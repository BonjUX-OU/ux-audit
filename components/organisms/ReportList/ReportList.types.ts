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


export enum ReportStatus {
  Unassigned = "UNASSIGNED",
  Assigned = "ASSIGNED",
  NotStarted = "NOT_STARTED",
  InProgres = "IN_PROGRESS",
  Completed = "COMPLETED"
}

interface Page{
  pageNumber: number,
  pageItemsCount: number
}

export interface ReportRequestType{
  userId: string;
  reportStatus: ReportStatus;
  page: Page;
}