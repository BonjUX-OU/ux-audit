import { SeverityLevels } from "@/constants/reportIssue.constants";
import { PreviewIssueType, ReportIssueType } from "@/types/reportIssue.types";
import IssueListGroup from "./IssueListGroup";

export type IssueListViewProps = {
  issues: ReportIssueType[];
  previewIssues?: PreviewIssueType[];
  isPaidReport?: boolean;
  onRegisterClick?: () => void;
};

const IssueListView = ({ issues, previewIssues, isPaidReport, onRegisterClick }: IssueListViewProps) => {
  const severityGroups = {
    minor: issues.filter((issue) => issue.severityLevel.code === SeverityLevels.MINOR.code),
    modareate: issues.filter((issue) => issue.severityLevel.code === SeverityLevels.MODERATE.code),
    major: issues.filter((issue) => issue.severityLevel.code === SeverityLevels.MAJOR.code),
    critical: issues.filter((issue) => issue.severityLevel.code === SeverityLevels.CRITICAL.code),
  };

  const previewIssueGroups = {
    minor: previewIssues?.filter((issue) => issue.severityLevel.code === SeverityLevels.MINOR.code),
    modareate: previewIssues?.filter((issue) => issue.severityLevel.code === SeverityLevels.MODERATE.code),
    major: previewIssues?.filter((issue) => issue.severityLevel.code === SeverityLevels.MAJOR.code),
    critical: previewIssues?.filter((issue) => issue.severityLevel.code === SeverityLevels.CRITICAL.code),
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 grid-rows-1 gap-4">
        {/* Minor Issues */}
        <IssueListGroup
          issues={severityGroups.minor}
          title="❓ Minor Issues"
          previewIssues={previewIssueGroups.minor}
          previewIssuesCount={previewIssues?.length}
          isPaidReport={isPaidReport}
          onRegisterClick={onRegisterClick}
        />

        {/* Moderate Issues */}
        <IssueListGroup
          issues={severityGroups.modareate}
          title="⁉️ Moderate Issues"
          previewIssues={previewIssueGroups.modareate}
          previewIssuesCount={previewIssues?.length}
          isPaidReport={isPaidReport}
          onRegisterClick={onRegisterClick}
        />

        {/* Major Issues */}
        <IssueListGroup
          issues={severityGroups.major}
          title="‼️ Major Issues"
          previewIssues={previewIssueGroups.major}
          previewIssuesCount={previewIssues?.length}
          isPaidReport={isPaidReport}
          onRegisterClick={onRegisterClick}
        />

        {/* Critical Issues */}
        <IssueListGroup
          issues={severityGroups.critical}
          title="&#9940; Critical Issues"
          previewIssues={previewIssueGroups.critical}
          previewIssuesCount={previewIssues?.length}
          isPaidReport={isPaidReport}
          onRegisterClick={onRegisterClick}
        />
      </div>
    </div>
  );
};

export default IssueListView;
