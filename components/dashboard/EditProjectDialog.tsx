// components/dashboard/EditProjectDialog.tsx
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

export default function EditProjectDialog({
  open,
  onOpenChange,
  name,
  setName,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  setName: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-white shadow-2xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg">Edit Project Name</DialogTitle>
          <DialogDescription>
            Update the project name as you wish.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="mt-2 mb-4">
            <Input
              type="text"
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow-sm focus:ring-[#B04E34]/50"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#B04E34] text-white">
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
