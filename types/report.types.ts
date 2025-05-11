import { DataObjectType } from "./common.types";
import { ProjectType } from "./project.types";
import { UserType } from "./user.types";

export type ReportType = DataObjectType & {
  project: ProjectType;
  url: string;
  pageType: string;
  status: "unassigned" | "assigned" | "completed" | "failed";
  sector?: string;
  score?: number;
  createdBy?: UserType;
  assignedTo?: UserType;
  assignedBy?: UserType;
  predefinedIssues?: string[];
  screenshotImgUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
