"use client";

import * as React from "react";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

/* ---------- Root ---------- */
const AccordionRoot = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>(({ className, ...props }, ref) => {
  return <AccordionPrimitive.Root ref={ref} className={clsx("w-full", className)} {...props} />;
});
AccordionRoot.displayName = "Accordion";

/* ---------- Item ---------- */
const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => {
  return <AccordionPrimitive.Item ref={ref} className={clsx("border-b", className)} {...props} />;
});
AccordionItem.displayName = "Accordion.Item";

/* ---------- Trigger (wrapped by Header) ---------- */
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={clsx(
          "text-foreground flex flex-1 cursor-pointer items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
          className,
        )}
        {...props}>
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
AccordionTrigger.displayName = "Accordion.Trigger";

/* ---------- Content ---------- */
const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={clsx(
      "data-[state=open]:animate-accordion-down",
      "data-[state=closed]:animate-accordion-up",
      "text-foreground overflow-hidden text-sm transition-all",
      className,
    )}
    {...props}>
    <div className={clsx("pt-0 pb-4")}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = "Accordion.Content";

/* ---------- Compose namespace ---------- */
const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
});

export { Accordion };
export type { AccordionRoot as AccordionType };
