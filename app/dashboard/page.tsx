"use client";

import { useEffect, useState, FormEvent } from "react";
import AppBar from "@/components/layout/AppBar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
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
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useSession } from "next-auth/react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2Icon } from "lucide-react";

// If you have a user session from next-auth, you can import and use useSession
// import { useSession } from "next-auth/react";

type Project = {
  _id: string;
  owner?: string; // or { _id: string, name: string } if you populated
  name: string;
  description?: string;
  createdAt?: string;
};

type AnalysisReport = {
  _id: string;
  url: string;
  sector?: string;
  overallScore: number;
  heuristics: any[];
  createdAt?: string;
  project: Project;
  pageType?: string;
};

export default function DashboardPage() {
  // const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [openDialog, setOpenDialog] = useState(false); // If your session user ID is needed, you'd set it from session
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const { data: session }: any = useSession();
  const [url, setUrl] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedPageType, setSelectedPageType] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Fetch projects from our new route
  async function fetchProjects() {
    try {
      const response = await fetch(
        `/api/user/projects?userId=${session?.user.id}`,
        {
          method: "GET",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();
      setProjects(data);
      setCurrentProject(data[0]);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (session) {
      fetchProjects();
      fetchUserReports();
    }
  }, [session]);

  // Handle create project
  async function handleCreateProject(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: session.user.id, name, description }),
      });
      if (!response.ok) {
        throw new Error("Error creating project");
      }
      // Clear inputs
      setName("");
      setDescription("");
      setOpenDialog(false);
      // Refetch
      fetchProjects();
    } catch (error) {
      console.error(error);
    }
  }

  // 4) Create new analysis
  async function handleCreateAnalysis(e: FormEvent) {
    e.preventDefault();
    //if no project is there create untitled project
    if (!currentProject) {
      try {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ owner: session.user.id, name: "Untitled" }),
        });
        if (!response.ok) {
          throw new Error("Error creating project");
        }
        // Refetch
        fetchProjects();
      } catch (error) {
        console.error(error);
      }
    }

    setIsAnalyzing(true);

    try {
      // Step 1: call combinedAnalyze
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!analyzeRes.ok) throw new Error("Error analyzing page");
      const { screenshot, analysis, snapshotHtml } = await analyzeRes.json();

      // parse GPT JSON
      const cleanedAnalysis = analysis
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const analysisObj = JSON.parse(cleanedAnalysis);
      //convert all the scores to number and add them to overall score
      let overallScore = 0;
      analysisObj.score.forEach((score: any) => {
        overallScore += Number(score.score);
      });

      console.log("Overall Score", overallScore);

      // Step 2: store in DB
      const storeRes = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: session.user.id,
          project: currentProject?._id,
          url,
          screenshot,
          sector: selectedSector,
          pageType: selectedPageType,
          heuristics: analysisObj.heuristics,
          score: analysisObj.score,
          overallScore: overallScore || 0,
          snapshotHtml,
        }),
      });
      if (!storeRes.ok) throw new Error("Error storing analysis");

      // Clear
      setUrl("");
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  // 2) For a project, fetch all analysis
  async function fetchUserReports() {
    setLoadingReports(true);
    try {
      const res = await fetch(`/api/user/reports?userId=${session?.user.id}`);
      if (!res.ok) throw new Error("Failed to fetch analysis");
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error(err);
    }
    setLoadingReports(false);
  }

  function handleProjectClick(proj: Project) {
    setCurrentProject(proj);
    setSelectedPageType("All");
  }

  // -------------------------
  // Derived data in memory
  // -------------------------
  // If a project is selected, we gather only that project's reports
  const projectReports = currentProject
    ? reports.filter((report) => report.project?._id === currentProject._id)
    : [];

  // Distinct pageTypes for the selected project
  const distinctPageTypes = Array.from(
    new Set(projectReports.map((r) => r.pageType || "Other"))
  );
  // Always keep an "All" tab
  const pageTypeTabs = ["All", ...distinctPageTypes];

  // If the user has chosen a pageType in the tab, we filter again
  const filteredReports =
    selectedPageType && selectedPageType !== "All"
      ? projectReports.filter(
          (r) => (r.pageType || "Other") === selectedPageType
        )
      : projectReports;
  return (
    <div className="flex flex-col min-h-screen">
      <AppBar />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 border-r p-4 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Projects</h2>
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center">
              <p className="text-sm font-semibold">My Projects</p>
            </div>
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
                  {/* If you need the owner field or if the server sets it automatically from session */}

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
          {projects && (
            <div>
              {projects.map((project) => (
                <div key={project._id}>
                  <Link href={`/dashboard`}>
                    <p className="block py-2">{project.name}</p>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 mt-12">
          <h2 className="text-2xl font-base mb-4">
            Welcome {session?.user?.name?.split(" ")[0]}{" "}
            {session?.user?.name?.split(" ")[1]} 👋
          </h2>
          <p className="text-lg font-semibold">
            Generate your Heuristic Report
          </p>
          <div className="mt-6">
            <form
              onSubmit={handleCreateAnalysis}
              className="grid grid-cols-12 gap-1 items-center"
            >
              <div className="col-span-4">
                <label className="block text-sm font-semibold mb-1 ">
                  Page's URL
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
                  onValueChange={(value) => setSelectedSector(value)}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {selectedSector || "Select Sector"}
                    </SelectValue>
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
                  PageType
                </label>
                <Select
                  value={selectedPageType}
                  onValueChange={(value) => setSelectedPageType(value)}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {selectedPageType || "Select Page Type"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="landing">Landing Page</SelectItem>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                      <SelectItem value="pricing">Pricing</SelectItem>
                      <SelectItem value="checkout">Checkout</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Button
                  type="submit"
                  variant="default"
                  disabled={isAnalyzing}
                  className="mt-6 w-full"
                >
                  {isAnalyzing ? "Generating..." : "Generate"}
                </Button>
              </div>
            </form>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-4">Recent Reports</h3>

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
                      {" "}
                      <Link href={`/report/${report._id}`}>{report.url}</Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/report/${report._id}`}>
                        {new Date(report.createdAt!).toLocaleString()}
                      </Link>
                    </TableCell>
                    <TableCell>{report.overallScore}</TableCell>

                    <TableCell>{report.project.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {loadingReports && (
              <div className="flex justify-center items-center mt-2">
                <Loader2Icon className="animate-spin" />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
