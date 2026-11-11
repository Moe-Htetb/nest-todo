import type { Metadata } from "next";
import { TodoListView } from "@/components/todos/todo-list-view";

export const metadata: Metadata = {
  title: "All Tasks",
};

export default function TasksPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <p className="text-sm text-muted-foreground">
        Every task on your board, newest first. Use the search bar to narrow
        things down.
      </p>
      <TodoListView filter="all" />
    </div>
  );
}
