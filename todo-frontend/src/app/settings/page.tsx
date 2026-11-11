"use client";

import { LayoutGrid, List, Palette, Server } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { getApiBaseUrl } from "@/lib/api-client";
import { useUIStore, type ViewMode } from "@/stores/ui-store";

const emptySubscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

export default function SettingsPage() {
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();
  const viewMode = useUIStore((state) => state.viewMode);
  const setViewMode = useUIStore((state) => state.setViewMode);

  const currentTheme = mounted ? (theme ?? "system") : "system";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <section className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Personalize how Todo Studio looks and feels. Preferences are stored in
          this browser.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="size-4" />
            Appearance
          </CardTitle>
          <CardDescription>
            Choose a theme and the default layout for task lists.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <Label>Theme</Label>
              <p className="text-xs text-muted-foreground">
                Light, dark, or follow your system preference.
              </p>
            </div>
            <ToggleGroup
              type="single"
              variant="outline"
              value={currentTheme}
              onValueChange={(value) => {
                if (value) setTheme(value);
              }}
              aria-label="Theme"
            >
              <ToggleGroupItem value="light" aria-label="Light theme">
                Light
              </ToggleGroupItem>
              <ToggleGroupItem value="dark" aria-label="Dark theme">
                Dark
              </ToggleGroupItem>
              <ToggleGroupItem value="system" aria-label="System theme">
                System
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <Label>Default view</Label>
              <p className="text-xs text-muted-foreground">
                How tasks are laid out on list pages.
              </p>
            </div>
            <ToggleGroup
              type="single"
              variant="outline"
              value={viewMode}
              onValueChange={(value) => {
                if (value) setViewMode(value as ViewMode);
              }}
              aria-label="Default task view"
            >
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="size-4" />
                List
              </ToggleGroupItem>
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <LayoutGrid className="size-4" />
                Grid
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Server className="size-4" />
            Connection
          </CardTitle>
          <CardDescription>
            The frontend talks to the NestJS todo API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">API base URL</Badge>
            <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
              {getApiBaseUrl()}
            </code>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure it with the <code className="font-mono">NEXT_PUBLIC_API_URL</code>{" "}
            environment variable. Restart the dev server after changing it.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
