"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Lightbulb, Code, ChevronLeft, Eye } from "lucide-react";
import AppBar from "@/components/layout/AppBar";
import StepperBreadCrumb from "@/components/organisms/StepperBreadCrumb/StepperBreadCrumb";
import { list } from "@vercel/blob";
import { ReportType } from "@/types/report.types";
import { HeuristicType } from "@/types/reportIssue.types";

export default function EditReportPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session }: any = useSession();
  const { id } = params; // The report ID to edit
  const userRole = session?.user?.role;

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
  const [editedHeuristics, setEditedHeuristics] = useState<HeuristicType[]>([]);
  // Whether we are in "edit mode" (drag to highlight)
  const [editMode, setEditMode] = useState(false);

  // -- NEW STATES FOR THE MODAL / NEW ISSUE WORKFLOW --
  const [showNewIssueModal, setShowNewIssueModal] = useState(false);
  // We store a newly-highlighted CSS selector that the user just dragged over
  const [newIssueSelector, setNewIssueSelector] = useState("");
  // We store user-input for the new issue's details
  const [newIssueData, setNewIssueData] = useState({
    heuristicIndex: 0, // which heuristic to attach it to
    issue_id: "",
    description: "",
    solution: "",
  });

  const snapshotRef = useRef<HTMLIFrameElement>(null);
  const [snapshotUrl, setSnapshotUrl] = useState<string | undefined>();

  // ---------------------------
  // 1. LOAD THE EXISTING REPORT
  // ---------------------------
  useEffect(() => {
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
    if (id) fetchReport();
  }, [id]);

  // --------------------------------------
  // 2. LISTEN FOR "ELEMENT_SELECTED" IN IFRAME
  //    AND OPEN THE NEW ISSUE MODAL
  // --------------------------------------
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!event.data) return;
      if (event.data.type === "ELEMENT_SELECTED") {
        const selectedSelector = event.data.selector;
        if (selectedSelector) {
          // We store the new selector, show the "Create New Issue" modal
          setNewIssueSelector(selectedSelector);
          setShowNewIssueModal(true);
        }
      }
    }
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // ----------------------------
  // 3. WHEN editMode CHANGES,
  //    NOTIFY THE IFRAME
  // ----------------------------
  useEffect(() => {
    if (snapshotRef.current) {
      snapshotRef.current.contentWindow?.postMessage({ type: "TOGGLE_EDIT_MODE", edit: editMode }, "*");
    }
  }, [editMode]);

  // ------------------------------------------------------
  // 6. *NEW* FUNCTION: ADDING A BRAND NEW ISSUE & OCCURRENCE
  //    WHEN USER FINISHES HIGHLIGHTING AND FILLS THE MODAL
  // ------------------------------------------------------
  function handleCreateNewIssue() {
    const hIndex = newIssueData.heuristicIndex; // Which heuristic do we attach to?
    const newHeuristics = [...editedHeuristics];

    // Construct a brand-new Issue with a single Occurrence
    const newIssue: Issue = {
      issue_id: newIssueData.issue_id || "",
      description: newIssueData.description || "",
      solution: newIssueData.solution || "",
      occurrences: [
        {
          //id = issue id + occurence index for the issue id, this means find issues with the same id and add its occurrences and get the occurences length
          id: `${newIssueData.issue_id}.
            ${newHeuristics[hIndex].issues
              .filter((issue) => issue.issue_id === newIssueData.issue_id)
              .reduce((acc, issue) => acc + issue.occurrences.length, 0)}`,
          selector: newIssueSelector,
        },
      ],
    };

    newHeuristics[hIndex].issues.push(newIssue);

    // Update the state and reset the modal fields
    setEditedHeuristics(newHeuristics);
    setShowNewIssueModal(false);
    setNewIssueSelector("");
    setNewIssueData({
      heuristicIndex: 0,
      issue_id: "",
      description: "",
      solution: "",
    });
  }

  // ------------------------------------------------------------------
  // 8. MEASURE THE IFRAME CONTAINER WIDTH => SEND SCALE FACTOR TO IFRAME
  // ------------------------------------------------------------------

  // We'll measure the container width where the iframe is placed
  const iframeContainerRef = useRef<HTMLDivElement>(null);

  const sendScaleFactorToIframe = useCallback((containerWidth: number) => {
    // Decide what "desktop width" means (say 1200 px).
    // If containerWidth < 1200, we shrink.
    // If containerWidth >= 1200, scale = 1 (no growth).
    const DESKTOP_WIDTH = 1200;
    let scale = containerWidth / DESKTOP_WIDTH;
    if (scale > 1) {
      scale = 1; // never zoom bigger than actual
    }
    // Now post a message to the iframe
    if (snapshotRef.current && snapshotRef.current.contentWindow) {
      snapshotRef.current.contentWindow.postMessage({ type: "SET_SCALE", scale }, "*");
    }
  }, []);

  useEffect(() => {
    if (!iframeContainerRef.current) return;

    // We'll use a ResizeObserver to measure the container's width
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        const containerWidth = cr.width;
        sendScaleFactorToIframe(containerWidth);
      }
    });
    ro.observe(iframeContainerRef.current);

    return () => {
      ro.disconnect();
    };
  }, [sendScaleFactorToIframe]);

  // -----------------------------
  // Recent added codes starts here
  // -----------------------------
  const breadcrumbsteps = [
    { label: "Heuristic Evaluation", value: "heuristic" },
    { label: "Report Summary", value: "summary" },
  ];

  const [imageHeight, setImageHeight] = useState(300);
  const imgRef = useRef<HTMLImageElement>(null);

  const completeAndSeeSummary = () => {};

  const getSpecificBlobImage = async (pathname: string) => {
    try {
      const blobs = await list({ prefix: pathname });
      if (blobs.blobs.length > 0) {
        return blobs.blobs[0].url;
      }
      return null;
    } catch (error) {
      console.error("Error getting specific blob:", error);
      return null;
    }
  };

  const handleImageLoad = () => {
    if (imgRef.current) {
      setImageHeight(imgRef?.current?.naturalHeight);
    }
  };

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

          <img ref={imgRef} src={snapshotUrl} onLoad={handleImageLoad} style={{ display: "none" }} alt="preload" />

          {/* Main Content */}
          <Card className="mt-4 mb-6 border-none shadow-lg bg-white transition-all duration-300 hover:shadow-xl">
            <Tabs defaultValue="screenshot" className="w-full">
              <CardHeader className="pb-0">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <h3 className="text-lg font-medium mb-4">Screenshot/Website Preview</h3>
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
                  <div className="w-full border-none" style={{ height: "calc(100vh - 220px)", overflowY: "scroll" }}>
                    {/* <div
                      ref={snapshotRef}
                      className="w-full h-full"
                      style={{
                        backgroundImage: `url(${snapshotUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        width: "100%",
                        height: `${imageHeight}px`,
                      }}></div> */}
                    <img
                      src={snapshotUrl}
                      alt="Dynamic height content"
                      style={{
                        width: "100%",
                        height: "auto", // This allows the image to maintain its natural height
                        display: "block",
                      }}
                    />
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
      <Dialog open={showNewIssueModal} onOpenChange={setShowNewIssueModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              New Issue Found
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Assign to Heuristic</label>
              <Select
                value={newIssueData.heuristicIndex.toString()}
                onValueChange={(value) =>
                  setNewIssueData((prev) => ({
                    ...prev,
                    heuristicIndex: Number(value),
                  }))
                }>
                <SelectTrigger>
                  <SelectValue placeholder="Select a heuristic" />
                </SelectTrigger>
                <SelectContent>
                  {/* {editedHeuristics.map((heuristic, idx) => (
                    <SelectItem key={heuristic.id} value={idx.toString()}>
                      {heuristic.name || `Heuristic ${heuristic.id}`}
                    </SelectItem>
                  ))} */}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Issue ID</label>
              <Input
                type="text"
                value={newIssueData.issue_id}
                onChange={(e) => setNewIssueData({ ...newIssueData, issue_id: e.target.value })}
                placeholder="e.g., 1.1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Textarea
                value={newIssueData.description}
                onChange={(e) =>
                  setNewIssueData({
                    ...newIssueData,
                    description: e.target.value,
                  })
                }
                className="min-h-[80px]"
                placeholder="Describe the issue"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Lightbulb className="h-3 w-3 text-amber-500" />
                Solution
              </label>
              <Textarea
                value={newIssueData.solution}
                onChange={(e) => setNewIssueData({ ...newIssueData, solution: e.target.value })}
                className="min-h-[80px]"
                placeholder="Suggest a solution"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Code className="h-3 w-3 text-blue-500" />
                Selected CSS Selector
              </label>
              <div className="bg-blue-50 rounded-md p-3 text-sm font-mono break-all border border-blue-100">
                {newIssueSelector}
              </div>
            </div>
          </div>

          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowNewIssueModal(false);
                setNewIssueSelector("");
              }}>
              Cancel
            </Button>
            <Button onClick={handleCreateNewIssue} className="bg-[#B04E34] hover:bg-[#963F28] text-white">
              Save Issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
