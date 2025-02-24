import mongoose from "mongoose";

const IssueSchema = new mongoose.Schema({
  issue_id: String,
  description: String,
  solution: String,
  occurrences: [
    {
      id: String,
      selector: String,
    },
  ],
});

const HeuristicSchema = new mongoose.Schema({
  id: Number,
  name: String,
  issues: [IssueSchema],
});

const ScoreSchema = new mongoose.Schema({
  id: Number,
  name: String,
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
    score: [ScoreSchema],
    overallScore: {
      type: Number,
      required: true,
    },
    heuristics: [HeuristicSchema],
    snapshotHtml: {
      type: String, // store the entire HTML string
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);
