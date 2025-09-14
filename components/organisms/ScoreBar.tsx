import clsx from "clsx";

import { Ratings } from "@/components/organisms/RaitingBar/RaitingBar.constants";

import RaitingBar from "./RaitingBar/RaitingBar";

type ScoreBarProps = {
  score: number;
  totalIssues: number;
};

const ScoreBar = ({ score, totalIssues }: ScoreBarProps) => {
  const rating = Ratings.find((rating) => score >= rating.min && score <= rating.max);

  if (!rating) return null;

  const textColor = `text-${rating.color}`;
  const badgeBg = `bg-${rating.color}`;

  return (
    <div className="flex w-full items-center">
      <div className="w-[10%]">
        <p className="text-md text-gray-500">UX Score</p>
        <div className="flex items-center gap-2">
          <span className={`text-3xl font-bold ${textColor}`}>{score}</span>
          <span
            className={clsx(
              "flex h-6 w-8 items-center justify-center rounded-full px-0 text-lg font-bold text-white",
              badgeBg,
            )}>
            {rating.badge}
          </span>
        </div>
        <p className="text-xs font-medium text-gray-500">{rating.label} usability</p>
      </div>
      <div className="mt-6 w-[90%]">
        <RaitingBar score={score} issues={totalIssues} />
      </div>
    </div>
  );
};

export default ScoreBar;
