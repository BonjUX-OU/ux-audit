import { CodeNamePair, DataObjectType } from "./common.types";
import { ReportType } from "./report.types";
import { UserType } from "./user.types";

export type HeuristicType = CodeNamePair & {
  description: string;
  color?: string;
};

export type SeverityLevelsType = {
  [key in "MINOR" | "MAJOR" | "MODERATE" | "CRITICAL"]: SeverityLevelType;
};

export type SeverityLevelType = {
  code: "1" | "2" | "3" | "4";
  name: "Minor (1)" | "Moderate (2)" | "Major (3)" | "Critical (4)";
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
  suggestedFix?: string;
  croppedImageUrl: string;
  snapshotLocation: SnapshotType;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
};
