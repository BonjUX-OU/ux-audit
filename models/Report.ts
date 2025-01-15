import mongoose from "mongoose";

const IssueSchema = new mongoose.Schema({
  issue_id: String,
  description: String,
  solution: String,
  selector: String,
});

const HeuristicSchema = new mongoose.Schema({
  id: Number,
  name: String,
  issues: [IssueSchema],
});

const ReportSchema = new mongoose.Schema(
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
    screenshot: String, // base64 string
    heuristics: [HeuristicSchema],
    snapshotHtml: {
      type: String, // store the entire HTML string
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);
