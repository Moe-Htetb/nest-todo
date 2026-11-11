"use client";

import { CircleAlert, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TodoErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function TodoErrorState({ message, onRetry }: TodoErrorStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <CircleAlert className="size-6" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Could not load tasks</p>
          <p className="max-w-md text-sm text-muted-foreground">{message}</p>
        </div>
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="size-4" />
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}
