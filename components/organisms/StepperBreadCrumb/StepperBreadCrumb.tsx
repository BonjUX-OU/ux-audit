"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils"; // optional: utility for conditional class names

type Step = {
  label: string;
  value: string;
};

interface StepperProps {
  steps: Step[];
  currentStep: string;
}

const StepperBreadCrumb = ({ steps, currentStep }: StepperProps) => {
  return (
    <Tabs.Root value={currentStep}>
      <div className="flex items-center gap-4">
        {steps.map((step, index) => {
          const isActive = currentStep === step.value;
          // const isCompleted = steps.findIndex((s) => s.value === currentStep) > index;

          return (
            <div key={step.value} className="flex items-center gap-4">
              <div
                className={cn(
                  "rounded-full w-6 h-6 text-sm flex items-center justify-center font-semibold bg-[#963F28] text-white",
                  !isActive && "opacity-25"
                )}>
                {index + 1}
              </div>
              <span className={cn("text-sm font-medium", isActive ? "text-black" : "text-gray-500")}>{step.label}</span>
              {index < steps.length - 1 && <div className="h-px w-10 bg-[#B04E34] mx-2" />}
            </div>
          );
        })}
      </div>
    </Tabs.Root>
  );
};

export default StepperBreadCrumb;
