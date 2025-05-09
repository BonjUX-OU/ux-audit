import ConfirmationModal from "@/components/organisms/ConfirmationModal/ConfirmationModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";

type CreateProjectButtonProps = {
  onCreateSuccess: () => void;
};

const CreateProjectButton = ({ onCreateSuccess }: CreateProjectButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateProject = async () => {
    if (!name.trim()) return;

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
        }),
      });

      if (!response.ok) {
        setIsOpen(false);
        alert("Error creating project");
        throw new Error("Error creating project");
      } else {
        onCreateSuccess();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-[#B04E34] hover:bg-[#FFF1E0] transition-colors duration-200">
        <Plus className="h-4 w-4 mr-1" />
        New
      </Button>
      <ConfirmationModal
        isOpen={isOpen}
        onConfirm={handleCreateProject}
        onCancel={() => setIsOpen(false)}
        title="Create a new project"
        description="Enter details for your new project"
        confirmButtonTitle="Create"
        confirmButtonDisabled={!name}>
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <Input
            type="text"
            placeholder="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="shadow-sm focus:ring-2 focus:ring-[#B04E34] focus:ring-opacity-50 transition-all duration-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Input
            type="text"
            placeholder="Optional"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="shadow-sm focus:ring-2 focus:ring-[#B04E34] focus:ring-opacity-50 transition-all duration-200"
          />
        </div>
      </ConfirmationModal>
    </>
  );
};

export default CreateProjectButton;
