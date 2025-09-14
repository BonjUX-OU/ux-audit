// src/components/atoms/Typography.tsx
import { FC, ReactNode } from "react";

import { cva, type VariantProps } from "class-variance-authority";

const typography = cva("", {
  variants: {
    variant: {
      h1: "text-4xl font-bold",
      h2: "text-3xl font-semibold",
      h3: "text-2xl font-semibold",
      h4: "text-xl font-medium",
      h5: "text-lg font-medium",
      h6: "text-base font-medium",
      p: "text-base",
      small: "text-sm",
      span: "text-base",
    },
    weight: {
      light: "font-light",
      normal: "font-normal",
      medium: "font-medium",
      bold: "font-bold",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    },
    color: {
      default: "text-black",
      gray: "text-gray-600",
      white: "text-white",
      primary: "text-blue-500",
      accent: "text-accent-foreground",
    },
  },
  defaultVariants: {
    variant: "p",
    weight: "normal",
    align: "left",
    color: "default",
  },
});

interface TypographyProps extends VariantProps<typeof typography> {
  children: ReactNode;
  className?: string;
}

const Typography: FC<TypographyProps> = ({ children, className, ...props }) => {
  const Component = props.variant || "p";
  return <Component className={typography({ ...props, className })}>{children}</Component>;
};

export default Typography;
