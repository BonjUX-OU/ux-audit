import { useEffect, useState } from "react";

import { Progress } from "radix-ui";

const ProgressBar = ({ percent }: { percent: number }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(percent), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Progress.Root
      className="bg-primary/20 relative h-2 w-full translate-z-0 overflow-hidden rounded-full"
      value={progress}>
      <Progress.Indicator
        className="bg-primary h-full w-full transition-transform duration-660 ease-[cubic-bezier(0.65,0,0.35,1)]"
        style={{ transform: `translateX(-${100 - progress}%)` }}
      />
    </Progress.Root>
  );
};

export default ProgressBar;
