// models/Report.ts
import { HeuristicType, IssueType, OccurrenceType, ReportType } from "@/types/report.types";
import mongoose from "mongoose";

const OccurrenceSchema = new mongoose.Schema<OccurrenceType>({
  selector: String,
});

const IssueSchema = new mongoose.Schema<IssueType>({
  description: String,
  solution: String,
  occurrences: [OccurrenceSchema],
});

const HeuristicSchema = new mongoose.Schema<HeuristicType>({
  name: String,
  issues: [IssueSchema],
});

const ReportSchema = new mongoose.Schema<ReportType>(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    url: {
      type: String,
      required: true,
    },
    sector: {
      type: String,
    },
    pageType: {
      type: String,
    },
    score: { type: Number },
    predefinedIssues: { type: [String] },
    heuristics: [HeuristicSchema],
    snapshotHtml: {
      type: String, // store the entire HTML string
      required: true,
    },
    // New field for human-edited reports:
    humanEdited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);
