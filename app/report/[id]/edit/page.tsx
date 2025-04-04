"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Plus,
  Trash2,
  Save,
  X,
  Pencil,
  PencilOff,
  Lightbulb,
  Code,
  ChevronLeft,
  Info,
  Maximize2,
  Minimize2,
} from "lucide-react";
import AppBar from "@/components/layout/AppBar";

type Occurrence = {
  id: string;
  selector: string;
};

type Issue = {
  issue_id: string;
  description: string;
  solution: string;
  occurrences: Occurrence[];
};

type Heuristic = {
  id: number;
  name: string;
  issues: Issue[];
};

type AnalysisReport = {
  pageType: any;
  sector: any;
  _id: string;
  project?: string;
  owner?: string;
  url: string;
  snapshotHtml: string;
  heuristics: Heuristic[];
  overallScore: number;
  scores: { id: number; score: number }[];
};

function getQualityLabel(score: number): string {
  if (score <= 20) return "Very Poor";
  if (score <= 40) return "Poor";
  if (score <= 60) return "Mediocre";
  if (score <= 80) return "Good";
  return "Very Good";
}

function getQualityColor(score: number): string {
  if (score <= 20) return "bg-red-500";
  if (score <= 40) return "bg-orange-500";
  if (score <= 60) return "bg-yellow-500";
  if (score <= 80) return "bg-green-400";
  return "bg-green-600";
}

