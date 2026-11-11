import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentTodos } from "@/components/dashboard/recent-todos";

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
        <p className="text-sm text-muted-foreground">
          A quick look at how your tasks are progressing today.
        </p>
      </section>
      <DashboardStats />
      <RecentTodos />
    </div>
  );
}
