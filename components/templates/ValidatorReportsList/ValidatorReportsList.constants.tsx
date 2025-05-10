import { ReportGroupsType } from "./ValidatorReportsList.types";

export const ReportGroups: ReportGroupsType = {
  ALL: { label: "All Reports", value: "all" },
  ASSIGNED: { label: "Assigned Reports", value: "assigned" },
  UNASSIGNED: { label: "Unassigned Reports", value: "unassigned" },
  IN_PROGRESS: { label: "In Progress Reports", value: "inProgress" },
  COMPLETED: { label: "Completed Reports", value: "completed" },
};
