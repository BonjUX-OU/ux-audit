import { Card, CardContent } from "@/components/ui/card";
import { ReportType } from "@/types/report.types";

function getLeftPercent(score: number) {
  const clamped = Math.min(100, Math.max(0, score));
  return `${clamped}%`;
}

const ComparisonScale = ({ reports }: { reports: ReportType[] }) => {
  const sortedByDate = [...reports].sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());

  return (
    <Card className="mt-4 border-none shadow-lg bg-white transition-all duration-300 hover:shadow-xl">
      <CardContent className="p-6">
        <div className="flex justify-between mb-3 text-gray-600 text-xs font-medium">
          <span>Very Poor</span>
          <span>Poor</span>
          <span>Mediocre</span>
          <span>Good</span>
          <span>Very Good</span>
        </div>
        <div className="relative h-2 bg-gray-100 rounded-full mb-8 shadow-inner">
          <div className="absolute inset-0 flex">
            <div className="w-1/5 h-full bg-red-500/80 rounded-l-full"></div>
            <div className="w-1/5 h-full bg-orange-500/80"></div>
            <div className="w-1/5 h-full bg-yellow-500/80"></div>
            <div className="w-1/5 h-full bg-green-400/80"></div>
            <div className="w-1/5 h-full bg-green-600/80 rounded-r-full"></div>
          </div>
          {sortedByDate.map((report, i) => {
            const left = getLeftPercent(report.score ?? 0);
            return (
              <div key={report._id} className="absolute -top-3 transform -translate-x-1/2" style={{ left }}>
                <div className="w-7 h-7 bg-white border-2 border-[#B04E34] text-[#B04E34] text-xs rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110 hover:shadow-lg">
                  {i + 1}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonScale;
