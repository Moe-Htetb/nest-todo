import type { Metadata } from "next";
import { TodoListView } from "@/components/todos/todo-list-view";

export const metadata: Metadata = {
  title: "Active Tasks",
};

export default function ActiveTasksPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <p className="text-sm text-muted-foreground">
        Tasks that still need your attention.
      </p>
      <TodoListView filter="active" />
    </div>
  );
}
