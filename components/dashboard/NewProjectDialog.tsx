// components/dashboard/NewProjectDialog.tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

export default function NewProjectDialog({
  open,
  onOpenChange,
  name,
  description,
  setName,
  setDescription,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  description: string;
  setName: (v: string) => void;
  setDescription: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-[#B04E34] hover:bg-[#FFF1E0]"
        >
          <Plus className="h-4 w-4 mr-1" /> New
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white shadow-2xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Create a new Project</DialogTitle>
          <DialogDescription>
            Enter details for your new project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              type="text"
              placeholder="Project Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="shadow-sm focus:ring-[#B04E34]/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <Input
              type="text"
              placeholder="Optional"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow-sm focus:ring-[#B04E34]/50"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#B04E34] text-white">
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
