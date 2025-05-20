import { SeverityLevels } from "@/constants/reportIssue.constants";
import { ReportIssueType } from "@/types/reportIssue.types";
import IssueListGroup from "./IssueListGroup";

export type IssueListViewProps = {
  issues: ReportIssueType[];
};

const IssueListView = ({ issues }: IssueListViewProps) => {
  const severityGroups = {
    minor: issues.filter((issue) => issue.severityLevel.code === SeverityLevels.MINOR.code),
    modareate: issues.filter((issue) => issue.severityLevel.code === SeverityLevels.MODERATE.code),
    major: issues.filter((issue) => issue.severityLevel.code === SeverityLevels.MAJOR.code),
    critical: issues.filter((issue) => issue.severityLevel.code === SeverityLevels.CRITICAL.code),
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 grid-rows-1 gap-4">
        {/* Minor Issues */}
        <IssueListGroup issues={severityGroups.minor} title="❓ Minor Issues" />

        {/* Modareta Issues */}
        <IssueListGroup issues={severityGroups.modareate} title="⁉️ Modareta Issues" />

        {/* Major Issues */}
        <IssueListGroup issues={severityGroups.major} title="‼️ Major Issues" />

        {/* Critical Issues */}
        <IssueListGroup issues={severityGroups.critical} title="&#9940; Critical Issues" />
      </div>
    </div>
  );
};

export default IssueListView;
