"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Eye, Plus, Save } from "lucide-react";
import AppBar from "@/components/layout/AppBar";
import StepperBreadCrumb from "@/components/organisms/StepperBreadCrumb/StepperBreadCrumb";
import { ReportType } from "@/types/report.types";
import { HeuristicType, IssueOrdersType, ReportIssueType } from "@/types/reportIssue.types";
import { UserRoleType } from "@/types/user.types";
import ScoreBar from "@/components/templates/ScoreBar/ScoreBar";
import IssueListView from "@/components/templates/IssueListView/IssueListView";
import { Heuristics, IssueOrdersInitState } from "@/constants/reportIssue.constants";
import { OptionType } from "@/types/common.types";
import LoadingOverlay from "@/components/layout/LoadingOverlay";
import IssuesContainer from "@/components/templates/ScreenshotView/IssuesContainer";
import { useDrawRect } from "@/hooks/useDrawRect";
import CreateIsseModal from "@/components/organisms/CreateIssueModal/CreateIsseModal";
import IssueDetailModal from "@/components/organisms/IssueDetailModal/IssueDetailModal";
import ScreenshotOverlay from "@/components/templates/ScreenshotView/ScreenshotOverlay";
import { ReportStatus } from "@/components/organisms/ReportList/ReportList.types";
import { useToast } from "@/hooks/useToast";

const breadcrumbsteps = [
  { label: "Heuristic Evaluation", value: "heuristic" },
  { label: "Report Summary", value: "summary" },
];

