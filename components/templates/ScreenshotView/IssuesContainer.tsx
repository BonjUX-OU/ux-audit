import { getHeuristicColor } from "@/helpers/getColorHelper";
import { ReportIssueType } from "@/types/reportIssue.types";
import React, { useState } from "react";

type IssuesContainerProps = {
  imgUrl?: string;
  hideIssues: boolean;
  reportIssues: ReportIssueType[];
  onIssueClick: (issue: ReportIssueType) => void;
};

const IssuesContainer = ({ imgUrl, hideIssues, reportIssues, onIssueClick }: IssuesContainerProps) => {
  const [isHovering, setIsHovered] = useState("");
  const onMouseEnter = (id: string) => {
    setIsHovered(id);
  };
  const onMouseLeave = () => setIsHovered("");

  // TODO: Toggling highlight area MUST BE REFACTORED in order to imporove DOM performance for avoiding performance issues.
  // TODO: IMPROVEMENT IDEA => https://stackoverflow.com/questions/3331353/transitions-on-the-css-display-property
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
            <React.Fragment key={"fragment-" + index}>
              <div
                key={index}
                onMouseEnter={() => onMouseEnter(issue._id!)}
                className="w-10 h-10 text-white absolute rounded-full shadow-md flex items-center justify-center cursor-pointer"
                onClick={() => onIssueClick(issue)}
                style={{
                  backgroundColor: getHeuristicColor(issue.heuristic.code),
                  top: issue.snapshotLocation.top,
                  left: issue.snapshotLocation.left,
                  visibility: isHovering === issue._id ? "hidden" : "visible",
                  opacity: isHovering === issue._id ? 0 : 1,
                  transition: "visibility 0s, opacity 0.25s linear",
                }}>
                <h4 className="text-lg font-semibold">
                  {issue.heuristic.code}.{issue.order ?? 0}
                </h4>
              </div>
              <div
                key={"highlight-" + index}
                onClick={() => onIssueClick(issue)}
                onMouseLeave={onMouseLeave}
                style={{
                  cursor: "pointer",
                  width: issue.snapshotLocation.width,
                  height: issue.snapshotLocation.height,
                  top: issue.snapshotLocation.top,
                  left: issue.snapshotLocation.left,
                  backgroundColor: "rgba(255,255,255,0.25)",
                  border: "4px solid ".concat(getHeuristicColor(issue.heuristic.code)),
                  position: "absolute",
                  visibility: isHovering === issue._id ? "visible" : "hidden",
                  opacity: isHovering === issue._id ? 1 : 0,
                  transition: "visibility 0s, opacity 0.5s linear",
                }}>
                <div
                  key={index}
                  className="w-10 h-10 text-white absolute rounded-full shadow-md flex items-center justify-center cursor-pointer"
                  style={{
                    backgroundColor: getHeuristicColor(issue.heuristic.code),
                    top: "-1.5rem",
                    left: "-1.5rem",
                  }}>
                  <h4 className="text-lg font-semibold">
                    {issue.heuristic.code}.{issue.order ?? 0}
                  </h4>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </>
  );
};

export default IssuesContainer;
