"use client";

import { ListTodo, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { navItems } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

interface NavLinksProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

function NavLinks({ collapsed = false, onNavigate }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        const link = (
          <Link
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive &&
                "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm",
              collapsed && "justify-center px-0",
            )}
          >
            <item.icon className="size-5 shrink-0" />
            <span className={cn("truncate", collapsed && "sr-only")}>
              {item.label}
            </span>
          </Link>
        );

        if (!collapsed) {
          return <span key={item.href}>{link}</span>;
        }

        return (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div
      className={cn(
        "flex h-16 items-center gap-3 border-b border-sidebar-border px-4",
        collapsed && "justify-center px-0",
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
        <ListTodo className="size-5" />
      </div>
      <div className={cn("min-w-0", collapsed && "sr-only")}>
        <p className="truncate text-sm font-semibold">Todo Studio</p>
        <p className="truncate text-xs text-muted-foreground">
          Stay on top of it
        </p>
      </div>
    </div>
  );
}

export function AppSidebar() {
  const collapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const mobileMenuOpen = useUIStore((state) => state.mobileMenuOpen);
  const setMobileMenuOpen = useUIStore((state) => state.setMobileMenuOpen);

  return (
    <>
      <aside
        className={cn(
          "sticky top-0 hidden h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 lg:flex",
          collapsed ? "w-[4.5rem]" : "w-64",
        )}
      >
        <Brand collapsed={collapsed} />
        <div className="flex-1 overflow-y-auto p-2">
          <NavLinks collapsed={collapsed} />
        </div>
        <div className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            onClick={toggleSidebar}
            className={cn(
              "w-full gap-3 text-muted-foreground",
              collapsed ? "justify-center px-0" : "justify-start",
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-5" />
            ) : (
              <PanelLeftClose className="size-5" />
            )}
            <span className={cn(collapsed && "sr-only")}>Collapse sidebar</span>
          </Button>
        </div>
      </aside>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-72 gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Navigate between the dashboard, tasks and settings.
          </SheetDescription>
          <Brand />
          <div className="flex-1 overflow-y-auto p-2">
            <NavLinks onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
