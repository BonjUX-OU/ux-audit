// app/dashboard/page.tsx
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import AppBar from "@/components/layout/AppBar";
import ProjectSidebar from "@/components/dashboard/ProjectSidebar";
import SubscriptionDialog from "@/components/dashboard/SubscriptionDialog";
import EditProjectDialog from "@/components/dashboard/EditProjectDialog";
import DeleteProjectDialog from "@/components/dashboard/DeleteProjectDialog";
import DeleteReportDialog from "@/components/dashboard/DeleteReportDialog";
import AddSectorDialog from "@/components/dashboard/AddSectorDialog";
import AddPageTypeDialog from "@/components/dashboard/AddPageTypeDialog";
import ReportForm from "@/components/dashboard/ReportForm";
import ReportsTable from "@/components/dashboard/ReportsTable";
import ReportsByPageTypeTabs from "@/components/dashboard/ReportsByPageTypeTabs";
import AnalysisModal from "@/components/dashboard/AnalysisModal";

import { getRatingColor, getRatingLabel } from "@/utils/rating";
import type { Project, AnalysisReport, AnalysisStep } from "@/types/dashboard";

export default function DashboardPage() {
  const { data: session }: any = useSession();
  const router = useRouter();

  // --- subscription/trial logic ---
  const userRole = session?.user?.role;
  const userSubscribed = session?.user?.subscribed;
  const used = session?.user?.usedAnalyses ?? 0;
  const created = session?.user?.createdAt
    ? new Date(session.user.createdAt)
    : new Date(0);
  const trialEnd = new Date(created.getTime() + 7 * 86400e3);
  const now = new Date();
  const withinTrial = now < trialEnd;
  const underLimit = used < 10;
  const allowed =
    userRole === "admin" ||
    userRole === "tester" ||
    userSubscribed ||
    (withinTrial && underLimit);
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  useEffect(() => {
    if (session?.user && !allowed) setSubscribeOpen(true);
  }, [session, allowed]);

  function handleSubscribeNow() {
    const link = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;
    if (!link) return alert("No Payment Link available.");
    window.location.href = link;
  }

  const daysLeft = Math.max(
    0,
    Math.ceil((trialEnd.getTime() - now.getTime()) / 86400e3)
  );

  // --- sectors/page types state ---
  const [sectors, setSectors] = useState<string[]>([
    "Healthcare",
    "Finance",
    "Education",
    "E-commerce",
    "Technology / Software",
    "Real Estate",
    "Entertainment & Media",
    "Tourism & Travel",
    "Social Networking",
    "Manufacturing",
    "Consulting & Professional Services",
    "Nonprofit/NGO",
    "Retail",
    "Telecommunications",
    "Automotive",
  ]);
  const [pageTypes, setPageTypes] = useState<string[]>([
    "Homepage",
    "Product/Service Page",
    "About Page",
    "Blog Page",
    "Contact Page",
    "FAQ Page",
    "E-commerce Product Page",
    "Pricing Page",
  ]);

  // --- dialogs state ---
  const [addSectorOpen, setAddSectorOpen] = useState(false);
  const [newSector, setNewSector] = useState("");
  const [addPageTypeOpen, setAddPageTypeOpen] = useState(false);
  const [newPageType, setNewPageType] = useState("");

  // --- projects & reports ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project>({
    _id: "all",
    name: "All Reports",
  });
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // --- new project form ---
  const [newProjOpen, setNewProjOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // --- edit/delete project ---
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [toEdit, setToEdit] = useState<Project | null>(null);

  const [delProjOpen, setDelProjOpen] = useState(false);
  const [delProjConfirm, setDelProjConfirm] = useState("");
  const [toDeleteProj, setToDeleteProj] = useState<Project | null>(null);

  // --- delete report ---
  const [delRepOpen, setDelRepOpen] = useState(false);
  const [toDeleteRep, setToDeleteRep] = useState<AnalysisReport | null>(null);

  // --- analysis form ---
  const [url, setUrl] = useState("");
  const [selSector, setSelSector] = useState("");
  const [selPageType, setSelPageType] = useState("");

  // --- analysis modal ---
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [steps, setSteps] = useState<AnalysisStep[]>([
    { label: "Scanning the website...", status: "pending" },
    { label: "Analyzing webpage & Highlighting issues...", status: "pending" },
    {
      label: "Generating final analysis & storing report...",
      status: "pending",
    },
  ]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [finalReportId, setFinalReportId] = useState<string | null>(null);

  // --- handlers & fetchers ---
  async function fetchProjects() {
    if (!session?.user?.id) return;
    const res = await fetch(`/api/user/projects?userId=${session.user.id}`);
    if (!res.ok) throw new Error("Fetch projects failed");
    const data = await res.json();
    setProjects([{ _id: "all", name: "All Reports" }, ...data]);
    setCurrentProject({ _id: "all", name: "All Reports" });
  }
  async function fetchReports() {
    if (!session?.user?.id) return;
    setLoadingReports(true);
    try {
      const r = await fetch(`/api/user/reports?userId=${session.user.id}`);
      if (!r.ok) throw new Error();
      setReports(await r.json());
    } finally {
      setLoadingReports(false);
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchProjects();
      fetchReports();
    }
  }, [session]);

  function handleSectorSelect(val: string) {
    if (val === "add-new-sector") return setAddSectorOpen(true);
    setSelSector(val);
  }
  function handlePageTypeSelect(val: string) {
    if (val === "add-new-pagetype") return setAddPageTypeOpen(true);
    setSelPageType(val);
  }

  function handleCreateProject(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    // ...fetch POST /api/projects...
    setNewName("");
    setNewDesc("");
    setNewProjOpen(false);
    fetchProjects();
  }
  function handleEditProject(e: FormEvent) {
    e.preventDefault();
    if (!editName.trim() || !toEdit) return;
    // ...fetch PUT...
    setEditOpen(false);
    setToEdit(null);
    setEditName("");
    fetchProjects();
  }
  function handleDeleteProject() {
    if (!toDeleteProj) return;
    // ...fetch DELETE...
    setDelProjOpen(false);
    setToDeleteProj(null);
    fetchProjects();
    fetchReports();
    setCurrentProject({ _id: "all", name: "All Reports" });
  }
  function handleDeleteReport() {
    if (!toDeleteRep) return;
    // ...fetch DELETE...
    setDelRepOpen(false);
    setToDeleteRep(null);
    fetchReports();
  }

  function resetSteps() {
    setSteps([
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
    if (!allowed) return setSubscribeOpen(true);
    if (!url.trim()) return;
    // ...complex 3-step logic...
  }

  // --- derived ---
  const isAll = currentProject._id === "all";
  const projectReports = isAll
    ? reports
    : reports.filter((r) => r.project._id === currentProject._id);
  const reportsByPageType: Record<string, AnalysisReport[]> = {};
  projectReports.forEach((r) => {
    const pt = r.pageType || "Other";
    reportsByPageType[pt] ||= [];
    reportsByPageType[pt].push(r);
  });

  return (
    <>
      <SubscriptionDialog
        open={subscribeOpen}
        onOpenChange={setSubscribeOpen}
        onSubscribe={handleSubscribeNow}
      />

      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <AppBar />
        <div className="flex flex-1 pt-16 px-4 md:px-6 lg:px-8 pb-8">
          <aside className="hidden md:block w-64 mr-6">
            <ProjectSidebar
              projects={projects}
              currentProjectId={currentProject._id}
              onSelect={setCurrentProject}
              onEdit={(p) => {
                setToEdit(p);
                setEditName(p.name);
                setEditOpen(true);
              }}
              onDelete={(p) => {
                setToDeleteProj(p);
                setDelProjOpen(true);
              }}
              newDialogOpen={newProjOpen}
              setNewDialogOpen={setNewProjOpen}
              newName={newName}
              newDesc={newDesc}
              setNewName={setNewName}
              setNewDesc={setNewDesc}
              onCreate={handleCreateProject}
            />
          </aside>

          <main className="flex-1">
            {!userSubscribed && (withinTrial || underLimit) && (
              <div className="bg-[#FFF1E0] text-gray-700 mb-4 p-3 rounded-md border border-[#FADBBB] flex justify-between">
                <div>
                  <strong>Your free trial ends in {daysLeft} Days.</strong>
                  <br />
                  To keep going, just add your payment details — you’ll only be
                  charged <strong>€4.99/month</strong> after.
                </div>
                <button
                  onClick={handleSubscribeNow}
                  className="text-[#B04E34] flex items-center"
                >
                  Subscribe Now <span className="ml-1">→</span>
                </button>
              </div>
            )}

            <ReportForm
              url={url}
              setUrl={setUrl}
              sectors={sectors}
              onSectorSelect={handleSectorSelect}
              selectedSector={selSector}
              pageTypes={pageTypes}
              onPageTypeSelect={handlePageTypeSelect}
              selectedPageType={selPageType}
              onSubmit={handleCreateAnalysis}
              generating={analysisOpen}
            />

            {isAll ? (
              <ReportsTable
                reports={projectReports}
                loading={loadingReports}
                onDelete={(r) => {
                  setToDeleteRep(r);
                  setDelRepOpen(true);
                }}
              />
            ) : (
              <ReportsByPageTypeTabs
                grouped={reportsByPageType}
                loading={loadingReports}
                onDelete={(r) => {
                  setToDeleteRep(r);
                  setDelRepOpen(true);
                }}
                scrollToForm={() =>
                  document
                    .querySelector("form")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              />
            )}
          </main>
        </div>

        <AnalysisModal
          open={analysisOpen}
          onOpenChange={setAnalysisOpen}
          steps={steps}
          error={analysisError}
          finalReportId={finalReportId}
        />

        <AddSectorDialog
          open={addSectorOpen}
          onOpenChange={setAddSectorOpen}
          value={newSector}
          setValue={setNewSector}
          onAdd={() => {
            if (newSector.trim() && !sectors.includes(newSector)) {
              setSectors((prev) => [...prev, newSector]);
              setSelSector(newSector);
            }
            setNewSector("");
            setAddSectorOpen(false);
          }}
        />

        <AddPageTypeDialog
          open={addPageTypeOpen}
          onOpenChange={setAddPageTypeOpen}
          value={newPageType}
          setValue={setNewPageType}
          onAdd={() => {
            if (newPageType.trim() && !pageTypes.includes(newPageType)) {
              setPageTypes((prev) => [...prev, newPageType]);
              setSelPageType(newPageType);
            }
            setNewPageType("");
            setAddPageTypeOpen(false);
          }}
        />

        <EditProjectDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          name={editName}
          setName={setEditName}
          onSubmit={handleEditProject}
        />

        <DeleteProjectDialog
          open={delProjOpen}
          onOpenChange={setDelProjOpen}
          projectName={toDeleteProj?.name || ""}
          confirmationValue={delProjConfirm}
          setConfirmationValue={setDelProjConfirm}
          onConfirm={handleDeleteProject}
        />

        <DeleteReportDialog
          open={delRepOpen}
          onOpenChange={setDelRepOpen}
          onConfirm={handleDeleteReport}
        />
      </div>
    </>
  );
}
