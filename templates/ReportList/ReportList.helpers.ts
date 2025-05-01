import { RatingLabels } from "./ReportList.constants";

export const getRatingLabel = (score: number): string => {
	for (const rating of RatingLabels) {
		if (score <= rating.threshold) return rating.label;
	}
	return "Unknown";
};

export const getRatingColor = (score: number): string => {
	for (const rating of RatingLabels) {
		if (score <= rating.threshold) return rating.color;
	}
	return "bg-gray-500";
};
