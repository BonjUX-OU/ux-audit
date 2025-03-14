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
import AppBar from "@/components/layout/AppBar";
import { ChevronLeft, Edit2Icon } from "lucide-react";

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

type HeuristicScore = {
  id: number;
  name: string;
  score: number;
};

type AnalysisReport = {
  _id: string;
  project?: string;
  url: string;
  screenshot?: string;
  snapshotHtml?: string;
  heuristics: Heuristic[];
  overallScore: number;
  scores: HeuristicScore[];
};

function getQualityLabel(score: number): string {
  if (score <= 20) return "very poor";
  if (score <= 40) return "poor";
  if (score <= 60) return "mediocre";
  if (score <= 80) return "good";
  return "very good";
}

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
      <div className="relative h-4 bg-rose-200 rounded-full">
        <div
          className="absolute left-0 top-0 h-4 bg-rose-900 rounded-full transition-all duration-300"
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

export default function AnalysisView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [analysis, setAnalysis] = useState<AnalysisReport | null>(null);
  const [hoveredIssue, setHoveredIssue] = useState<Issue | null>(null);
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

  // Highlight elements in the iframe after it loads
  useEffect(() => {
    if (!analysis || !iframeRef.current) return;

    const highlights: { selector: string; label: string }[] = [];
    analysis.heuristics.forEach((h) => {
      h.issues.forEach((issue) => {
        issue.occurrences?.forEach((occ) => {
          highlights.push({
            selector: occ.selector,
            label: occ.id,
          });
        });
      });
    });

    const iframe = iframeRef.current;
    function sendHighlights() {
      iframe.contentWindow?.postMessage({ type: "HIGHLIGHT", highlights }, "*");
    }

    // in case it's not fully loaded yet
    iframe.addEventListener("load", sendHighlights, { once: true });
    // also try after a short delay
    setTimeout(sendHighlights, 500);

    return () => {
      iframe.removeEventListener("load", sendHighlights);
    };
  }, [analysis]);

  // Listen for hover events from the child iframe
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!event.data) return;
      if (event.data.type === "ISSUE_MOUSEENTER") {
        const issueId = event.data.issueId;
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

  if (!analysis) {
    return (
      <div className="p-6">
        <p>Loading analysis...</p>
      </div>
    );
  }

  const overallScore = analysis.overallScore;
  const ratingLabel = getQualityLabel(overallScore);

  return (
    <>
      <AppBar />
      <div className="p-4 space-y-4 pt-16">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" onClick={() => router.push(`/dashboard`)}>
            <ChevronLeft />
            Back to Dashboard
          </Button>
          <Button
            onClick={() => router.push(`/report/${id}/edit`)}
            className="ml-auto"
          >
            <Edit2Icon />
            Edit
          </Button>
        </div>
        <main className="flex-1 px-4 overflow-auto">
          <div>
            <RatingBar score={overallScore} ratingLabel={ratingLabel} />

            <div className="grid grid-cols-12 gap-1">
              {/* IFRAME */}
              <div className="col-span-10 w-full">
                <div className="relative border rounded w-full">
                  <iframe
                    ref={iframeRef}
                    src={`/api/snapshot/${analysis._id}`}
                    // Add sandbox, allow scripts & same-origin so highlight script can work
                    sandbox="allow-same-origin allow-scripts"
                    style={{ width: "100%", height: "500px", border: "none" }}
                  />
                  {/* Hover card for hovered issues */}
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

              {/* Side panel with heuristics & issues */}
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
                              {issue.occurrences?.length > 0 && (
                                <div className="text-blue-500 mt-1">
                                  {issue.occurrences.map((occ) => (
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
                        <p className="text-xs text-gray-600">
                          No issues found.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
