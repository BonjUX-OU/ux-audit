import { RatingLabelType } from "./ReportList.types";

export const RatingLabels: RatingLabelType[] = [
	{ threshold: 20, label: "Very Poor", color: "bg-red-500" },
	{ threshold: 40, label: "Poor", color: "bg-orange-500" },
	{ threshold: 60, label: "Mediocre", color: "bg-yellow-500" },
	{ threshold: 80, label: "Good", color: "bg-green-400" },
	{ threshold: 100, label: "Very Good", color: "bg-green-600" },
] as const;
