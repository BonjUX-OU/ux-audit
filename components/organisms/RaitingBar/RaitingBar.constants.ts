import { RatingType } from "./RaitingBar.types";

export const Ratings: RatingType[] = [
  { key: "critical", badge: "D", label: "Critical", color: "red-500", textColor: "red-500", min: 0, max: 39 },
  { key: "poor", badge: "C", label: "Poor", color: "orange-500", textColor: "orange-500", min: 40, max: 59 },
  { key: "usable", badge: "B", label: "Usable", color: "yellow-500", textColor: "yellow-500", min: 60, max: 74 },
  { key: "good", badge: "A", label: "Good", color: "green-400", textColor: "green-400", min: 75, max: 89 },
  { key: "excellent", badge: "A+", label: "Excellent", color: "green-600", textColor: "green-600", min: 90, max: 100 },
] as const;
