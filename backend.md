# Project: Todo REST API with NestJS, TypeORM, PostgreSQL & Docker

Act as a Senior Backend Engineer. Your task is to build a clean, maintainable, and well-structured Todo REST API using NestJS, TypeORM, PostgreSQL, and Docker.

You must implement the application completely, not just generate example code or a project structure.

## 1. Technology Stack

Use the following technologies:

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Validation:** class-validator and class-transformer
- **Configuration:** @nestjs/config
- **API Documentation:** Swagger (@nestjs/swagger)
- **Containerization:** Docker and Docker Compose
- **Package Manager:** npm

Use stable, mutually compatible package versions.

## 2. Project Requirements

Build a simple Todo CRUD API.

Each Todo must contain:

| Field       | Type    | Description                          |
| ----------- | ------- | ------------------------------------ |
| id          | UUID    | Primary key, automatically generated |
| title       | string  | Todo title (required)                |
| description | string  | Optional description                 |
| completed   | boolean | Default: false                       |
| createdAt   | Date    | Automatically generated              |
| updatedAt   | Date    | Automatically updated                |

### API Endpoints

Implement the following REST endpoints:

**1. Create Todo**

- Method: POST
- Endpoint: `/api/todos`
- Accept title and optional description.
- Validate incoming data.
- Automatically set completed to false.

**2. Get All Todos**

- Method: GET
- Endpoint: `/api/todos`
- Return all todos.
- Support optional query parameters:
  - `completed`: Filter by completion status.
  - `search`: Search todos by title.
  - `page`: Pagination page.
  - `limit`: Number of records per page.

**3. Get Todo by ID**

- Method: GET
- Endpoint: `/api/todos/:id`
- Return a single todo.
- Return HTTP 404 if it does not exist.

**4. Update Todo**

- Method: PATCH
- Endpoint: `/api/todos/:id`
- Allow updating title, description, and completed.
- Use PartialType or an appropriate update DTO.
- Return HTTP 404 if the todo does not exist.

**5. Delete Todo**

- Method: DELETE
- Endpoint: `/api/todos/:id`
- Delete the specified todo.
- Return HTTP 404 if it does not exist.
- Return an appropriate success response.

## 3. Architecture & Project Structure

Follow NestJS best practices and modular architecture.

Organize the project similar to this:

```text
todo-api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   └── todos/
│       ├── dto/
│       │   ├── create-todo.dto.ts
│       │   ├── update-todo.dto.ts
│       │   └── query-todo.dto.ts
│       ├── entities/
│       │   └── todo.entity.ts
│       ├── todos.controller.ts
│       ├── todos.service.ts
│       └── todos.module.ts
├── test/
├── .env.example
├── .gitignore
├── Dockerfile
├── compose.yaml
├── package.json
├── tsconfig.json
└── README.md
```

Responsibilities:

- **Controller:** Handle HTTP requests and responses.
- **Service:** Handle business logic and database operations.
- **Entity:** Define the PostgreSQL Todo table.
- **DTO:** Validate and transform incoming requests.
- **Module:** Organize and connect Todo-related components.

Keep business logic out of controllers.

## 4. PostgreSQL & TypeORM Configuration

Configure PostgreSQL using environment variables.

Required environment variables:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=todo_db
```

Requirements:

- Use `TypeOrmModule.forRootAsync()` with ConfigModule.
- Use PostgreSQL as the database.
- Register entities properly.
- Use UUID primary keys.
- Enable automatic entity synchronization only in development.
- Disable `synchronize` in production.
- Use TypeORM migrations as the production database schema management strategy.
- Never hardcode database credentials in application source code.

## 5. Docker Configuration

Create a production-ready multi-stage Dockerfile.

Requirements:

- Use an official Node.js LTS Alpine image.
- Install dependencies efficiently.
- Build the NestJS application.
- Use a separate production stage.
- Install only production dependencies in the final stage.
- Run the application as a non-root user.
- Expose port 3000.
- Use the compiled application entry point.

Create a `compose.yaml` file containing two services:

### API Service

- Build from the project's Dockerfile.
- Expose port 3000.
- Load environment variables from `.env`.
- Connect to PostgreSQL using the Docker service name as `DB_HOST`.
- Wait for PostgreSQL health checks before starting.
- Restart automatically when appropriate.

### PostgreSQL Service

- Use an official PostgreSQL image.
- Configure database name, username, and password through environment variables.
- Persist database data using a named Docker volume.
- Add a PostgreSQL health check.

Important:
Inside Docker Compose, the API must connect to PostgreSQL using the service name (for example, `postgres`), not `localhost`.

## 6. API Quality & Error Handling

Implement:

- Global validation using ValidationPipe.
- `whitelist: true`.
- `transform: true`.
- Appropriate HTTP status codes.
- Meaningful error messages.
- Proper exception handling using NestJS exceptions.
- UUID validation for ID parameters.
- Consistent JSON response structures.
- Correct pagination metadata.

Do not expose database credentials or internal database errors to API consumers.

## 7. Swagger Documentation

Configure Swagger at:

`http://localhost:3000/api/docs`

