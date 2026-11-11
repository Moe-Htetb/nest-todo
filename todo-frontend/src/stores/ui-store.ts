import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type ViewMode = "grid" | "list";

interface UIState {
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  viewMode: ViewMode;
  search: string;
  isTodoDialogOpen: boolean;
  selectedTodoId: string | null;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setViewMode: (viewMode: ViewMode) => void;
  setSearch: (search: string) => void;
  setTodoDialogOpen: (open: boolean) => void;
  setSelectedTodoId: (id: string | null) => void;
  openCreateDialog: () => void;
  openEditDialog: (id: string) => void;
  closeTodoDialog: () => void;
}

export const useUIStore = create<UIState>()(
  immer((set) => ({
    sidebarCollapsed: false,
    mobileMenuOpen: false,
    viewMode: "list",
    search: "",
    isTodoDialogOpen: false,
    selectedTodoId: null,
    toggleSidebar: () =>
      set((state) => {
        state.sidebarCollapsed = !state.sidebarCollapsed;
      }),
    setSidebarCollapsed: (collapsed) =>
      set((state) => {
        state.sidebarCollapsed = collapsed;
      }),
    setMobileMenuOpen: (open) =>
      set((state) => {
        state.mobileMenuOpen = open;
      }),
    setViewMode: (viewMode) =>
      set((state) => {
        state.viewMode = viewMode;
      }),
    setSearch: (search) =>
      set((state) => {
        state.search = search;
      }),
    setTodoDialogOpen: (open) =>
      set((state) => {
        state.isTodoDialogOpen = open;
      }),
    setSelectedTodoId: (id) =>
      set((state) => {
        state.selectedTodoId = id;
      }),
    openCreateDialog: () =>
      set((state) => {
        state.selectedTodoId = null;
        state.isTodoDialogOpen = true;
      }),
    openEditDialog: (id) =>
      set((state) => {
        state.selectedTodoId = id;
        state.isTodoDialogOpen = true;
      }),
    closeTodoDialog: () =>
      set((state) => {
        state.isTodoDialogOpen = false;
        state.selectedTodoId = null;
      }),
  })),
);
