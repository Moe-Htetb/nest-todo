import SwiftUI

enum TodoEditorMode {
    case create
    case edit(Todo)
}

struct TodoEditorView: View {
    let mode: TodoEditorMode

    @Environment(AppEnvironment.self) private var environment
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var description = ""
    @State private var isCompleted = false
    @State private var isSaving = false
    @State private var showValidation = false
    @FocusState private var titleFocused: Bool

    private var trimmedTitle: String {
        title.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private var isValid: Bool {
        !trimmedTitle.isEmpty && trimmedTitle.count <= 255 && description.count <= 2000
    }

    private var isCreate: Bool {
        if case .create = mode { return true }
        return false
    }

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 20) {
                fieldLabel("Title")
                TextField("What needs to be done?", text: $title)
                    .textFieldStyle(.plain)
                    .focused($titleFocused)
                    .accessibilityIdentifier("todo-title-field")
                    .padding(14)
                    .background(AppColors.card, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                    .overlay {
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .strokeBorder(
                                showValidation && trimmedTitle.isEmpty ? Color.red : Color.clear,
                                lineWidth: 1
                            )
                    }

                if showValidation && trimmedTitle.isEmpty {
                    Text("Title is required.")
                        .font(.caption)
                        .foregroundStyle(AppColors.destructive)
                }

                fieldLabel("Description (optional)")
                TextEditor(text: $description)
                    .accessibilityIdentifier("todo-description-field")
                    .frame(minHeight: 110)
                    .padding(8)
                    .scrollContentBackground(.hidden)
                    .background(AppColors.card, in: RoundedRectangle(cornerRadius: 14, style: .continuous))

                if !isCreate {
                    Toggle("Completed", isOn: $isCompleted)
                        .accessibilityIdentifier("todo-completed-toggle")
                        .font(.subheadline.weight(.medium))
                        .padding(14)
                        .background(AppColors.card, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                }

                if let message = environment.errorMessage {
                    Text(message)
                        .font(.caption)
                        .foregroundStyle(AppColors.destructive)
                }

                Spacer()

                PrimaryButton(
                    title: isCreate ? "Create Task" : "Save Changes",
                    systemImage: isCreate ? "plus" : "checkmark",
                    isLoading: isSaving,
                    isDisabled: !isValid,
                    accessibilityIdentifier: isCreate ? "create-task-button" : "save-task-button"
                ) {
                    Task { await save() }
                }
            }
            .padding()
            .background(AppColors.background)
            .navigationTitle(isCreate ? "New Task" : "Edit Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
            .presentationDetents([.medium, .large])
            .onAppear {
                if case .edit(let todo) = mode {
                    title = todo.title
                    description = todo.description ?? ""
                    isCompleted = todo.completed
                } else {
                    titleFocused = true
                }
            }
        }
    }

    private func fieldLabel(_ text: String) -> some View {
        Text(text)
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(.secondary)
    }

    private func save() async {
        showValidation = true
        guard isValid else {
            HapticFeedback.warning()
            return
        }

        isSaving = true
        defer { isSaving = false }

        let cleanDescription = description.trimmingCharacters(in: .whitespacesAndNewlines)
        let finalDescription = cleanDescription.isEmpty ? nil : cleanDescription

        var succeeded = true

        switch mode {
        case .create:
            await environment.createTodo(title: trimmedTitle, description: finalDescription)
            succeeded = environment.errorMessage == nil
        case .edit(let todo):
            var updated = todo
            updated.title = trimmedTitle
            updated.description = finalDescription
            updated.completed = isCompleted
            await environment.updateTodo(updated)
            succeeded = environment.errorMessage == nil
        }

        if succeeded {
            HapticFeedback.success()
        } else {
            HapticFeedback.warning()
        }

        dismiss()
    }
}

#Preview {
    TodoEditorView(mode: .create)
        .environment(AppEnvironment())
}
