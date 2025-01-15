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
  params: { projectId: string; analysisId: string };
}) {
  const { projectId, analysisId } = params;
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

      <h1 className="text-2xl font-bold">Analysis for {analysis.url}</h1>

      <div className="flex gap-4">
        {/* Left side: Iframe with highlights */}
        <div className="flex-1 relative">
          <iframe
            ref={iframeRef}
            src={`/api/proxy?url=${encodeURIComponent(analysis.url)}`}
            style={{
              width: "100%",
              height: "600px",
              border: "1px solid #ccc",
            }}
          />

          {/* HoverCard that appears if an issue is hovered */}
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
                    <strong>Description:</strong> {hoveredIssue.description}
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

        {/* Right side: Heuristic data */}
        <div className="w-1/5 border rounded p-2 h-[600px] overflow-y-auto">
          <h2 className="font-semibold mb-2 text-lg">
            Heuristics &amp; Issues
          </h2>
          {analysis.heuristics.map((h) => (
            <div key={h.id} className="border-b pb-2 mb-2">
              <p className="font-bold text-sm">
                {h.id}. {h.name}
              </p>
              {h.issues.length > 0 ? (
                <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                  {h.issues.map((issue) => (
                    <li key={issue.issue_id}>
                      <p>
                        <strong>{issue.issue_id}:</strong> {issue.description}
                      </p>
                      <p>
                        <em>Solution:</em> {issue.solution}
                      </p>
                      {issue.selector && (
                        <p className="text-blue-500">
                          Selector: <code>{issue.selector}</code>
                        </p>
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
    </div>
  );
}
