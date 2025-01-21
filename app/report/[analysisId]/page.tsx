// app/dashboard/[projectId]/analysis/[analysisId]/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

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
};

export default function AnalysisView({
  params,
}: {
  params: { analysisId: string };
}) {
  const { analysisId } = params;
  const router = useRouter();

  const [analysis, setAnalysis] = useState<AnalysisReport | null>(null);
  const [hoveredIssue, setHoveredIssue] = useState<Issue | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 1) Fetch the analysis
  async function fetchAnalysis() {
    try {
      const res = await fetch(`/api/report?id=${analysisId}`);
      if (!res.ok) throw new Error("Failed to fetch analysis");
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchAnalysis();
  }, [analysisId]);

  // 2) Once we have the analysis, we send highlight instructions to the iframe
  useEffect(() => {
    if (!analysis || !iframeRef.current) return;

    const highlights: { selector: string; label: string }[] = [];
    analysis.heuristics.forEach((h) => {
      h.issues.forEach((issue) => {
        if (issue.selector) {
          highlights.push({ selector: issue.selector, label: issue.issue_id });
        }
      });
    });

    if (highlights.length === 0) return;

    const iframe = iframeRef.current;
    function handleIframeLoad() {
      // postMessage to the proxied page
      iframe.contentWindow?.postMessage({ type: "HIGHLIGHT", highlights }, "*");
    }

    // wait for the iframe to load
    iframe.addEventListener("load", handleIframeLoad, { once: true });

    return () => {
      iframe.removeEventListener("load", handleIframeLoad);
    };
  }, [analysis]);

  // 3) Listen for hover events from the proxied page
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;
      if (event.data.type === "ISSUE_MOUSEENTER") {
        const issueId = event.data.issueId;
        // find the matching issue
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
    };
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

  return (
    <div className="p-4 space-y-4">
      <Button variant="outline" onClick={() => router.push(`/dashboard`)}>
        Back to Dashboard
      </Button>
      <main className="flex-1 p-4 space-y-4 overflow-auto">
        {analysis ? (
          <div className="space-y-4">
            <h1 className="text-xl font-bold">Analysis: {analysis.url}</h1>

            {/* Iframe: load snapshot at /api/snapshot/[analysisId] */}
            <div className="grid grid-cols-12 gap-1">
              <div className="col-span-10 w-full">
                <div className="relative border rounded w-full">
                  <iframe
                    ref={iframeRef}
                    src={`/api/snapshot/${analysis._id}`}
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
              </div>

              {/* Heuristics list */}
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
                              {issue.selector && (
                                <div className="text-blue-500">
                                  Selector: <code>{issue.selector}</code>
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
        ) : (
          <div>
            <h1 className="text-xl font-bold">Dashboard</h1>
            <p>Select a project and expand an analysis to see it here.</p>
          </div>
        )}
      </main>
    </div>
  );
}