Document:

- All Todo endpoints.
- Request body schemas.
- Query parameters.
- Response schemas.
- HTTP status codes.
- Error responses.

## 8. Environment & Git Configuration

Create `.env.example` with all required variables.

Ensure:

- `.env` is excluded from Git.
- `node_modules` is excluded.
- `dist` is excluded.
- Docker-related temporary files are excluded where appropriate.
- No secrets are committed.

## 9. README Documentation

Write a complete README containing:

1. Project overview.
2. Technology stack.
3. Prerequisites.
4. Installation instructions.
5. Environment variable configuration.
6. How to run locally.
7. How to run with Docker.
8. How to stop containers.
9. How to access Swagger.
10. API endpoint documentation.
11. Example curl requests.
12. Database migration commands.

Include these commands:

```bash
# Install dependencies
npm install

# Run in development
npm run start:dev

# Build
npm run build

# Start production
npm run start:prod

# Start Docker services
docker compose up --build -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Stop services and remove database volume
docker compose down -v
```

Ensure migration commands are configured and documented correctly.

## 10. Testing

Implement basic unit tests for TodoService.

Test:

- Creating a Todo.
- Retrieving all Todos.
- Retrieving a Todo by ID.
- Updating a Todo.
- Deleting a Todo.
- Handling nonexistent Todo IDs.

Make sure tests can run using:

```bash
npm run test
```

## 11. Development Workflow

Follow this workflow:

1. Inspect the current working directory.
2. Check whether a NestJS project already exists.
3. If it exists, inspect its architecture before modifying anything.
4. If it does not exist, initialize a new NestJS project.
5. Install the required dependencies.
6. Implement the application incrementally.
7. Configure TypeORM and PostgreSQL.
8. Implement all CRUD endpoints.
9. Configure Dockerfile and Docker Compose.
10. Configure Swagger.
11. Write tests and README.
12. Build and verify the application.

Do not overwrite existing user files without inspecting them first.

## 12. Error Investigation & Self-Correction

You are expected to work autonomously like a professional development agent.

If an error occurs:

1. Read the complete error message.
2. Identify the actual root cause.
3. Inspect the relevant source code and configuration.
4. If necessary, search official documentation or reliable online resources.
5. Apply the correct fix.
6. Re-run the failed command.
7. Verify that the fix does not introduce new problems.

Prioritize official documentation:

- NestJS: https://docs.nestjs.com
- TypeORM: https://typeorm.io
- PostgreSQL: https://www.postgresql.org/docs/
- Docker: https://docs.docker.com

Do not hide errors, skip failed steps, or pretend something works without verification.

## 13. Final Verification

Before considering the project complete, verify:

- [ ] NestJS application builds successfully.
- [ ] PostgreSQL starts successfully.
- [ ] TypeORM connects to PostgreSQL.
- [ ] Database schema is created through the configured development or migration workflow.
- [ ] All CRUD endpoints work correctly.
- [ ] Request validation works.
- [ ] Invalid UUIDs are rejected.
- [ ] Pagination and filtering work.
- [ ] Swagger documentation is accessible.
- [ ] Unit tests pass.
- [ ] Docker image builds successfully.
- [ ] Docker Compose starts both services successfully.
- [ ] API can communicate with PostgreSQL inside Docker.
- [ ] Database data persists after restarting containers.

Do not mark any item as complete unless you have actually verified it.

## 14. Final Output

When finished, provide:

1. A summary of the implementation.
2. The final project structure.
3. All available API endpoints.
4. Instructions to run locally.
5. Instructions to run using Docker.
6. Swagger URL.
7. Test results.
8. Any known limitations or remaining issues.

**Important:** Do not stop after generating files. Your responsibility is to implement, build, run, test, debug, and verify the complete Todo REST API. Make reasonable technical decisions independently and avoid unnecessary questions.
