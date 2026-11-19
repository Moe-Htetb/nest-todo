import SwiftUI

@main
struct TodoApp: App {
    @State private var environment = AppEnvironment()
    @AppStorage("appearancePreference") private var appearanceRaw = "system"

    private var appearance: AppearancePreference {
        AppearancePreference(rawValue: appearanceRaw) ?? .system
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(environment)
                .preferredColorScheme(appearance.colorScheme)
        }
    }
}
