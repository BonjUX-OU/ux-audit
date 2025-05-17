import { ReportStatus } from "@/components/organisms/ReportList/ReportList.types";
import { ReportGroupsType } from "./ValidatorReportsList.types";

export const ReportGroups: ReportGroupsType = {
  ALL: { label: "All Reports", value: "all"},
  ASSIGNED: { label: "Assigned Reports", value: "assigned" , status: ReportStatus.Assigned},
  UNASSIGNED: { label: "Unassigned Reports", value: "unassigned" , status: ReportStatus.Unassigned},
  IN_PROGRESS: { label: "In Progress Reports", value: "inProgress" , status: ReportStatus.InProgres },
  COMPLETED: { label: "Completed Reports", value: "completed" , status: ReportStatus.Completed},
};
