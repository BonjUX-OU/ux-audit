import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PreviewIssueType } from "@/types/reportIssue.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type CreateIssueModalProps = {
  issue: PreviewIssueType;
  issueCount: number;
  onClose: () => void;
  onRegisterClick: () => void;
};

const RegisterAndPayModal = ({ issue, issueCount, onClose, onRegisterClick }: CreateIssueModalProps) => {
  const issueOptionNumber = `Issue ${issue.heuristic.code}.${issue.order}`;

  return (
    <>
      <Dialog open onOpenChange={onClose}>
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

          <div className="p-4 h-auto flex flex-col items-center text-center gap-5 bg-[#FFF1E0]">
            <div className="w-full flex items-center justify-center">
              <h1 className="text-[#B04E34] text-3xl bold my-4">Get your full report just €14.90</h1>
            </div>
            <div className="w-full">
              <span className="text-md font-[300] text-[#B04E34]">
                We have found {issueCount} issues for this page. If you want to get the full report you need to pay
                first. You will be directed to the Stripe page.
              </span>
            </div>

            <div className="flex">
              <Button onClick={onRegisterClick} className="w-full py-6 bg-[#B04E34] hover:bg-[#963F28] text-white">
                Register & Purchase full report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RegisterAndPayModal;
