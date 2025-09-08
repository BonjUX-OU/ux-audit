import CreateIsseModal from "@/components/organisms/CreateIssueModal/CreateIsseModal";
import IssueDetailModal from "@/components/organisms/IssueDetailModal/IssueDetailModal";
import { useDrawRect } from "@/hooks/useDrawRect";
import { ReportType } from "@/types/report.types";
import { IssueOrdersType, ReportIssueType } from "@/types/reportIssue.types";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import IssuesContainer from "./IssuesContainer";
import LoadingOverlay from "@/components/layout/LoadingOverlay";
import ScreenshotOverlay from "./ScreenshotOverlay";

type ScreenshowViewProps = {
  report: ReportType;
  reportIssues: ReportIssueType[];
  issueOrders: IssueOrdersType;
  onIssueCreate: (issue: ReportIssueType) => void;
};

export type AddIssueButtonRef = {
  enableDrawMode: () => void;
};

// !IMPORTANT !!!! THIS COMPONENT IS NOT IN USE CURRENTLY

const ScreenshotView = forwardRef<AddIssueButtonRef, ScreenshowViewProps>(
  ({ report, reportIssues, issueOrders, onIssueCreate }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { rectangle, enableDrawing, isDrawingEnabled, clearRectangle, isCropping } = useDrawRect(containerRef);

    const [showNewIssueModal, setShowNewIssueModal] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<ReportIssueType | null>(null);

    useImperativeHandle(ref, () => ({
      enableDrawMode: () => {
        !isDrawingEnabled && enableDrawing();
      },
    }));

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
        {isCropping && <LoadingOverlay message="Cropping the image..." hasOpacity />}
        <div ref={containerRef} className="w-full h-max border-none relative">
          <IssuesContainer
            hideIssues={isDrawingEnabled}
            imgUrl={report.screenshotImgUrl}
            reportIssues={reportIssues}
            onIssueClick={setSelectedIssue}
          />
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

        {selectedIssue && <IssueDetailModal isOpen issue={selectedIssue!} onClose={() => setSelectedIssue(null)} />}

        {isDrawingEnabled && !isCropping && <ScreenshotOverlay targetRef={containerRef} />}
      </>
    );
  }
);

ScreenshotView.displayName = "ScreenshotView";

export default ScreenshotView;
