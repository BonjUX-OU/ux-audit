"use client";
import { useEffect, useState, useRef, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AppBar from "@/components/layout/AppBar";
import { Share } from "lucide-react";
import ScoreBar from "@/components/templates/ScoreBar/ScoreBar";
import { ReportType } from "@/types/report.types";
import LoadingOverlay from "@/components/layout/LoadingOverlay";
import { PreviewIssueType, ReportIssueType } from "@/types/reportIssue.types";
import { ConstantsBundleResponseType, OptionType } from "@/types/common.types";
import IssuesContainer from "@/components/templates/ScreenshotView/IssuesContainer";
import IssueListView from "@/components/templates/IssueListView/IssueListView";
import IssueDetailModal from "@/components/organisms/IssueDetailModal/IssueDetailModal";
import { getOption } from "@/helpers/optionArrayFunctions";
import RegisterAndPayModal from "@/components/organisms/RegisterAndPayModal/RegisterAndPayModal";
import { useToast } from "@/hooks/useToast";

export default function PreviewView({ params }: { params: Promise<{ id: string }> }) {
  const { id: reportId } = use(params);
  const containerRef = useRef(null);
  const { toast } = useToast();

  const [report, setReport] = useState<ReportType | null>(null);
  const [reportIssues, setReportIssues] = useState<ReportIssueType[]>([]);
  const [previewIssues, setPreviewIssues] = useState<PreviewIssueType[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<ReportIssueType | null>(null);
  const [selectedPreviewIssue, setSelectedPreviewIssue] = useState<PreviewIssueType | null>();
  const [showShareButton, setShowShareButton] = useState(false);

  // Constants states
  const [pageType, setPageType] = useState<OptionType>();
  const [sector, setSector] = useState<OptionType>();

  const fetchPreviewIssues = async () => {
    try {
      const res = await fetch(`/api/report/preview-issues?reportId=${reportId}`);

      if (!res.ok) throw new Error("Failed to fetch report issues");

      const data: {
        report: ReportType;
        issues: ReportIssueType[];
        previewIssues: PreviewIssueType[];
        shareAvailable: boolean;
      } = await res.json();

      setReport(data.report);
      setReportIssues(data.issues);
      setPreviewIssues(data.previewIssues);
      setShowShareButton(data.shareAvailable);
    } catch (error) {
      console.error(error);
    }
  };

  const getConstants = async () => {
    const response = await fetch(`/api/constants?target=customerIssues`);
    const data = (await response.json()) as ConstantsBundleResponseType;

    setPageType(getOption(data.pageTypeOptions, report!.pageType));
    setSector(getOption(data.sectors, report!.sector!));
  };

  const handleRegisterClick = () => {
    alert("register");
    // TODO: Implement registration and payment flow here
  };

  useEffect(() => {
    if (reportId) {
      fetchPreviewIssues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  useEffect(() => {
    if (report) getConstants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report]);

  if (!report) return <LoadingOverlay message="Loading report for editing..." />;

  const overallScore = report.score;
  const totalIssues = reportIssues.length;

  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Success",
      description: "Link copied to clipboard!",
    });
  };

  return (
    <>
      <AppBar />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <Card className="mt-4 mb-6 border-none shadow-lg bg-white transition-all duration-300 hover:shadow-xl">
            <CardHeader className="pb-0">
              <div className="mb-6 flex flex-col flex-wrap gap-4 border-b">
                <div className="flex items-center justify-between pb-2">
                  <div>
                    <h3 className="text-lg font-medium">Heuristic Evaluation Report Summary</h3>
                    <p className="text-sm text-gray-700">{report.url}</p>
                  </div>

                  {showShareButton && (
                    <Button
                      onClick={handleShareClick}
                      className="bg-[#B04E34] hover:bg-[#963F28] text-white flex items-center gap-1"
                      size="sm">
                      <Share className="h-4 w-4" />
                      <span>Share the report</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 w-full">
                <div className="flex flex-col">
                  <h5>Website</h5>
                  <p className="text-sm text-gray-600">{report.url}</p>
                </div>
                <div>
                  <h5>Industry</h5>
                  <p className="text-sm text-gray-600">{sector?.label}</p>
                </div>
                <div>
                  <h5>Page Type</h5>
                  <p className="text-sm text-gray-600">{pageType?.label}</p>
                </div>
                <div>
                  <h5>Report Generated</h5>
                  <p className="text-sm text-gray-600">{new Date(report.createdAt!).toString()}</p>
                </div>
              </div>
              <div className="flex flex-col mt-4">
                <h3 className="text-lg font-medium">General Summary from the Contributor</h3>
                <p className="text-sm text-gray-700">{report.contributorNotes ?? "Not specified"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Score Card */}
          <Card className="mb-6 border-none shadow-sm">
            <Tabs defaultValue="screenshot" className="w-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-full flex justify-between">
                    <p className="text-lg font-medium">Usability Score and Issue Details</p>

                    <div className="flex items-center">
                      <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="screenshot">Screenshot View</TabsTrigger>
                        <TabsTrigger value="list">Listed View</TabsTrigger>
                      </TabsList>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreBar overallScore={overallScore ?? 0} totalIssues={totalIssues} />

                <TabsContent value="screenshot" className="mt-4">
                  <h3 className="text-center text-lg font-[500] mb-4">Screenshot/Website Preview</h3>
                  <div ref={containerRef} className="w-full h-max border-none relative" style={{ zIndex: 45 }}>
                    <IssuesContainer
                      hideIssues={false}
                      imgUrl={report.screenshotImgUrl}
                      reportIssues={reportIssues}
                      previewIssues={previewIssues}
                      onIssueClick={setSelectedIssue}
                      onPreviewIssueClick={setSelectedPreviewIssue}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="list" className="mt-4">
                  <h3 className="text-center text-lg font-[500] mb-4">Issues Listed Preview</h3>
                  <IssueListView issues={reportIssues} />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
      {selectedIssue && <IssueDetailModal isOpen issue={selectedIssue!} onClose={() => setSelectedIssue(null)} />}
      {selectedPreviewIssue && (
        <RegisterAndPayModal
          issue={selectedPreviewIssue}
          issueCount={previewIssues.length + reportIssues.length}
          onClose={() => setSelectedPreviewIssue(null)}
          onRegisterClick={handleRegisterClick}
        />
      )}
      {showShareButton && (
        <div className="w-screen sticky bottom-0 bg-[#FFF1E0] z-50">
          <div className="container flex gap-2 mx-auto p-4">
            <div className="w-4/5 text-left">
              <h1 className="text-[#B04E34] text-3xl font-extrabold my-4">
                Reveal {previewIssues.length + reportIssues.length} more issues by purchasing this report just €14.90
              </h1>
              <p className="text-md font-[300] text-[#B04E34]">
                To access the full report, you’ll need to register and complete the payment. Once registered, you’ll be
                redirected to the Stripe page to finalize your purchase.
              </p>
            </div>

            <div className="w-1/5 flex items-center">
              <Button onClick={handleRegisterClick} className="w-full py-6 bg-[#B04E34] hover:bg-[#963F28] text-white">
                Register & Purchase full report
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
