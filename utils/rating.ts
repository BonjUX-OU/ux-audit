// utils/rating.ts
type Rating = { threshold: number; label: string; color: string };

const ratingLabels: Rating[] = [
  { threshold: 20, label: "Very Poor", color: "bg-red-500" },
  { threshold: 40, label: "Poor", color: "bg-orange-500" },
  { threshold: 60, label: "Mediocre", color: "bg-yellow-500" },
  { threshold: 80, label: "Good", color: "bg-green-400" },
  { threshold: 100, label: "Very Good", color: "bg-green-600" },
];

export function getRatingLabel(score: number): string {
  for (const r of ratingLabels) if (score <= r.threshold) return r.label;
  return "Unknown";
}

export function getRatingColor(score: number): string {
  for (const r of ratingLabels) if (score <= r.threshold) return r.color;
  return "bg-gray-500";
}

export function getLeftPercent(score: number): string {
  const c = Math.min(100, Math.max(0, score));
  return `${c}%`;
}
