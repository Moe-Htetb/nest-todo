"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/stores/ui-store";

const DEBOUNCE_MS = 350;

export function SearchInput() {
  const storedSearch = useUIStore((state) => state.search);
  const setSearch = useUIStore((state) => state.setSearch);
  const [value, setValue] = useState(storedSearch);
  const pathname = usePathname();
  const router = useRouter();
  const isTasksRoute = pathname.startsWith("/tasks");

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (value === storedSearch) return;
      setSearch(value);
      if (value && !isTasksRoute) {
        router.push("/tasks");
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [value, storedSearch, setSearch, isTasksRoute, router]);

  return (
    <form
      role="search"
      className="relative order-last w-full sm:order-none sm:w-64 md:w-72"
      onSubmit={(event) => event.preventDefault()}
    >
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search tasks..."
        aria-label="Search tasks"
        className="h-9 pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Clear search"
          className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-muted-foreground"
          onClick={() => {
            setValue("");
            setSearch("");
          }}
        >
          <X className="size-4" />
        </Button>
      ) : null}
    </form>
  );
}
