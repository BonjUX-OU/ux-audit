"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
  FileIcon,
  Globe,
  Layers,
  FolderPlus,
  Edit,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ConfirmationModal from "@/components/organisms/ConfirmationModal/ConfirmationModal";
import { SelectItemType } from "@/components/organisms/SelectElement/SelectElement.types";
import SelectElement from "@/components/organisms/SelectElement/SelectElement";
import ReportList from "@/components/organisms/ReportList/ReportList";

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

function getLeftPercent(score: number) {
  const clamped = Math.min(100, Math.max(0, score));
  return `${clamped}%`;
}

// ------------------------------------
// ComparisonScale Component
// ------------------------------------
function ComparisonScale({ reports }: { reports: AnalysisReport[] }) {
  if (!reports || !reports.length) return null;

  const sortedByDate = [...reports].sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());

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
              <div key={report._id} className="absolute -top-3 transform -translate-x-1/2" style={{ left }}>
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
  const router = useRouter();

  // ------------------------------------
  // Subscription & Free Trial Logic
  // ------------------------------------
  const userRole = session?.user?.role;
  const userSubscribed = session?.user?.subscribed;
  const userUsedAnalyses = session?.user?.usedAnalyses ?? 0;
  const userCreatedAt = session?.user?.createdAt ? new Date(session.user.createdAt) : new Date(0);

  // 7-day trial calculation
  const trialEnd = new Date(userCreatedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const within7Days = now < trialEnd;
  const under10Analyses = userUsedAnalyses < 10;

  // If user is admin/tester => no limit
  // If user.subscribed => no limit
  // Otherwise => must be within7Days && under10Analyses
  const userAllowedToAnalyze =
    userRole === "admin" || userRole === "tester" || userSubscribed || (within7Days && under10Analyses);

  // We'll show a forced subscription dialog if user is blocked
  const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false);

  // Payment Link from env
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || "";

  // If blocked from analyzing, open subscription modal
  useEffect(() => {
    if (session?.user && !userAllowedToAnalyze) {
      setSubscribeDialogOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, userAllowedToAnalyze]);

  function handleSubscribeNow() {
    if (!paymentLink) {
      alert("No Payment Link available. Please contact support.");
      return;
    }
    window.location.href = paymentLink;
  }

  // Calculate how many days left in trial
  const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  // ------------------------------------
  // Sectors and Page Types
  // ------------------------------------
  const sectorOptions: SelectItemType[] = [
    { value: "healt", label: "Healthcare" },
    { value: "finance", label: "Finance" },
    { value: "education", label: "Education" },
    { value: "eCommerce", label: "E-commerce" },
    { value: "technology", label: "Technology / Software" },
    { value: "realEstate", label: "Real Estate" },
    { value: "entertaintment", label: "Entertainment & Media" },
    { value: "tourism", label: "Tourism & Travel" },
    { value: "socialNetwork", label: "Social Networking" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "consulting", label: "Consulting & Professional Services" },
    { value: "nonprofit", label: "Nonprofit/NGO" },
    { value: "retail", label: "Retail" },
    { value: "telecom", label: "Telecommunications" },
    { value: "automotive", label: "Automotive" },
  ];

  const pageTypeOptions: SelectItemType[] = [
    { value: "home", label: "Homepage" },
    { value: "service", label: "Product/Service Page" },
    { value: "about", label: "About Page" },
    { value: "blog", label: "Blog Page" },
    { value: "contact", label: "Contact Page" },
    { value: "faq", label: "FAQ Page" },
    { value: "product", label: "E-commerce Product Page" },
    { value: "pricing", label: "Pricing Page" },
  ];

  // ------------------------------------
  // Projects & Reports
  // ------------------------------------
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // ------------------------------------
  // Form State for New Project
  // ------------------------------------
  const [openDialog, setOpenDialog] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // ------------------------------------
  // Form State for New Analysis
  // ------------------------------------
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
      label: "Analyzing webpage & Highlighting issues...",
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
  // Delete Project
  // ------------------------------------
  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
  const [deleteProjectName, setDeleteProjectName] = useState("");
  const [selectedProjectToDelete, setSelectedProjectToDelete] = useState<Project | null>(null);

  // ------------------------------------
  // Delete Report
  // ------------------------------------
  const [deleteReportDialogOpen, setDeleteReportDialogOpen] = useState(false);
  const [selectedReportToDelete, setSelectedReportToDelete] = useState<AnalysisReport | null>(null);

  // ------------------------------------
  // Fetch Projects & Reports
  // ------------------------------------
  async function fetchProjects() {
    if (!session?.user?.id) return;
    try {
      const response = await fetch(`/api/user/projects?userId=${session.user.id}`);
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
  // Edit Project Name
  // ------------------------------------
  function handleEditProjectClick(project: Project) {
    if (project._id === "all") return; // skip "All Reports"
    setEditProjectData(project);
    setEditProjectName(project.name);
    setEditProjectDialogOpen(true);
  }

  async function handleEditProjectSubmit() {
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
      await fetchProjects();
    } catch (error) {
      console.error(error);
      alert("Failed to update project. Please try again.");
    }
  }

  // ------------------------------------
  // Delete Project
  // ------------------------------------
  function handleDeleteProjectClick(project: Project) {
    if (project._id === "all") return; // skip "All Reports"
    setSelectedProjectToDelete(project);
    setDeleteProjectName("");
    setDeleteProjectDialogOpen(true);
  }

  async function confirmDeleteProject() {
    if (!selectedProjectToDelete?._id) return;

    try {
      const response = await fetch(`/api/projects?id=${selectedProjectToDelete._id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Error deleting project");
      }
      setDeleteProjectDialogOpen(false);
      setSelectedProjectToDelete(null);
      fetchProjects();
      fetchUserReports();
      // If the deleted project was currently selected, reset to "All Reports"
      if (currentProject?._id === selectedProjectToDelete._id) {
        setCurrentProject(projects.find((p) => p._id === "all") || null);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete project. Please try again.");
    }
  }

  // ------------------------------------
  // Analysis Logic
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

    // If user is blocked from analyzing, show the forced dialog
    if (!userAllowedToAnalyze) {
      alert("Your free trial has ended. Please subscribe to continue.");
      setSubscribeDialogOpen(true);
      return;
    }

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
      setAnalysisSteps((prev) => prev.map((s, i) => (i === 0 ? { ...s, status: "in-progress" } : s)));
      const step1Res = await fetch("/api/analyze/step1", {
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
      setAnalysisSteps((prev) => prev.map((s, i) => (i === 0 ? { ...s, status: "done" } : s)));

      // STEP 2
      setAnalysisSteps((prev) => prev.map((s, i) => (i === 1 ? { ...s, status: "in-progress" } : s)));
      const step2Res = await fetch("/api/analyze/step2", {
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
      setAnalysisSteps((prev) => prev.map((s, i) => (i === 1 ? { ...s, status: "done" } : s)));

      // STEP 3
      setAnalysisSteps((prev) => prev.map((s, i) => (i === 2 ? { ...s, status: "in-progress" } : s)));
      const step3Res = await fetch("/api/analyze/step3", {
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
          project: currentProject._id === "all" ? newProjectId : currentProject._id,
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
      setAnalysisSteps((prev) => prev.map((s, i) => (i === 2 ? { ...s, status: "done" } : s)));

      // If user is normal and not subscribed, increment usage
      if (userRole === "user" && !userSubscribed) {
        await fetch("/api/user/increment-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: session.user.id }),
        });
        // Force refresh to update session usedAnalyses
        router.refresh();
      }

      // Finally, refresh to see new reports
      fetchUserReports();
    } catch (error: any) {
      console.error("Analysis error:", error);
      setAnalysisError(error.message || "Unknown error");
      setAnalysisSteps((prev) => {
        const idx = prev.findIndex((s) => s.status === "in-progress");
        if (idx >= 0) {
          return prev.map((step, i) => (i === idx ? { ...step, status: "error" } : step));
        }
        return prev;
      });
    }
  }

  // ------------------------------------
  // Delete Report
  // ------------------------------------
  function handleDeleteReportClick(report: AnalysisReport) {
    setSelectedReportToDelete(report);
    setDeleteReportDialogOpen(true);
  }

  async function confirmDeleteReport() {
    if (!selectedReportToDelete?._id) return;
    try {
      const response = await fetch(`/api/report?id=${selectedReportToDelete._id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Error deleting report");
      }
      setDeleteReportDialogOpen(false);
      setSelectedReportToDelete(null);
      fetchUserReports();
    } catch (error) {
      console.error(error);
      alert("Failed to delete report. Please try again.");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // ------------------------------------
  // Derived Data
  // ------------------------------------
  const isAllProjects = currentProject?._id === "all";
  const projectReports = isAllProjects ? reports : reports.filter((r) => r.project._id === currentProject?._id);

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
      {/* FORCED SUBSCRIBE DIALOG IF BLOCKED */}
      <Dialog open={subscribeDialogOpen} onOpenChange={setSubscribeDialogOpen}>
        <DialogContent className="sm:max-w-sm bg-white shadow-2xl border-none rounded-xl">
          <DialogHeader>
            <div className="bg-[#E84C30] rounded-full w-24 h-24 flex items-center justify-center mb-4">
              <span className="text-white text-3xl font-bold">X . X</span>
            </div>
            <DialogTitle className="text-lg">Free Trial Ended!</DialogTitle>
            <DialogDescription>
              To keep going, just add your payment details. You’ll only be charged €4.99/month.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleSubscribeNow} className="bg-[#B04E34] text-white w-full">
              Subscribe Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <AppBar />
        <div className="flex flex-1 pt-16 px-4 md:px-6 lg:px-8 pb-8">
          {/* Sidebar */}
          <aside className="hidden md:block w-64 mr-6">
            <Card className="sticky top-20 shadow-lg border-none bg-white transition-all duration-300 hover:shadow-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Projects</CardTitle>
                  <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-[#B04E34] hover:bg-[#FFF1E0] transition-colors duration-200">
                        <Plus className="h-4 w-4 mr-1" />
                        New
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-white shadow-2xl border-none rounded-xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl">Create a new Project</DialogTitle>
                        <DialogDescription>Enter details for your new project.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateProject} className="space-y-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Name</label>
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
                          <label className="block text-sm font-medium mb-1">Description</label>
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
                            className="bg-white hover:bg-gray-100 shadow-sm hover:shadow transition-all duration-200">
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="bg-[#B04E34] hover:bg-[#963F28] text-white shadow-md hover:shadow-lg transition-all duration-200">
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
                      <div key={project._id} className="group flex items-center justify-between">
                        <button
                          onClick={() => handleProjectClick(project)}
                          className={cn(
                            "flex items-center text-left px-3 py-2 rounded-md w-full transition-all duration-200",
                            currentProject?._id === project._id
                              ? "bg-[#FFF1E0] text-[#B04E34] font-medium shadow-sm"
                              : "hover:bg-gray-100 text-gray-700"
                          )}>
                          {project._id === "all" ? (
                            <Layers className="h-4 w-4 mr-2 flex-shrink-0" />
                          ) : (
                            <FileIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          )}
                          <span className="truncate">{project.name}</span>
                        </button>
                        {project._id !== "all" && (
                          <div className="flex flex-row items-center mr-2 space-x-2">
                            {/* Edit Button */}
                            <button
                              onClick={() => handleEditProjectClick(project)}
                              className="hidden group-hover:block text-gray-400 hover:text-[#B04E34] transition-colors duration-200"
                              title="Edit project name">
                              <Edit className="h-4 w-4" />
                            </button>
                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteProjectClick(project)}
                              className="hidden group-hover:block text-gray-400 hover:text-red-600 transition-colors duration-200"
                              title="Delete project">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
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
            {/* 
              TOP BANNER if user is unsubscribed or still in trial:
              e.g.: "Your free trial ends in X Days. Just add your payment details..."
            */}
            {!userSubscribed && (within7Days || under10Analyses) && (
              <div className="bg-[#FFF1E0] text-sm text-gray-700  mt-4 mb-2 p-3 rounded-md flex items-center justify-between border border-[#FADBBB]">
                <div>
                  <strong className="mr-1">Your free trial ends in {daysLeft} Days.</strong>
                  <br />
                  {"To keep going, just add your payment details — you’ll only be charged"}{" "}
                  <span className="font-semibold">€4.99/month</span> {"after your free trial ends."}
                </div>
                <Button onClick={handleSubscribeNow} variant="ghost" className="text-[#B04E34] ml-4">
                  Subscribe Now
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}

            {/* Welcome Card */}
            <Card className="mb-6 border-none shadow-lg bg-white transition-all duration-300 hover:shadow-xl">
              <CardHeader className="pb-0">
                <CardTitle className="text-2xl font-normal flex items-center">
                  Welcome, {session?.user?.name?.split(" ")[0]}! 👋
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-4">Generate a New Report</h3>
                  <form onSubmit={handleCreateAnalysis} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-5">
                      <label className="block text-sm font-medium mb-1.5 ">Page URL</label>
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
                      <SelectElement
                        label="Sector"
                        placeholder="Select Sector"
                        options={sectorOptions}
                        onValueChange={(item) => setSelectedSector(item.value)}
                      />
                    </div>

                    {/* Page Type */}
                    <div className="md:col-span-2">
                      <SelectElement
                        label="Page Type"
                        placeholder="Select Page Type"
                        options={pageTypeOptions}
                        onValueChange={(item) => setSelectedPageType(item.value)}
                      />
                    </div>

                    {/* Generate Button */}
                    <div className="md:col-span-2">
                      {showAnalysisModal ? (
                        <Button
                          type="submit"
                          disabled
                          className="w-full bg-[#B04E34] text-white shadow-md hover:shadow-lg transition-all duration-200">
                          Generating...
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          className="w-full bg-[#B04E34] hover:bg-[#963F28] text-white shadow-md hover:shadow-lg transition-all duration-200">
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
                  <CardTitle className="text-xl font-medium">{currentProject?.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {isAllProjects ? (
                  <div className="mt-2">
                    <ScrollArea className="h-[48vh] pr-4 -mr-4">
                      <ReportList
                        isLoading={loadingReports}
                        reports={reports}
                        onDeleteReportClick={handleDeleteReportClick}
                      />
                    </ScrollArea>
                  </div>
                ) : (
                  <>
                    {!pageTypes.length && !loadingReports && (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-50 rounded-lg shadow-sm">
                        <FolderPlus className="h-16 w-16 mb-4 text-gray-300" />
                        <p className="text-center text-lg font-medium mb-2">No reports in this project</p>
                        <p className="text-center text-gray-400 mb-6">Generate your first report for this project</p>
                        <Button
                          onClick={() => document.querySelector("form")?.scrollIntoView({ behavior: "smooth" })}
                          className="bg-[#B04E34] hover:bg-[#963F28] text-white shadow-md hover:shadow-lg transition-all duration-200">
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
                              className="px-4 rounded-md data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm transition-all duration-200">
                              {pt}{" "}
                              <Badge variant="outline" className="ml-2 bg-white shadow-sm">
                                {reportsByPageType[pt].length}
                              </Badge>
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        {pageTypes.map((pt) => (
                          <TabsContent key={pt} value={pt}>
                            <ComparisonScale reports={reportsByPageType[pt]} />
                            <ScrollArea className="h-[350px] mt-4 pr-4 -mr-4">
                              <ReportList
                                reports={reportsByPageType[pt]}
                                onDeleteReportClick={handleDeleteReportClick}
                              />
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
                {analysisError ? <span className="text-red-500">Analysis Failed</span> : "Analyzing Your Website..."}
              </DialogTitle>
              <DialogDescription className="text-center">
                {analysisError ? (
                  <>
                    <p className="text-red-600 mb-2">An error occurred during analysis:</p>
                    <p className="text-sm italic">{analysisError}</p>
                    <p className="mt-4 text-sm">
                      Try checking the URL, ensuring the site is public, or retrying in a few moments.
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
                    step.status === "in-progress" ? "bg-blue-50" : step.status === "error" ? "bg-red-50" : "bg-gray-50"
                  )}>
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
                      <span className="font-medium text-blue-600">{step.label}</span>
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
                  className="bg-white hover:bg-gray-100 shadow-sm hover:shadow transition-all duration-200">
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
                  title="Please wait until the analysis completes.">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Working...
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog for editing existing Project */}
      <ConfirmationModal
        title="Edit Project Name"
        description="Update the project name as you wish."
        confirmButtonTitle="Update"
        isOpen={editProjectDialogOpen}
        onCancel={() => setEditProjectDialogOpen(false)}
        onConfirm={handleEditProjectSubmit}>
        <div className="mt-2 space-y-4 mb-4">
          <Input
            type="text"
            placeholder="Project name"
            value={editProjectName}
            onChange={(e) => setEditProjectName(e.target.value)}
            className="shadow-sm focus:ring-2 focus:ring-[#B04E34] focus:ring-opacity-50"
          />
        </div>
      </ConfirmationModal>

      {/* Dialog for Deleting Project */}
      <ConfirmationModal
        variant="danger"
        title="Delete Project"
        description={
          <>
            Deleting the project will remove <strong>all reports</strong> inside it. This action{" "}
            <strong>cannot be undone</strong>.
          </>
        }
        confirmButtonTitle="Delete Project"
        confirmButtonDisabled={!selectedProjectToDelete || deleteProjectName !== selectedProjectToDelete.name}
        isOpen={deleteProjectDialogOpen}
        onConfirm={confirmDeleteProject}
        onCancel={() => setDeleteProjectDialogOpen(false)}>
        <div className="mt-4 text-sm">
          To confirm, type <b>{selectedProjectToDelete?.name}</b> below:
        </div>
        <div className="mt-2 mb-4">
          <Input
            type="text"
            placeholder="Enter project name"
            value={deleteProjectName}
            onChange={(e) => setDeleteProjectName(e.target.value)}
            className="shadow-sm focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
          />
        </div>
      </ConfirmationModal>

      {/* Dialog for Deleting Report */}
      <ConfirmationModal
        variant="danger"
        title="Delete Report"
        description="Are you sure you want to delete this report? This action cannot be undone."
        isOpen={deleteReportDialogOpen}
        confirmButtonTitle="Delete"
        onConfirm={confirmDeleteReport}
        onCancel={() => setDeleteReportDialogOpen(false)}
      />
    </>
  );
}
