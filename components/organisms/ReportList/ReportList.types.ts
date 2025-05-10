import { ProjectType } from "@/types/project.types";

export type RatingLabelType = {
  threshold: number;
  label: string;
  color: string;
};

export type HeuristicType = any;

export type AnalysisReportType = {
  _id: string;
  url: string;
  sector?: string;
  overallScore: number;
  createdAt?: string;
  heuristics?: HeuristicType[];
  project: ProjectType;
  pageType?: string;
};
