import { Ratings } from "./RaitingBar.constants";

type RaitingBarProps = {
  score: number;
  issues?: number;
  showLabel?: boolean;
};

const RaitingBar = ({ score, issues }: RaitingBarProps) => {
  const clampedScore = Math.max(0, Math.min(100, score));

  return (
    <div>
      <div className="w-full relative h-5 bg-gray-100 rounded-full overflow-hidden">
        <div className="absolute w-full inset-0 flex">
          <div
            className={`w-1/2 bg-gradient-to-r from-${Ratings[0].color} via-${Ratings[1].color} to-${Ratings[2].color}`}
          />
          <div
            className={`w-1/2 bg-gradient-to-r from-${Ratings[2].color} via-${Ratings[3].color} to-${Ratings[4].color}`}
          />
        </div>

        <div className="w-full h-full flex justify-end">
          <div
            className="h-full bg-[#CCC] opacity-70 rounded-r-full transition-all duration-300"
            style={{ width: `${100 - clampedScore}%` }}
          />
        </div>

        {issues && (
          <div className="absolute top-0 left-0 flex justify-center align-middle w-full inset-0 text-white text-sm font-bold">{`${issues} issues identified`}</div>
        )}
      </div>
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        {Ratings.map((rating) => (
          <span key={rating.key}>{`${rating.label} (${rating.min}-${rating.max})`}</span>
        ))}
      </div>
    </div>
  );
};

export default RaitingBar;
