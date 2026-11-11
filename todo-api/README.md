# Todo REST API

A clean, maintainable Todo REST API built with **NestJS**, **TypeORM**, **PostgreSQL**, and **Docker**.

## Project Overview

This service provides full CRUD management of todo items with validation, filtering, searching, pagination, interactive API documentation (Swagger), and a production-ready Docker setup backed by a persistent PostgreSQL database.

## Technology Stack

| Concern             | Technology                                  |
| ------------------- | ------------------------------------------- |
| Framework           | NestJS 12                                   |
| Language            | TypeScript                                 |
| Database            | PostgreSQL 17                               |
| ORM                 | TypeORM (with migrations)                  |
| Validation          | class-validator / class-transformer        |
| Configuration       | @nestjs/config                              |
| API Documentation   | @nestjs/swagger                             |
| Containerization    | Docker (multi-stage build, plain `docker run`) |
| Package Manager     | npm                                         |
| Testing             | Vitest                                      |

## Prerequisites

- [Node.js](https://nodejs.org) >= 20 (24 recommended)
- npm >= 10
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose (for the containerized setup)
- A running PostgreSQL 17 instance (for local, non-Docker development)

## Installation

```bash
# Clone the repository and enter the project directory
cd todo-api

# Install dependencies
npm install

# Prepare environment variables
cp .env.example .env
```

Edit `.env` if your local PostgreSQL credentials differ from the defaults.

### Environment Variables

| Variable      | Description                          | Default (dev) |
| ------------- | ------------------------------------ | ------------- |
| `NODE_ENV`    | `development` or `production`       | `development` |
| `PORT`        | HTTP port the API listens on         | `3000`        |
| `CORS_ORIGINS` | Comma-separated allowed browser origins (default: reflect origin) | – |
| `DB_HOST`     | PostgreSQL host                     | `localhost`   |
| `DB_PORT`     | PostgreSQL port                     | `5432`        |
| `DB_USERNAME` | PostgreSQL user                      | `postgres`    |
| `DB_PASSWORD` | PostgreSQL password                 | `postgres`    |
| `DB_DATABASE` | PostgreSQL database name             | `todo_db`     |

> **Note:** In development (`NODE_ENV != production`), TypeORM's `synchronize`
> is enabled and entities create the schema automatically. In production,
> `synchronize` is disabled and schema changes are applied through
> TypeORM migrations (see below). The Docker image automatically runs
> pending migrations before starting the server.

## Running Locally (without Docker)

1. Start a PostgreSQL server and create the database:

   ```bash
   createdb todo_db
   ```

   (Or run only the database from the Docker Compose setup:

   ```bash
   docker compose up -d postgres
   ```

   )

2. Start the API in watch mode:

   ```bash
   npm run start:dev
   ```

3. The API is available at `http://localhost:3000/api/todos`, and the
   Swagger UI at `http://localhost:3000/api/docs`.

## Running with Plain Docker (no Compose)

This workflow uses only `docker build` and `docker run`. Two containers are
involved: the API image built from this Dockerfile, and a PostgreSQL instance
to talk to. They communicate over a user-defined Docker network, and the API
container waits for the database itself, so the start order does not matter.

```bash
# 1. Build the app image
docker build -t nest-todo .

# 2. Create a network so the two containers can talk to each other
docker network create todo-net

# 3. Start PostgreSQL (data persists in the "todo-pgdata" volume)
docker run -d --name todo-postgres --network todo-net \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=todo_db \
  -v todo-pgdata:/var/lib/postgresql/data \
  --restart unless-stopped \
  postgres:17-alpine

# 4. Run the API (waits for the DB, runs migrations, then starts)
docker run -d --name todo-app --network todo-net \
  -p 3000:3000 \
  -e DB_HOST=todo-postgres \
  -e DB_PORT=5432 \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=postgres \
  -e DB_DATABASE=todo_db \
  --restart unless-stopped \
  nest-todo
```

Key points:

- **`DB_HOST` is the container name** (`todo-postgres`), not `localhost`.
  Inside Docker, containers reach each other by name over the shared
  network. `localhost` would mean "inside the API container itself".
- **`-v todo-pgdata:/var/lib/postgresql/data`** persists database data
  across container restarts and removals.
- **`-p 3000:3000`** publishes the API on the host; `-p 5433:5432` on the
  postgres container would additionally expose psql access from the host.
- **`--restart unless-stopped`** makes both containers restart
  automatically, like Docker restart policies.
- The image contains a wait-and-retry loop: it retries the database
  connection for ~60 seconds before giving up, then runs TypeORM migrations
  and starts the server.

### Inspecting and Stopping (plain Docker)

```bash
# View logs
docker logs -f todo-app

# Open a shell inside the container (Alpine has no bash; use sh)
docker exec -it todo-app sh

# Check the container's health status
docker ps

# Stop and remove containers
docker stop todo-app todo-postgres
docker rm todo-app todo-postgres

# Remove the persisted database data and the network
docker volume rm todo-pgdata
docker network rm todo-net
```

## Deploying to Coolify

The Dockerfile is Coolify-ready:

1. In Coolify, create a new resource from your Git repository and choose the
   **Dockerfile** build pack.
2. Add the environment variables in the Coolify UI (`DB_HOST`, `DB_PORT`,
   `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`). If you attach a Coolify
   PostgreSQL service, use the host/credentials it provides for `DB_HOST`
   and friends — Coolify injects its own `POSTGRES_*` variables, which you
   can map to the `DB_*` names of this app.
3. Deploy. The image listens on `PORT` (defaults to 3000, `EXPOSE`d in the
   Dockerfile), waits for the database, runs migrations automatically, and
   runs as a non-root user.

## Alternative: Docker Compose

`compose.yaml` is included if you prefer running the whole stack with one
command:

```bash
# Start Docker services (builds the API image, starts PostgreSQL)
docker compose up --build -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Stop services and remove database volume
docker compose down -v
```

The API service waits for the PostgreSQL health check before starting, runs
pending database migrations, and then serves the app on port `3000`.

## Swagger Documentation

Once the app is running (locally or in Docker), open:

- Swagger UI: <http://localhost:3000/api/docs>
- OpenAPI JSON: <http://localhost:3000/api/docs-json>

## API Endpoints

All endpoints are prefixed with `/api`.

| Method | Endpoint         | Description                                        | Success |
| ------ | ---------------- | -------------------------------------------------- | ------- |
| POST   | `/api/todos`     | Create a todo (title required, description optional) | 201     |
| GET    | `/api/todos`     | List todos; supports `completed`, `search`, `page`, `limit` | 200 |
| GET    | `/api/todos/:id` | Get a single todo by UUID                            | 200     |
| PATCH  | `/api/todos/:id` | Update `title`, `description`, and/or `completed`   | 200     |
| DELETE | `/api/todos/:id` | Delete a todo                                       | 200     |

Validation rules:

- `title`: required, string, 1-255 characters
- `description`: optional, string, max 2000 characters
- `completed`: boolean
- `:id` must be a valid UUID; unknown body properties are rejected
- `page` >= 1 and `limit` between 1 and 100

Example list response with pagination metadata:

```json
{
  "data": [
    {
      "id": "0b9c443b-3d3f-4a3e-9f52-8f4bd4a7bf2e",
      "title": "Buy groceries",
      "description": "Milk, eggs, and bread",
      "completed": false,
      "createdAt": "2026-11-11T09:00:00.000Z",
      "updatedAt": "2026-11-11T09:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

## Example curl Requests

```bash
# Create a todo
curl -X POST http://localhost:3000/api/todos \
  -H 'Content-Type: application/json' \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, and bread"}'

# List all todos (with pagination)
curl http://localhost:3000/api/todos?page=1&limit=10

# Filter by completion status
curl http://localhost:3000/api/todos?completed=false

# Search by title
curl http://localhost:3000/api/todos?search=groceries

# Get a single todo by id
curl http://localhost:3000/api/todos/0b9c443b-3d3f-4a3e-9f52-8f4bd4a7bf2e

# Update a todo
curl -X PATCH http://localhost:3000/api/todos/0b9c443b-3d3f-4a3e-9f52-8f4bd4a7bf2e \
  -H 'Content-Type: application/json' \
  -d '{"completed": true}'

# Delete a todo
curl -X DELETE http://localhost:3000/api/todos/0b9c443b-3d3f-4a3e-9f52-8f4bd4a7bf2e
```

## Database Migrations

Development uses `synchronize: true`, so no manual migration step is needed.
For production (and for controlled schema changes), use TypeORM migrations:

```bash
# Generate a migration by diffing entities against the database
npm run migration:generate -- CreateTodosTable

# Create an empty migration file
npm run migration:create -- MyNewMigration

# Run all pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert

# List migrations and their execution status
npm run migration:show
```

The Docker image runs `migration:run` against the compiled data source
(`dist/data-source.js`) automatically before starting the server.

## Build & Production

```bash
# Build
npm run build

# Start production
npm run start:prod

# Run production migrations explicitly
npm run migration:run:prod
```

## Tests

```bash
# Run unit tests
npm run test

# Run e2e tests (requires a running PostgreSQL; uses .env)
npm run test:e2e

# Coverage
npm run test:cov
```

## Project Structure

```text
todo-api/
├── src/
│   ├── main.ts                     # Bootstrap: prefix, validation, Swagger
│   ├── app.module.ts               # ConfigModule + TypeOrmModule.forRootAsync
│   ├── config/
│   │   └── configuration.ts        # Typed environment configuration
│   ├── data-source.ts              # Standalone DataSource for TypeORM CLI
│   ├── migrations/
│   │   └── 1794355200000-CreateTodosTable.ts
│   └── todos/
│       ├── dto/
│       │   ├── create-todo.dto.ts
│       │   ├── update-todo.dto.ts
│       │   └── query-todo.dto.ts
│       ├── entities/
│       │   └── todo.entity.ts
│       ├── todos.controller.ts
│       ├── todos.service.ts
│       ├── todos.service.spec.ts   # Unit tests
│       └── todos.module.ts
├── test/
│   └── todos.e2e-spec.ts           # e2e tests
├── .env.example
├── .gitignore
├── Dockerfile                      # Multi-stage production build
├── compose.yaml                    # api + postgres services
├── package.json
├── tsconfig.json
└── README.md
```
