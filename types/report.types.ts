import { DataObjectType } from "./common.types";
import { ProjectType } from "./project.types";
import { UserType } from "./user.types";

export type OccurrenceType = DataObjectType & {
  selector: string;
};

export type IssueType = DataObjectType & {
  description: string;
  solution: string;
  occurrences: OccurrenceType[];
};

export type HeuristicType = DataObjectType & {
  name: string;
  issues: IssueType[];
};

export type ReportType = {
  project: ProjectType;
  createdBy?: UserType;
  assignedTo?: UserType;
  assignedBy?: UserType;
  url: string;
  sector?: string;
  pageType: string;
  predefinedIssues?: string[];
  score?: number;
  status: "unassigned" | "assigned" | "completed" | "failed";
  heuristics?: HeuristicType[];
  snapshotHtml?: string;
  humanEdited?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ReportResponseType = DataObjectType & ReportType;
