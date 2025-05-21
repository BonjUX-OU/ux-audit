import { ReportStatus } from "@/components/organisms/ReportList/ReportList.types";
import { DataObjectType } from "./common.types";
import { ProjectType } from "./project.types";
import { UserType } from "./user.types";

export type ReportType = DataObjectType & {
  project: ProjectType;
  url: string;
  pageType: string;
  status: ReportStatus;
  sector?: string;
  score?: number;
  createdBy?: UserType;
  assignedTo?: UserType;
  assignedBy?: UserType;
  predefinedIssues?: string[];
  screenshotImgUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  contributorNotes?: string;
  hasRights?: boolean;
};
