import { getHeuristicColor } from "@/helpers/getColorHelper";
import { ReportIssueType } from "@/types/reportIssue.types";

type IssuesContainerProps = {
  imgUrl?: string;
  hideIssues: boolean;
  reportIssues: ReportIssueType[];
  onIssueClick: (issue: ReportIssueType) => void;
};

const IssuesContainer = ({ imgUrl, hideIssues, reportIssues, onIssueClick }: IssuesContainerProps) => {
  return (
    <>
      <img
        src={imgUrl}
        alt="Dynamic height content"
        style={{
          width: "100%",
          height: "auto", // This allows the image to maintain its natural height
          display: "block",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
      {!hideIssues && (
        <div className="w-full h-full bg-transparent absolute top-0 left-0">
          {reportIssues.map((issue, index) => (
            <div
              key={index}
              className="w-10 h-10 text-white absolute rounded-full shadow-md flex items-center justify-center cursor-pointer"
              onClick={() => onIssueClick(issue)}
              style={{
                backgroundColor: getHeuristicColor(issue.heuristic.code),
                top: issue.snapshotLocation.top,
                left: issue.snapshotLocation.left,
              }}>
              <h4 className="text-lg font-semibold">
                {issue.heuristic.code}.{issue.order ?? 0}
              </h4>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default IssuesContainer;
