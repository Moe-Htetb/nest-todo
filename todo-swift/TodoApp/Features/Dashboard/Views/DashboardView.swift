import SwiftUI

struct DashboardView: View {
    @Environment(AppEnvironment.self) private var environment
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @ScaledMetric(relativeTo: .body) private var statColumnMinimum: CGFloat = 96
    @Binding var selectedTab: AppTab

    @State private var path = NavigationPath()
    @State private var isShowingEditor = false
    @State private var appeared = false

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<12: return "Good morning"
        case 12..<17: return "Good afternoon"
        case 17..<21: return "Good evening"
        default: return "Good night"
        }
    }

    var body: some View {
        NavigationStack(path: $path) {
            ScrollView {
                VStack(alignment: .leading, spacing: 28) {
                    header

                    if let message = environment.errorMessage {
                        ErrorView(message: message) {
                            Task { await environment.fetchTodos() }
                        }
                    }

                    LazyVGrid(
                        columns: [GridItem(.adaptive(minimum: statColumnMinimum), spacing: 12)],
                        spacing: 12
                    ) {
                        StatCard(title: "Total", value: "\(environment.totalCount)", systemImage: "square.stack", tint: AppColors.accent)
                        StatCard(title: "Active", value: "\(environment.activeCount)", systemImage: "circle", tint: AppColors.warning)
                        StatCard(title: "Done", value: "\(environment.completedCount)", systemImage: "checkmark.circle", tint: AppColors.success)
                    }
                    .appear(appeared, delay: 0.04, reduceMotion: reduceMotion)

                    progressCard
                        .appear(appeared, delay: 0.1, reduceMotion: reduceMotion)

                    section(
                        title: "Today's Tasks",
                        todos: environment.todaysTasks,
                        filter: .active,
                        delay: 0.16
                    )

                    section(
                        title: "In Progress",
                        todos: environment.inProgress,
                        filter: .active,
                        delay: 0.22
                    )

                    section(
                        title: "Completed",
                        todos: environment.finished,
                        filter: .completed,
                        delay: 0.28
                    )
                }
                .padding()
                .animation(AppAnimation.content(reduceMotion: reduceMotion), value: environment.todos.count)
            }
            .background(AppColors.background)
            .overlay {
                if environment.isLoading && environment.todos.isEmpty {
                    LoadingView()
                        .background(AppColors.background)
                }
            }
            .toolbar(.hidden, for: .navigationBar)
            .sheet(isPresented: $isShowingEditor) {
                TodoEditorView(mode: .create)
            }
            .navigationDestination(for: Todo.self) { todo in
                TodoDetailsView(todo: todo)
            }
            .overlay(alignment: .bottomTrailing) {
                addButton
                    .padding(.trailing, 20)
                    .padding(.bottom, 24)
            }
            .onAppear {
                withAnimation(AppAnimation.content(reduceMotion: reduceMotion)) {
                    appeared = true
                }
            }
            .task {
                await environment.fetchTodos()
            }
        }
    }

    private var header: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 4) {
                AppTypography.greeting(greeting)
                Text(Date.now.formatted(.dateTime.weekday(.wide).month(.wide).day()))
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Button {
                HapticFeedback.selection()
                selectedTab = .settings
            } label: {
                Image(systemName: "gearshape")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(.primary)
                    .padding(10)
                    .background(AppColors.card, in: Circle())
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Settings")

            Image(systemName: "person.crop.circle.fill")
                .font(.system(size: 38))
                .foregroundStyle(AppColors.accent.opacity(0.8))
                .accessibilityLabel("Profile")
        }
    }

    private var progressCard: some View {
        AppCard {
            HStack(spacing: 20) {
                ProgressRing(progress: environment.completionFraction, lineWidth: 10, size: 108)

                VStack(alignment: .leading, spacing: 8) {
                    AppTypography.sectionTitle("Your progress")
                    Text("\(environment.completedCount) of \(environment.totalCount) tasks completed")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Text(environment.totalCount == 0 ? "Add a task to begin." : "Keep the momentum going.")
                        .font(.caption)
                        .foregroundStyle(AppColors.mutedText)
                }

                Spacer(minLength: 0)
            }
        }
    }

    private func section(title: String, todos: [Todo], filter: TodoFilter, delay: Double) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                AppTypography.sectionTitle(title)
                Text("\(todos.count)")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(AppColors.accent.opacity(0.1), in: Capsule())

                Spacer()

                Button("See all") {
                    HapticFeedback.selection()
                    environment.filter = filter
                    selectedTab = .tasks
                }
                .font(.subheadline.weight(.semibold))
            }

            if todos.isEmpty {
                Text("Nothing here yet.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, 20)
            } else {
                ForEach(todos.prefix(3)) { todo in
                    TodoCard(
                        todo: todo,
                        onOpen: { path.append($0) },
                        onToggle: { item in
                            Task { await environment.toggleTodo(item) }
                        }
                    )
                }
            }
        }
        .appear(appeared, delay: delay, reduceMotion: reduceMotion)
    }

    private var addButton: some View {
        Button {
            HapticFeedback.selection()
            isShowingEditor = true
        } label: {
            Image(systemName: "plus")
                .font(.system(size: 24, weight: .semibold))
                .foregroundStyle(.white)
                .padding(18)
                .background(AppColors.accent, in: Circle())
                .shadow(color: AppColors.accent.opacity(0.3), radius: 10, y: 5)
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Create task")
        .accessibilityIdentifier("dashboard-create-task")
    }
}

private extension View {
    func appear(_ appeared: Bool, delay: Double, reduceMotion: Bool) -> some View {
        self
            .opacity(appeared ? 1 : 0)
            .offset(y: appeared ? 0 : 14)
            .animation(
                reduceMotion ? .linear(duration: 0) : AppAnimation.spring.delay(delay),
                value: appeared
            )
    }
}
