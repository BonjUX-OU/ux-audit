import React from "react";

import clsx from "clsx";

const Card = ({
  children,
  className,
}: Readonly<{ children: React.ReactNode; className?: string }>) => {
  return <div className={clsx("border-border rounded-sm bg-white p-4", className)}>{children}</div>;
};

export default Card;
