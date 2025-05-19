import { getHeuristicColor } from "@/helpers/getColorHelper";
import { ReportType } from "@/types/report.types";
import { ReportIssueType } from "@/types/reportIssue.types";
import { forwardRef } from "react";

type ScreenshowViewProps = {
  snapshotUrl: string;
  report: ReportType;
  reportIssues: ReportIssueType[];
  onIssueClick: (issue: ReportIssueType) => void;
  onCreateNewIssue: (issue: ReportIssueType) => void;
};

const ScreenshowView = forwardRef<HTMLDivElement, ScreenshowViewProps>(
  ({ snapshotUrl, reportIssues, onIssueClick }, ref) => {
    return (
      <div ref={ref} className="w-full h-max border-none relative">
        <img
          src={snapshotUrl}
          alt="Dynamic height content"
          style={{
            width: "100%",
            height: "auto", // This allows the image to maintain its natural height
            display: "block",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
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
              <h4 className="text-lg font-semibold">{issue.heuristic.code}</h4>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

ScreenshowView.displayName = "ScreenshowView";

export default ScreenshowView;
