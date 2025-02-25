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

// ⬅️ Import the shadcn UI Tabs
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
    <div className="mt-4 p-4 border rounded bg-white">
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
              <div className="text-xs text-center mt-1 whitespace-nowrap">
                {getRatingLabel(report.overallScore)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ------------------------------------
// Main Dashboard Page
// ------------------------------------
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
      setProjects(data);
      if (data.length) setCurrentProject(data[0]); // optionally auto-select
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

  // -----------------------------
  // Handlers
  // -----------------------------
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
      fetchProjects();
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

      // 3) store in DB
      const storeRes = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: session.user.id,
          project: currentProject._id,
          url,
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

  // -----------------------------
  // Derived data
  // -----------------------------
  // Filter to the selected project’s reports
  const projectReports = currentProject
    ? reports.filter((r) => r.project._id === currentProject._id)
    : [];

  // Group them by pageType
  // e.g. { Homepage: [...], AboutUs: [...], Other: [...] }
  const reportsByPageType: Record<string, AnalysisReport[]> = {};
  for (const rep of projectReports) {
    const pt = rep.pageType || "Other";
    if (!reportsByPageType[pt]) {
      reportsByPageType[pt] = [];
    }
    reportsByPageType[pt].push(rep);
  }

  // Gather distinct page types
  const pageTypes = Object.keys(reportsByPageType).sort();

  // If there are no pageTypes yet, we can skip rendering or show a placeholder

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="flex flex-col min-h-screen">
      <AppBar />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 border-r p-4 bg-gray-50">
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
                className={`block w-full text-left px-2 py-1 rounded ${
                  currentProject?._id === project._id
                    ? "font-bold bg-gray-200"
                    : "hover:bg-gray-100"
                }`}
              >
                {project.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <h2 className="text-2xl font-base mb-4">
            Welcome {session?.user?.name?.split(" ")[0]}!
          </h2>

          {/* 1) Create a new Report Form */}
          <div className="border p-4 rounded mb-6">
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
                  className="w-full"
                >
                  {isAnalyzing ? "Generating..." : "Generate"}
                </Button>
              </div>
            </form>
          </div>

          {/* 2) Show the selected project’s pageTypes using shadcn Tabs */}
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

              {/* If no pageTypes, show a placeholder */}
              {!pageTypes.length && (
                <div className="text-gray-500 mt-4">
                  No reports yet for this project.
                </div>
              )}

              {!!pageTypes.length && (
                <Tabs defaultValue={pageTypes[0]} className="mt-6">
                  {/* TabsList: all pageTypes */}
                  <TabsList>
                    {pageTypes.map((pt) => (
                      <TabsTrigger key={pt} value={pt}>
                        {pt} ({reportsByPageType[pt].length})
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* For each pageType, show a ComparisonScale & Table */}
                  {pageTypes.map((pt) => (
                    <TabsContent key={pt} value={pt}>
                      {/* 2a) Comparison Scale */}
                      <ComparisonScale reports={reportsByPageType[pt]} />

                      {/* 2b) Table of Reports for this pageType */}
                      <div className="mt-4">
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Report</TableCell>
                              <TableCell>Date Created</TableCell>
                              <TableCell>Score</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {reportsByPageType[pt].map((report) => (
                              <TableRow key={report._id}>
                                <TableCell>
                                  <Link href={`/report/${report._id}`}>
                                    {report.url}
                                  </Link>
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    report.createdAt!
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  {getRatingLabel(report.overallScore)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
