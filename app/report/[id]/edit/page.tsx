"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertCircle,
  Plus,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";

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

    const newReport = {
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
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReport),
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
      for (let entry of entries) {
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
      <div className="flex items-center justify-center h-screen bg-[#FFF8EE]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C25B3F] mx-auto mb-4"></div>
          <p className="text-lg text-[#333333]">
            Loading report for editing...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8EE] text-[#333333]">
      <div className=" py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <Button
              variant="ghost"
              className="mr-2 text-[#C25B3F] hover:text-[#A04A33] hover:bg-[#FFECD9]"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-[#333333]">
              Heuristic Analysis Editor
            </h1>
          </div>
          <p className="text-[#666666] max-w-3xl">
            Edit the heuristic analysis report for {originalReport.url}. Use the
            edit mode to highlight elements on the page.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-12 lg:grid-cols-12 gap-3">
          {/* Left Panel: Webpage Preview */}
          <div className="lg:col-span-9">
            <Card className="overflow-hidden border-0 shadow-md">
              <CardHeader className="bg-white border-b border-gray-100 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-medium">
                  Webpage Preview
                </CardTitle>
                <Button
                  onClick={() => setEditMode(!editMode)}
                  variant={editMode ? "destructive" : "default"}
                  className={
                    editMode
                      ? "bg-[#C25B3F] hover:bg-[#A04A33]"
                      : "bg-[#C25B3F] hover:bg-[#A04A33]"
                  }
                >
                  {editMode ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Disable Edit Mode
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Enable Edit Mode
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <iframe
                  ref={iframeRef}
                  src={`/api/snapshot/${originalReport._id}`}
                  sandbox="allow-same-origin allow-scripts"
                  className="h-[500px] border-0"
                  style={{
                    width: "100%",
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Editing Form */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="score" className="w-full">
              <TabsList className="w-full bg-white border border-gray-100 rounded-t-lg">
                <TabsTrigger value="score" className="flex-1">
                  Score
                </TabsTrigger>
                <TabsTrigger value="heuristics" className="flex-1">
                  Heuristics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="score" className="mt-0">
                <Card className="border-0 shadow-md">
                  <CardHeader className="bg-white border-b border-gray-100">
                    <CardTitle className="text-lg font-medium">
                      Overall Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium text-[#666666]">
                            Score Value
                          </label>
                          <Badge
                            variant="outline"
                            className="bg-[#FFECD9] text-[#C25B3F] border-0"
                          >
                            {overallScore}/100
                          </Badge>
                        </div>
                        <Input
                          type="number"
                          value={overallScore}
                          onChange={(e) =>
                            setOverallScore(Number(e.target.value))
                          }
                          className="border-gray-200 focus:border-[#C25B3F] focus:ring-[#C25B3F]"
                          min="0"
                          max="100"
                        />
                      </div>

                      <div className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-md font-medium">
                            Score Interpretation
                          </h3>
                        </div>
                        <div className="bg-[#FFECD9] rounded-lg p-4 text-sm">
                          <p className="mb-2">
                            <strong>0-25:</strong> Poor usability, requires
                            immediate attention
                          </p>
                          <p className="mb-2">
                            <strong>26-50:</strong> Below average, significant
                            improvements needed
                          </p>
                          <p className="mb-2">
                            <strong>51-75:</strong> Average, some improvements
                            recommended
                          </p>
                          <p>
                            <strong>76-100:</strong> Good to excellent usability
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="heuristics" className="mt-0">
                <Card className="border-0 shadow-md">
                  <CardHeader className="bg-white border-b border-gray-100 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-medium">
                      Heuristics & Issues
                    </CardTitle>
                    <Button
                      onClick={addHeuristic}
                      size="sm"
                      className="bg-[#C25B3F] hover:bg-[#A04A33]"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Heuristic
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[384px]">
                      <div className="p-2 space-y-6">
                        {editedHeuristics.map((heuristic, hIndex) => (
                          <div
                            key={heuristic.id}
                            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                          >
                            <div className="p-2 bg-[#FFECD9] border-b border-gray-100">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 mr-4">
                                  <label className="text-sm font-medium text-[#666666] mb-1 block">
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
                                    className="border-gray-200 focus:border-[#C25B3F] focus:ring-[#C25B3F]"
                                    placeholder="Enter heuristic name"
                                  />
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeHeuristic(hIndex)}
                                  className="bg-[#C25B3F] hover:bg-[#A04A33]"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="p-2 space-y-4">
                              {heuristic.issues.map((issue, iIndex) => (
                                <div
                                  key={iIndex}
                                  className="bg-gray-50 rounded-lg p-2 space-y-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 mr-4">
                                      <label className="text-sm font-medium text-[#666666] mb-1 block">
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
                                        className="border-gray-200 focus:border-[#C25B3F] focus:ring-[#C25B3F]"
                                        placeholder="e.g., 1.1"
                                      />
                                    </div>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        removeIssue(hIndex, iIndex)
                                      }
                                      className="bg-[#C25B3F] hover:bg-[#A04A33]"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  <div>
                                    <label className="text-sm font-medium text-[#666666] mb-1 block">
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
                                      className="border-gray-200 focus:border-[#C25B3F] focus:ring-[#C25B3F] min-h-[80px]"
                                      placeholder="Describe the issue"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-sm font-medium text-[#666666] mb-1 block">
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
                                      className="border-gray-200 focus:border-[#C25B3F] focus:ring-[#C25B3F] min-h-[80px]"
                                      placeholder="Suggest a solution"
                                    />
                                  </div>

                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <label className="text-sm font-medium text-[#666666]">
                                        Occurrences
                                      </label>
                                      <Button
                                        onClick={() =>
                                          addOccurrence(hIndex, iIndex)
                                        }
                                        size="sm"
                                        variant="outline"
                                        className="text-[#C25B3F] border-[#C25B3F] hover:bg-[#FFECD9]"
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
                                              className="border-gray-200 focus:border-[#C25B3F] focus:ring-[#C25B3F] w-24 flex-shrink-0"
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
                                              className="border-gray-200 focus:border-[#C25B3F] focus:ring-[#C25B3F] flex-1"
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
                                              className="text-[#C25B3F] hover:bg-[#FFECD9] hover:text-[#A04A33] p-1 h-8 w-8"
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
                                className="w-full mt-2 text-[#C25B3F] border-[#C25B3F] hover:bg-[#FFECD9]"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Issue
                              </Button>
                            </div>
                          </div>
                        ))}
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
                className="flex-1 bg-[#C25B3F] hover:bg-[#A04A33]"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Edited Report
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 border-[#C25B3F] text-[#C25B3F] hover:bg-[#FFECD9]"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* New Issue Modal */}
      <Dialog open={showNewIssueModal} onOpenChange={setShowNewIssueModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl font-bold">
              <AlertCircle className="h-5 w-5 mr-2 text-[#C25B3F]" />
              New Issue Found
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#666666]">
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
                <SelectTrigger className="border-gray-200 focus:border-[#C25B3F] focus:ring-[#C25B3F]">
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
              <label className="text-sm font-medium text-[#666666]">
                Issue ID
              </label>
              <Input
                type="text"
                value={newIssueData.issue_id}
                onChange={(e) =>
                  setNewIssueData({ ...newIssueData, issue_id: e.target.value })
                }
                className="border-gray-200 focus:border-[#C25B3F] focus:ring-[#C25B3F]"
                placeholder="e.g., 1.1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#666666]">
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
                className="border-gray-200 focus:border-[#C25B3F] focus:ring-[#C25B3F] min-h-[80px]"
                placeholder="Describe the issue"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#666666]">
                Solution
              </label>
              <Textarea
                value={newIssueData.solution}
                onChange={(e) =>
                  setNewIssueData({ ...newIssueData, solution: e.target.value })
                }
                className="border-gray-200 focus:border-[#C25B3F] focus:ring-[#C25B3F] min-h-[80px]"
                placeholder="Suggest a solution"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#666666]">
                Selected CSS Selector
              </label>
              <div className="bg-[#FFECD9] rounded-md p-3 text-sm font-mono break-all">
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
              className="border-[#C25B3F] text-[#C25B3F] hover:bg-[#FFECD9]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateNewIssue}
              className="bg-[#C25B3F] hover:bg-[#A04A33]"
            >
              Save Issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
