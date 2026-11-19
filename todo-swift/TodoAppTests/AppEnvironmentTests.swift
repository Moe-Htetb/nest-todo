import Foundation
import XCTest
@testable import TodoApp

private final class MockTodoService: TodoServiceProtocol {
    var todos: [Todo] = []
    var shouldFail = false

    func fetchTodos() async throws -> [Todo] {
        if shouldFail { throw APIError.transport(URLError(.notConnectedToInternet)) }
        return todos
    }

    func createTodo(title: String, description: String?) async throws -> Todo {
        let todo = Todo(
            id: UUID(),
            title: title,
            description: description,
            completed: false,
            createdAt: Date(),
            updatedAt: Date()
        )
        todos.insert(todo, at: 0)
        return todo
    }

    func updateTodo(_ todo: Todo) async throws -> Todo {
        if shouldFail { throw APIError.transport(URLError(.notConnectedToInternet)) }
        guard let index = todos.firstIndex(where: { $0.id == todo.id }) else { return todo }
        todos[index] = todo
        return todo
    }

    func deleteTodo(id: UUID) async throws {
        todos.removeAll { $0.id == id }
    }
}

@MainActor
final class AppEnvironmentTests: XCTestCase {
    private func makeTodo(title: String, completed: Bool = false) -> Todo {
        Todo(
            id: UUID(),
            title: title,
            description: nil,
            completed: completed,
            createdAt: Date(),
            updatedAt: Date()
        )
    }

    func testFetchUpdatesStateAndStats() async {
        let service = MockTodoService()
        service.todos = [makeTodo(title: "One"), makeTodo(title: "Two", completed: true)]
        let environment = AppEnvironment(todoService: service)

        await environment.fetchTodos()

        XCTAssertEqual(environment.totalCount, 2)
        XCTAssertEqual(environment.completedCount, 1)
        XCTAssertEqual(environment.completionFraction, 0.5)
        XCTAssertFalse(environment.isLoading)
        XCTAssertNil(environment.errorMessage)
    }

    func testFetchFailureSetsErrorMessage() async {
        let service = MockTodoService()
        service.shouldFail = true
        let environment = AppEnvironment(todoService: service)

        await environment.fetchTodos()

        XCTAssertNotNil(environment.errorMessage)
        XCTAssertTrue(environment.todos.isEmpty)
    }

    func testCreateInsertsTodo() async {
        let environment = AppEnvironment(todoService: MockTodoService())

        await environment.createTodo(title: "New task", description: nil)

        XCTAssertEqual(environment.todos.count, 1)
        XCTAssertEqual(environment.todos.first?.title, "New task")
    }

    func testToggleRollsBackWhenUpdateFails() async {
        let service = MockTodoService()
        let todo = makeTodo(title: "Toggle me")
        service.todos = [todo]
        let environment = AppEnvironment(todoService: service)
        await environment.fetchTodos()

        service.shouldFail = true
        await environment.toggleTodo(todo)

        XCTAssertFalse(environment.todos[0].isCompleted)
        XCTAssertNotNil(environment.errorMessage)
    }

    func testDeleteRemovesTodo() async {
        let service = MockTodoService()
        let todo = makeTodo(title: "Delete me")
        service.todos = [todo]
        let environment = AppEnvironment(todoService: service)
        await environment.fetchTodos()

        await environment.deleteTodo(todo)

        XCTAssertTrue(environment.todos.isEmpty)
    }
}
