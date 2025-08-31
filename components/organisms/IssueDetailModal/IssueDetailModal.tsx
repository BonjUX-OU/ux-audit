import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReportIssueType } from "@/types/reportIssue.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";

type CreateIssueModalProps = {
  isOpen: boolean;
  issue: ReportIssueType;
  previewMode?: boolean;
  onClose: (isOpen: boolean) => void;
  onDeleteIssueSuccess?: () => void;
};

const IssueDetailModal = ({ isOpen, issue, previewMode, onClose, onDeleteIssueSuccess }: CreateIssueModalProps) => {
  const issueOptionNumber = `Issue ${issue.heuristic.code}.${issue.order}`;
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const confirmDeleteIssue = async () => {
    const res = await fetch(`/api/report/issue?issueId=${issue._id}`, { method: "DELETE" });
    const result = await res.json();

    if (result) {
      onDeleteIssueSuccess?.();
      setConfirmationOpen(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="p-0 gap-0">
          <DialogHeader className="border-b">
            <DialogTitle></DialogTitle>
            <div className="flex items-center gap-2">
              <span className="p-4 text-lg font-[500]">{issueOptionNumber}</span>
              <Badge
                variant="outline"
                className="p-2 bg-[#FFF1E0] border-[#B04E34] rounded-lg text-sm font-[500] flex items-center gap-2">
                ⁉️ {issue.severityLevel.name}
              </Badge>
            </div>
          </DialogHeader>

          <div className="p-4 h-auto flex flex-col gap-4">
            <div className="w-full flex items-center justify-center">
              <img
                src={issue.croppedImageUrl}
                alt="Issue Snapshot"
                className="rounded-lg border border-[#B04E34] shadow-md"
              />
            </div>
            <span className="text-md font-[500]">
              {issue.heuristic.name} ({issue.heuristic.code})
            </span>
            <div className="w-full">
              <span className="text-lg font-[500]">{issueOptionNumber} description</span>
              <p className="text-md font-light">{issue.description}</p>
            </div>
            <div className="w-full">
              <span className="text-lg font-[500]">Suggested Fix for {issueOptionNumber}</span>
              <p className="text-md font-light">{issue.suggestedFix}</p>
            </div>

            <div className="flex items-center gap-2">
              {issue.tags?.map((tag) => (
                <Badge
                  variant="outline"
                  key={tag}
                  className="p-2 bg-[#FFF1E0] border-[#B04E34] rounded-lg text-sm font-light flex items-center gap-2">
                  {tag}
                </Badge>
              ))}
            </div>

            {!previewMode && (
              <div className="flex">
                <Button
                  onClick={() => setConfirmationOpen(true)}
                  className="w-full py-6 bg-[#B04E34] hover:bg-[#963F28] text-white">
                  Delete Issue
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {!previewMode && (
        <ConfirmationModal
          variant="danger"
          title="Delete Report"
          description="Are you sure you want to delete this issue? This action cannot be undone."
          isOpen={confirmationOpen}
          confirmButtonTitle="Delete"
          onConfirm={confirmDeleteIssue}
          onCancel={() => setConfirmationOpen(false)}
        />
      )}
    </>
  );
};

export default IssueDetailModal;
