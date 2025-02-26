"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import AppBar from "@/components/layout/AppBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Loader2Icon } from "lucide-react";

// ------------------------------------
// Types
// ------------------------------------
type Project = {
  _id: string;
  owner?: string;
  name: string;
  description?: string;
  createdAt?: string;
};

type AnalysisReport = {
  _id: string;
  url: string;
  sector?: string;
  overallScore: number; // numeric, e.g. 0–100
  createdAt?: string;
  heuristics?: any[];
  project: Project;
  pageType?: string; // e.g. "Homepage", "AboutUs", etc.
};

// ------------------------------------
// Rating Helpers
// ------------------------------------
const ratingLabels = [
  { threshold: 20, label: "Very Poor" },
  { threshold: 40, label: "Poor" },
  { threshold: 60, label: "Mediocre" },
  { threshold: 80, label: "Good" },
  { threshold: 100, label: "Very Good" },
];

/**
 * Given 0–100 overallScore, returns a textual label (e.g., "Good").
 */
function getRatingLabel(score: number): string {
  for (const rating of ratingLabels) {
    if (score <= rating.threshold) return rating.label;
  }
  return "Unknown";
}

/**
 * Convert a 0–100 score to a left offset like "45%" for a positioning style.
 */
function getLeftPercent(score: number) {
  const clamped = Math.min(100, Math.max(0, score));
  return `${clamped}%`;
}

