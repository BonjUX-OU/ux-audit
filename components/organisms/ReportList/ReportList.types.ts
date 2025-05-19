export type RatingLabelType = {
  threshold: number;
  label: string;
  color: string;
};

export enum ReportStatus {
  Unassigned = "UNASSIGNED",
  Assigned = "ASSIGNED",
  NotStarted = "NOT_STARTED",
  InProgres = "IN_PROGRESS",
  Completed = "COMPLETED",
}
interface Page {
  pageNumber: number;
  pageItemsCount: number;
}
export interface ReportRequestType {
  userId: string;
  reportStatus: ReportStatus;
  page: Page;
}
