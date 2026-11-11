# Todo Studio — Frontend

A production-style todo dashboard built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **shadcn/ui**, **TanStack Query**, **Zustand + Immer**, **React Hook Form**, and **Zod**. It talks to the NestJS todo API in `../todo-api`.

## Features

- **Dashboard** with live summary cards (total, active, completed, completion rate) and a recent tasks panel.
- **Task management**: create, edit, delete, and toggle completion.
- **Route-based filters**: `/tasks`, `/tasks/active`, `/tasks/completed` — all backed by server-side filtering.
- **Debounced search** (350 ms) that syncs to the server query and jumps to the task list from any page.
- **Pagination** with page-size selection (10/20/50/100) and record counts, using `keepPreviousData` for smooth page transitions.
- **Optimistic completion toggle** with rollback on error and cache invalidation on settle.
- **List and grid views**, persisted in the UI store for the session.
- **Dark / light / system themes** via `next-themes`.
- **Responsive shell**: fixed sidebar on desktop (collapsible, with tooltips), slide-over sheet navigation on mobile.
- **Feedback everywhere**: loading skeletons, empty states, error states with retry, and toast notifications.
- **Typed API layer** with a custom `ApiError`, request cancellation via `AbortSignal`, and NestJS validation-message parsing.
- **Form validation** with React Hook Form + Zod matching backend limits (title 1–255, description ≤ 2000).

## Tech Stack

| Concern        | Technology                                  |
| -------------- | ------------------------------------------- |
| Framework      | Next.js 16.4 (App Router, Turbopack)        |
| UI Runtime     | React 19.3                                  |
| Styling        | Tailwind CSS 4.3 + shadcn/ui (new-york)     |
| Server State   | TanStack Query 5.107                        |
| Client State   | Zustand 5 + Immer 11                        |
| Forms          | React Hook Form 7.91 + Zod 4.6              |
| Dates          | date-fns 4.4                                |
| Notifications  | Sonner 2.0                                  |
| Icons          | lucide-react                                |
| Theming        | next-themes 0.4                             |

## Prerequisites

- **Node.js ≥ 20** (24 recommended) and npm ≥ 10.
- The **todo API running** on `http://localhost:3000/api` (see `../todo-api/README.md`).
- CORS: the API reflects the request origin by default, or set `CORS_ORIGINS` on the API to a comma-separated allow-list.

## Environment Variables

| Variable              | Description                      | Default                     |
| --------------------- | -------------------------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL` | Base URL of the todo API         | `http://localhost:3000/api` |

Create `.env.local` from the template:

```bash
cp .env.example .env.local
```

> `NEXT_PUBLIC_*` values are inlined at **build time**. Rebuild the app after changing them.

## Getting Started

```bash
npm install
cp .env.example .env.local

# The API already uses port 3000, so run the frontend on 3001
npm run dev -- -p 3001
```

Open [http://localhost:3001](http://localhost:3001). Ensure the API is up first:

```bash
curl http://localhost:3000/api/todos
```

## Available Scripts

| Script          | Purpose                                  |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start the dev server (Turbopack)         |
| `npm run build` | Production build (includes type checking) |
| `npm run start` | Serve the production build               |
| `npm run lint`  | Run ESLint                               |

## Project Structure

```text
src/
├── app/
│   ├── layout.tsx              # Fonts, metadata, providers, app shell
│   ├── providers.tsx           # QueryClient + ThemeProvider + Toaster
│   ├── page.tsx                # Dashboard
│   ├── settings/page.tsx       # Theme, default view, API info
│   └── tasks/
│       ├── page.tsx            # All tasks
│       ├── active/page.tsx     # Active tasks
│       └── completed/page.tsx  # Completed tasks
├── components/
│   ├── layout/                 # App shell, sidebar, header, search, theme toggle
│   ├── dashboard/              # Stat cards + recent tasks
│   ├── todos/                  # List view, item, form dialog, pagination, states
│   └── ui/                     # shadcn/ui primitives (vendored)
├── features/todos/
│   ├── api/todo-api.ts         # Typed API functions
│   ├── hooks/use-todos.ts      # Query keys, queries, mutations, stats
│   └── schemas/todo-schema.ts  # Zod form schema
├── lib/
│   ├── api-client.ts           # fetch wrapper + ApiError
│   ├── query-client.ts         # QueryClient factory/defaults
│   └── utils.ts                # cn()
├── stores/ui-store.ts          # Zustand UI state (Immer)
└── types/index.ts              # Todo, filters, API envelopes
```

## State Architecture

**Server state — TanStack Query.** All todo data lives in the query cache. Keys follow the resource hierarchy:

```ts
todoKeys.all        // ["todos"]
todoKeys.lists()    // ["todos", "list"]
todoKeys.list(f)    // ["todos", "list", filters]
todoKeys.details()  // ["todos", "detail"]
todoKeys.detail(id) // ["todos", "detail", id]
```

- Queries use a 30 s `staleTime`; filters/search/page are part of the key, so results are cached per view.
- Mutations invalidate `todoKeys.all` on settle, which refreshes lists, details, and stats.
- The completion toggle is optimistic: list caches and the detail cache are updated in `onMutate`, rolled back in `onError`, then invalidated in `onSettled`.
- Dashboard stats reuse the same list keys with `limit=1` and read `meta.total`, avoiding fetching every record.

**Client state — Zustand + Immer.** Only UI state lives here: sidebar collapsed, mobile menu, view mode, search term, todo dialog visibility, and the selected todo id.

## Verification

Performed against the running API and containerized PostgreSQL:

- `npm run build` — compiles cleanly (TypeScript included).
- `npm run lint` — no errors or warnings.
- All routes return `200` with correct headings: `/`, `/tasks`, `/tasks/active`, `/tasks/completed`, `/settings`.
- Headless Chrome against the real API: dashboard stats rendered (`Total 1`, `Active 0`, `Completed 1`, `100%`), recent tasks listed, filters returned the correct subsets.
- Scripted UI CRUD over the Chrome DevTools Protocol: create through the dialog → appears in the list and persists via API → optimistic toggle persists `completed=true` → delete through the actions menu and confirmation dialog removes it everywhere.
- CORS verified from a `http://localhost:3001` browser origin.

## Backend API Notes

- Base path: `http://localhost:3000/api` (Swagger at `/api/docs`).
- `GET /todos` supports `completed`, `search`, `page`, `limit` (max 100) and returns `{ data, meta }`.
- `POST /todos`, `PATCH /todos/:id`, `DELETE /todos/:id`.
- Validation: title 1–255 characters, description up to 2000; the client mirrors these limits.
- Clearing a description on edit sends `null`, which the API accepts (`@IsOptional`).

## Deployment Notes

The frontend is a standard Next.js app; a Dockerfile/Coolify setup can follow the same plain `docker run` approach used by the API:

1. Build with the target API URL available as a build arg/env (`NEXT_PUBLIC_API_URL`).
2. Run `npm run build` inside the image, then serve with `npm run start` (honors `PORT`).
3. Set `CORS_ORIGINS` on the API to the deployed frontend origin.

Because `NEXT_PUBLIC_API_URL` is baked into the client bundle, changing the API URL requires a rebuild — not just a restart.
