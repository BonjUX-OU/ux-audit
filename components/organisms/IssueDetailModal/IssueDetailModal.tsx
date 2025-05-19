import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReportIssueType } from "@/types/reportIssue.types";
import { Badge } from "@/components/ui/badge";

type CreateIssueModalProps = {
  isOpen: boolean;
  issue: ReportIssueType;
  onClose: (isOpen: boolean) => void;
};

const IssueDetailModal = ({ isOpen, issue, onClose }: CreateIssueModalProps) => {
  const issueOptionNumber = `Issue ${issue.heuristic.code}.${issue.order}`;

  return (
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IssueDetailModal;
