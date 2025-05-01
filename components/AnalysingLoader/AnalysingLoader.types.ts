import { AnalysingStatuses } from "./AnalysingLoader.constants";

export type AnalysingStatusType = (typeof AnalysingStatuses)[keyof typeof AnalysingStatuses];

export type AnalysingStepType = {
	label: string;
	status: AnalysingStatusType;
};
