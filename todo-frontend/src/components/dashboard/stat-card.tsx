import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint: string;
  icon: LucideIcon;
  className?: string;
  children?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
  children,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
