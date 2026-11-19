import Foundation
import Observation

@MainActor
@Observable
final class AppEnvironment {
    private let todoService: TodoServiceProtocol

    var todos: [Todo] = []
    var isLoading = false
    var errorMessage: String?
    var filter: TodoFilter = .all

    init(todoService: TodoServiceProtocol = TodoService()) {
        self.todoService = todoService
    }

    var totalCount: Int { todos.count }

    var activeCount: Int {
        todos.filter { !$0.isCompleted }.count
    }

    var completedCount: Int {
        todos.filter(\.isCompleted).count
    }

    var completionFraction: Double {
        guard totalCount > 0 else { return 0 }
        return Double(completedCount) / Double(totalCount)
    }

    var todaysTasks: [Todo] {
        todos.filter { Calendar.current.isDateInToday($0.createdAt) }
    }

    var inProgress: [Todo] {
        todos.filter { !$0.isCompleted && !Calendar.current.isDateInToday($0.createdAt) }
    }

    var finished: [Todo] {
        todos.filter(\.isCompleted)
    }

    func filteredTodos(searchText: String) -> [Todo] {
        let query = searchText.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()

        return todos.filter { todo in
            let matchesFilter: Bool
            switch filter {
            case .all: matchesFilter = true
            case .active: matchesFilter = !todo.isCompleted
            case .completed: matchesFilter = todo.isCompleted
            }

            let matchesSearch = query.isEmpty || todo.title.lowercased().contains(query)
            return matchesFilter && matchesSearch
        }
    }

    func fetchTodos() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            todos = try await todoService.fetchTodos()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func createTodo(title: String, description: String?) async {
        errorMessage = nil

        do {
            let created = try await todoService.createTodo(title: title, description: description)
            todos.insert(created, at: 0)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func updateTodo(_ todo: Todo) async {
        errorMessage = nil

        do {
            let updated = try await todoService.updateTodo(todo)
            guard let index = todos.firstIndex(where: { $0.id == updated.id }) else { return }
            todos[index] = updated
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func deleteTodo(_ todo: Todo) async {
        errorMessage = nil

        do {
            try await todoService.deleteTodo(id: todo.id)
            todos.removeAll { $0.id == todo.id }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func toggleTodo(_ todo: Todo) async {
        guard let index = todos.firstIndex(where: { $0.id == todo.id }) else { return }

        var updated = todo
        updated.completed.toggle()
        todos[index] = updated
        errorMessage = nil

        do {
            todos[index] = try await todoService.updateTodo(updated)
        } catch {
            todos[index] = todo
            errorMessage = error.localizedDescription
        }
    }
}
