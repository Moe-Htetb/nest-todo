import Foundation
import XCTest
@testable import TodoApp

final class TodoAPITests: XCTestCase {
    private let todoJSON = """
    {
      "id": "0b9c443b-3d3f-4a3e-9f52-8f4bd4a7bf2e",
      "title": "Buy groceries",
      "description": null,
      "completed": false,
      "createdAt": "2026-11-11T09:00:00.000Z",
      "updatedAt": "2026-11-12T10:30:00Z"
    }
    """

    private let listJSON = """
    {
      "data": [{
        "id": "0b9c443b-3d3f-4a3e-9f52-8f4bd4a7bf2e",
        "title": "Buy groceries",
        "description": "Milk and bread",
        "completed": false,
        "createdAt": "2026-11-11T09:00:00.000Z",
        "updatedAt": "2026-11-11T09:00:00.000Z"
      }],
      "meta": {
        "total": 1,
        "page": 1,
        "limit": 100,
        "totalPages": 1,
        "hasNextPage": false,
        "hasPreviousPage": false
      }
    }
    """

    func testTodoDecodesFractionalISO8601DatesAndNullDescription() throws {
        let todo = try JSONDecoder().decode(Todo.self, from: Data(todoJSON.utf8))

        XCTAssertEqual(todo.id.uuidString, "0B9C443B-3D3F-4A3E-9F52-8F4BD4A7BF2E")
        XCTAssertEqual(todo.title, "Buy groceries")
        XCTAssertNil(todo.description)
        XCTAssertFalse(todo.isCompleted)

        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        XCTAssertEqual(todo.createdAt, formatter.date(from: "2026-11-11T09:00:00.000Z"))
    }

    func testPaginatedEnvelopeDecodes() throws {
        let response = try JSONDecoder().decode(TodoListResponse.self, from: Data(listJSON.utf8))

        XCTAssertEqual(response.data.count, 1)
        XCTAssertEqual(response.meta.total, 1)
        XCTAssertFalse(response.meta.hasNextPage)
    }

    func testFetchTodosBuildsExpectedURL() async throws {
        let session = MockURLSession()
        session.stubs = [.init(statusCode: 200, data: Data(listJSON.utf8))]
        let service = TodoService(client: APIClient(session: session))

        let todos = try await service.fetchTodos()

        XCTAssertEqual(todos.count, 1)
        XCTAssertEqual(session.requests.first?.httpMethod, "GET")
        XCTAssertEqual(session.requests.first?.url?.path, "/api/todos")
        XCTAssertEqual(session.requests.first?.url?.query, "page=1&limit=100")
    }

    func testCreateSendsOnlyTitleAndDescription() async throws {
        let session = MockURLSession()
        session.stubs = [.init(statusCode: 201, data: Data(todoJSON.utf8))]
        let service = TodoService(client: APIClient(session: session))

        let created = try await service.createTodo(title: "New task", description: nil)

        XCTAssertEqual(created.title, "Buy groceries")
        XCTAssertEqual(session.requests.first?.httpMethod, "POST")
        let body = try XCTUnwrap(session.requests.first?.httpBody)
        let json = try XCTUnwrap(try JSONSerialization.jsonObject(with: body) as? [String: Any])
        XCTAssertEqual(json["title"] as? String, "New task")
    }

    func testUpdateOmitsNilFields() async throws {
        let session = MockURLSession()
        session.stubs = [.init(statusCode: 200, data: Data(todoJSON.utf8))]
        let service = TodoService(client: APIClient(session: session))
        let todo = Todo(
            id: UUID(uuidString: "0b9c443b-3d3f-4a3e-9f52-8f4bd4a7bf2e")!,
            title: "Old title",
            description: nil,
            completed: false,
            createdAt: Date(),
            updatedAt: Date()
        )

        _ = try await service.updateTodo(todo)

        XCTAssertEqual(session.requests.first?.httpMethod, "PATCH")
        let body = try XCTUnwrap(session.requests.first?.httpBody)
        let json = try XCTUnwrap(try JSONSerialization.jsonObject(with: body) as? [String: Any])
        XCTAssertNil(json["description"])
        XCTAssertEqual(json["completed"] as? Bool, false)
    }

    func testDeleteUsesDeleteMethod() async throws {
        let session = MockURLSession()
        session.stubs = [.init(
            statusCode: 200,
            data: Data(#"{"message":"deleted successfully"}"#.utf8)
        )]
        let service = TodoService(client: APIClient(session: session))

        try await service.deleteTodo(id: UUID())

        XCTAssertEqual(session.requests.first?.httpMethod, "DELETE")
    }

    func testValidationErrorIsForwarded() async throws {
        let session = MockURLSession()
        session.stubs = [.init(
            statusCode: 400,
            data: Data(#"{"message":["title must not be empty"],"error":"Bad Request","statusCode":400}"#.utf8)
        )]
        let service = TodoService(client: APIClient(session: session))

        do {
            _ = try await service.fetchTodos()
            XCTFail("Expected an API error")
        } catch {
            XCTAssertEqual(error.localizedDescription, "title must not be empty")
        }
    }

    func testTransportErrorIsWrapped() async throws {
        let session = MockURLSession()
        session.thrownError = URLError(.notConnectedToInternet)
        let service = TodoService(client: APIClient(session: session))

        do {
            _ = try await service.fetchTodos()
            XCTFail("Expected a transport error")
        } catch let error as APIError {
            if case .transport = error {
                XCTAssertTrue(error.localizedDescription.contains("Could not connect"))
            } else {
                XCTFail("Expected APIError.transport")
            }
        }
    }
}
