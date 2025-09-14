"use client";

import { useEffect, useState } from "react";

const CountdownTimer = ({
  totalTime,
  onCountDownEnds,
}: {
  totalTime: number;
  onCountDownEnds: () => void;
}) => {
  const [timeLeft, setTimeLeft] = useState(totalTime);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  // Calculate percentage
  const progress = (timeLeft / totalTime) * 100;

  return (
    <div className="mx-auto mt-10 mb-4 w-full max-w-md">
      {/* Progress Bar */}
      <div className="bg-accent/80 h-4 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Text */}
      <p className="mt-2 text-center text-sm text-gray-700">{timeLeft} seconds left</p>
    </div>
  );
};

export default CountdownTimer;
