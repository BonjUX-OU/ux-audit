import RaitingBar from "../../organisms/RaitingBar/RaitingBar";
import { Badge } from "@/components/ui/badge";
import { Ratings } from "@/components/organisms/RaitingBar/RaitingBar.constants";
import clsx from "clsx";

type ScoreBarProps = {
  overallScore: number;
  totalIssues: number;
};

const ScoreBar = ({ overallScore, totalIssues }: ScoreBarProps) => {
  const rating = Ratings.find((rating) => overallScore >= rating.min && overallScore <= rating.max);

  if (!rating) return null;

  const textColor = `text-${rating.color}`;
  const badgeBg = `bg-${rating.color.split("-")[0]}-100`;

  return (
    <div className="w-full flex items-center">
      <div className="w-[8%]">
        <p className="text-md text-gray-500">UX Score</p>
        <div className="flex items-center gap-2">
          <span className={`text-3xl font-bold ${textColor}`}>{overallScore}</span>
          <Badge className={clsx("text-sm w-10 h-4 justify-center", badgeBg, textColor)}>{rating.badge}</Badge>
        </div>
        <p className="text-xs text-gray-500 font-medium">{rating.label} usability</p>
      </div>
      <div className="w-[92%]">
        <RaitingBar score={overallScore} issues={totalIssues} />
      </div>
    </div>
  );
};

export default ScoreBar;
