// components/dashboard/DeleteProjectDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DeleteProjectDialog({
  open,
  onOpenChange,
  projectName,
  confirmationValue,
  setConfirmationValue,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  confirmationValue: string;
  setConfirmationValue: (v: string) => void;
  onConfirm: () => void;
}) {
  const disabled = confirmationValue !== projectName;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-white shadow-2xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg text-red-600">
            Delete Project
          </DialogTitle>
          <DialogDescription>
            Deleting the project will remove <strong>all reports</strong> inside
            it. This action <strong>cannot be undone</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 text-sm">
          To confirm, type the name of the project below:
        </div>
        <div className="mt-2 mb-4">
          <Input
            type="text"
            placeholder="Enter project name"
            value={confirmationValue}
            onChange={(e) => setConfirmationValue(e.target.value)}
            className="shadow-sm focus:ring-red-400/50"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={disabled}
            className={`bg-red-600 text-white ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Delete Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
