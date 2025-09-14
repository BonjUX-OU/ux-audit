"use client";

import React from "react";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import clsx from "clsx";
import { Circle } from "lucide-react";

const RadioGroupRoot = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root className={clsx("grid gap-2", className)} {...props} ref={ref} />
  );
});
RadioGroupRoot.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={clsx(
        "border-primary text-primary aspect-square h-4 w-4 rounded-full border focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}>
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle color="#B04E34" className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = "RadioGroup.Item";

export const RadioGroup = Object.assign(RadioGroupRoot, { Item: RadioGroupItem });
