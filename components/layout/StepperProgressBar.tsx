import clsx from "clsx";
import { CheckCircle } from "lucide-react";

export type StepObject = {
  label: string;
  completed?: boolean;
};

export type StepperProgressBarProps = {
  steps: StepObject[];
  activeStepIndex: number;
};

const StepperProgressBar = ({ steps, activeStepIndex }: StepperProgressBarProps) => {
  const lastCompletedIndex = steps.findLastIndex((item) => item.completed === true) ?? 0;
  return (
    <div className="flex items-center gap-4 mb-4">
      {steps.map((step, index) => (
        <>
          <div className="flex items-center">
            <div
              className={clsx(
                "bg-[#C25B3F] rounded-full w-6 h-6 flex items-center justify-center",
                index > activeStepIndex && "bg-[#c25b3f7a]"
              )}>
              {index < lastCompletedIndex ? (
                <CheckCircle className="h-4 w-4 text-white" />
              ) : (
                <span className="text-white text-xs">{index + 1}</span>
              )}
            </div>
            <span className={clsx("ml-2 text-sm", index > activeStepIndex && "text-gray-400")}>{step.label}</span>
          </div>
          {index < steps.length - 1 && <div className="h-px bg-[#C25B3F] flex-grow mx-2"></div>}
        </>
      ))}
    </div>
  );
};

export default StepperProgressBar;
