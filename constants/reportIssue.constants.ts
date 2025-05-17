import { HeuristicType, SeverityLevelsType } from "@/types/reportIssue.types";

export const SeverityLevels: SeverityLevelsType = {
  MINOR: { code: "1", name: "Minor (1)" },
  MODERATE: { code: "2", name: "Moderate (2)" },
  MAJOR: { code: "3", name: "Major (3)" },
  CRITICAL: { code: "4", name: "Critical (4)" },
};

export const Heuristics: HeuristicType[] = [
  {
    code: "1",
    name: "Visibility of System Status",
    description:
      "The system should always keep users informed about what is going on, through appropriate feedback within a reasonable time.",
  },
  {
    code: "2",
    name: "Match Between System and the Real World",
    description:
      "The system should speak the users' language, with words, phrases, and concepts familiar to the user, rather than system-oriented terms.",
  },
  {
    code: "3",
    name: "User Control and Freedom",
    description:
      "Users often choose system functions by mistake and will need a clearly marked 'emergency exit' to leave the unwanted state without having to go through an extended dialogue.",
  },
  {
    code: "4",
    name: "Consistency and Standards",
    description:
      "Users should not have to wonder whether different words, situations, or actions mean the same thing. Follow platform conventions.",
  },
  {
    code: "5",
    name: "Error Prevention",
    description:
      "Even better than good error messages is a careful design that prevents a problem from occurring in the first place.",
  },
  {
    code: "6",
    name: "Recognition Rather Than Recall",
    description:
      "Minimize the user's memory load by making objects, actions, and options visible. The user should not have to remember information from one part of the dialogue to another.",
  },
  {
    code: "7",
    name: "Flexibility and Efficiency of Use",
    description:
      "Accelerators - unseen by the novice user - may often speed up the interaction for the expert user such that the system can cater to both inexperienced and experienced users.",
  },
  {
    code: "8",
    name: "Aesthetic and Minimalist Design",
    description:
      "Dialogues should not contain irrelevant or rarely needed information. Every extra unit of information in a dialogue competes with the relevant units of information and diminishes their relative visibility.",
  },
  {
    code: "9",
    name: "Help Users Recognize, Diagnose, and Recover from Errors",
    description:
      "Error messages should be expressed in plain language (no codes), precisely indicate the problem, and constructively suggest a solution.",
  },
  {
    code: "10",
    name: "Help and Documentation",
    description:
      "Even though it is better if the system can be used without documentation, it may be necessary to provide help and documentation.",
  },
];
