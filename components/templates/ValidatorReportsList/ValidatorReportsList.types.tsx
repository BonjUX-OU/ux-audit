import { ReportStatus } from "@/components/organisms/ReportList/ReportList.types";

export type ReportGroupType = {
  label: string;
  value: string;
  status?: ReportStatus
};

export type ReportGroupObjectKeysType = "ALL" | "ASSIGNED" | "UNASSIGNED" | "IN_PROGRESS" | "COMPLETED";

export type ReportGroupsType = {
  [key in ReportGroupObjectKeysType]: ReportGroupType;
};
