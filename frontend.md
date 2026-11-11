# Project: Professional Todo Management Frontend

Act as a Senior Frontend Engineer and UI/UX Designer.

Build a modern, clean, responsive Todo Management application using Next.js, TypeScript, Tailwind CSS v4, shadcn/ui, Zustand, Immer, and TanStack Query.

The application must connect to an existing NestJS Todo REST API.

Your responsibility is to implement the complete frontend, including UI, API integration, state management, loading states, error handling, and responsive layouts.

Do not build a mock-only frontend. Implement real API integration.

# 1. Technology Stack

Use the following technologies:

- Framework: Next.js with App Router
- Language: TypeScript
- Styling: Tailwind CSS v4
- UI Components: shadcn/ui
- Icons: Lucide React
- Client State: Zustand
- Immutable State Updates: Immer
- Server State: TanStack Query
- HTTP Client: Native Fetch API
- Forms: React Hook Form
- Validation: Zod
- Form Integration: @hookform/resolvers
- Notifications: Sonner
- Date Formatting: date-fns

Use stable, mutually compatible package versions.

# 2. Design Requirements

Create a professional Todo Dashboard with a minimalist, modern SaaS-style design.

Design direction:

- Clean and minimal interface.
- Neutral background colors.
- Clear typography and visual hierarchy.
- Consistent spacing.
- Rounded cards and subtle borders.
- Soft shadows where appropriate.
- Smooth hover and transition effects.
- Consistent icon usage.
- Avoid excessive gradients and unnecessary animations.

Use shadcn/ui components instead of creating duplicate UI primitives.

Support:

- Light mode.
- Dark mode.
- Responsive mobile, tablet, and desktop layouts.

# 3. Application Layout

Create the following layout:

## Sidebar

Include:

- Application logo and name.
- Dashboard navigation.
- All Tasks navigation.
- Active Tasks navigation.
- Completed Tasks navigation.
- Settings navigation.

The sidebar should:

- Be collapsible on desktop.
- Become a mobile navigation drawer.
- Clearly highlight the active navigation item.

## Header

Include:

- Current page title.
- Search input.
- Theme toggle.
- User avatar or profile placeholder.
- Add Todo button.

## Main Dashboard

Display summary cards:

1. Total Tasks
2. Active Tasks
3. Completed Tasks
4. Completion Rate

Calculate these values from the actual Todo data returned by the API.

Do not hardcode dashboard statistics.

# 4. Todo Management Features

Implement the following features:

## A. Todo List

Display todos using clean cards or a structured list.

Each Todo item should display:

- Checkbox for completion.
- Todo title.
- Description.
- Creation date.
- Last updated date.
- Edit action.
- Delete action.

Visual behavior:

- Completed todos should have a different visual appearance.
- Completed titles should have strikethrough styling.
- Long descriptions should be truncated appropriately.
- Show an empty state when no todos exist.

## B. Create Todo

Use a shadcn Dialog or Sheet.

Form fields:

- Title (required).
- Description (optional).

Requirements:

- Use React Hook Form.
- Validate with Zod.
- Display validation messages.
- Submit to the NestJS API.
- Close the dialog after successful creation.
- Refresh the relevant TanStack Query cache.

## C. Update Todo

Allow users to edit an existing Todo.

Requirements:

- Open a prefilled form.
- Validate the input.
- Submit a PATCH request.
- Update the server cache after successful mutation.
- Display success or error notifications.

## D. Delete Todo

Use an AlertDialog for delete confirmation.

Requirements:

- Show the Todo title in the confirmation dialog.
- Send a DELETE request.
- Update the query cache after successful deletion.
- Show a success notification.

## E. Toggle Completion

Allow users to mark a Todo as completed or active.

Requirements:

- Use a checkbox.
- Send a PATCH request to update the completed property.
- Provide immediate UI feedback.
- Handle API errors gracefully.
- Roll back optimistic updates if the request fails.

# 5. Search, Filtering & Pagination

Implement:

## Search

- Search todos by title.
- Use a debounced search input.
- Connect to the API's search query parameter.

## Filtering

Provide filters:

- All.
- Active.
- Completed.

Use the API's completed query parameter.

## Pagination

