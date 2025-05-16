// models/Report.ts
import { ReportStatus } from "@/components/organisms/ReportList/ReportList.types";
import { ReportType } from "@/types/report.types";
import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema<ReportType>(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    pageType: {
      type: String,
    },
    status: {
      type: String,
      enum: ReportStatus,
      default: ReportStatus.Unassigned,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sector: {
      type: String,
    },
    score: { type: Number },
    predefinedIssues: { type: [String] },
  },
  { timestamps: true }
);

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);
