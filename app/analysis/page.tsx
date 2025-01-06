"use client";
import React, { useRef, useState, useEffect } from "react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GPTIssue {
  issue_id: string;
  description: string;
  solution: string;
  selector?: string;
}

interface Heuristic {
  id: number;
  name: string;
  issues: GPTIssue[];
}

interface AnalysisResult {
  heuristics: Heuristic[];
}

export default function Home() {
  // State
  const [url, setUrl] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // For the IFRAME reference
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Which issue is currently hovered in the proxied page?
  const [hoveredIssue, setHoveredIssue] = useState<GPTIssue | null>(null);

  /**
   * 1) Analyze the webpage
   */
  const handleAnalyze = async () => {
    if (!url) return;
    setLoading(true);
    setStatusMessage("Fetching webpage...");
    setAnalysis(null);

    try {
      // POST to your /api/analyze (or /api/combinedAnalyze)
      const res = await axios.post("/api/analyze", { url });

      setStatusMessage("Analyzing...");
      const { screenshot, analysis: rawAnalysis } = res.data || {};

      // Clean up GPT JSON
      const cleaned = rawAnalysis
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(
        cleaned.substring(cleaned.indexOf("{"), cleaned.lastIndexOf("}") + 1)
      ) as AnalysisResult;

      setAnalysis(parsed);

      setStatusMessage("Highlighting issues...");
      highlightIssues(parsed);

      setStatusMessage("Analysis complete!");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 2) Highlight
   */
  const highlightIssues = (analysisData: AnalysisResult) => {
    if (!iframeRef.current?.contentWindow) return;

    // Build an array of { selector, label } for each issue
    const highlights: { selector: string; label: string }[] = [];

    analysisData.heuristics.forEach((h) => {
      h.issues.forEach((issue) => {
        if (issue.selector) {
          highlights.push({
            selector: issue.selector,
            label: issue.issue_id, // "1.1", etc.
          });
        }
      });
    });

    if (highlights.length > 0) {
      // Send them to the proxied page
      iframeRef.current.contentWindow.postMessage(
        {
          type: "HIGHLIGHT",
          highlights,
        },
        "*"
      );
    }
  };

  /**
   * 3) Listen for "ISSUE_MOUSEENTER" and "ISSUE_MOUSELEAVE" from the proxied page
   *    Then show/hide a Shadcn HoverCard with the matching issue details
   */
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;

      if (event.data.type === "ISSUE_MOUSEENTER") {
        // event.data.issueId => e.g. "1.1"
        const issueId = event.data.issueId;
        if (analysis) {
          let found: GPTIssue | null = null;
          for (const h of analysis.heuristics) {
            for (const issue of h.issues) {
              if (issue.issue_id === issueId) {
                found = issue;
                break;
              }
            }
            if (found) break;
          }
          setHoveredIssue(found || null);
        }
      } else if (event.data.type === "ISSUE_MOUSELEAVE") {
        // Clear the hovered issue
        setHoveredIssue(null);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [analysis]);

  return (
    <div className="p-12 space-y-1">
      <h1 className="text-2xl font-bold">UX Audit</h1>

      <div className="flex items-center">
        <input
          type="text"
          placeholder="Enter URL, e.g. https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border p-2 w-96"
        />
        <Button onClick={handleAnalyze} disabled={!url || loading}>
          {loading ? "Working..." : "Analyze"}
        </Button>
      </div>

      {statusMessage && <p className="font-semibold">{statusMessage}</p>}
      <div className="grid grid-cols-12 gap-1">
        <div className="col-span-10">
          {/* The proxied webpage, only one view */}
          {url && (
            <div className="border rounded p-1">
              <h2 className="font-semibold mb-2">Live Page Preview</h2>
              <iframe
                ref={iframeRef}
                title="Page Preview"
                src={`/api/proxy?url=${encodeURIComponent(url)}`}
                style={{
                  width: "100%",
                  height: "500px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
          )}

          {/* Shadcn HoverCard for the hoveredIssue.
          We'll display it in a corner so user sees the details at a fixed location.
          Alternatively, you can float it near the cursor with a custom approach. */}
          <HoverCard open={!!hoveredIssue}>
            <HoverCardTrigger asChild>
              {/* Invisible anchor element or just a small block. */}
              <div style={{ width: 1, height: 1 }} />
            </HoverCardTrigger>
            <HoverCardContent className="max-w-sm">
              {hoveredIssue ? (
                <div className="space-y-2">
                  <p className="font-bold text-red-500">
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

        <div className="col-span-2">
          {/* Show the final analysis if any */}
          {analysis && (
            <div className="border p-2 rounded">
              <h2 className="font-semibold mb-2">
                Analysis (Nielsen's Heuristics)
              </h2>
              <ScrollArea className="h-[480px]">
                {analysis.heuristics.map((h) => (
                  <div key={h.id} className="border-b pb-2 mb-2">
                    <h3 className="font-bold">
                      {h.id}. {h.name}
                    </h3>
                    {h.issues.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {h.issues.map((issue) => (
                          <li key={issue.issue_id}>
                            <p>
                              <strong>{issue.issue_id}:</strong>{" "}
                              {issue.description}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Solution:</strong> {issue.solution}
                            </p>
                            {issue.selector && (
                              <p className="text-sm text-blue-500">
                                Selector: <code>{issue.selector}</code>
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-600">No issues found.</p>
                    )}
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
