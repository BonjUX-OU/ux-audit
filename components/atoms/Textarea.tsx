import * as React from "react";

import clsx from "clsx";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  resize?: "none" | "both" | "horizontal" | "vertical";
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, resize = "none", rows = 3, ...props }, ref) => {
    return (
      <textarea
        rows={rows}
        style={{ resize }}
        className={clsx(
          "border-input bg-background focus:border-primary/50 placeholder:text-muted-foreground",
          "flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
