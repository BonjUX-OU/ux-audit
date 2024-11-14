// pages/index.tsx

"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from "axios";

interface Heuristic {
  name: string;
  score: number;
  suggestions: string;
}

interface AnalysisResult {
  heuristics: Heuristic[];
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setStatusMessage("Fetching webpage...");
    setScreenshot(null);
    setAnalysis(null);

    try {
      // Capture Screenshot
      const screenshotResponse = await axios.post("/api/snapshot", { url });
      setScreenshot(screenshotResponse.data.screenshot);

      setStatusMessage("Analyzing webpage...");

      // Analyze Screenshot
      const analyzeResponse = await axios.post("/api/analyze", {
        screenshotBase64: screenshotResponse.data.screenshot,
      });

      // Clean and parse the GPT output
      const cleanedOutput = analyzeResponse.data
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const outputData = JSON.parse(
        cleanedOutput.substring(
          cleanedOutput.indexOf("{"),
          cleanedOutput.lastIndexOf("}") + 1
        )
      );

      setAnalysis(outputData);
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
      setStatusMessage("");
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">UX Audit</h1>
      <div className="space-y-4">
        <Input
          placeholder="Enter website URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />
        <Button onClick={handleSubmit} disabled={loading || !url}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Analyze Website"
          )}
        </Button>
      </div>

      {statusMessage && <p>{statusMessage}</p>}

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6">
          {screenshot && (
            <ScrollArea className="w-full h-96 border rounded-lg">
              <img
                src={`data:image/png;base64,${screenshot}`}
                alt="Website Screenshot"
                className="w-full"
              />
            </ScrollArea>
          )}
        </div>
        <div className="col-span-6">
          {analysis && (
            <ScrollArea className="w-full h-96 border rounded-lg p-4">
              <ul className="space-y-2">
                {analysis.heuristics.map((heuristic, index) => (
                  <li key={index} className="p-4 border rounded-lg">
                    <h3 className="font-semibold">{heuristic.name}</h3>
                    <p>Score: {heuristic.score}/5</p>
                    <p>Suggestions: {heuristic.suggestions}</p>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
