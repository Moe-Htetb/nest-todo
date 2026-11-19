import SwiftUI

struct TodoCard: View {
    let todo: Todo
    var onOpen: (Todo) -> Void = { _ in }
    var onToggle: (Todo) -> Void = { _ in }
    var onEdit: (Todo) -> Void = { _ in }
    var onDelete: (Todo) -> Void = { _ in }

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var isPressed = false

    var body: some View {
        AppCard {
            HStack(alignment: .top, spacing: 14) {
                Button {
                    HapticFeedback.selection()
                    onToggle(todo)
                } label: {
                    Image(systemName: todo.isCompleted ? "checkmark.circle.fill" : "circle")
                        .font(.system(size: 26))
                        .foregroundStyle(
                            todo.isCompleted ? AppColors.success : AppColors.accent.opacity(0.7)
                        )
                        .symbolEffect(.bounce, value: todo.isCompleted)
                }
                .buttonStyle(.plain)
                .accessibilityLabel(todo.isCompleted ? "Mark incomplete" : "Mark complete")
                .accessibilityIdentifier("todo-toggle-\(todo.id.uuidString)")

                VStack(alignment: .leading, spacing: 6) {
                    Text(todo.title)
                        .strikethrough(todo.isCompleted, color: .secondary)
                        .foregroundStyle(todo.isCompleted ? .secondary : .primary)

                    if let description = todo.description, !description.isEmpty {
                        Text(description)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .lineLimit(2)
                    }

                    Text(todo.createdAt.formatted(date: .abbreviated, time: .shortened))
                        .font(.caption2)
                        .foregroundStyle(AppColors.mutedText)
                }
                .animation(AppAnimation.interactive(reduceMotion: reduceMotion), value: todo.isCompleted)
                .scaleEffect(isPressed ? 0.985 : 1)
                .animation(AppAnimation.interactive(reduceMotion: reduceMotion), value: isPressed)
                .contentShape(Rectangle())
                .onTapGesture {
                    onOpen(todo)
                }
                .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity) {
                } onPressingChanged: { pressed in
                    isPressed = pressed
                }

                Spacer(minLength: 0)

                Menu {
                    Button {
                        HapticFeedback.selection()
                        onEdit(todo)
                    } label: {
                        Label("Edit", systemImage: "pencil")
                    }

                    Button(role: .destructive) {
                        HapticFeedback.warning()
                        onDelete(todo)
                    } label: {
                        Label("Delete", systemImage: "trash")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                        .font(.system(size: 20))
                        .foregroundStyle(.secondary)
                }
                .accessibilityLabel("Actions for \(todo.title)")
            }
        }
        .opacity(todo.isCompleted ? 0.72 : 1)
        .scaleEffect(todo.isCompleted ? 0.99 : 1)
        .animation(AppAnimation.interactive(reduceMotion: reduceMotion), value: todo.isCompleted)
        .transition(.scale(scale: 0.96).combined(with: .opacity))
        .accessibilityIdentifier("todo-card-\(todo.id.uuidString)")
    }
}
