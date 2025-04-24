// components/dashboard/ProjectSidebar.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Layers, FileIcon, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import NewProjectDialog from "./NewProjectDialog";

import type { Project } from "@/types/dashboard";

export default function ProjectSidebar({
  projects,
  currentProjectId,
  onSelect,
  onEdit,
  onDelete,
  newDialogOpen,
  setNewDialogOpen,
  newName,
  newDesc,
  setNewName,
  setNewDesc,
  onCreate,
}: {
  projects: Project[];
  currentProjectId: string;
  onSelect: (p: Project) => void;
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
  newDialogOpen: boolean;
  setNewDialogOpen: (b: boolean) => void;
  newName: string;
  newDesc: string;
  setNewName: (s: string) => void;
  setNewDesc: (s: string) => void;
  onCreate: (e: React.FormEvent) => void;
}) {
  return (
    <Card className="sticky top-20 shadow-lg bg-white hover:shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Projects</CardTitle>
          <NewProjectDialog
            open={newDialogOpen}
            onOpenChange={setNewDialogOpen}
            name={newName}
            description={newDesc}
            setName={setNewName}
            setDescription={setNewDesc}
            onSubmit={onCreate}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Separator className="my-2" />
        <ScrollArea className="h-[76vh] pr-4">
          <div className="space-y-1 mt-2">
            {projects.map((p) => (
              <div
                key={p._id}
                className="group flex items-center justify-between"
              >
                <button
                  onClick={() => onSelect(p)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md w-full transition",
                    p._id === currentProjectId
                      ? "bg-[#FFF1E0] text-[#B04E34]"
                      : "hover:bg-gray-100 text-gray-700"
                  )}
                >
                  {p._id === "all" ? (
                    <Layers className="mr-2" />
                  ) : (
                    <FileIcon className="mr-2" />
                  )}
                  <span className="truncate">{p.name}</span>
                </button>
                {p._id !== "all" && (
                  <div className="hidden group-hover:flex space-x-2">
                    <button onClick={() => onEdit(p)}>
                      <Edit />
                    </button>
                    <button onClick={() => onDelete(p)}>
                      <Trash2 />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
