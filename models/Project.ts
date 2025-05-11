// models/Projects.ts
import { ProjectType } from "@/types/project.types";
import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema<ProjectType>(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
