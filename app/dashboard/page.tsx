"use client";

import { useEffect, useState, type FormEvent } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Check,
  XCircle,
  Plus,
  ExternalLink,
  FileIcon,
  Calendar,
  Globe,
  Layers,
  FolderPlus,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  overallScore: number;
  createdAt?: string;
  heuristics?: any[];
  project: Project;
  pageType?: string;
};

type AnalysisStep = {
  label: string;
  status: "pending" | "in-progress" | "done" | "error";
};

// ------------------------------------
// Rating Helpers
// ------------------------------------
const ratingLabels = [
  { threshold: 20, label: "Very Poor", color: "bg-red-500" },
  { threshold: 40, label: "Poor", color: "bg-orange-500" },
  { threshold: 60, label: "Mediocre", color: "bg-yellow-500" },
  { threshold: 80, label: "Good", color: "bg-green-400" },
  { threshold: 100, label: "Very Good", color: "bg-green-600" },
];

function getRatingLabel(score: number): string {
  for (const rating of ratingLabels) {
    if (score <= rating.threshold) return rating.label;
  }
  return "Unknown";
}

function getRatingColor(score: number): string {
  for (const rating of ratingLabels) {
    if (score <= rating.threshold) return rating.color;
  }
  return "bg-gray-500";
}

function getLeftPercent(score: number) {
  const clamped = Math.min(100, Math.max(0, score));
  return `${clamped}%`;
}

