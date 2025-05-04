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

export type ReportType = DataObjectType & {
  project: ProjectType;
  createdBy: UserType;
  assignedTo: UserType;
  url: string;
  sector?: string;
  pageType: string;
  predefinedIssues?: string[];
  score: number;
  status: "unassigned" | "assigned" | "completed" | "failed";
  heuristics: HeuristicType[];
  snapshotHtml: string;
  humanEdited?: boolean;
};
