import { AnalysingStepType } from "./AnalysingLoader.types";

export const AnalysingStatuses = {
  IN_PROGRESS: "in-progress",
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  ERROR: "error",
  DONE: "done",
} as const;

export const AnalysingSteps: AnalysingStepType[] = [
  { label: "Scraping the website...", status: AnalysingStatuses.PENDING },
  {
    label: "Analyzing webpage & Highlighting issues...",
    status: AnalysingStatuses.PENDING,
  },
  {
    label: "Generating final analysis & storing report...",
    status: AnalysingStatuses.PENDING,
  },
] as const;