function RatingBar({
  score,
  ratingLabel,
  showLabel = true,
  height = "h-4",
}: {
  score: number;
  ratingLabel?: string;
  showLabel?: boolean;
  height?: string;
}) {
  const clampedScore = Math.max(0, Math.min(100, score));
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>Very Poor</span>
        <span>Poor</span>
        <span>Mediocre</span>
        <span>Good</span>
        <span>Very Good</span>
      </div>
      <div
        className={`relative ${height} bg-gray-100 rounded-full overflow-hidden`}
      >
        <div className="absolute inset-0 flex">
          <div className="w-1/5 h-full bg-red-500"></div>
          <div className="w-1/5 h-full bg-orange-500"></div>
          <div className="w-1/5 h-full bg-yellow-500"></div>
          <div className="w-1/5 h-full bg-green-400"></div>
          <div className="w-1/5 h-full bg-green-600"></div>
        </div>
        <div
          className="absolute left-0 top-0 h-full bg-[#B04E34] opacity-70 rounded-full transition-all duration-300"
          style={{ width: `${clampedScore}%` }}
        />
        {showLabel && ratingLabel && (
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            <Badge className="bg-white text-[#B04E34] border border-[#B04E34]">
              {ratingLabel}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EditReportPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params; // The report ID to edit

  // Original report loaded from the API
  const [originalReport, setOriginalReport] = useState<AnalysisReport | null>(
    null
  );
  // Edits in progress (heuristics and overall score)
  const [editedHeuristics, setEditedHeuristics] = useState<Heuristic[]>([]);
  const [overallScore, setOverallScore] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  // Whether we are in "edit mode" (drag to highlight)
  const [editMode, setEditMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ---------------------------
  // 1. LOAD THE EXISTING REPORT
  // ---------------------------
  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/report?id=${id}`);
        if (!res.ok) throw new Error("Failed to fetch report");
        const data: AnalysisReport = await res.json();
        setOriginalReport(data);
        setEditedHeuristics(data.heuristics);
        setOverallScore(data.overallScore);
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
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        { type: "TOGGLE_EDIT_MODE", edit: editMode },
        "*"
      );
    }
  }, [editMode]);

  // -----------------------------------------
  // 4. HELPER FUNCTIONS TO UPDATE OUR STATE
  // -----------------------------------------
  function handleHeuristicChange(
    index: number,
    field: keyof Heuristic,
    value: any
  ) {
    const newHeuristics = [...editedHeuristics];
    newHeuristics[index] = { ...newHeuristics[index], [field]: value };
    setEditedHeuristics(newHeuristics);
  }

  function handleIssueChange(
    heuristicIndex: number,
    issueIndex: number,
    field: keyof Issue,
    value: any
  ) {
    const newHeuristics = [...editedHeuristics];
    const updatedIssues = [...newHeuristics[heuristicIndex].issues];
    updatedIssues[issueIndex] = {
      ...updatedIssues[issueIndex],
      [field]: value,
    };
    newHeuristics[heuristicIndex].issues = updatedIssues;
    setEditedHeuristics(newHeuristics);
  }

  function handleOccurrenceChange(
    hIndex: number,
    iIndex: number,
    occIndex: number,
    field: keyof Occurrence,
    value: any
  ) {
    const newHeuristics = [...editedHeuristics];
    const updatedOccurrences = [
      ...newHeuristics[hIndex].issues[iIndex].occurrences,
    ];
    updatedOccurrences[occIndex] = {
      ...updatedOccurrences[occIndex],
      [field]: value,
    };
    newHeuristics[hIndex].issues[iIndex].occurrences = updatedOccurrences;
    setEditedHeuristics(newHeuristics);
  }

  // -----------------------------
  // 5. FUNCTIONS TO ADD/REMOVE
  //    HEURISTICS, ISSUES, ETC.
  // -----------------------------
  const addHeuristic = () => {
    const newHeuristic: Heuristic = { id: Date.now(), name: "", issues: [] };
    setEditedHeuristics([...editedHeuristics, newHeuristic]);
  };

  const removeHeuristic = (hIndex: number) => {
    const newHeuristics = editedHeuristics.filter((_, i) => i !== hIndex);
    setEditedHeuristics(newHeuristics);
  };

  const addIssue = (hIndex: number) => {
    const newIssue: Issue = {
      issue_id: "",
      description: "",
      solution: "",
      occurrences: [],
    };
    const newHeuristics = [...editedHeuristics];
    newHeuristics[hIndex].issues.push(newIssue);
    setEditedHeuristics(newHeuristics);
  };

  const removeIssue = (hIndex: number, iIndex: number) => {
    const newHeuristics = [...editedHeuristics];
    newHeuristics[hIndex].issues = newHeuristics[hIndex].issues.filter(
      (_, i) => i !== iIndex
    );
    setEditedHeuristics(newHeuristics);
  };

  const addOccurrence = (hIndex: number, iIndex: number) => {
    const newOccurrence: Occurrence = {
      id: Date.now().toString(),
      selector: "",
    };
    const newHeuristics = [...editedHeuristics];
    newHeuristics[hIndex].issues[iIndex].occurrences.push(newOccurrence);
    setEditedHeuristics(newHeuristics);
  };

  const removeOccurrence = (
    hIndex: number,
    iIndex: number,
    occIndex: number
  ) => {
    const newHeuristics = [...editedHeuristics];
    newHeuristics[hIndex].issues[iIndex].occurrences = newHeuristics[
      hIndex
    ].issues[iIndex].occurrences.filter((_, i) => i !== occIndex);
    setEditedHeuristics(newHeuristics);
  };

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
          id: Date.now().toString(),
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

  // --------------------------------
  // 7. SAVE THE NEW (EDITED) REPORT
  // --------------------------------
  const handleSave = async () => {
    if (!originalReport) return;
    setIsSaving(true);

    const updatedReport = {
      owner: originalReport.owner,
      project: originalReport.project,
      url: originalReport.url,
      sector: originalReport.sector,
      pageType: originalReport.pageType,
      scores: originalReport.scores,
      overallScore,
      heuristics: editedHeuristics,
      snapshotHtml: originalReport.snapshotHtml,
      humanEdited: true,
    };

    try {
      const res = await fetch(`/api/report?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedReport),
      });
      if (!res.ok) throw new Error("Failed to save report");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

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
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "SET_SCALE", scale },
        "*"
      );
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

  // --------------
  // RENDER LOGIC
  // --------------
  if (!originalReport) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#B04E34] border-t-transparent"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">
            Loading report for editing...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppBar />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <h1 className="text-xl font-medium text-gray-800 ml-2">
                Edit Analysis:{" "}
                <span className="font-normal text-gray-600">
                  {originalReport.url}
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditMode(!editMode)}
                className={`flex items-center gap-1 ${
                  editMode ? "bg-amber-50 text-amber-600 border-amber-300" : ""
                }`}
              >
                {editMode ? (
                  <>
                    <Pencil className="h-4 w-4" />
                    <span className="hidden sm:inline">Exit Edit Mode</span>
                  </>
                ) : (
                  <>
                    <PencilOff className="h-4 w-4" />
                    <span className="hidden sm:inline">Enable Edit Mode</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex items-center gap-1"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Fullscreen</span>
                  </>
                )}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#B04E34] hover:bg-[#963F28] text-white flex items-center gap-1"
                size="sm"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div
            className={`grid ${
              isFullscreen ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3 gap-6"
            }`}
          >
            {/* Iframe Container */}
            <div
              ref={iframeContainerRef}
              className={`${
                isFullscreen ? "col-span-1" : "col-span-1 lg:col-span-2"
              }`}
            >
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="py-3 px-4 bg-gray-50 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">
                      Webpage Preview
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {editMode ? (
                        <span className="text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Edit mode active. Click and drag to highlight
                          elements.
                        </span>
                      ) : (
                        "View the webpage and its issues"
                      )}
                    </CardDescription>
                  </div>
                  {editMode && (
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-600 border-amber-200"
                    >
                      Highlight Mode Active
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="p-0 relative">
                  <iframe
                    ref={iframeRef}
                    src={`/api/snapshot/${originalReport._id}`}
                    sandbox="allow-same-origin allow-scripts"
                    className="w-full border-none"
                    style={{
                      height: isFullscreen ? "calc(100vh - 220px)" : "600px",
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Panel: Editing Form */}
            {!isFullscreen && (
              <div className="col-span-1">
                <Tabs defaultValue="score" className="w-full">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="score">Overall Score</TabsTrigger>
                    <TabsTrigger value="heuristics">
                      Heuristics & Issues
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="score" className="mt-4">
                    <Card className="border-none shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium">
                          Overall Usability Score
                        </CardTitle>
                        <CardDescription>
                          Adjust the overall score for this analysis
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div>
                            <div className="flex justify-between mb-2">
                              <label className="text-sm font-medium text-gray-700">
                                Score Value
                              </label>
                              <Badge
                                className={`${getQualityColor(
                                  overallScore
                                )} hover:${getQualityColor(overallScore)}`}
                              >
                                {getQualityLabel(overallScore)}
                              </Badge>
                            </div>
                            <Input
                              type="number"
                              value={overallScore}
                              onChange={(e) =>
                                setOverallScore(Number(e.target.value))
                              }
                              className="mb-2"
                              min="0"
                              max="100"
                            />
                            <RatingBar score={overallScore} showLabel={false} />
                          </div>

                          <div className="bg-blue-50 rounded-lg p-4 text-sm border border-blue-100">
                            <div className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                              <div>
                                <p className="font-medium text-blue-700 mb-2">
                                  Score Interpretation
                                </p>
                                <ul className="space-y-1 text-blue-800">
                                  <li>
                                    <strong>0-20:</strong> Very Poor - Critical
                                    usability issues
                                  </li>
                                  <li>
                                    <strong>21-40:</strong> Poor - Significant
                                    improvements needed
                                  </li>
                                  <li>
                                    <strong>41-60:</strong> Mediocre - Several
                                    improvements recommended
                                  </li>
                                  <li>
                                    <strong>61-80:</strong> Good - Minor
                                    improvements possible
                                  </li>
                                  <li>
                                    <strong>81-100:</strong> Very Good -
                                    Excellent usability
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="heuristics" className="mt-4">
                    <Card className="border-none shadow-sm">
                      <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-medium">
                            Heuristics & Issues
                          </CardTitle>
                          <CardDescription>
                            Manage heuristics and their associated issues
                          </CardDescription>
                        </div>
                        <Button
                          onClick={addHeuristic}
                          size="sm"
                          className="bg-[#B04E34] hover:bg-[#963F28] text-white"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ScrollArea className="h-[500px]">
                          <div className="p-4 space-y-6">
                            {editedHeuristics.map((heuristic, hIndex) => (
                              <div
                                key={heuristic.id}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                              >
                                <div className="p-3 bg-gray-50 border-b border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 mr-4">
                                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                                        Heuristic Name
                                      </label>
                                      <Input
                                        type="text"
                                        value={heuristic.name}
                                        onChange={(e) =>
                                          handleHeuristicChange(
                                            hIndex,
                                            "name",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Enter heuristic name"
                                      />
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeHeuristic(hIndex)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 mt-6"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="p-3 space-y-4">
                                  {heuristic.issues.map((issue, iIndex) => (
                                    <div
                                      key={iIndex}
                                      className="bg-gray-50 rounded-lg p-3 space-y-3"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1 mr-4">
                                          <label className="text-sm font-medium text-gray-700 mb-1 block">
                                            Issue ID
                                          </label>
                                          <Input
                                            type="text"
                                            value={issue.issue_id}
                                            onChange={(e) =>
                                              handleIssueChange(
                                                hIndex,
                                                iIndex,
                                                "issue_id",
                                                e.target.value
                                              )
                                            }
                                            placeholder="e.g., 1.1"
                                          />
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            removeIssue(hIndex, iIndex)
                                          }
                                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 mt-6"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>

                                      <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                                          Description
                                        </label>
                                        <Textarea
                                          value={issue.description}
                                          onChange={(e) =>
                                            handleIssueChange(
                                              hIndex,
                                              iIndex,
                                              "description",
                                              e.target.value
                                            )
                                          }
                                          className="min-h-[80px]"
                                          placeholder="Describe the issue"
                                        />
                                      </div>

                                      <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1">
                                          <Lightbulb className="h-3 w-3 text-amber-500" />
                                          Solution
                                        </label>
                                        <Textarea
                                          value={issue.solution}
                                          onChange={(e) =>
                                            handleIssueChange(
                                              hIndex,
                                              iIndex,
                                              "solution",
                                              e.target.value
                                            )
                                          }
                                          className="min-h-[80px]"
                                          placeholder="Suggest a solution"
                                        />
                                      </div>

                                      <div>
                                        <div className="flex items-center justify-between mb-2">
                                          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                            <Code className="h-3 w-3 text-blue-500" />
                                            Occurrences
                                          </label>
                                          <Button
                                            onClick={() =>
                                              addOccurrence(hIndex, iIndex)
                                            }
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-xs"
                                          >
                                            <Plus className="h-3 w-3 mr-1" />
                                            Add
                                          </Button>
                                        </div>

                                        <div className="space-y-2">
                                          {issue.occurrences.map(
                                            (occ, occIndex) => (
                                              <div
                                                key={occ.id}
                                                className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200"
                                              >
                                                <Input
                                                  type="text"
                                                  placeholder="ID"
                                                  value={occ.id}
                                                  onChange={(e) =>
                                                    handleOccurrenceChange(
                                                      hIndex,
                                                      iIndex,
                                                      occIndex,
                                                      "id",
                                                      e.target.value
                                                    )
                                                  }
                                                  className="w-24 flex-shrink-0"
                                                />
                                                <Input
                                                  type="text"
                                                  placeholder="CSS Selector"
                                                  value={occ.selector}
                                                  onChange={(e) =>
                                                    handleOccurrenceChange(
                                                      hIndex,
                                                      iIndex,
                                                      occIndex,
                                                      "selector",
                                                      e.target.value
                                                    )
                                                  }
                                                  className="flex-1"
                                                />
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() =>
                                                    removeOccurrence(
                                                      hIndex,
                                                      iIndex,
                                                      occIndex
                                                    )
                                                  }
                                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}

                                  <Button
                                    onClick={() => addIssue(hIndex)}
                                    variant="outline"
                                    className="w-full mt-2"
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Issue
                                  </Button>
                                </div>
                              </div>
                            ))}

                            {editedHeuristics.length === 0 && (
                              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                <AlertTriangle className="h-12 w-12 text-amber-500 mb-2" />
                                <p>No heuristics defined yet.</p>
                                <Button
                                  onClick={addHeuristic}
                                  variant="outline"
                                  className="mt-4"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Your First Heuristic
                                </Button>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-4">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-[#B04E34] hover:bg-[#963F28] text-white"
                  >
                    {isSaving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
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
              <label className="text-sm font-medium text-gray-700">
                Assign to Heuristic
              </label>
              <Select
                value={newIssueData.heuristicIndex.toString()}
                onValueChange={(value) =>
                  setNewIssueData((prev) => ({
                    ...prev,
                    heuristicIndex: Number(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a heuristic" />
                </SelectTrigger>
                <SelectContent>
                  {editedHeuristics.map((heuristic, idx) => (
                    <SelectItem key={heuristic.id} value={idx.toString()}>
                      {heuristic.name || `Heuristic ${heuristic.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Issue ID
              </label>
              <Input
                type="text"
                value={newIssueData.issue_id}
                onChange={(e) =>
                  setNewIssueData({ ...newIssueData, issue_id: e.target.value })
                }
                placeholder="e.g., 1.1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
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
                onChange={(e) =>
                  setNewIssueData({ ...newIssueData, solution: e.target.value })
                }
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
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateNewIssue}
              className="bg-[#B04E34] hover:bg-[#963F28] text-white"
            >
              Save Issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
