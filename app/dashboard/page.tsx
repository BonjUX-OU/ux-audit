"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import AppBar from "@/components/layout/AppBar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, FolderPlus } from "lucide-react";
import ConfirmationModal from "@/components/organisms/ConfirmationModal/ConfirmationModal";
import ReportList from "@/components/organisms/ReportList/ReportList";
import RequestReportBar from "@/components/templates/RequestReportBar/RequestReportBar";
import ProjectsNavBar, { ProjectsNavBarHandle } from "@/components/templates/ProjectsNavBar/ProjectsNavBar";
import CreateProjectButton from "@/components/templates/CreateProjectButton/CreateProjectButton";
import ComparisonScale from "@/components/templates/ComparisonScale/ComparisonScale";
import { ProjectType } from "@/types/project.types";
import ValidatorReportsList, {
  ValidatorReportsListHandle,
} from "@/components/templates/ValidatorReportsList/ValidatorReportsList";
import { UserRoleType } from "@/types/user.types";
import { ReportType } from "@/types/report.types";

export default function DashboardPage() {
  const { data: session } = useSession();

  const [currentProject, setCurrentProject] = useState<ProjectType | null>(null);
  const [reports, setReports] = useState<ReportType[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // ------------------------------------
  // Delete Report
  // ------------------------------------
  const [deleteReportDialogOpen, setDeleteReportDialogOpen] = useState(false);
  const [selectedReportToDelete, setSelectedReportToDelete] = useState<ReportType | null>(null);

  const projectsNavbarRef = useRef<ProjectsNavBarHandle>(null);
  const validatorReportsRef = useRef<ValidatorReportsListHandle>(null);

  async function fetchUserReports() {
    if (!session?.user?._id) return;
    setLoadingReports(true);
    try {
      const res = await fetch(`/api/user/reports?userId=${session.user._id}`);
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
  // Delete Report
  // ------------------------------------
  function handleDeleteReportClick(report: ReportType) {
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
  // Fetching projects and reports
  // ------------------------------------
  useEffect(() => {
    if (session?.user?._id) {
      projectsNavbarRef.current?.fetchProjects();
      fetchUserReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const projectReports = currentProject ? reports.filter((r) => r.project._id === currentProject?._id) : reports;

  const reportsByPageType: Record<string, ReportType[]> = {};
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
                  {session?.user?.role === UserRoleType.Customer ? (
                    <>
                      <CardTitle className="text-lg font-medium">Projects</CardTitle>
                      <CreateProjectButton onCreateSuccess={() => projectsNavbarRef.current?.fetchProjects()} />
                    </>
                  ) : (
                    "Will be updated for validator"
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Separator className="my-2" />
                {session?.user?.role === UserRoleType.Customer && (
                  <ProjectsNavBar ref={projectsNavbarRef} onProjectSelect={setCurrentProject} />
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* 
              TOP BANNER if user is unsubscribed or still in trial:
              e.g.: "Your free trial ends in X Days. Just add your payment details..."
              // TODO: Check subscription modal open
            */}
            {/* <SubscribeBar /> */}

            {/* Welcome Card */}
            <Card className="mt-4 mb-6 border-none shadow-lg bg-white transition-all duration-300 hover:shadow-xl">
              <CardHeader className="pb-0">
                <CardTitle className="text-2xl font-normal flex items-center">
                  Welcome, {session?.user?.name?.split(" ")[0]}! 👋
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RequestReportBar
                  project={currentProject}
                  onRequestComplete={() => {
                    if (session?.user?.role === UserRoleType.Customer) {
                      fetchUserReports();
                    } else {
                      validatorReportsRef.current?.fetchReports();
                    }
                    projectsNavbarRef.current?.fetchProjects();
                  }}
                />
              </CardContent>
            </Card>

            {/* Validator Reports */}
            {session?.user?.role === UserRoleType.Validator && (
              <ScrollArea className="h-[48vh] pr-4 -mr-4">
                <ValidatorReportsList ref={validatorReportsRef} />
              </ScrollArea>
            )}

            {/* Reports Card */}

            {session?.user?.role !== UserRoleType.Validator && (
              <Card className="border-none shadow-lg bg-white transition-all duration-300 hover:shadow-xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-medium">{currentProject?.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {!currentProject ? (
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
            )}
          </main>
        </div>
      </div>

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
