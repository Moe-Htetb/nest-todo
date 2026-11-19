import SwiftUI

struct AllTasksView: View {
    @Environment(AppEnvironment.self) private var environment
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    @State private var searchText = ""
    @State private var path = NavigationPath()
    @State private var isShowingEditor = false
    @State private var todoToEdit: Todo?
    @State private var todoToDelete: Todo?

    private var visibleTodos: [Todo] {
        environment.filteredTodos(searchText: searchText)
    }

    private var filterBinding: Binding<TodoFilter> {
        Binding(
            get: { environment.filter },
            set: { environment.filter = $0 }
        )
    }

    var body: some View {
        NavigationStack(path: $path) {
            Group {
                if environment.isLoading && environment.todos.isEmpty {
                    LoadingView()
                } else if let message = environment.errorMessage {
                    ErrorView(message: message) {
                        Task { await environment.fetchTodos() }
                    }
                } else if visibleTodos.isEmpty {
                    EmptyStateView(
                        systemImage: searchText.isEmpty ? "tray" : "magnifyingglass",
                        title: searchText.isEmpty ? "No tasks here" : "No results",
                        message: searchText.isEmpty
                            ? "Try another filter or create a new task."
                            : "Try a different search term.",
                        actionTitle: searchText.isEmpty ? "Create task" : nil,
                        action: searchText.isEmpty ? { isShowingEditor = true } : nil
                    )
                } else {
                    List {
                        ForEach(visibleTodos) { todo in
                            TodoCard(
                                todo: todo,
                                onOpen: { path.append($0) },
                                onToggle: { item in
                                    Task { await environment.toggleTodo(item) }
                                },
                                onEdit: { todoToEdit = $0 },
                                onDelete: { todoToDelete = $0 }
                            )
                            .listRowInsets(EdgeInsets(top: 6, leading: 0, bottom: 6, trailing: 0))
                            .listRowSeparator(.hidden)
                            .listRowBackground(Color.clear)
                            .transition(.move(edge: .top).combined(with: .opacity))
                            .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                                Button(role: .destructive) {
                                    todoToDelete = todo
                                } label: {
                                    Label("Delete", systemImage: "trash")
                                }

                                Button {
                                    todoToEdit = todo
                                } label: {
                                    Label("Edit", systemImage: "pencil")
                                }
                                .tint(AppColors.accent)
                            }
                        }
                    }
                    .listStyle(.plain)
                    .scrollContentBackground(.hidden)
                    .animation(AppAnimation.content(reduceMotion: reduceMotion), value: environment.todos.count)
                }
            }
            .background(AppColors.background)
            .navigationTitle("Tasks")
            .searchable(text: $searchText, prompt: "Search by title")
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Picker("Filter", selection: filterBinding) {
                        ForEach(TodoFilter.allCases) { filter in
                            Text(filter.title).tag(filter)
                        }
                    }
                    .pickerStyle(.segmented)
                    .frame(width: 250)
                    .accessibilityIdentifier("todo-filter-picker")
                }

                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        HapticFeedback.selection()
                        isShowingEditor = true
                    } label: {
                        Image(systemName: "plus")
                    }
                    .accessibilityLabel("Create task")
                    .accessibilityIdentifier("tasks-create-task")
                }
            }
            .refreshable {
                await environment.fetchTodos()
            }
            .sheet(isPresented: $isShowingEditor) {
                TodoEditorView(mode: .create)
            }
            .sheet(item: $todoToEdit) { todo in
                TodoEditorView(mode: .edit(todo))
            }
            .alert("Delete task?", isPresented: Binding(
                get: { todoToDelete != nil },
                set: { if !$0 { todoToDelete = nil } }
            )) {
                Button("Delete", role: .destructive) {
                    HapticFeedback.warning()
                    if let todo = todoToDelete {
                        Task { await environment.deleteTodo(todo) }
                    }
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("This task will be removed permanently.")
            }
            .navigationDestination(for: Todo.self) { todo in
                TodoDetailsView(todo: todo)
            }
        }
    }
}

#Preview {
    AllTasksView()
        .environment(AppEnvironment())
}
