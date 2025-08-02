import { Heuristics } from "@/constants/reportIssue.constants";
import { ReportIssueType } from "@/types/reportIssue.types";

const getMultiplier = (issueCount: number) => {
  if (issueCount > 2 && issueCount <= 5) return 1.25;
  else if (issueCount > 5) return 1.5;

  return 1;
};

export const calculateReportScore = (issues: ReportIssueType[]) => {
  const groupedHeuristics: {
    [key: string]: { issues: ReportIssueType[]; totalSeverityScore: number; heuristicScore: number };
  } = {};

  Heuristics.forEach((item) => {
    groupedHeuristics[item.code] = {
      issues: [],
      totalSeverityScore: 0,
      heuristicScore: 0,
    };
  });

  issues.forEach((issue) => {
    groupedHeuristics[issue.heuristic.code].issues.push(issue);
    groupedHeuristics[issue.heuristic.code].totalSeverityScore += parseInt(issue.severityLevel.code);
  });

  for (const [key, value] of Object.entries(groupedHeuristics)) {
    groupedHeuristics[key].heuristicScore = value.totalSeverityScore * getMultiplier(value.issues.length);
  }

  const penalty = Object.keys(groupedHeuristics).reduce((acc, curr) => {
    acc += groupedHeuristics[curr].heuristicScore;
    return acc;
  }, 0);

  return Math.max(0, 100 - penalty);
};
