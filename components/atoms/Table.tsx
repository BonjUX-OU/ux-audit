import * as React from "react";

import clsx from "clsx";

const TableRoot = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={clsx("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  ),
);
TableRoot.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={clsx("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "Table.Header";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={clsx("[&_tr:last-child]:border-0", className)} {...props} />
));
TableBody.displayName = "Table.Body";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={clsx("bg-muted/50 border-t font-medium last:[&>tr]:border-b-0", className)}
    {...props}
  />
));
TableFooter.displayName = "Table.Footer";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={clsx(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "Table.Row";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={clsx(
      "text-muted-foreground h-12 px-4 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0",
      className,
    )}
    {...props}
  />
));
TableHead.displayName = "Table.Head";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={clsx("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
));
TableCell.displayName = "Table.Cell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={clsx("text-muted-foreground mt-4 text-sm", className)} {...props} />
));
TableCaption.displayName = "Table.Caption";

export const Table = Object.assign(TableRoot, {
  Header: TableHeader,
  Body: TableBody,
  Footer: TableFooter,
  Head: TableHead,
  Row: TableRow,
  Cell: TableCell,
  Caption: TableCaption,
});
