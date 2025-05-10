export type ReportGroupType = {
  label: string;
  value: string;
};

export type ReportGroupObjectKeysType = "ALL" | "ASSIGNED" | "UNASSIGNED" | "IN_PROGRESS" | "COMPLETED";

export type ReportGroupsType = {
  [key in ReportGroupObjectKeysType]: ReportGroupType;
};
