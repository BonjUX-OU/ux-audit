// models/Report.ts
import mongoose from "mongoose";

const OccurrenceSchema = new mongoose.Schema({
  id: String,
  selector: String,
});

const IssueSchema = new mongoose.Schema({
  issue_id: String,
  description: String,
  solution: String,
  occurrences: [OccurrenceSchema],
});

const HeuristicSchema = new mongoose.Schema({
  id: Number,
  name: String,
  issues: [IssueSchema],
});

const ScoreSchema = new mongoose.Schema({
  id: Number,
  score: String,
});

const ReportSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    scores: [ScoreSchema],
    overallScore: {
      type: Number,
      required: true,
    },
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
