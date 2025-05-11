import { SeverityLevelType } from "@/types/reportIssue.types";

export const SeverityLevels: { [key in "MINOR" | "MAJOR" | "MODERATE" | "CRITICAL"]: SeverityLevelType } = {
  MINOR: { code: "1", name: "Minor(1)" },
  MODERATE: { code: "2", name: "Moderate(2)" },
  MAJOR: { code: "3", name: "Major(3)" },
  CRITICAL: { code: "4", name: "Critical(4)" },
};