// ------------------------------------
// ComparisonScale Component
// ------------------------------------
function ComparisonScale({ reports }: { reports: AnalysisReport[] }) {
  if (!reports || !reports.length) return null;

  // Sort reports oldest → newest
  const sortedByDate = [...reports].sort(
    (a, b) =>
      new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
  );

  return (
    <div className="mt-4 p-4 rounded bg-white">
      {/* Scale header labels */}
      <div className="flex justify-between mb-2 text-gray-600 text-sm">
        <span>Very Poor</span>
        <span>Poor</span>
        <span>Mediocre</span>
        <span>Good</span>
        <span>Very Good</span>
      </div>

      {/* Horizontal track */}
      <div className="relative h-2 bg-gray-200 rounded mb-6">
        {sortedByDate.map((report, i) => {
          const left = getLeftPercent(report.overallScore);
          return (
            <div key={report._id} className="absolute -top-2" style={{ left }}>
              <div className="w-6 h-6 bg-gray-500 text-white text-xs rounded-full flex items-center justify-center">
                {i + 1}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session }: any = useSession();

  // Projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Dialog for creating a new Project
  const [openDialog, setOpenDialog] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Create a new report
  const [url, setUrl] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedPageType, setSelectedPageType] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Reports
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // -----------------------------
  // Data fetching
  // -----------------------------
  async function fetchProjects() {
    if (!session?.user?.id) return;
    try {
      const response = await fetch(
        `/api/user/projects?userId=${session.user.id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();

      // Insert a pseudo-project to represent 'All Reports'
      const allProjectsOption: Project = {
        _id: "all",
        name: "All Reports",
      };

      // Prepend 'All Reports' to the list and set as default
      setProjects([allProjectsOption, ...data]);
      setCurrentProject(allProjectsOption);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchUserReports() {
    if (!session?.user?.id) return;
    setLoadingReports(true);
    try {
      const res = await fetch(`/api/user/reports?userId=${session.user.id}`);
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReports(false);
    }
  }

  function handleProjectClick(proj: Project) {
    setCurrentProject(proj);
  }

  async function handleCreateProject(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: session.user.id,
          name,
          description,
        }),
      });
      if (!response.ok) {
        throw new Error("Error creating project");
      }
      setName("");
      setDescription("");
      setOpenDialog(false);
      fetchProjects(); // refresh the list
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCreateAnalysis(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    if (!currentProject) {
      alert("No project selected.");
      return;
    }
    setIsAnalyzing(true);
    try {
      // 1) call your analysis endpoint
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!analyzeRes.ok) throw new Error("Error analyzing page");
      const { screenshot, analysis, snapshotHtml } = await analyzeRes.json();

      // 2) compute overall score
      let overallScore = 0;
      if (analysis?.scores?.length) {
        overallScore = analysis.scores.reduce((acc: number, s: any) => {
          return acc + Number(s.score);
        }, 0);
      }
      console.log("projects:", projects);

      // 3) store in DB
      const storeRes = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        //if id == all set the project to the next project or create a new project
        body: JSON.stringify({
          owner: session.user.id,
          project:
            currentProject._id === "all" ? projects[1]._id : currentProject._id,
          url,
          scores: analysis.scores,
          screenshot,
          sector: selectedSector,
          pageType: selectedPageType,
          heuristics: analysis.heuristics,
          overallScore,
          snapshotHtml,
        }),
      });
      if (!storeRes.ok) throw new Error("Error storing analysis");

      // Clear the URL field
      setUrl("");
      fetchUserReports();
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  // -----------------------------
  // Effects
  // -----------------------------
  useEffect(() => {
    if (session?.user?.id) {
      fetchProjects();
      fetchUserReports();
    }
  }, [session]);

  // -----------------------------------------------
  // Distinguish "All Reports" vs. single project
  // -----------------------------------------------
  const isAllProjects = currentProject?._id === "all";

  // If not showing “All Reports”, filter to the selected project’s reports
  const projectReports = isAllProjects
    ? reports
    : reports.filter((r) => r.project._id === currentProject?._id);

  // Group them by pageType
  const reportsByPageType: Record<string, AnalysisReport[]> = {};
  for (const rep of projectReports) {
    const pt = rep.pageType || "Other";
    if (!reportsByPageType[pt]) {
      reportsByPageType[pt] = [];
    }
    reportsByPageType[pt].push(rep);
  }

  const pageTypes = Object.keys(reportsByPageType).sort();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <AppBar />
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside className="w-64 p-4 bg-white m-2 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Projects</h2>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">My Projects</p>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost">+ Create</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a new Project</DialogTitle>
                  <DialogDescription>
                    Enter details for your new project.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateProject} className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Project Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <Input
                      type="text"
                      placeholder="Optional"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setOpenDialog(false)}
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button variant="default" type="submit">
                      Create
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-4 space-y-1">
            {projects.map((project) => (
              <button
                key={project._id}
                onClick={() => handleProjectClick(project)}
                className={`block w-full text-left px-2 py-2 rounded ${
                  currentProject?._id === project._id
                    ? "bg-[#FFF1E0]"
                    : "hover:bg-stone-50"
                }`}
              >
                {project.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 h-full">
          <div className="m-2 rounded-xl bg-white p-4">
            <h2 className="text-2xl font-base mb-4">
              Welcome {session?.user?.name?.split(" ")[0]}!
            </h2>

            {/* 1) Create a new Report Form */}
            <div className="rounded mb-6">
              <p className="text-lg font-semibold">Generate a New Report</p>
              <form
                onSubmit={handleCreateAnalysis}
                className="grid grid-cols-12 gap-2 items-end mt-4"
              >
                <div className="col-span-4">
                  <label className="block text-sm font-semibold mb-1">
                    Page URL
                  </label>
                  <Input
                    type="text"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-semibold mb-1">
                    Sector
                  </label>
                  <Select
                    value={selectedSector}
                    onValueChange={(v) => setSelectedSector(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-semibold mb-1">
                    Page Type
                  </label>
                  <Select
                    value={selectedPageType}
                    onValueChange={(v) => setSelectedPageType(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Page Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Homepage">Homepage</SelectItem>
                        <SelectItem value="AboutUs">About Us</SelectItem>
                        <SelectItem value="Pricing">Pricing</SelectItem>
                        <SelectItem value="Checkout">Checkout</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Button
                    type="submit"
                    variant="default"
                    disabled={isAnalyzing}
                    className="w-full bg-[#B04E34] hover:bg-[#963F28] text-white"
                  >
                    {isAnalyzing ? "Generating..." : "Generate"}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          <div className="m-2 rounded-xl bg-white p-4">
            {currentProject && (
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {currentProject.name}
                </h2>

                {loadingReports && (
                  <div className="flex justify-center items-center mt-2">
                    <Loader2Icon className="animate-spin" />
                  </div>
                )}

                {isAllProjects ? (
                  // -------------------------------------------
                  // When "All Reports" is selected:
                  // No comparison scale, no page-type tabs,
                  // just a single table with all user reports.
                  // -------------------------------------------
                  <div className="mt-4">
                    {!reports.length && !loadingReports && (
                      <div className="text-gray-500 mt-4 h-72">
                        No reports yet.
                      </div>
                    )}
                    {!!reports.length && (
                      <ScrollArea className="w-full h-72 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Report</TableHead>
                              <TableHead>Date Created</TableHead>
                              <TableHead>Score</TableHead>
                              <TableHead>Project</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reports.map((report) => (
                              <TableRow key={report._id}>
                                <TableCell>
                                  <Link href={`/report/${report._id}`}>
                                    {report.url}
                                  </Link>
                                </TableCell>
                                <TableCell>
                                  <Link href={`/report/${report._id}`}>
                                    {new Date(
                                      report.createdAt!
                                    ).toLocaleString()}
                                  </Link>
                                </TableCell>
                                <TableCell>
                                  {getRatingLabel(report.overallScore)}
                                </TableCell>
                                <TableCell>{report.project.name}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    )}
                  </div>
                ) : (
                  // -------------------------------------------
                  // A specific project is selected:
                  // Show page-type tabs + comparison scale
                  // -------------------------------------------
                  <>
                    {/* If no pageTypes (meaning no reports), show placeholder */}
                    {!pageTypes.length && !loadingReports && (
                      <div className="text-gray-500 mt-4 h-72">
                        No reports yet for this project.
                      </div>
                    )}

                    {!!pageTypes.length && (
                      <Tabs defaultValue={pageTypes[0]} className="mt-6">
                        <TabsList>
                          {pageTypes.map((pt) => (
                            <TabsTrigger key={pt} value={pt}>
                              {pt} ({reportsByPageType[pt].length})
                            </TabsTrigger>
                          ))}
                        </TabsList>

                        {pageTypes.map((pt) => (
                          <TabsContent key={pt} value={pt}>
                            <ComparisonScale reports={reportsByPageType[pt]} />

                            <ScrollArea className="w-full h-48 overflow-y-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Report</TableHead>
                                    <TableHead>Date Created</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Project</TableHead>
                                  </TableRow>
                                </TableHeader>

                                <TableBody>
                                  {reportsByPageType[pt].map((report) => (
                                    <TableRow key={report._id}>
                                      <TableCell>
                                        <Link href={`/report/${report._id}`}>
                                          {report.url}
                                        </Link>
                                      </TableCell>
                                      <TableCell>
                                        <Link href={`/report/${report._id}`}>
                                          {new Date(
                                            report.createdAt!
                                          ).toLocaleString()}
                                        </Link>
                                      </TableCell>
                                      <TableCell>
                                        {getRatingLabel(report.overallScore)}
                                      </TableCell>
                                      <TableCell>
                                        {report.project.name}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </ScrollArea>
                          </TabsContent>
                        ))}
                      </Tabs>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
