import Foundation

enum APIEndpoint {
    case listTodos(page: Int, limit: Int)
    case todo(id: UUID)
    case createTodo
    case updateTodo(id: UUID)
    case deleteTodo(id: UUID)

    var path: String {
        switch self {
        case .listTodos, .createTodo:
            return "/todos"
        case .todo(let id), .updateTodo(let id), .deleteTodo(let id):
            return "/todos/\(id.uuidString)"
        }
    }

    var method: String {
        switch self {
        case .listTodos, .todo:
            return "GET"
        case .createTodo:
            return "POST"
        case .updateTodo:
            return "PATCH"
        case .deleteTodo:
            return "DELETE"
        }
    }

    var queryItems: [URLQueryItem] {
        switch self {
        case .listTodos(let page, let limit):
            return [
                URLQueryItem(name: "page", value: String(page)),
                URLQueryItem(name: "limit", value: String(limit))
            ]
        default:
            return []
        }
    }

    func url(baseURL: URL) throws -> URL {
        guard var components = URLComponents(url: baseURL, resolvingAgainstBaseURL: false) else {
            throw APIError.invalidURL
        }

        components.path += path

        if !queryItems.isEmpty {
            components.queryItems = queryItems
        }

        guard let url = components.url else {
            throw APIError.invalidURL
        }

        return url
    }
}
