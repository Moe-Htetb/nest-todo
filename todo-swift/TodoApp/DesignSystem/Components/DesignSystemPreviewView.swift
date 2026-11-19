import SwiftUI

struct DesignSystemPreviewView: View {
    @State private var todos = Todo.samples
    @State private var progress = 0.6

    private var completedCount: Int {
        todos.filter(\.isCompleted).count
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    section("Progress") {
                        VStack(spacing: 16) {
                            ProgressRing(progress: progress)
                            Slider(value: $progress, in: 0...1)
                                .padding(.horizontal)
                            Text("\(completedCount) of \(todos.count) sample tasks completed")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        .frame(maxWidth: .infinity)
                    }

                    section("Buttons") {
                        VStack(spacing: 12) {
                            PrimaryButton(title: "Create task", systemImage: "plus") {}
                            PrimaryButton(title: "Saving…", isLoading: true) {}
                            PrimaryButton(title: "Disabled", isDisabled: true) {}
                        }
                    }

                    section("Todo cards") {
                        VStack(spacing: 12) {
                            ForEach(todos.prefix(3)) { todo in
                                TodoCard(todo: todo, onToggle: { toggled in
                                    toggle(toggled)
                                })
                            }
                        }
                    }

                    section("States") {
                        VStack(spacing: 20) {
                            LoadingView()
                            EmptyStateView(
                                systemImage: "checklist",
                                title: "No tasks yet",
                                message: "Create your first task to get started.",
                                actionTitle: "Create task",
                                action: {}
                            )
                            ErrorView(message: "The API could not be reached.") {}
                        }
                    }
                }
                .padding()
            }
            .background(AppColors.background)
            .navigationTitle("Design System")
        }
    }

    private func section<Content: View>(_ title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            AppTypography.sectionTitle(title)
            content()
        }
    }

    private func toggle(_ todo: Todo) {
        guard let index = todos.firstIndex(where: { $0.id == todo.id }) else { return }
        todos[index].completed.toggle()
    }
}

#Preview {
    DesignSystemPreviewView()
}
