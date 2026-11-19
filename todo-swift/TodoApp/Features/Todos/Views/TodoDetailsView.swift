import SwiftUI

struct TodoDetailsView: View {
    let todo: Todo

    @Environment(AppEnvironment.self) private var environment
    @Environment(\.dismiss) private var dismiss

    @State private var current: Todo
    @State private var isShowingEditor = false
    @State private var isConfirmingDelete = false

    init(todo: Todo) {
        self.todo = todo
        _current = State(initialValue: todo)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                AppCard {
                    VStack(alignment: .leading, spacing: 14) {
                        HStack {
                            Image(systemName: current.isCompleted ? "checkmark.circle.fill" : "circle")
                                .font(.system(size: 24))
                                .foregroundStyle(current.isCompleted ? AppColors.success : AppColors.accent)
                                .symbolEffect(.bounce, value: current.isCompleted)

                            AppTypography.sectionTitle(current.title)

                            Spacer(minLength: 0)
                        }

                        Text(current.isCompleted ? "Completed" : "Active")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(current.isCompleted ? AppColors.success : AppColors.warning)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(
                                (current.isCompleted ? AppColors.success : AppColors.warning).opacity(0.12),
                                in: Capsule()
                            )
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }

                detailCard(
                    title: "Description",
                    content: current.description ?? "No description provided."
                )

                detailCard(
                    title: "Created",
                    content: current.createdAt.formatted(date: .long, time: .shortened)
                )

                detailCard(
                    title: "Last updated",
                    content: current.updatedAt.formatted(date: .long, time: .shortened)
                )

                Button(role: .destructive) {
                    HapticFeedback.warning()
                    isConfirmingDelete = true
                } label: {
                    Label("Delete Task", systemImage: "trash")
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                }
                .buttonStyle(.bordered)
                .buttonBorderShape(.roundedRectangle(radius: 14))
                .accessibilityIdentifier("delete-task-button")
            }
            .padding()
        }
        .background(AppColors.background)
        .navigationTitle("Details")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            Button("Edit") {
                HapticFeedback.selection()
                isShowingEditor = true
            }
            .accessibilityIdentifier("edit-task-button")
        }
        .sheet(isPresented: $isShowingEditor) {
            TodoEditorView(mode: .edit(current))
        }
        .alert("Delete task?", isPresented: $isConfirmingDelete) {
            Button("Delete", role: .destructive) {
                Task {
                    await environment.deleteTodo(current)
                    dismiss()
                }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This task will be removed permanently.")
        }
        .onChange(of: environment.todos) { _, todos in
            if let updated = todos.first(where: { $0.id == todo.id }) {
                current = updated
            }
        }
    }

    private func detailCard(title: String, content: String) -> some View {
        AppCard {
            VStack(alignment: .leading, spacing: 8) {
                AppTypography.caption(title)
                Text(content)
                    .font(.body)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

#Preview {
    NavigationStack {
        TodoDetailsView(todo: Todo.samples[0])
            .environment(AppEnvironment())
    }
}
