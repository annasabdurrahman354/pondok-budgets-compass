
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  children,
  className,
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className={cn("space-y-4", className)}>
        {children}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full caption-bottom text-sm", className)}>
        {children}
      </table>
    </div>
  );
};

interface ResponsiveTableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveTableHeader: React.FC<ResponsiveTableHeaderProps> = ({
  children,
  className,
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return null; // Hide headers on mobile
  }

  return (
    <thead className={cn("[&_tr]:border-b", className)}>
      {children}
    </thead>
  );
};

interface ResponsiveTableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveTableBody: React.FC<ResponsiveTableBodyProps> = ({
  children,
  className,
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <tbody className={cn("[&_tr:last-child]:border-0", className)}>
      {children}
    </tbody>
  );
};

interface ResponsiveTableRowProps {
  children: React.ReactNode;
  className?: string;
  isCard?: boolean;
}

export const ResponsiveTableRow: React.FC<ResponsiveTableRowProps> = ({
  children,
  className,
  isCard = false,
}) => {
  const isMobile = useIsMobile();

  if (isMobile || isCard) {
    return (
      <div className={cn("bg-white p-4 rounded-lg border shadow-sm", className)}>
        {children}
      </div>
    );
  }

  return (
    <tr className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}>
      {children}
    </tr>
  );
};

interface ResponsiveTableCellProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
  isCard?: boolean;
}

export const ResponsiveTableCell: React.FC<ResponsiveTableCellProps> = ({
  children,
  className,
  label,
  isCard = false,
}) => {
  const isMobile = useIsMobile();

  if (isMobile || isCard) {
    return (
      <div className={cn("flex justify-between items-center py-1", className)}>
        {label && <span className="font-medium text-sm text-muted-foreground">{label}:</span>}
        <span className="text-right">{children}</span>
      </div>
    );
  }

  return (
    <td className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}>
      {children}
    </td>
  );
};

interface ResponsiveTableHeadProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveTableHead: React.FC<ResponsiveTableHeadProps> = ({
  children,
  className,
}) => {
  return (
    <th className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}>
      {children}
    </th>
  );
};