- Previous and Next buttons.
- Current page indicator.
- Page size selection.
- Display total records when pagination metadata is available.
- Handle empty pages correctly.

Keep filters, search, and pagination synchronized with the server query.

# 6. API Integration

The backend API is already implemented using NestJS.

Base URL must come from an environment variable:

NEXT_PUBLIC_API_URL=http://localhost:3000/api

Available endpoints:

GET /todos
GET /todos/:id
POST /todos
PATCH /todos/:id
DELETE /todos/:id

GET /todos supports:

- completed
- search
- page
- limit

Create a centralized API layer.

Example structure:

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── components/
│   ├── layout/
│   ├── dashboard/
│   ├── todos/
│   └── ui/
├── features/
│   └── todos/
│       ├── api/
│       │   └── todo-api.ts
│       ├── components/
│       ├── hooks/
│       ├── schemas/
│       └── types/
├── lib/
│   ├── api-client.ts
│   ├── query-client.ts
│   └── utils.ts
├── stores/
│   └── ui-store.ts
└── types/
    └── index.ts
```

Requirements:

- Centralize HTTP requests.
- Define reusable TypeScript interfaces.
- Handle HTTP errors consistently.
- Avoid duplicating API request logic.
- Do not use `any`.
- Keep API types separate from UI components.

# 7. TanStack Query - Server State

Use TanStack Query for all remote data.

Create reusable query hooks:

- useTodos
- useTodo
- useCreateTodo
- useUpdateTodo
- useDeleteTodo

Use a consistent query key structure:

```typescript
export const todoKeys = {
  all: ["todos"] as const,
  lists: () => [...todoKeys.all, "list"] as const,
  list: (filters: TodoFilters) => [...todoKeys.lists(), filters] as const,
  details: () => [...todoKeys.all, "detail"] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
};
```

Requirements:

- Configure QueryClientProvider.
- Use proper staleTime and gcTime.
- Handle loading and error states.
- Invalidate relevant queries after mutations.
- Use optimistic updates for completion toggles.
- Implement rollback using onMutate, onError, and onSettled.
- Avoid unnecessary API requests.

Do not store API responses in Zustand.

TanStack Query must remain the single source of truth for server data.

# 8. Zustand + Immer - Client State

Use Zustand with Immer middleware for client-only state.

Store UI-related state such as:

- Sidebar collapsed state.
- Mobile navigation state.
- Current view preference (grid/list).
- Todo dialog visibility.
- Currently selected Todo ID.
- Theme-related UI preferences if not already handled by the theme provider.

Example:

```typescript
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface UIState {
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  viewMode: "grid" | "list";
  isTodoDialogOpen: boolean;
  selectedTodoId: string | null;

  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  setViewMode: (mode: "grid" | "list") => void;
  setTodoDialogOpen: (open: boolean) => void;
  setSelectedTodoId: (id: string | null) => void;
}

export const useUIStore = create<UIState>()(
  immer((set) => ({
    sidebarCollapsed: false,
    mobileMenuOpen: false,
    viewMode: "list",
    isTodoDialogOpen: false,
    selectedTodoId: null,

    toggleSidebar: () =>
      set((state) => {
        state.sidebarCollapsed = !state.sidebarCollapsed;
      }),

    setMobileMenuOpen: (open) =>
      set((state) => {
        state.mobileMenuOpen = open;
      }),

    setViewMode: (mode) =>
      set((state) => {
        state.viewMode = mode;
      }),

    setTodoDialogOpen: (open) =>
      set((state) => {
        state.isTodoDialogOpen = open;
      }),

    setSelectedTodoId: (id) =>
      set((state) => {
        state.selectedTodoId = id;
      }),
  })),
);
```

This is an architectural example. Adapt it to the actual implementation.

Important:

- Use Zustand only for client-side UI state.
- Use TanStack Query for API/server state.
- Never duplicate Todo API data in Zustand.
- Avoid unnecessary global state.
- Use selectors to prevent unnecessary component re-renders.

# 9. React Hook Form + Zod

Create reusable schemas.

Example:

```typescript
import { z } from "zod";

export const todoSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),

  description: z.string().max(500, "Description is too long").optional(),
});

