import CreateIsseModal from "@/components/organisms/CreateIssueModal/CreateIsseModal";
import { Button } from "@/components/ui/button";
import { getHeuristicColor } from "@/helpers/getColorHelper";
import { useDrawRect } from "@/hooks/useDrawRect";
import { ReportType } from "@/types/report.types";
import { IssueOrdersType, ReportIssueType } from "@/types/reportIssue.types";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ScreenshowViewProps = {
  report: ReportType;
  reportIssues: ReportIssueType[];
  issueOrders: IssueOrdersType;
  onIssueClick: (issue: ReportIssueType) => void;
  onIssueCreate: (issue: ReportIssueType) => void;
};

const ScreenshowView = ({ report, reportIssues, issueOrders, onIssueClick, onIssueCreate }: ScreenshowViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { rectangle, enableDrawing, isDrawingEnabled, clearRectangle, isCropping } = useDrawRect(containerRef);

  const [showNewIssueModal, setShowNewIssueModal] = useState(false);

  useEffect(() => {
    if (rectangle) {
      setShowNewIssueModal(true);
    }
  }, [rectangle]);

  const handeCreateIssue = (createdIssue: ReportIssueType) => {
    clearRectangle();
    setShowNewIssueModal(false);
    onIssueCreate(createdIssue);
  };

  return (
    <>
      {isCropping && (
        <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-gray-50 z-50 bg-opacity-50">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#B04E34] border-t-transparent"></div>
            <p className="mt-4 text-lg font-medium text-gray-700">Cropping the image...</p>
          </div>
        </div>
      )}
      <div className="w-full flex items-center justify-center p-4 my-2">
        <Button
          onClick={enableDrawing}
          className="bg-[#B04E34] hover:bg-[#963F28] text-white flex items-center gap-1"
          disabled={isDrawingEnabled}
          size="sm">
          <Plus className="h-4 w-4" />
          <span>Draw Issue Area</span>
        </Button>
      </div>
      <div ref={containerRef} className="w-full h-max border-none relative">
        <img
          src={report.screenshotImgUrl}
          alt="Dynamic height content"
          style={{
            width: "100%",
            height: "auto", // This allows the image to maintain its natural height
            display: "block",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
        {!isDrawingEnabled && (
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
      </div>

      {/* New Issue Modal */}
      {showNewIssueModal && (
        <CreateIsseModal
          isOpen
          targetReport={report}
          issueOrders={issueOrders}
          issueRectangle={rectangle!}
          onSaveIssue={handeCreateIssue}
          onClose={setShowNewIssueModal}
        />
      )}
    </>
  );
};

export default ScreenshowView;