// ------------------------------------
// ComparisonScale Component
// ------------------------------------
function ComparisonScale({ reports }: { reports: AnalysisReport[] }) {
  if (!reports || !reports.length) return null;

  const sortedByDate = [...reports].sort(
    (a, b) =>
      new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
  );

  return (
    <Card className="mt-4 border-none shadow-lg bg-white transition-all duration-300 hover:shadow-xl">
      <CardContent className="p-6">
        <div className="flex justify-between mb-3 text-gray-600 text-xs font-medium">
          <span>Very Poor</span>
          <span>Poor</span>
          <span>Mediocre</span>
          <span>Good</span>
          <span>Very Good</span>
        </div>
        <div className="relative h-2 bg-gray-100 rounded-full mb-8 shadow-inner">
          <div className="absolute inset-0 flex">
            <div className="w-1/5 h-full bg-red-500/80 rounded-l-full"></div>
            <div className="w-1/5 h-full bg-orange-500/80"></div>
            <div className="w-1/5 h-full bg-yellow-500/80"></div>
            <div className="w-1/5 h-full bg-green-400/80"></div>
            <div className="w-1/5 h-full bg-green-600/80 rounded-r-full"></div>
          </div>
          {sortedByDate.map((report, i) => {
            const left = getLeftPercent(report.overallScore);
            return (
              <div
                key={report._id}
                className="absolute -top-3 transform -translate-x-1/2"
                style={{ left }}
              >
                <div className="w-7 h-7 bg-white border-2 border-[#B04E34] text-[#B04E34] text-xs rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110 hover:shadow-lg">
                  {i + 1}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: session }: any = useSession();

  // ------------------------------------
  // State for Sectors/Page Types
  // ------------------------------------
  const [sectors, setSectors] = useState([
    "Healthcare",
    "Finance",
    "Education",
  ]);
  const [pageTypeOptions, setPageTypeOptions] = useState([
    "Homepage",
    "AboutUs",
    "Pricing",
    "Checkout",
  ]);

  // Add new item dialog controls
  const [isAddSectorDialogOpen, setIsAddSectorDialogOpen] = useState(false);
  const [newSectorInput, setNewSectorInput] = useState("");

  const [isAddPageTypeDialogOpen, setIsAddPageTypeDialogOpen] = useState(false);
  const [newPageTypeInput, setNewPageTypeInput] = useState("");

  // ------------------------------------
  // Projects & Reports
  // ------------------------------------
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // ------------------------------------
  // Form State
  // ------------------------------------
  const [openDialog, setOpenDialog] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [url, setUrl] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedPageType, setSelectedPageType] = useState("");

  // ------------------------------------
  // Analysis Modal Steps
  // ------------------------------------
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([
    { label: "Scraping the website...", status: "pending" },
    {
      label: "Analyzing webpage & and highlighting issues...",
      status: "pending",
    },
    {
      label: "Generating final analysis & storing report...",
      status: "pending",
    },
  ]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [finalReportId, setFinalReportId] = useState<string | null>(null);

  // ------------------------------------
  // Edit Project
  // ------------------------------------
  const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
  const [editProjectData, setEditProjectData] = useState<Project | null>(null);
  const [editProjectName, setEditProjectName] = useState("");

  // ------------------------------------
  // Project/Report Fetching
  // ------------------------------------
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
      const allProjectsOption: Project = {
        _id: "all",
        name: "All Reports",
      };
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

  // ------------------------------------
  // Sector/PageType Add Logic
  // ------------------------------------
  function handleSectorSelect(value: string) {
    if (value === "add-new-sector") {
      setIsAddSectorDialogOpen(true);
    } else {
      setSelectedSector(value);
    }
  }

  function handlePageTypeSelect(value: string) {
    if (value === "add-new-pagetype") {
      setIsAddPageTypeDialogOpen(true);
    } else {
      setSelectedPageType(value);
    }
  }

  function handleAddNewSector() {
    const newSec = newSectorInput.trim();
    if (newSec && !sectors.includes(newSec)) {
      setSectors((prev) => [...prev, newSec]);
      setSelectedSector(newSec);
    }
    setNewSectorInput("");
    setIsAddSectorDialogOpen(false);
  }

  function handleAddNewPageType() {
    const newType = newPageTypeInput.trim();
    if (newType && !pageTypeOptions.includes(newType)) {
      setPageTypeOptions((prev) => [...prev, newType]);
      setSelectedPageType(newType);
    }
    setNewPageTypeInput("");
    setIsAddPageTypeDialogOpen(false);
  }

  // ------------------------------------
  // Project Handlers
  // ------------------------------------
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

  async function createUntitledProject(): Promise<Project> {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner: session.user.id,
        name: "Untitled Project",
        description: "",
      }),
    });
    if (!response.ok) {
      throw new Error("Error creating untitled project");
    }
    return response.json();
  }

  // ------------------------------------
  // Edit Project (Name) Handlers
  // ------------------------------------
  function handleEditProjectClick(project: Project) {
    if (project._id === "all") return; // We won't allow editing the "All Reports" pseudo-project
    setEditProjectData(project);
    setEditProjectName(project.name);
    setEditProjectDialogOpen(true);
  }

  async function handleEditProjectSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editProjectData || !editProjectName.trim()) return;

    try {
      const response = await fetch(`/api/projects?id=${editProjectData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editProjectName,
          description: editProjectData.description || "",
        }),
      });
      if (!response.ok) {
        throw new Error("Error updating project");
      }
      setEditProjectDialogOpen(false);
      setEditProjectData(null);
      setEditProjectName("");

      // Refresh the projects
      await fetchProjects();

      // If the user was editing the currently selected project, we need to update that name as well
      // The simplest way is just to re-select the updated project from the list if it still exists
      // (already handled by fetchProjects, but we can ensure the currentProject is re-updated)
    } catch (error) {
      console.error(error);
      alert("Failed to update project. Please try again.");
    }
  }

  // ------------------------------------
  // Analysis
  // ------------------------------------
  function resetAnalysisSteps() {
    setAnalysisSteps([
      { label: "Scanning the website...", status: "pending" },
      {
        label: "Analyzing webpage & Highlighting issues...",
        status: "pending",
      },
      {
        label: "Generating final analysis & storing report...",
        status: "pending",
      },
    ]);
  }

  async function handleCreateAnalysis(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    if (!currentProject) {
      alert("No project selected.");
      return;
    }

    let projectId = currentProject._id;
    let newProjectId = "";
    if (projectId === "all") {
      // If user is on "All Reports", create an untitled project
      try {
        const newProj = await createUntitledProject();
        projectId = newProj._id;
        setProjects((prev) => {
          const filtered = prev.filter((p) => p._id !== "all");
          return [{ _id: "all", name: "All Reports" }, newProj, ...filtered];
        });
        newProjectId = newProj._id;
      } catch (err) {
        console.error(err);
        alert("Failed to create an untitled project. Please try again.");
        return;
      }
    }

    setShowAnalysisModal(true);
    resetAnalysisSteps();
    setAnalysisError(null);
    setFinalReportId(null);

    try {
      // STEP 1
      setAnalysisSteps((prev) =>
        prev.map((s, i) => (i === 0 ? { ...s, status: "in-progress" } : s))
      );
      let step1Res = await fetch("/api/analyze/step1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          sector: selectedSector,
          pageType: selectedPageType,
          ownerId: session.user.id,
          projectId,
        }),
      });
      if (!step1Res.ok) {
        throw new Error(`Url may be invalid or webpage prevented scanning`);
      }
      const step1Data = await step1Res.json();
      const screenshot = step1Data.screenshot;
      const truncatedHTML = step1Data.truncatedHTML;
      const rawHTML = step1Data.rawHTML;
      setAnalysisSteps((prev) =>
        prev.map((s, i) => (i === 0 ? { ...s, status: "done" } : s))
      );

      // STEP 2
      setAnalysisSteps((prev) =>
        prev.map((s, i) => (i === 1 ? { ...s, status: "in-progress" } : s))
      );
      let step2Res = await fetch("/api/analyze/step2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          truncatedHTML,
          screenshot,
        }),
      });
      if (!step2Res.ok) {
        throw new Error(`Step 2 failed: ${step2Res.statusText}`);
      }
      await step2Res.json(); // presumably { success: true }
      setAnalysisSteps((prev) =>
        prev.map((s, i) => (i === 1 ? { ...s, status: "done" } : s))
      );

      // STEP 3
      setAnalysisSteps((prev) =>
        prev.map((s, i) => (i === 2 ? { ...s, status: "in-progress" } : s))
      );
      let step3Res = await fetch("/api/analyze/step3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          truncatedHTML,
          screenshot,
          rawHTML,
        }),
      });
      if (!step3Res.ok) {
        throw new Error(`Step 3 failed: ${step3Res.statusText}`);
      }
      const { analysis, snapshotHtml } = await step3Res.json();

      let overallScore = 0;
      if (analysis?.scores?.length) {
        overallScore = analysis.scores.reduce((acc: number, s: any) => {
          return acc + Number(s.score);
        }, 0);
      }

      const storeRes = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: session.user.id,
          project:
            currentProject._id === "all" ? newProjectId : currentProject._id,
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

      const savedReportId = (await storeRes.json())._id;
      setFinalReportId(savedReportId);
      setAnalysisSteps((prev) =>
        prev.map((s, i) => (i === 2 ? { ...s, status: "done" } : s))
      );

      // Refresh
      fetchUserReports();
    } catch (error: any) {
      console.error("Analysis error:", error);
      setAnalysisError(error.message || "Unknown error");
      setAnalysisSteps((prev) => {
        const idx = prev.findIndex((s) => s.status === "in-progress");
        if (idx >= 0) {
          return prev.map((step, i) =>
            i === idx ? { ...step, status: "error" } : step
          );
        }
        return prev;
      });
    }
  }

  // ------------------------------------
  // useEffect
  // ------------------------------------
  useEffect(() => {
    if (session?.user?.id) {
      fetchProjects();
      fetchUserReports();
    }
  }, [session]);

  // ------------------------------------
  // Derived data
  // ------------------------------------
  const isAllProjects = currentProject?._id === "all";
  const projectReports = isAllProjects
    ? reports
    : reports.filter((r) => r.project._id === currentProject?._id);

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
    <>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <AppBar />
        <div className="flex flex-1 pt-16 px-4 md:px-6 lg:px-8 pb-8">
          {/* Sidebar */}
          <aside className="hidden md:block w-64 mr-6">
            <Card className="sticky top-20 shadow-lg border-none bg-white transition-all duration-300 hover:shadow-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">
                    Projects
                  </CardTitle>
                  <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-[#B04E34] hover:bg-[#FFF1E0] transition-colors duration-200"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        New
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-white shadow-2xl border-none rounded-xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl">
                          Create a new Project
                        </DialogTitle>
                        <DialogDescription>
                          Enter details for your new project.
                        </DialogDescription>
                      </DialogHeader>
                      <form
                        onSubmit={handleCreateProject}
                        className="space-y-4 mt-4"
                      >
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
                            className="shadow-sm focus:ring-2 focus:ring-[#B04E34] focus:ring-opacity-50 transition-all duration-200"
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
                            className="shadow-sm focus:ring-2 focus:ring-[#B04E34] focus:ring-opacity-50 transition-all duration-200"
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setOpenDialog(false)}
                            type="button"
                            className="bg-white hover:bg-gray-100 shadow-sm hover:shadow transition-all duration-200"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="bg-[#B04E34] hover:bg-[#963F28] text-white shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            Create
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Separator className="my-2" />
                <ScrollArea className="h-[76vh] pr-4 -mr-4">
                  <div className="space-y-1 mt-2">
                    {projects.map((project) => (
                      <div
                        key={project._id}
                        className="group flex items-center justify-between"
                      >
                        <button
                          onClick={() => handleProjectClick(project)}
                          className={cn(
                            "flex items-center text-left px-3 py-2 rounded-md w-full transition-all duration-200",
                            currentProject?._id === project._id
                              ? "bg-[#FFF1E0] text-[#B04E34] font-medium shadow-sm"
                              : "hover:bg-gray-100 text-gray-700"
                          )}
                        >
                          {project._id === "all" ? (
                            <Layers className="h-4 w-4 mr-2 flex-shrink-0" />
                          ) : (
                            <FileIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          )}
                          <span className="truncate">{project.name}</span>
                        </button>
                        {project._id !== "all" && (
                          <button
                            onClick={() => handleEditProjectClick(project)}
                            className="hidden group-hover:block mr-3 text-gray-400 hover:text-[#B04E34] transition-colors duration-200"
                            title="Edit project name"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Welcome Card */}
            <Card className="mb-6 border-none shadow-lg bg-white transition-all duration-300 hover:shadow-xl">
              <CardHeader className="pb-0">
                <CardTitle className="text-2xl font-normal flex items-center">
                  Welcome, {session?.user?.name?.split(" ")[0]}! 👋
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-4">
                    Generate a New Report
                  </h3>
                  <form
                    onSubmit={handleCreateAnalysis}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
                  >
                    <div className="md:col-span-5">
                      <label className="block text-sm font-medium mb-1.5 ">
                        Page URL
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="https://example.com"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          required
                          className="pl-9 shadow-sm focus:ring-2 focus:ring-[#B04E34] focus:ring-opacity-50 transition-all duration-200"
                        />
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    {/* Sector */}
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium mb-1.5">
                        Sector
                      </label>
                      <Select
                        value={selectedSector}
                        onValueChange={handleSectorSelect}
                      >
                        <SelectTrigger className="shadow-sm focus:ring-2 focus:ring-[#B04E34] focus:ring-opacity-50 transition-all duration-200">
                          <SelectValue placeholder="Select Sector" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {sectors.map((sec) => (
                              <SelectItem key={sec} value={sec}>
                                {sec}
                              </SelectItem>
                            ))}
                            <SelectItem
                              value="add-new-sector"
                              className="text-gray-500 italic"
                            >
                              + Add new sector...
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Page Type */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1.5">
                        Page Type
                      </label>
                      <Select
                        value={selectedPageType}
                        onValueChange={handlePageTypeSelect}
                      >
                        <SelectTrigger className="shadow-sm focus:ring-2 focus:ring-[#B04E34] focus:ring-opacity-50 transition-all duration-200">
                          <SelectValue placeholder="Page Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {pageTypeOptions.map((pt) => (
                              <SelectItem key={pt} value={pt}>
                                {pt}
                              </SelectItem>
                            ))}
                            <SelectItem
                              value="add-new-pagetype"
                              className="text-gray-500 italic"
                            >
                              + Add new page type...
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Generate Button */}
                    <div className="md:col-span-2">
                      {showAnalysisModal ? (
                        <Button
                          type="submit"
                          disabled
                          className="w-full bg-[#B04E34] text-white shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          Generating...
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          className="w-full bg-[#B04E34] hover:bg-[#963F28] text-white shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          Generate
                        </Button>
                      )}
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>

            {/* Reports Card */}
            <Card className="border-none shadow-lg bg-white transition-all duration-300 hover:shadow-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-medium">
                    {currentProject?.name}
                  </CardTitle>
                  {loadingReports && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Loading reports...
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isAllProjects ? (
                  <div className="mt-2">
                    {!reports.length && !loadingReports && (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-50 rounded-lg shadow-sm">
                        <FileIcon className="h-16 w-16 mb-4 text-gray-300" />
                        <p className="text-center text-lg font-medium mb-2">
                          No reports yet
                        </p>
                        <p className="text-center text-gray-400 mb-6">
                          Generate your first report using the form above
                        </p>
                      </div>
                    )}
                    {!!reports.length && (
                      <ScrollArea className="h-[48vh] pr-4 -mr-4">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead>Report URL</TableHead>
                              <TableHead>Date Created</TableHead>
                              <TableHead>Score</TableHead>
                              <TableHead>Project</TableHead>
                              <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reports.map((report) => (
                              <TableRow
                                key={report._id}
                                className="hover:bg-gray-50 transition-colors duration-200"
                              >
                                <TableCell className="font-medium max-w-[300px] truncate">
                                  {report.url}
                                </TableCell>
                                <TableCell className="text-gray-500">
                                  <div className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-2 text-gray-400" />
                                    {new Date(
                                      report.createdAt!
                                    ).toLocaleDateString()}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={`${getRatingColor(
                                      report.overallScore
                                    )} hover:${getRatingColor(
                                      report.overallScore
                                    )} shadow-sm transition-all duration-200`}
                                  >
                                    {getRatingLabel(report.overallScore)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-gray-600">
                                  {report.project.name}
                                </TableCell>
                                <TableCell>
                                  <Link
                                    href={`/report/${report._id}`}
                                    target="_blank"
                                  >
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-[#FFF1E0] hover:text-[#B04E34] transition-colors duration-200"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                      <span className="sr-only">
                                        View Report
                                      </span>
                                    </Button>
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    )}
                  </div>
                ) : (
                  <>
                    {!pageTypes.length && !loadingReports && (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-50 rounded-lg shadow-sm">
                        <FolderPlus className="h-16 w-16 mb-4 text-gray-300" />
                        <p className="text-center text-lg font-medium mb-2">
                          No reports in this project
                        </p>
                        <p className="text-center text-gray-400 mb-6">
                          Generate your first report for this project
                        </p>
                        <Button
                          onClick={() =>
                            document
                              .querySelector("form")
                              ?.scrollIntoView({ behavior: "smooth" })
                          }
                          className="bg-[#B04E34] hover:bg-[#963F28] text-white shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Report
                        </Button>
                      </div>
                    )}
                    {!!pageTypes.length && (
                      <Tabs defaultValue={pageTypes[0]} className="mt-4">
                        <TabsList className="mb-4 bg-white shadow-md rounded-lg p-1">
                          {pageTypes.map((pt) => (
                            <TabsTrigger
                              key={pt}
                              value={pt}
                              className="px-4 rounded-md data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm transition-all duration-200"
                            >
                              {pt}{" "}
                              <Badge
                                variant="outline"
                                className="ml-2 bg-white shadow-sm"
                              >
                                {reportsByPageType[pt].length}
                              </Badge>
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        {pageTypes.map((pt) => (
                          <TabsContent key={pt} value={pt}>
                            <ComparisonScale reports={reportsByPageType[pt]} />
                            <ScrollArea className="h-[350px] mt-4 pr-4 -mr-4">
                              <Table>
                                <TableHeader>
                                  <TableRow className="hover:bg-transparent">
                                    <TableHead>Report URL</TableHead>
                                    <TableHead>Date Created</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead className="w-[80px]"></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {reportsByPageType[pt].map((report) => (
                                    <TableRow
                                      key={report._id}
                                      className="hover:bg-gray-50 transition-colors duration-200"
                                    >
                                      <TableCell className="font-medium max-w-[400px] truncate">
                                        {report.url}
                                      </TableCell>
                                      <TableCell className="text-gray-500">
                                        <div className="flex items-center">
                                          <Calendar className="h-3 w-3 mr-2 text-gray-400" />
                                          {new Date(
                                            report.createdAt!
                                          ).toLocaleDateString()}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          className={`${getRatingColor(
                                            report.overallScore
                                          )} hover:${getRatingColor(
                                            report.overallScore
                                          )} shadow-sm transition-all duration-200`}
                                        >
                                          {getRatingLabel(report.overallScore)}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Link
                                          href={`/report/${report._id}`}
                                          target="_blank"
                                        >
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 hover:bg-[#FFF1E0] hover:text-[#B04E34] transition-colors duration-200"
                                          >
                                            <ExternalLink className="h-4 w-4" />
                                            <span className="sr-only">
                                              View Report
                                            </span>
                                          </Button>
                                        </Link>
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
              </CardContent>
            </Card>
          </main>
        </div>

        {/* Analysis Modal */}
        <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
          <DialogContent className="sm:max-w-md bg-white shadow-2xl border-none rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-xl text-center">
                {analysisError ? (
                  <span className="text-red-500">Analysis Failed</span>
                ) : (
                  "Analyzing Your Website..."
                )}
              </DialogTitle>
              <DialogDescription className="text-center">
                {analysisError ? (
                  <>
                    <p className="text-red-600 mb-2">
                      An error occurred during analysis:
                    </p>
                    <p className="text-sm italic">{analysisError}</p>
                    <p className="mt-4 text-sm">
                      Try checking the URL, ensuring the site is public, or
                      retrying in a few moments.
                    </p>
                  </>
                ) : (
                  "We're generating your usability report step-by-step."
                )}
              </DialogDescription>
            </DialogHeader>

            {/* Steps UI */}
            <div className="py-4 space-y-3">
              {analysisSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center p-2 rounded-md transition-all duration-200",
                    step.status === "in-progress"
                      ? "bg-blue-50"
                      : step.status === "error"
                      ? "bg-red-50"
                      : "bg-gray-50"
                  )}
                >
                  <div className="mr-3">
                    {step.status === "pending" && (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        <span className="text-xs text-gray-400">{idx + 1}</span>
                      </div>
                    )}
                    {step.status === "in-progress" && (
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                        <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                      </div>
                    )}
                    {step.status === "done" && (
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="w-3 h-3 text-green-500" />
                      </div>
                    )}
                    {step.status === "error" && (
                      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle className="w-3 h-3 text-red-500" />
                      </div>
                    )}
                  </div>
                  <div className="text-sm">
                    {step.status === "in-progress" ? (
                      <span className="font-medium text-blue-600">
                        {step.label}
                      </span>
                    ) : step.status === "done" ? (
                      <span className="text-gray-600">{step.label}</span>
                    ) : step.status === "error" ? (
                      <span className="text-red-600">{step.label}</span>
                    ) : (
                      <span className="text-gray-500">{step.label}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter className="flex justify-center">
              {analysisError ? (
                <Button
                  variant="outline"
                  onClick={() => setShowAnalysisModal(false)}
                  className="bg-white hover:bg-gray-100 shadow-sm hover:shadow transition-all duration-200"
                >
                  Close
                </Button>
              ) : finalReportId ? (
                <Link href={`/report/${finalReportId}`}>
                  <Button className="bg-[#B04E34] hover:bg-[#963F28] text-white shadow-md hover:shadow-lg transition-all duration-200">
                    View Full Analysis
                  </Button>
                </Link>
              ) : (
                <Button
                  disabled
                  className="bg-gray-200 text-gray-500 cursor-not-allowed"
                  title="Please wait until the analysis completes."
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Working...
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog for adding new Sector */}
      <Dialog
        open={isAddSectorDialogOpen}
        onOpenChange={setIsAddSectorDialogOpen}
      >
        <DialogContent className="sm:max-w-sm bg-white shadow-2xl border-none rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg">Add New Sector</DialogTitle>
            <DialogDescription>
              Enter a new sector that is not in the list.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <Input
              type="text"
              placeholder="e.g. Technology"
              value={newSectorInput}
              onChange={(e) => setNewSectorInput(e.target.value)}
              className="shadow-sm focus:ring-2 focus:ring-[#B04E34] focus:ring-opacity-50"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddSectorDialogOpen(false)}
              className="bg-white hover:bg-gray-100 shadow-sm hover:shadow transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNewSector}
              className="bg-[#B04E34] hover:bg-[#963F28] text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for adding new Page Type */}
      <Dialog
        open={isAddPageTypeDialogOpen}
        onOpenChange={setIsAddPageTypeDialogOpen}
      >
        <DialogContent className="sm:max-w-sm bg-white shadow-2xl border-none rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg">Add New Page Type</DialogTitle>
            <DialogDescription>
              Enter a new page type that is not in the list.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <Input
              type="text"
              placeholder="e.g. Contact"
              value={newPageTypeInput}
              onChange={(e) => setNewPageTypeInput(e.target.value)}
              className="shadow-sm focus:ring-2 focus:ring-[#B04E34] focus:ring-opacity-50"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddPageTypeDialogOpen(false)}
              className="bg-white hover:bg-gray-100 shadow-sm hover:shadow transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNewPageType}
              className="bg-[#B04E34] hover:bg-[#963F28] text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for editing existing Project */}
      <Dialog
        open={editProjectDialogOpen}
        onOpenChange={setEditProjectDialogOpen}
      >
        <DialogContent className="sm:max-w-sm bg-white shadow-2xl border-none rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg">Edit Project Name</DialogTitle>
            <DialogDescription>
              Update the project name as you wish.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProjectSubmit}>
            <div className="mt-2 space-y-4 mb-4">
              <Input
                type="text"
                placeholder="Project name"
                value={editProjectName}
                onChange={(e) => setEditProjectName(e.target.value)}
                className="shadow-sm focus:ring-2 focus:ring-[#B04E34] focus:ring-opacity-50"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditProjectDialogOpen(false)}
                className="bg-white hover:bg-gray-100 shadow-sm hover:shadow transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#B04E34] hover:bg-[#963F28] text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
