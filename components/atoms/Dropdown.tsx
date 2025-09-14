"use client";

import * as React from "react";

import * as RadixDropdown from "@radix-ui/react-dropdown-menu";
import clsx from "clsx";
import { Check, ChevronRight, Circle } from "lucide-react";

const DropdownMenuRoot = RadixDropdown.Root;

const DropdownMenuTrigger = RadixDropdown.Trigger;
const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof RadixDropdown.Content>,
  React.ComponentPropsWithoutRef<typeof RadixDropdown.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <RadixDropdown.Portal>
    <RadixDropdown.Content
      ref={ref}
      sideOffset={sideOffset}
      className={clsx(
        "bg-popover bg-background border-border text-popover-foreground z-50 min-w-32 cursor-pointer overflow-hidden rounded-md border p-1 shadow-md",
        className,
      )}
      {...props}
    />
  </RadixDropdown.Portal>
));
DropdownMenuContent.displayName = "Dropdown.Content";

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof RadixDropdown.Item>,
  React.ComponentPropsWithoutRef<typeof RadixDropdown.Item> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <RadixDropdown.Item
    ref={ref}
    className={clsx(
      "focus:bg-accent focus:text-accent-foreground flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = "Dropdown.Item";

const DropdownMenuSub = RadixDropdown.Sub;
const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof RadixDropdown.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof RadixDropdown.SubTrigger> & { inset?: boolean }
>(({ className, inset, children, ...props }, ref) => (
  <RadixDropdown.SubTrigger
    ref={ref}
    className={clsx(
      "focus:bg-accent focus:text-accent-foreground flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden [&_svg]:pointer-events-none",
      inset && "pl-8",
      className,
    )}
    {...props}>
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </RadixDropdown.SubTrigger>
));
DropdownMenuSubTrigger.displayName = "Dropdown.SubTrigger";

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof RadixDropdown.SubContent>,
  React.ComponentPropsWithoutRef<typeof RadixDropdown.SubContent>
>(({ className, ...props }, ref) => (
  <RadixDropdown.SubContent
    ref={ref}
    className={clsx(
      "bg-popover text-popover-foreground z-50 min-w-32 overflow-hidden rounded-md border p-1 shadow-lg",
      className,
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName = "Dropdown.SubContent";

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof RadixDropdown.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof RadixDropdown.CheckboxItem>
>(({ children, className, ...props }, ref) => (
  <RadixDropdown.CheckboxItem
    ref={ref}
    className={clsx(
      "focus:bg-accent focus:text-accent-foreground flex cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none",
      className,
    )}
    {...props}>
    <RadixDropdown.ItemIndicator className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <Check className="h-4 w-4" />
    </RadixDropdown.ItemIndicator>
    {children}
  </RadixDropdown.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = "Dropdown.CheckboxItem";

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof RadixDropdown.RadioItem>,
  React.ComponentPropsWithoutRef<typeof RadixDropdown.RadioItem>
>(({ children, className, ...props }, ref) => (
  <RadixDropdown.RadioItem
    ref={ref}
    className={clsx(
      "focus:bg-accent focus:text-accent-foreground flex cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none",
      className,
    )}
    {...props}>
    <RadixDropdown.ItemIndicator className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <Circle className="h-2 w-2 fill-current" />
    </RadixDropdown.ItemIndicator>
    {children}
  </RadixDropdown.RadioItem>
));
DropdownMenuRadioItem.displayName = "Dropdown.RadioItem";

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof RadixDropdown.Label>,
  React.ComponentPropsWithoutRef<typeof RadixDropdown.Label> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <RadixDropdown.Label
    ref={ref}
    className={clsx("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = "Dropdown.Label";

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof RadixDropdown.Separator>,
  React.ComponentPropsWithoutRef<typeof RadixDropdown.Separator>
>(({ className, ...props }, ref) => (
  <RadixDropdown.Separator
    ref={ref}
    className={clsx("bg-muted -mx-1 my-1 h-px", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "Dropdown.Separator";

// Main Dropdown namespace
export const Dropdown = Object.assign(DropdownMenuRoot, {
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  Sub: DropdownMenuSub,
  SubTrigger: DropdownMenuSubTrigger,
  SubContent: DropdownMenuSubContent,
  CheckboxItem: DropdownMenuCheckboxItem,
  RadioItem: DropdownMenuRadioItem,
  Label: DropdownMenuLabel,
  Separator: DropdownMenuSeparator,
});
