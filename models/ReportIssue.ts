import mongoose, { Schema } from "mongoose";

const HeuristicSchema = new Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
});

const SeverityLevelSchema = new Schema({
  code: { type: String, enum: ["1", "2", "3", "4"], required: true },
  name: {
    type: String,
    enum: ["Minor(1)", "Moderate(2)", "Major(3)", "Critical(4)"],
    required: true,
  },
});

const SnapshotSchema = new Schema({
  top: { type: Number, required: true },
  right: { type: Number },
  bottom: { type: Number },
  left: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
});

const ReportIssueSchema = new Schema(
  {
    report: {
      type: Schema.Types.ObjectId,
      ref: "Report",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    heuristic: {
      type: HeuristicSchema,
      required: true,
    },
    severityLevel: {
      type: SeverityLevelSchema,
      required: true,
    },
    suggestedFix: {
      type: String,
      required: true,
    },
    croppedImageUrl: {
      type: String,
      required: true,
    },
    snapshotLocation: {
      type: SnapshotSchema,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.ReportIssue || mongoose.model("ReportIssue", ReportIssueSchema);
