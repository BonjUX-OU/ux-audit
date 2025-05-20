import { CodeNamePair, DataObjectType } from "./common.types";
import { ReportType } from "./report.types";
import { UserType } from "./user.types";

export type HeuristicType = CodeNamePair & {
  description: string;
};

export type SeverityLevelKeys = "MINOR" | "MAJOR" | "MODERATE" | "CRITICAL";

export type SeverityLevelsType = {
  [key in SeverityLevelKeys]: SeverityLevelType;
};

export type SeverityLevelType = {
  code: "1" | "2" | "3" | "4";
  name: "Minor (1)" | "Moderate (2)" | "Major (3)" | "Critical (4)";
};

export type IssueOrdersType = {
  [key in HeuristicType["code"]]: number;
};

export type SnapshotType = {
  top: number;
  right?: number;
  bottom?: number;
  left: number;
  width: number;
  height: number;
};

export type ReportIssueType = DataObjectType & {
  report: ReportType;
  createdBy?: UserType;
  updatedBy?: UserType;
  heuristic: HeuristicType;
  severityLevel: SeverityLevelType;
  order: number;
  suggestedFix?: string;
  croppedImageUrl: string;
  snapshotLocation: SnapshotType;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
};
