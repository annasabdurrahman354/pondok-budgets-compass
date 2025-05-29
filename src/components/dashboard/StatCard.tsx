
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  className,
}) => {
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 shadow-lg",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          <div className="text-3xl font-bold text-gray-900">{value}</div>
        </div>
        {icon && (
          <div className="p-3 rounded-full bg-white/50">
            {icon}
          </div>
        )}
      </CardHeader>
      {description && (
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 font-medium">{description}</p>
        </CardContent>
      )}
    </Card>
  );
};
