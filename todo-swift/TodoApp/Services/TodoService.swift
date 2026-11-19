import Foundation

struct PaginationMeta: Decodable {
    let total: Int
    let page: Int
    let limit: Int
    let totalPages: Int
    let hasNextPage: Bool
    let hasPreviousPage: Bool
}

struct TodoListResponse: Decodable {
    let data: [Todo]
    let meta: PaginationMeta
}

struct CreateTodoRequest: Encodable {
    let title: String
    let description: String?
}

struct UpdateTodoRequest: Encodable {
    let title: String?
    let description: String?
    let completed: Bool?

    enum CodingKeys: String, CodingKey {
        case title
        case description
        case completed
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        if let title { try container.encode(title, forKey: .title) }
        if let description { try container.encode(description, forKey: .description) }
        if let completed { try container.encode(completed, forKey: .completed) }
    }
}

struct DeleteTodoResponse: Decodable {
    let message: String
}

protocol TodoServiceProtocol {
    func fetchTodos() async throws -> [Todo]
    func createTodo(title: String, description: String?) async throws -> Todo
    func updateTodo(_ todo: Todo) async throws -> Todo
    func deleteTodo(id: UUID) async throws
}

struct TodoService: TodoServiceProtocol {
    private let client: APIClient

    init(client: APIClient = APIClient()) {
        self.client = client
    }

    func fetchTodos() async throws -> [Todo] {
        var todos: [Todo] = []
        var page = 1

        while true {
            let response: TodoListResponse = try await client.request(
                .listTodos(page: page, limit: 100)
            )
            todos.append(contentsOf: response.data)

            guard response.meta.hasNextPage else { break }
            page += 1
        }

        return todos
    }

    func createTodo(title: String, description: String?) async throws -> Todo {
        let body = CreateTodoRequest(title: title, description: description)
        return try await client.request(.createTodo, body: body)
    }

    func updateTodo(_ todo: Todo) async throws -> Todo {
        let body = UpdateTodoRequest(
            title: todo.title,
            description: todo.description,
            completed: todo.completed
        )
        return try await client.request(.updateTodo(id: todo.id), body: body)
    }

    func deleteTodo(id: UUID) async throws {
        let response: DeleteTodoResponse = try await client.request(.deleteTodo(id: id))
        _ = response.message
    }
}
