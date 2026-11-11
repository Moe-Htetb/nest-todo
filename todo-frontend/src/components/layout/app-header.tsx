"use client";

import { LogOut, Menu, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { pageTitles } from "@/components/layout/nav-items";
import { SearchInput } from "@/components/layout/search-input";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useUIStore } from "@/stores/ui-store";

function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Account menu"
        >
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">TS</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">Todo Studio</p>
          <p className="text-xs text-muted-foreground">Signed in locally</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Dashboard";
  const setMobileMenuOpen = useUIStore((state) => state.setMobileMenuOpen);
  const openCreateDialog = useUIStore((state) => state.openCreateDialog);

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Open navigation"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold tracking-tight">
          {title}
        </h1>
      </div>

      <SearchInput />

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Button
          size="sm"
          className="gap-2"
          onClick={openCreateDialog}
          aria-label="Create task"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">New task</span>
        </Button>
        <UserMenu />
      </div>
    </header>
  );
}
