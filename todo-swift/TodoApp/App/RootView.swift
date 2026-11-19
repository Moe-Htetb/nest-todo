import SwiftUI

struct RootView: View {
    @State private var selectedTab: AppTab = .dashboard

    var body: some View {
        TabView(selection: $selectedTab) {
            DashboardView(selectedTab: $selectedTab)
                .tabItem {
                    Label("Home", systemImage: "house")
                }
                .accessibilityIdentifier("tab-home")
                .tag(AppTab.dashboard)

            AllTasksView()
                .tabItem {
                    Label("Tasks", systemImage: "checklist")
                }
                .accessibilityIdentifier("tab-tasks")
                .tag(AppTab.tasks)

            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gearshape")
                }
                .accessibilityIdentifier("tab-settings")
                .tag(AppTab.settings)
        }
        .tint(AppColors.accent)
        .accessibilityIdentifier("root-tab-view")
    }
}

#Preview {
    RootView()
        .environment(AppEnvironment())
}
