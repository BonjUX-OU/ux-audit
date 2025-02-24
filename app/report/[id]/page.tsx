"use client";
import React, { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// ------------------------------------------------------------------------
// 1. Data Structures
// ------------------------------------------------------------------------

// Each occurrence has an ID and a CSS selector
type Occurrence = {
  id: string;
  selector: string;
};

// Issues now include an array of occurrences
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

// Each heuristic has a numeric score
type HeuristicScore = {
  id: number;
  name: string;
  score: number;
};

// Full server response shape
type AnalysisReport = {
  _id: string; // e.g. DB or project ID
  project?: string; // optional project name
  url: string; // the URL that was analyzed
  screenshot?: string; // base64 screenshot (optional)
  heuristics: Heuristic[]; // list of heuristics and issues
  overallScore: number; // overall numeric score
  scores: HeuristicScore[]; // per-heuristic numeric scores
};

// ------------------------------------------------------------------------
// 2. (Optional) Utility Functions
// ------------------------------------------------------------------------

// Example scoring logic that doesn't actually use the scores array;
// it calculates an overall rating based on the total number of issues.
function calculateScore(analysis: AnalysisReport): number {
  const totalHeuristics = analysis.heuristics.length;
  if (totalHeuristics === 0) return 100; // Edge case: no heuristics => perfect

  const totalIssues = analysis.heuristics.reduce(
    (acc, h) => acc + h.issues.length,
    0
  );
  const issuesPerHeuristic = totalIssues / totalHeuristics;

  // Example: 5+ issues/heuristic => 0 score
  const worstCaseThreshold = 5;
  const rawScore = 100 - (issuesPerHeuristic / worstCaseThreshold) * 100;
  const clampedScore = Math.max(0, Math.min(100, rawScore));
  return Math.round(clampedScore);
}

function getQualityLabel(score: number): string {
  if (score <= 20) return "very poor";
  if (score <= 40) return "poor";
  if (score <= 60) return "mediocre";
  if (score <= 80) return "good";
  return "very good";
}

// Simple rating bar to display a single numeric score
function RatingBar({
  score,
  ratingLabel,
}: {
  score: number;
  ratingLabel?: string;
}) {
  const clampedScore = Math.max(0, Math.min(100, score));
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>Very Poor</span>
        <span>Mediocre</span>
        <span>Good</span>
        <span>Very Good</span>
      </div>
      <div className="relative h-4 bg-gray-200 rounded-full">
        <div
          className="absolute left-0 top-0 h-4 bg-gray-400 rounded-full transition-all duration-300"
          style={{ width: `${clampedScore}%` }}
        />
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
          {ratingLabel && (
            <span className="text-xs font-bold text-black">
              [{ratingLabel}]
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------
// 3. Main Component
// ------------------------------------------------------------------------
export default function AnalysisView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // The ID from the route params
  const { id } = use(params);
  const router = useRouter();

  // Store the entire analysis from /api/report
  const [analysis, setAnalysis] = useState<AnalysisReport | null>(null);

  // Which issue the user is currently hovering over (from the <iframe>)
  const [hoveredIssue, setHoveredIssue] = useState<Issue | null>(null);

  // Reference to the <iframe>, so we can communicate with it via postMessage
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fetch the analysis from your /api/report route
  async function fetchAnalysis() {
    try {
      const res = await fetch(`/api/report?id=${id}`);
      if (!res.ok) throw new Error("Failed to fetch analysis");
      const data = await res.json();
      // data is presumably shaped like { _id, url, screenshot, heuristics, scores }
      console.log("Analysis data:", data);
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    }
  }

  // Run once on mount
  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  // 2) Once we have the analysis, we highlight elements in the iframe
  useEffect(() => {
    if (!analysis || !iframeRef.current) return;

    // Build an array of all (selector, label) we want to highlight
    const highlights: { selector: string; label: string }[] = [];
    analysis.heuristics.forEach((h) => {
      h.issues.forEach((issue) => {
        // Each issue may have multiple occurrences
        issue.occurrences &&
          issue.occurrences.forEach((occ) => {
            highlights.push({
              selector: occ.selector,
              label: occ.id,
            });
          });
      });
    });

    if (highlights.length === 0) return;

    const iframe = iframeRef.current;
    function handleIframeLoad() {
      iframe.contentWindow?.postMessage({ type: "HIGHLIGHT", highlights }, "*");
    }

    iframe.addEventListener("load", handleIframeLoad, { once: true });
    return () => {
      iframe.removeEventListener("load", handleIframeLoad);
    };
  }, [analysis]);

  // 3) Listen for hover events from the proxied page
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!event.data) return;

      if (event.data.type === "ISSUE_MOUSEENTER") {
        const issueId = event.data.issueId;
        // find the matching issue in analysis
        let found: Issue | null = null;
        analysis?.heuristics.forEach((h) => {
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

  // If loading or data not yet present
  if (!analysis) {
    return (
      <div className="p-6">
        <p>Loading analysis...</p>
      </div>
    );
  }

  // Example: overall rating using the # of issues
  const overallScore = analysis.overallScore;
  const ratingLabel = getQualityLabel(overallScore);

  return (
    <div className="p-4 space-y-4">
      <Button variant="outline" onClick={() => router.push(`/dashboard`)}>
        Back to Dashboard
      </Button>

      {/* Overall rating bar across all heuristics */}
      <RatingBar score={overallScore} ratingLabel={ratingLabel} />

      <main className="flex-1 p-4 space-y-4 overflow-auto">
        <div className="space-y-4">
          <h1 className="text-xl font-bold">Analysis: {analysis.url}</h1>

          {/* If you store an HTML snapshot at /api/snapshot/[analysisId], load it in an iframe */}
          <div className="grid grid-cols-12 gap-1">
            <div className="col-span-10 w-full">
              <div className="relative border rounded w-full">
                <iframe
                  ref={iframeRef}
                  src={`/api/snapshot/${analysis._id}`}
                  style={{ width: "100%", height: "500px", border: "none" }}
                />
                {/* Hover card for the hovered issue */}
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
            </div>

            {/* Side panel: heuristics & issues */}
            <ScrollArea className="col-span-2 h-[500px]">
              <div className="col-span-2 p-2 rounded">
                <h2 className="font-semibold mb-2">Heuristics & Issues</h2>
                {analysis.heuristics.map((h) => (
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
                            {/* Show ALL occurrences (selector + occurrence ID) */}
                            {issue.occurrences &&
                              issue.occurrences.length > 0 && (
                                <div className="text-blue-500 mt-1">
                                  {issue.occurrences &&
                                    issue.occurrences.map((occ) => (
                                      <div key={occ.id}>
                                        <strong>Occurrence {occ.id}:</strong>{" "}
                                        <code>{occ.selector}</code>
                                      </div>
                                    ))}
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
            </ScrollArea>
          </div>

          {/* (Optional) Display the per-heuristic numeric scores from the 'scores' array */}
          <div className="mt-4 p-2 border rounded">
            <h2 className="font-semibold mb-2">Heuristic Scores</h2>
            {analysis.scores && analysis.scores.length > 0 ? (
              <ul className="list-none pl-0 space-y-1 text-sm">
                {analysis.scores.map((score) => (
                  <li key={score.id}>
                    <strong>
                      {score.id}. {score.name}
                    </strong>
                    : {score.score}/10
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-600">No scores available.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
