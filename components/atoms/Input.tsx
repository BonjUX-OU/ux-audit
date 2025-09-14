import { forwardRef, InputHTMLAttributes, ReactNode } from "react";

import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  wrapperClassName?: string;
  icon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, className, wrapperClassName, icon, type = "text", rightIcon, ...props },
    ref,
  ) => {
    return (
      <div className={clsx("flex flex-col space-y-1", wrapperClassName)}>
        {label && <label className="text-foreground font-normal">{label}</label>}

        <div className="relative">
          {icon && (
            <span className="text-muted-foreground absolute top-1/2 left-2 -translate-y-1/2">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            type={type}
            className={clsx(
              "border-input bg-background",
              "file:text-foreground placeholder:text-muted-foreground",
              "flex h-10 w-full rounded-md border px-3 py-2 text-sm",
              "focus:border-primary/50 focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-10", // add padding if icon exists
              error && "border-red-500",
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2">
              {rightIcon}
            </span>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
