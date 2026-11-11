"use client";

import { TodoFormDialog } from "@/components/todos/todo-form-dialog";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-svh w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">{children}</main>
        </div>
      </div>
      <TodoFormDialog />
    </TooltipProvider>
  );
}
