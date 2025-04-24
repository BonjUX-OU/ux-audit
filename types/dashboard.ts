// types/dashboard.ts
export type Project = {
  _id: string;
  owner?: string;
  name: string;
  description?: string;
  createdAt?: string;
};

export type AnalysisReport = {
  _id: string;
  url: string;
  sector?: string;
  overallScore: number;
  createdAt?: string;
  heuristics?: any[];
  project: Project;
  pageType?: string;
};

export type AnalysisStep = {
  label: string;
  status: "pending" | "in-progress" | "done" | "error";
};
