import { SeverityLevels } from "@/constants/reportIssue.constants";
import { PreviewIssueType } from "@/types/reportIssue.types";
import PreviewIssueListGroup from "./PreviewIssueListGroup";

export type PreviewIssueListViewProps = {
  issues: PreviewIssueType[];
  onRegisterClick: () => void;
};

const PreviewIssueListView = ({ issues, onRegisterClick }: PreviewIssueListViewProps) => {
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
        <PreviewIssueListGroup
          issueCount={issues.length}
          onRegisterClick={onRegisterClick}
          issues={severityGroups.minor}
          title="❓ Minor Issues"
        />

        {/* Moderate Issues */}
        <PreviewIssueListGroup
          issueCount={issues.length}
          onRegisterClick={onRegisterClick}
          issues={severityGroups.modareate}
          title="⁉️ Moderate Issues"
        />

        {/* Major Issues */}
        <PreviewIssueListGroup
          issueCount={issues.length}
          onRegisterClick={onRegisterClick}
          issues={severityGroups.major}
          title="‼️ Major Issues"
        />

        {/* Critical Issues */}
        <PreviewIssueListGroup
          issueCount={issues.length}
          onRegisterClick={onRegisterClick}
          issues={severityGroups.critical}
          title="&#9940; Critical Issues"
        />
      </div>
    </div>
  );
};

export default PreviewIssueListView;
