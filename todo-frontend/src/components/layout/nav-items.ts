import {
  CircleCheckBig,
  CircleDashed,
  LayoutDashboard,
  ListTodo,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "All Tasks", icon: ListTodo },
  { href: "/tasks/active", label: "Active Tasks", icon: CircleDashed },
  { href: "/tasks/completed", label: "Completed Tasks", icon: CircleCheckBig },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/tasks": "All Tasks",
  "/tasks/active": "Active Tasks",
  "/tasks/completed": "Completed Tasks",
  "/settings": "Settings",
};
