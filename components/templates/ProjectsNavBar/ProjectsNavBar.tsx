import ConfirmationModal from "@/components/organisms/ConfirmationModal/ConfirmationModal";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProjectType } from "@/types/project.types";
import clsx from "clsx";
import { Edit, FileIcon, Layers, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

export type ProjectsNavBarHandle = {
  fetchProjects: () => void;
};

type ProjectsNavBarProps = {
  onProjectSelect: (project: ProjectType) => void;
};

const ProjectsNavBar = forwardRef<ProjectsNavBarHandle, ProjectsNavBarProps>(({ onProjectSelect }, ref) => {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<ProjectType[]>();
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [updateTarget, setUpdateTarget] = useState<ProjectType | null>(null);
  const [confirmedProjectName, setConfirmedProjectName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updateType, setUpdateType] = useState<"edit" | "delete" | null>(null);

  const fetchProjects = async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch(`/api/user/projects`);
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();

      setProjects(data);
      setSelectedProject(null);
    } catch (err) {
      console.error(err);
    }
  };

  const confirmUpdate = (project: ProjectType, type: "edit" | "delete") => {
    if (!project) return;

    setUpdateType(type);
    setUpdateTarget(project);
    setConfirmedProjectName("");
    setIsDialogOpen(true);
  };

  const cancelUpdate = () => {
    setUpdateType(null);
    setUpdateTarget(null);
    setConfirmedProjectName("");
    setIsDialogOpen(false);
  };

  const handleUpdate = async () => {
    if (!updateTarget?._id) return;

    try {
      let response;
      if (updateType === "edit") {
        response = await fetch(`/api/projects?id=${updateTarget._id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: confirmedProjectName,
            description: "updateTarget.description",
          }),
        });
      } else {
        response = await fetch(`/api/projects?id=${updateTarget._id}`, {
          method: "DELETE",
        });
      }

      if (!response.ok) {
        throw new Error("Error updating project");
      }

      // If the deleted project was currently selected, reset to "All Reports"
      if (selectedProject?._id === updateTarget._id) {
        setSelectedProject(null);
      }

      cancelUpdate();
      fetchProjects();
    } catch (error) {
      console.error(error);
      alert("Failed to delete project. Please try again.");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Expose the function to parent via ref
  useImperativeHandle(ref, () => ({
    fetchProjects,
  }));

  const editProjectContent = (
    <div className="mt-2 space-y-4 mb-4">
      <Input
        type="text"
        placeholder="Project name"
        value={confirmedProjectName}
        onChange={(e) => setConfirmedProjectName(e.target.value)}
        className="shadow-sm focus:ring-2 focus:ring-[#B04E34] focus:ring-opacity-50"
      />
    </div>
  );

  const deleteProjectContent = (
    <>
      <div className="mt-4 text-sm">
        To confirm, type <b>{updateTarget?.name}</b> below:
      </div>
      <div className="mt-2 mb-4">
        <Input
          type="text"
          placeholder="Enter project name"
          value={confirmedProjectName}
          onChange={(e) => setConfirmedProjectName(e.target.value)}
          className="shadow-sm focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
        />
      </div>
    </>
  );

  return (
    <>
      <ScrollArea className="h-[76vh] pr-4 -mr-4">
        <div className="space-y-1 mt-2">
          {projects &&
            projects.map((project) => (
              <div key={project._id.toString()} className="group flex items-center justify-between">
                <button
                  onClick={() => onProjectSelect(project)}
                  className={clsx(
                    "flex items-center text-left px-3 py-2 rounded-md w-full transition-all duration-200",
                    selectedProject?._id === project._id
                      ? "bg-[#FFF1E0] text-[#B04E34] font-medium shadow-sm"
                      : "hover:bg-gray-100 text-gray-700"
                  )}>
                  {!project ? (
                    <Layers className="h-4 w-4 mr-2 flex-shrink-0" />
                  ) : (
                    <FileIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  )}
                  <span className="truncate">{project.name}</span>
                </button>
                {project && (
                  <div className="flex flex-row items-center mr-2 space-x-2">
                    {/* Edit Button */}
                    <button
                      onClick={() => confirmUpdate(project, "edit")}
                      className="hidden group-hover:block text-gray-400 hover:text-[#B04E34] transition-colors duration-200"
                      title="Edit project name">
                      <Edit className="h-4 w-4" />
                    </button>
                    {/* Delete Button */}
                    <button
                      onClick={() => confirmUpdate(project, "delete")}
                      className="hidden group-hover:block text-gray-400 hover:text-red-600 transition-colors duration-200"
                      title="Delete project">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>
      </ScrollArea>

      {updateTarget && updateType && (
        <ConfirmationModal
          variant={updateType === "edit" ? "default" : "danger"}
          title={updateType === "edit" ? "Edit Project Name" : "Delete Project"}
          description={
            updateType === "edit" ? (
              "Update the project name as you wish"
            ) : (
              <>
                Deleting the project will remove <strong>all reports</strong> inside it. This action{" "}
                <strong>cannot be undone</strong>.
              </>
            )
          }
          confirmButtonDisabled={
            updateType === "edit"
              ? confirmedProjectName === updateTarget!.name
              : confirmedProjectName !== updateTarget!.name
          }
          isOpen={isDialogOpen}
          onConfirm={handleUpdate}
          onCancel={cancelUpdate}>
          {updateType === "edit" ? editProjectContent : deleteProjectContent}
        </ConfirmationModal>
      )}
    </>
  );
});

export default ProjectsNavBar;
