import type { Metadata } from "next";
import { TodoListView } from "@/components/todos/todo-list-view";

export const metadata: Metadata = {
  title: "Completed Tasks",
};

export default function CompletedTasksPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <p className="text-sm text-muted-foreground">
        Everything you have finished so far.
      </p>
      <TodoListView filter="completed" />
    </div>
  );
}
