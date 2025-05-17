"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Eye, Plus } from "lucide-react";
import AppBar from "@/components/layout/AppBar";
import StepperBreadCrumb from "@/components/organisms/StepperBreadCrumb/StepperBreadCrumb";
import { ReportType } from "@/types/report.types";
import { useDrawRect } from "@/hooks/useDrawRect";
import CreateIsseModal from "@/components/organisms/CreateIssueModal/CreateIsseModal";
import { ReportIssueType } from "@/types/reportIssue.types";
import { getHeuristicColor } from "@/helpers/getColorHelper";
import IssueDetailModal from "@/components/organisms/IssueDetailModal/IssueDetailModal";

export default function EditReportPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session }: any = useSession();
  const { id } = params; // The report ID to edit
  const userRole = session?.user?.role;

  const containerRef = useRef<HTMLDivElement>(null);
  const { rectangle, enableDrawing, isDrawingEnabled, clearRectangle, isCropping } = useDrawRect(containerRef);

  useEffect(() => {
    //if user is not logged redirect to login page
    //if user is not admin or tester redirect to dashboard
    if (!session) {
      router.push("/signin");
    } else if (userRole !== "validator" && userRole !== "contributor") {
      router.push("/dashboard");
    }
  }, [session, userRole, router]);

  // Original report loaded from the API
  const [originalReport, setOriginalReport] = useState<ReportType | null>(null);
  const [snapshotUrl, setSnapshotUrl] = useState<string | undefined>();
  const [reportIssues, setReportIssues] = useState<ReportIssueType[]>([]);
  const [showNewIssueModal, setShowNewIssueModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<ReportIssueType | null>(null);

  async function fetchReport() {
    try {
      const res = await fetch(`/api/report?id=${id}`);
      if (!res.ok) throw new Error("Failed to fetch report");
      const data: ReportType = await res.json();
      setOriginalReport(data);
      // setEditedHeuristics(data.iss); // !IMPORANT: ReportIssues and Reports need to binded somehow
      setSnapshotUrl(data.screenshotImgUrl);
    } catch (error) {
      console.error(error);
    }
  }

  const fetchReportIssues = async () => {
    try {
      const res = await fetch(`/api/report/issue?reportId=${id}`);

      if (!res.ok) throw new Error("Failed to fetch report issues");

      const data: ReportIssueType[] = await res.json();

      setReportIssues(data);
    } catch (error) {
      console.error(error);
    }
  };

  // ---------------------------
  // 1. LOAD TARGET REPORT
  // ---------------------------
  useEffect(() => {
    if (id) {
      fetchReport()
        .then(() => {
          fetchReportIssues();
        })
        .catch((error) => {
          console.error("Error fetching report:", error);
        });
    }
  }, [id]);

  useEffect(() => {
    if (rectangle) {
      setShowNewIssueModal(true);
    }
  }, [rectangle]);

  useEffect(() => {
    if (!showNewIssueModal) {
      clearRectangle();
    }
  }, [showNewIssueModal]);

  // ------------------------------------------------------
  // 6. *NEW* FUNCTION: ADDING A BRAND NEW ISSUE & OCCURRENCE
  //    WHEN USER FINISHES HIGHLIGHTING AND FILLS THE MODAL
  // ------------------------------------------------------
  function handleCreateNewIssue(issue: ReportIssueType) {
    setReportIssues((prev) => [...prev, issue]);
    setShowNewIssueModal(false);
  }

  // -----------------------------
  // Recent added codes starts here
  // -----------------------------
  const breadcrumbsteps = [
    { label: "Heuristic Evaluation", value: "heuristic" },
    { label: "Report Summary", value: "summary" },
  ];

  const completeAndSeeSummary = () => {};

  // --------------
  // RENDER LOGIC
  // --------------
  if (!originalReport) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#B04E34] border-t-transparent"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading report for editing...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppBar />
      {isCropping && (
        <div className="absoute top-0 left-0 w-screen h-screen flex items-center justify-center bg-gray-50 z-50">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#B04E34] border-t-transparent"></div>
            <p className="mt-4 text-lg font-medium text-gray-700">Cropping the image...</p>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-6">
          {/* Stepper Breadcrumb */}
          <div className="w-100 flex justify-center">
            <StepperBreadCrumb steps={breadcrumbsteps} currentStep={breadcrumbsteps[0].value} />
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
                    <span className="ms-1">https://example.com</span>
                  </Badge>
                  <Badge variant="outline" className="bg-[#FFF1E0] text-[#963F28] border-0 p-2 font-normal">
                    <strong>Page:</strong>
                    <span className="ms-1">Homepage</span>
                  </Badge>
                  <Badge variant="outline" className="bg-[#FFF1E0] text-[#963F28] border-0 p-2 font-normal">
                    <strong>Issues:</strong>
                    <span className="ms-1">Improving user satisfaction&feedback</span>
                  </Badge>
                </div>
                <div className="flex items-center">
                  <Button
                    onClick={completeAndSeeSummary}
                    className="bg-[#B04E34] hover:bg-[#963F28] text-white flex items-center gap-1"
                    size="sm">
                    <Eye className="h-4 w-4" />
                    <span>Complete & See Summary</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-medium mb-4">Additional Info from the Customer</h3>
              <p className="text-sm mb-4">
                Lorem ipsum dolor sit amet amet, lorem ipsum dolor sit amet ametlorem ipsum dolor sit amet ametlorem
                ipsum dolor sit amet ametlorem ipsum dolor sit amet ametlorem ipsum dolor sit amet ametlorem ipsum dolor
                sit amet ametlorem ipsum dolor sit amet amet
              </p>
              <h3 className="text-lg font-medium mb-4">General Summary from the Contributor</h3>
              {/* Additional Notes */}
              <div className="grid grid-cols-1 md:grid-cols-12 mt-4">
                <div className="md:col-span-12">
                  <Textarea
                    placeholder="Summarize the website page experience based on the heuristic evaluation"
                    rows={3}
                    style={{ resize: "none" }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Card className="mt-4 mb-6 border-none shadow-lg bg-white transition-all duration-300 hover:shadow-xl">
            <Tabs defaultValue="screenshot" className="w-full">
              <CardHeader className="pb-0">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <h3 className="text-lg font-medium mb-4">Screenshot/Website Preview</h3>
                  <Button
                    onClick={enableDrawing}
                    className="bg-[#B04E34] hover:bg-[#963F28] text-white flex items-center gap-1"
                    disabled={isDrawingEnabled}
                    size="sm">
                    <Plus className="h-4 w-4" />
                    <span>Draw Issue Area</span>
                  </Button>
                  <div className="flex items-center">
                    <TabsList className="w-full grid grid-cols-2">
                      <TabsTrigger value="screenshot">Screenshot View</TabsTrigger>
                      <TabsTrigger value="list">Listed View</TabsTrigger>
                    </TabsList>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <TabsContent value="screenshot" className="mt-4">
                  <div ref={containerRef} className="w-full h-max border-none relative">
                    <img
                      src={snapshotUrl}
                      alt="Dynamic height content"
                      style={{
                        width: "100%",
                        height: "auto", // This allows the image to maintain its natural height
                        display: "block",
                        pointerEvents: "none",
                        userSelect: "none",
                      }}
                    />
                    <div className="w-full h-full bg-transparent absolute top-0 left-0">
                      {reportIssues.map((issue, index) => (
                        <div
                          key={index}
                          className="w-10 h-10 text-white absolute rounded-full shadow-md flex items-center justify-center cursor-pointer"
                          onClick={() => setSelectedIssue(issue)}
                          style={{
                            backgroundColor: getHeuristicColor(issue.heuristic.code),
                            top: issue.snapshotLocation.top,
                            left: issue.snapshotLocation.left,
                          }}>
                          <h4 className="text-lg font-semibold">{issue.heuristic.code}</h4>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="list" className="mt-4">
                  list here
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
          issueOrder={1}
          issueRectangle={rectangle!}
          onSaveIssue={handleCreateNewIssue}
          onClose={setShowNewIssueModal}
        />
      )}

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <IssueDetailModal isOpen issue={selectedIssue!} issueOrder={1} onClose={() => setSelectedIssue(null)} />
      )}
    </>
  );
}
