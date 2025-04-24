// components/dashboard/ComparisonScale.tsx
import { Card, CardContent } from "@/components/ui/card";
import type { AnalysisReport } from "@/types/dashboard";
import { getLeftPercent } from "@/utils/rating";

export default function ComparisonScale({
  reports,
}: {
  reports: AnalysisReport[];
}) {
  if (!reports.length) return null;
  const sorted = [...reports].sort(
    (a, b) =>
      new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
  );

  return (
    <Card className="mt-4 border-none shadow-lg bg-white hover:shadow-xl">
      <CardContent className="p-6">
        <div className="flex justify-between mb-3 text-gray-600 text-xs font-medium">
          {["Very Poor", "Poor", "Mediocre", "Good", "Very Good"].map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
        <div className="relative h-2 bg-gray-100 rounded-full mb-8 shadow-inner">
          <div className="absolute inset-0 flex">
            <div className="w-1/5 h-full bg-red-500/80 rounded-l-full" />
            <div className="w-1/5 h-full bg-orange-500/80" />
            <div className="w-1/5 h-full bg-yellow-500/80" />
            <div className="w-1/5 h-full bg-green-400/80" />
            <div className="w-1/5 h-full bg-green-600/80 rounded-r-full" />
          </div>
          {sorted.map((r, i) => (
            <div
              key={r._id}
              className="absolute -top-3 transform -translate-x-1/2"
              style={{ left: getLeftPercent(r.overallScore) }}
            >
              <div className="w-7 h-7 bg-white border-2 border-[#B04E34] text-[#B04E34] text-xs rounded-full flex items-center justify-center shadow-md hover:scale-110 transition">
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