export default function EditReportPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const { id: reportId } = params;
  const userRole = session?.user?.role;
  const { toast } = useToast();

  useEffect(() => {
    //if user is not logged redirect to login page
    //if user is not admin or tester redirect to dashboard
    if (!session) {
      router.push("/signin");
    } else if (userRole !== UserRoleType.Validator && userRole !== UserRoleType.Contributor) {
      router.push("/dashboard");
    }
  }, [session, userRole, router]);

  // Original report loaded from the API
  const [originalReport, setOriginalReport] = useState<ReportType | null>(null);
  const [reportIssues, setReportIssues] = useState<ReportIssueType[]>([]);
  const [issueOrders, setIssueOrders] = useState<IssueOrdersType>(IssueOrdersInitState);
  const [pageTypes, setPageTypes] = useState<OptionType[]>();
  const [customerIssues, setCustomerIssues] = useState<OptionType[]>();
  const [summaryMode, setSummaryMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState("screenshot");
  const [reportNotes, setReportNotes] = useState("");
  const [isReportInReview, setIsReportInReview] = useState(false);

  // ReportIssue related states and hooks
  const [showNewIssueModal, setShowNewIssueModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<ReportIssueType | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const { rectangle, enableDrawing, disableDrawing, isDrawingEnabled, clearRectangle, isCropping } =
    useDrawRect(containerRef);

  const getConstants = async () => {
    const response = await fetch(`/api/constants?target=customerIssues`);
    const data = await response.json();

    setCustomerIssues(data.customerIssues);
    setPageTypes(data.pageTypeOptions);
  };

  const groupFunc = async (reportIssues: ReportIssueType[]) => {
    const newIssueOrders: IssueOrdersType = Heuristics.reduce((acc, heuristic) => {
      const targetIssue = reportIssues.find((issue) => issue.heuristic.code === heuristic.code);
      acc[heuristic.code] = targetIssue?.order ?? 0;
      return acc;
    }, {} as Record<HeuristicType["code"], number>);

    setIssueOrders(newIssueOrders);
  };

  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/report?id=${reportId}`);
      if (!res.ok) throw new Error("Failed to fetch report");
      const data: ReportType = await res.json();
      setOriginalReport(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchReportIssues = async () => {
    try {
      const res = await fetch(`/api/report/issue?reportId=${reportId}`);

      if (!res.ok) throw new Error("Failed to fetch report issues");

      const data: ReportIssueType[] = await res.json();
      await groupFunc(data);
      setReportIssues(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (reportId) {
      getConstants();

      fetchReport()
        .then(() => {
          fetchReportIssues();
          if (originalReport && originalReport.status === ReportStatus.InReview) {
            setIsReportInReview(true);
            setSummaryMode(true);
          }
        })
        .catch((error) => {
          console.error("Error fetching report:", error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (rectangle) {
      setShowNewIssueModal(true);
    }
  }, [rectangle]);

  function handleCreateNewIssue(issue: ReportIssueType) {
    // TODO: DELETE OR UPDATE FLOW SHOULD BE ADDED FOR PREVIOUSLY CREATED ISSUES
    clearRectangle();
    setReportIssues((prev) => [...prev, issue]);
    setIssueOrders((prev) => ({ ...prev, [issue.heuristic.code]: issue.order }));
    setShowNewIssueModal(false);
  }

  const completeAndSeeSummary = () => {
    setSummaryMode(!summaryMode);
  };

  const saveReportAnalysis = async () => {
    // TODO: handle save report analysis here
    const response = await fetch(`/api/report?id=${reportId}`, {
      method: "PUT",
      body: JSON.stringify({ status: ReportStatus.InReview }),
    });

    if (!response.ok) {
      toast({
        title: "Error",
        description: "Failed to send report to review",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Report has been sent for review",
      });

      setIsReportInReview(true);
      setSummaryMode(true);
    }
  };

  if (!originalReport) return <LoadingOverlay message="Loading report for editing..." />;

  return (
    <>
      <AppBar />
      {isCropping && <LoadingOverlay message="Cropping the image..." hasOpacity />}
      {isDrawingEnabled && !isCropping && <ScreenshotOverlay targetRef={containerRef} onCancel={disableDrawing} />}
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-6">
          {/* Stepper Breadcrumb */}
          <div className="w-100 flex justify-center">
            <StepperBreadCrumb steps={breadcrumbsteps} currentStep={breadcrumbsteps[+summaryMode].value} />
          </div>

          {/* Header */}
          <Card className="mt-4 mb-6 border-none shadow-lg bg-white transition-all duration-300 hover:shadow-xl">
            <CardHeader className="pb-0">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center">
                  <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-1">
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-[#FFF1E0] text-[#963F28] border-0 p-2 font-normal">
                    <strong>Website:</strong>
                    <span className="ms-1">{originalReport.url}</span>
                  </Badge>
                  <Badge variant="outline" className="bg-[#FFF1E0] text-[#963F28] border-0 p-2 font-normal">
                    <strong>Page:</strong>
                    <span className="ms-1">
                      {pageTypes?.find((page) => page.value === originalReport.pageType)?.label ?? "undefined"}
                    </span>
                  </Badge>
                  <Badge variant="outline" className="bg-[#FFF1E0] text-[#963F28] border-0 p-2 font-normal">
                    <strong>Issues:</strong>
                    <span className="ms-1">
                      {customerIssues?.find(
                        (customerIssues) => customerIssues.value === originalReport.predefinedIssues?.[0]
                      )?.label ?? "Not specified"}
                    </span>
                  </Badge>
                </div>
                {!isReportInReview && (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={completeAndSeeSummary}
                      className="bg-[#B04E34] hover:bg-[#963F28] text-white flex items-center gap-1"
                      size="sm">
                      {summaryMode ? <ChevronLeft className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span>{summaryMode ? "Back to Editing" : "Complete & See Summary"}</span>
                    </Button>
                    {summaryMode && (
                      <Button
                        onClick={saveReportAnalysis}
                        className="bg-[#B04E34] hover:bg-[#963F28] text-white flex items-center gap-1"
                        size="sm">
                        <Save className="h-4 w-4" />
                        <span>Submit Report for Review</span>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-medium mb-4">Additional Info from the Customer</h3>
              {originalReport.predefinedIssues && originalReport.predefinedIssues.length > 0
                ? originalReport.predefinedIssues.map((preDefinedIssue, index) => (
                    <p className="text-sm mb-4" key={`user-defined-issue-${index}`}>
                      {preDefinedIssue}
                    </p>
                  ))
                : "Not specified"}
              <h3 className="text-lg font-medium my-4">General Summary from the Contributor</h3>
              {/* Additional Notes */}
              <div className="grid grid-cols-1 md:grid-cols-12 mt-4">
                <div className="md:col-span-12">
                  {summaryMode ? (
                    reportNotes ?? "Not specified"
                  ) : (
                    <Textarea
                      placeholder="Summarize the website page experience based on the heuristic evaluation"
                      value={reportNotes}
                      onChange={(e) => setReportNotes(e.target.value)}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Card className="mt-4 mb-6 border-none shadow-lg bg-white transition-all duration-300 hover:shadow-xl">
            <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <CardHeader className="pb-0">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <h3 className="text-lg font-medium mb-4">Screenshot/Website Preview</h3>
                  {!summaryMode && selectedTab === "screenshot" && !isReportInReview && (
                    <Button
                      onClick={enableDrawing}
                      disabled={isDrawingEnabled}
                      className="bg-[#B04E34] hover:bg-[#963F28] text-white flex items-center gap-1"
                      size="sm">
                      <Plus className="h-4 w-4" />
                      <span>Draw Issue Area</span>
                    </Button>
                  )}
                  <div className="flex items-center">
                    <TabsList className="w-full grid grid-cols-2">
                      <TabsTrigger value="screenshot">Screenshot View</TabsTrigger>
                      <TabsTrigger value="list">Listed View</TabsTrigger>
                    </TabsList>
                  </div>
                </div>
                {summaryMode && <ScoreBar overallScore={93} totalIssues={4} />}
              </CardHeader>
              <CardContent>
                <TabsContent value="screenshot" className="mt-4">
                  <div ref={containerRef} className="w-full h-max border-none relative" style={{ zIndex: 45 }}>
                    <IssuesContainer
                      hideIssues={isDrawingEnabled}
                      imgUrl={originalReport.screenshotImgUrl}
                      reportIssues={reportIssues}
                      onIssueClick={setSelectedIssue}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="list" className="mt-4">
                  <IssueListView issues={reportIssues} />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* New Issue Modal */}
      {showNewIssueModal && (
        <CreateIsseModal
          isOpen
          targetReport={originalReport}
          issueOrders={issueOrders}
          issueRectangle={rectangle!}
          onSaveIssue={handleCreateNewIssue}
          onClose={setShowNewIssueModal}
        />
      )}

      {selectedIssue && <IssueDetailModal isOpen issue={selectedIssue!} onClose={() => setSelectedIssue(null)} />}
    </>
  );
}
