// app/dashboard/page.tsx
"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import { useSession } from "next-auth/react";
import AppBar from "@/components/layout/AppBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

// Types
type Project = {
  _id: string;
  owner?: string;
  name: string;
  description?: string;
};

type Issue = {
  issue_id: string;
  description: string;
  solution: string;
  selector?: string;
};

type Heuristic = {
  id: number;
  name: string;
  issues: Issue[];
};

type AnalysisReport = {
  _id: string;
  project: string;
  url: string;
  screenshot?: string;
  heuristics: Heuristic[];
  snapshotHtml?: string;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [analysisMap, setAnalysisMap] = useState<{
    [projId: string]: AnalysisReport[];
  }>({});
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<AnalysisReport | null>(null);

  // For "New Analysis"
  const [dialogProjectId, setDialogProjectId] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // iFrame + Hover states
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [hoveredIssue, setHoveredIssue] = useState<Issue | null>(null);

  // 1) Fetch all projects
  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
  }

  // 2) For a project, fetch all analysis
  async function fetchAnalysisForProject(projectId: string) {
    try {
      const res = await fetch(`/api/report?projectId=${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch analysis");
      const data = await res.json();
      setAnalysisMap((prev) => ({ ...prev, [projectId]: data }));
    } catch (err) {
      console.error(err);
    }
  }

  // 3) Fetch single analysis by ID
  async function fetchSingleAnalysis(analysisId: string) {
    try {
      const res = await fetch(`/api/report?id=${analysisId}`);
      if (!res.ok) throw new Error("Failed to fetch single analysis");
      const data = await res.json();
      setSelectedAnalysis(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  // Called when user expands a Project
  function handleProjectAccordionChange(projectId: string | undefined) {
    if (projectId && !analysisMap[projectId]) {
      fetchAnalysisForProject(projectId);
    }
  }

  // Called when user expands an Analysis
  function handleAnalysisAccordionChange(analysisId: string | undefined) {
    if (analysisId) {
      fetchSingleAnalysis(analysisId);
    } else {
      setSelectedAnalysis(null);
    }
  }

  // 4) Create new analysis
  async function handleCreateAnalysis(e: FormEvent) {
    e.preventDefault();
    if (!dialogProjectId || !url.trim()) return;

    setIsAnalyzing(true);

    try {
      // Step 1: call combinedAnalyze
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!analyzeRes.ok) throw new Error("Error analyzing page");
      const { screenshot, analysis, snapshotHtml } = await analyzeRes.json();

      // parse GPT JSON
      const cleanedAnalysis = analysis
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const analysisObj = JSON.parse(cleanedAnalysis);

      // Step 2: store in DB
      const storeRes = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: dialogProjectId,
          url,
          screenshot,
          heuristics: analysisObj.heuristics,
          snapshotHtml,
        }),
      });
      if (!storeRes.ok) throw new Error("Error storing analysis");

      // Clear
      setUrl("");
      setDialogProjectId(null);

      // Refresh project
      fetchAnalysisForProject(dialogProjectId);
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  // 5) Once we have selectedAnalysis, postMessage highlights
  useEffect(() => {
    if (!selectedAnalysis || !iframeRef.current) return;

    const highlights: { selector: string; label: string }[] = [];
    selectedAnalysis.heuristics.forEach((h) => {
      h.issues.forEach((issue) => {
        if (issue.selector) {
          highlights.push({ selector: issue.selector, label: issue.issue_id });
        }
      });
    });
    if (highlights.length === 0) return;

    const iframe = iframeRef.current;
    function handleLoad() {
      iframe.contentWindow?.postMessage({ type: "HIGHLIGHT", highlights }, "*");
    }

    // wait for load
    iframe.addEventListener("load", handleLoad, { once: true });
    return () => {
      iframe.removeEventListener("load", handleLoad);
    };
  }, [selectedAnalysis]);

  // 6) Listen for hover events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;
      if (event.data.type === "ISSUE_MOUSEENTER") {
        const { issueId } = event.data;
        if (selectedAnalysis) {
          for (const h of selectedAnalysis.heuristics) {
            for (const issue of h.issues) {
              if (issue.issue_id === issueId) {
                setHoveredIssue(issue);
                return;
              }
            }
          }
        }
      } else if (event.data.type === "ISSUE_MOUSELEAVE") {
        setHoveredIssue(null);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [selectedAnalysis]);

  return (
    <div className="flex flex-col min-h-screen">
      <AppBar />
      <div className="flex flex-1">
        {/* Sidebar: Projects + Analysis */}
        <aside className="w-64 border-r p-4 bg-gray-50 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Projects</h2>

          <Accordion
            type="single"
            collapsible
            onValueChange={handleProjectAccordionChange}
          >
            {projects.map((proj) => (
              <AccordionItem key={proj._id} value={proj._id}>
                <AccordionTrigger>{proj.name}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm mb-2">
                    {proj.description || "No description."}
                  </p>
                  <Accordion
                    type="single"
                    collapsible
                    onValueChange={handleAnalysisAccordionChange}
                    className="ml-2 border-l pl-2 space-y-1"
                  >
                    {(analysisMap[proj._id] || []).map((report) => (
                      <AccordionItem key={report._id} value={report._id}>
                        <AccordionTrigger>{report.url}</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-xs text-gray-600">
                            Expand to load analysis on the right.
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>

                  {/* New Analysis */}
                  <Dialog
                    open={dialogProjectId === proj._id}
                    onOpenChange={(open) =>
                      setDialogProjectId(open ? proj._id : null)
                    }
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" className="mt-2">
                        + New Analysis
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>New UI Analysis</DialogTitle>
                        <DialogDescription>
                          Enter the page URL to analyze
                        </DialogDescription>
                      </DialogHeader>
                      <form
                        onSubmit={handleCreateAnalysis}
                        className="space-y-4 mt-4"
                      >
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            URL
                          </label>
                          <Input
                            type="text"
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setDialogProjectId(null)}
                            type="button"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="default"
                            type="submit"
                            disabled={isAnalyzing}
                          >
                            {isAnalyzing ? "Analyzing..." : "Analyze"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </aside>

        {/* Main content: selectedAnalysis snapshot + highlights */}
        <main className="flex-1 p-4 space-y-4 overflow-auto">
          {!session && <p>Please log in to see your projects.</p>}

          {selectedAnalysis ? (
            <div className="space-y-4">
              <h1 className="text-xl font-bold">
                Analysis: {selectedAnalysis.url}
              </h1>

              {/* Iframe: load snapshot at /api/snapshot/[analysisId] */}
              <div className="relative border rounded">
                <iframe
                  ref={iframeRef}
                  src={`/api/snapshot/${selectedAnalysis._id}`}
                  style={{ width: "100%", height: "500px", border: "none" }}
                />

                {/* HoverCard for hoveredIssue */}
                <HoverCard open={!!hoveredIssue}>
                  <HoverCardTrigger asChild>
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: 1,
                        height: 1,
                      }}
                    />
                  </HoverCardTrigger>
                  <HoverCardContent className="max-w-sm">
                    {hoveredIssue ? (
                      <div className="space-y-2">
                        <p className="font-bold text-red-600">
                          Issue: {hoveredIssue.issue_id}
                        </p>
                        <p>
                          <strong>Description:</strong>{" "}
                          {hoveredIssue.description}
                        </p>
                        <p>
                          <strong>Solution:</strong> {hoveredIssue.solution}
                        </p>
                      </div>
                    ) : (
                      <p>No issue hovered</p>
                    )}
                  </HoverCardContent>
                </HoverCard>
              </div>

              {/* Heuristics list */}
              <div className="border p-2 rounded">
                <h2 className="font-semibold mb-2">Heuristics & Issues</h2>
                {selectedAnalysis.heuristics.map((h) => (
                  <div key={h.id} className="border-b pb-2 mb-2">
                    <p className="font-bold text-sm">
                      {h.id}. {h.name}
                    </p>
                    {h.issues.length > 0 ? (
                      <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                        {h.issues.map((issue) => (
                          <li key={issue.issue_id}>
                            <strong>{issue.issue_id}:</strong>{" "}
                            {issue.description}
                            <br />
                            <em>Solution:</em> {issue.solution}
                            {issue.selector && (
                              <div className="text-blue-500">
                                Selector: <code>{issue.selector}</code>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-600">No issues found.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-xl font-bold">Dashboard</h1>
              <p>Select a project and expand an analysis to see it here.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
