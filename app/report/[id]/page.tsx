"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AppBar from "@/components/layout/AppBar";
import {
  ChevronLeft,
  Edit2,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  List,
  BarChart3,
} from "lucide-react";
import ScoreBar from "@/components/templates/ScoreBar/ScoreBar";
import { AnalysisReportType } from "@/components/organisms/ReportList/ReportList.types";

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

export default function AnalysisView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session }: any = useSession();

  const userRole = session?.user?.role;

  const [analysis, setAnalysis] = useState<AnalysisReportType | null>(null);
  const [hoveredIssue, setHoveredIssue] = useState<Issue | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHighlights, setShowHighlights] = useState(true);
  const [activeTab, setActiveTab] = useState("issues");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  async function fetchAnalysis() {
    try {
      const res = await fetch(`/api/report?id=${id}`);
      if (!res.ok) throw new Error("Failed to fetch analysis");
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  // Highlight elements in the iframe after it loads.
  useEffect(() => {
    if (!analysis || !iframeRef.current) return;
    const highlights: { selector: string; label: string; issueId: string }[] = [];
    analysis.heuristics?.forEach((h) => {
      h.issues.forEach((issue) => {
        issue.occurrences?.forEach((occ) => {
          highlights.push({
            selector: occ.selector,
            label: occ.id,
            issueId: issue.issue_id,
          });
        });
      });
    });
    const iframe = iframeRef.current;
    function sendHighlights() {
      iframe.contentWindow?.postMessage(
        {
          type: "HIGHLIGHT",
          highlights,
          visible: showHighlights,
        },
        "*"
      );
    }
    iframe.addEventListener("load", sendHighlights, { once: true });
    setTimeout(sendHighlights, 500);
    return () => {
      iframe.removeEventListener("load", sendHighlights);
    };
  }, [analysis, showHighlights]);

  // Toggle highlight visibility.
  useEffect(() => {
    if (!iframeRef.current) return;
    iframeRef.current.contentWindow?.postMessage(
      {
        type: "TOGGLE_HIGHLIGHTS",
        visible: showHighlights,
      },
      "*"
    );
  }, [showHighlights]);

  // Listen for hover events from the child iframe.
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!event.data) return;
      if (event.data.type === "ISSUE_MOUSEENTER") {
        const issueId = event.data.issueId;
        let found: Issue | null = null;
        analysis?.heuristics?.forEach((h) => {
          h.issues.forEach((issue) => {
            if (issue.issue_id === issueId) {
              found = issue;
            }
          });
        });
        setHoveredIssue(found || null);
      } else if (event.data.type === "ISSUE_MOUSELEAVE") {
        setHoveredIssue(null);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [analysis]);

  if (!analysis) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#B04E34] border-t-transparent"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading analysis...</p>
        </div>
      </div>
    );
  }

  const overallScore = analysis.overallScore;
  let totalIssues = 0;
  analysis?.heuristics?.forEach((h) => {
    totalIssues += h.issues.length;
  });

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
                onClick={() => router.push(`/dashboard`)}
                className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Dashboard
              </Button>
              <h1 className="text-xl font-medium text-gray-800 ml-2">
                Analysis Report: <span className="font-normal text-gray-600">{analysis.url}</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHighlights(!showHighlights)}
                className="flex items-center gap-1">
                {showHighlights ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    <span className="hidden sm:inline">Hide Highlights</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Show Highlights</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex items-center gap-1">
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
              {(userRole === "admin" || userRole === "tester") && (
                <Button
                  onClick={() => router.push(`/report/${id}/edit`)}
                  className="bg-[#B04E34] hover:bg-[#963F28] text-white flex items-center gap-1"
                  size="sm">
                  <Edit2 className="h-4 w-4" />
                  <span>Edit Report</span>
                </Button>
              )}
            </div>
          </div>

          {/* Score Card */}
          <Card className="mb-6 border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <p className="text-lg font-medium">Usability Score and Issue Details</p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreBar overallScore={overallScore} totalIssues={totalIssues} />
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className={`grid ${isFullscreen ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3 gap-6"}`}>
            {/* Iframe Container */}
            <div className={`${isFullscreen ? "col-span-1" : "col-span-1 lg:col-span-2"}`}>
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="py-3 px-4 bg-gray-50 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium truncate max-w-[300px]">{analysis.url}</span>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="bg-white">
                            {totalIssues} issues
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Issues found on this page</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                <CardContent className="p-0 relative">
                  <div className="relative w-full">
                    <iframe
                      ref={iframeRef}
                      src={`/api/snapshot/${analysis._id}`}
                      sandbox="allow-same-origin allow-scripts"
                      className="w-full border-none"
                      style={{
                        height: isFullscreen ? "calc(100vh - 220px)" : "600px",
                      }}
                    />
                    {/* Enhanced popup for hovered issues always centered */}
                    {hoveredIssue && (
                      <div
                        className="fixed z-50 w-80 bg-white border border-gray-200 shadow-lg rounded-lg p-4 animate-in fade-in-50 zoom-in-95"
                        style={{
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          maxWidth: "90%",
                        }}>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="bg-amber-100 p-1.5 rounded-full">
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                            </div>
                            <p className="font-semibold text-gray-900">Issue {hoveredIssue.issue_id}</p>
                          </div>
                          <Separator />
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                              {hoveredIssue.description}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-1">
                              <Lightbulb className="h-3.5 w-3.5 text-green-500" />
                              Solution:
                            </p>
                            <p className="text-sm text-gray-600 bg-green-50 p-2 rounded-md border-l-2 border-green-500">
                              {hoveredIssue.solution}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Side panel with heuristics & issues */}
            {!isFullscreen && (
              <div className="col-span-1">
                <Card className="border-none shadow-sm h-full">
                  <Tabs defaultValue="issues" onValueChange={setActiveTab} className="w-full">
                    <CardHeader className="py-3 px-4 border-b">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="issues" className="text-xs">
                          <List className="h-3 w-3 mr-1" />
                          Issues
                        </TabsTrigger>
                        <TabsTrigger value="heuristics" className="text-xs">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Heuristics
                        </TabsTrigger>
                      </TabsList>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[600px]">
                        <TabsContent value="issues" className="m-0">
                          <div className="p-4">
                            {analysis.heuristics?.flatMap((h) =>
                              h.issues.map((issue) => (
                                <div key={issue.issue_id} className="mb-4 bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                                    <div>
                                      <p className="font-medium text-sm">Issue {issue.issue_id}</p>
                                      <p className="text-xs text-gray-600 mt-1">{issue.description}</p>
                                      <div className="mt-2 bg-green-50 p-2 rounded border border-green-100">
                                        <p className="text-xs font-medium text-green-700 flex items-center gap-1">
                                          <Lightbulb className="h-3 w-3" />
                                          Solution:
                                        </p>
                                        <p className="text-xs text-green-800">{issue.solution}</p>
                                      </div>
                                      {issue.occurrences?.length > 0 && (
                                        <div className="mt-2">
                                          <p className="text-xs font-medium text-gray-700">Occurrences:</p>
                                          <div className="mt-1 space-y-1">
                                            {issue.occurrences.map((occ) => (
                                              <div
                                                key={occ.id}
                                                className="text-xs bg-blue-50 p-1 rounded border border-blue-100">
                                                <span className="font-medium text-blue-700">{occ.id}:</span>{" "}
                                                <code className="text-blue-800 text-[10px]">{occ.selector}</code>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                            {totalIssues === 0 && (
                              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                                <p>No issues found!</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                        <TabsContent value="heuristics" className="m-0">
                          <div className="p-4">
                            {analysis.heuristics?.map((h) => (
                              <div key={h.id} className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge
                                    variant="outline"
                                    className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                                    {h.id}
                                  </Badge>
                                  <p className="font-medium text-sm">{h.name}</p>
                                  <Badge className="ml-auto">
                                    {h.issues.length} {h.issues.length === 1 ? "issue" : "issues"}
                                  </Badge>
                                </div>
                                {h.issues.length > 0 ? (
                                  <div className="pl-8 space-y-2">
                                    {h.issues.map((issue) => (
                                      <div
                                        key={issue.issue_id}
                                        className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                                        <p className="font-medium">Issue {issue.issue_id}</p>
                                        <p className="mt-1">{issue.description}</p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="pl-8 text-xs text-gray-500 italic">
                                    No issues found for this heuristic.
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      </ScrollArea>
                    </CardContent>
                  </Tabs>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