export type TodoFormValues = z.infer<typeof todoSchema>;
```

Requirements:

- Use zodResolver.
- Display field-level validation errors.
- Disable submit buttons while submitting.
- Prevent duplicate submissions.
- Reuse the form for creating and editing todos.

# 10. Loading, Empty & Error States

Every API-driven screen must handle:

Loading:

- Use Skeleton components.
- Avoid layout shifts.

Empty:

- Show a helpful empty state.
- Include an Add Todo action.

Error:

- Show a meaningful error message.
- Provide a retry action where appropriate.

Mutations:

- Disable relevant actions while pending.
- Display Sonner notifications.
- Handle network failures.

Do not leave the user with a blank screen.

# 11. Performance & Code Quality

Follow these rules:

- Use Next.js App Router correctly.
- Use Server Components by default.
- Use Client Components only when interactivity or client-side state is needed.
- Keep "use client" boundaries as small as possible.
- Use reusable components.
- Use TypeScript strict mode.
- Avoid unnecessary useEffect.
- Avoid prop drilling when Zustand or component composition is more appropriate.
- Avoid unnecessary dependencies.
- Use semantic HTML.
- Add accessible labels and keyboard interactions.
- Use consistent naming conventions.
- Keep components focused and maintainable.

# 12. Environment Configuration

Create `.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Ensure `.env.local` is excluded from Git.

# 13. Development Workflow

Work autonomously as a professional coding agent.

Follow these steps:

1. Inspect the current working directory.
2. Inspect the existing NestJS API contract if backend source code is available.
3. Check existing frontend files before modifying them.
4. Initialize Next.js only if the project does not already exist.
5. Install required dependencies.
6. Initialize and configure shadcn/ui.
7. Configure Tailwind CSS v4.
8. Configure TanStack Query.
9. Configure Zustand with Immer.
10. Implement the API client.
11. Implement Todo CRUD functionality.
12. Implement dashboard statistics.
13. Implement filtering, search, and pagination.
14. Implement responsive layouts.
15. Add loading, empty, and error states.
16. Verify all API integrations.
17. Run linting and production build.

Do not overwrite existing files without inspecting them first.

# 14. Error Investigation & Self-Correction

If you encounter an error:

1. Read the complete error message.
2. Identify the root cause.
3. Inspect the relevant implementation.
4. Consult official documentation or reliable online resources when necessary.
5. Fix the problem.
6. Run the failed command again.
7. Verify that the fix works.

Official documentation:

- Next.js: https://nextjs.org/docs
- shadcn/ui: https://ui.shadcn.com/docs
- Zustand: https://zustand.docs.pmnd.rs
- Immer: https://immerjs.github.io/immer/
- TanStack Query: https://tanstack.com/query/latest/docs/framework/react/overview
- React Hook Form: https://react-hook-form.com
- Zod: https://zod.dev

Do not ignore errors or pretend that a feature is working without testing it.

# 15. Final Verification

Before finishing, verify:

- [ ] Next.js application starts successfully.
- [ ] Production build succeeds.
- [ ] shadcn/ui components are configured correctly.
- [ ] Light and dark themes work.
- [ ] Responsive layouts work.
- [ ] Dashboard statistics use real API data.
- [ ] Create Todo works.
- [ ] Read Todo works.
- [ ] Update Todo works.
- [ ] Delete Todo works.
- [ ] Completion toggle works.
- [ ] Search works.
- [ ] Filtering works.
- [ ] Pagination works.
- [ ] Form validation works.
- [ ] TanStack Query caching works.
- [ ] Optimistic updates and rollback work.
- [ ] Zustand manages UI state only.
- [ ] Loading, empty, and error states work.
- [ ] No TypeScript errors.
- [ ] No unnecessary console errors.

# 16. Final Deliverables

When implementation is complete, provide:

1. Project overview.
2. Final folder structure.
3. Installed dependencies.
4. Explanation of the state management architecture.
5. Environment configuration.
6. Commands to run the frontend.
7. Backend connection instructions.
8. Build and verification results.
9. Known limitations, if any.

IMPORTANT:
Build a fully functional Todo Management frontend, not just a static UI prototype.

Prioritize clean architecture, maintainability, usability, responsive design, and correct separation between client state and server state.

Make reasonable technical decisions independently and do not ask unnecessary questions.
