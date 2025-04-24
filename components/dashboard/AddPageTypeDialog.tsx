// components/dashboard/AddPageTypeDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AddPageTypeDialog({
  open,
  onOpenChange,
  value,
  setValue,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  setValue: (v: string) => void;
  onAdd: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-white shadow-2xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg">Add New Page Type</DialogTitle>
          <DialogDescription>
            Enter a new page type that is not in the list.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 mb-4">
          <Input
            placeholder="e.g. Contact"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="shadow-sm focus:ring-[#B04E34]/50"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onAdd} className="bg-[#B04E34] text-white">
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
