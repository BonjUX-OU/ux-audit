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
import { useSession } from "next-auth/react";
// import { useRouter } from "next/router";
import { redirect } from "next/navigation";
import { customerIssues, STORAGE_KEY_FOR_PAYMENT } from "@/constants/common.constants";

export default function PreviewView({ params }: { params: Promise<{ id: string }> }) {
  const { id: reportId } = use(params);
  const { status } = useSession();
  // const router = useRouter();
  const containerRef = useRef(null);
  const { toast } = useToast();

  const [report, setReport] = useState<ReportType | null>(null);
  const [reportIssues, setReportIssues] = useState<ReportIssueType[]>([]);
  const [previewIssues, setPreviewIssues] = useState<PreviewIssueType[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<ReportIssueType | null>(null);
  const [selectedPreviewIssue, setSelectedPreviewIssue] = useState<PreviewIssueType | null>();
  const [showShareButton, setShowShareButton] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Constants states
  const [pageType, setPageType] = useState<OptionType>();
  // const [sector, setSector] = useState<OptionType>();

  const fetchPreviewIssues = async () => {
    try {
      const res = await fetch(`/api/report/preview-issues?reportId=${reportId}`);

      if (!res.ok) {
        if (status === "authenticated" && res.status === 403) {
          redirect("/dashboard");
          // router.push("/dashboard");
          return;
        } else throw new Error("Failed to fetch report issues");
      }

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
    } finally {
      setIsLoading(false);
    }
  };

  const getConstants = async () => {
    const response = await fetch(`/api/constants?target=customerIssues`);
    const data = (await response.json()) as ConstantsBundleResponseType;

    setPageType(getOption(data.pageTypeOptions, report!.pageType));
    // setSector(getOption(data.sectors, report!.sector!));
  };

  const handleRegisterClick = () => {
    const sessionItem = {
      reportId,
      comesFromRegisterAndPay: true,
      hasPaid: false,
    };
    sessionStorage.setItem(STORAGE_KEY_FOR_PAYMENT, JSON.stringify(sessionItem));

    if (status === "authenticated") {
      redirect("/payment");
    } else {
      redirect("/signup");
    }
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

  if (isLoading) return <LoadingOverlay message="Loading report for preview..." />;

  if (!report) return <div className="text-center p-8">Report not found</div>;

  const overallScore = report?.score;
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
              <div className="grid grid-cols-5 w-full">
                <div className="flex flex-col">
                  <h5>Contributor</h5>
                  <p className="text-sm text-gray-600">{report.assignedTo?.name}</p>
                </div>
                <div className="flex flex-col">
                  <h5>Website</h5>
                  <p className="text-sm text-gray-600">{report.url}</p>
                </div>
                {/* <div>
                  <h5>Industry</h5>
                  <p className="text-sm text-gray-600">{sector?.label}</p>
                </div> */}
                <div>
                  <h5>Page Type</h5>
                  <p className="text-sm text-gray-600">{pageType?.label}</p>
                </div>
                <div>
                  <h5>Issues</h5>
                  <p className="text-sm text-gray-600">
                    {customerIssues?.find((customerIssue) => customerIssue.value === report.predefinedIssues?.[0])
                      ?.label ?? "Not specified"}
                    {report.predefinedIssues &&
                      report.predefinedIssues.length > 1 &&
                      `+${report.predefinedIssues?.length - 1} more issues`}
                  </p>
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
                  <IssueListView
                    issues={reportIssues}
                    previewIssues={previewIssues}
                    isPaidReport={report.isPaid}
                    onRegisterClick={handleRegisterClick}
                  />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
      {selectedIssue && (
        <IssueDetailModal previewMode isOpen issue={selectedIssue!} onClose={() => setSelectedIssue(null)} />
      )}
      {selectedPreviewIssue && (
        <RegisterAndPayModal
          issue={selectedPreviewIssue}
          issueCount={previewIssues.length + reportIssues.length}
          onClose={() => setSelectedPreviewIssue(null)}
          onRegisterClick={handleRegisterClick}
          hasPaid={report.isPaid}
        />
      )}
      {report.isPaid && (
        <div className="w-screen sticky bottom-0 bg-[#FFF1E0] z-50">
          <div className="container flex gap-2 mx-auto p-4">
            <div className="w-full flex items-center justify-center gap-4">
              <h1 className="text-[#B04E34] text-3xl bold my-4">Purchased already!</h1>
              <span className="text-md font-[300] text-[#B04E34]">
                This audit has been already purchased by someone else! If you know the owner you can request an access
                by the owner.
              </span>
            </div>
          </div>
        </div>
      )}
      {!report.isPaid && previewIssues.length > 0 && (
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
                {status === "authenticated" ? "Purchase full report" : "Register & Purchase full report"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
