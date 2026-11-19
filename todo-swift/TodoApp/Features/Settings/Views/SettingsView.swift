import SwiftUI

enum AppearancePreference: String, CaseIterable, Identifiable {
    case system
    case light
    case dark

    var id: String { rawValue }

    var title: String {
        switch self {
        case .system: "System"
        case .light: "Light"
        case .dark: "Dark"
        }
    }

    var colorScheme: ColorScheme? {
        switch self {
        case .system: nil
        case .light: .light
        case .dark: .dark
        }
    }
}

struct SettingsView: View {
    @AppStorage("appearancePreference") private var appearanceRaw = AppearancePreference.system.rawValue

    var body: some View {
        NavigationStack {
            Form {
                Section("Appearance") {
                    Picker("Appearance", selection: $appearanceRaw) {
                        ForEach(AppearancePreference.allCases) { preference in
                            Text(preference.title).tag(preference.rawValue)
                        }
                    }
                    .pickerStyle(.segmented)
                    .accessibilityIdentifier("appearance-picker")
                }

                Section("About") {
                    LabeledContent("Application", value: "TodoApp")
                    LabeledContent("Version", value: "1.0")
                    LabeledContent("Build", value: "1")
                    Label("Built with SwiftUI", systemImage: "swift")
                }

                Section("API Connection") {
                    LabeledContent("Environment", value: "Development")
                    LabeledContent("Base URL", value: APIConfiguration.baseURL.absoluteString)
                    Text("Use your Mac's LAN IP instead of localhost when running on a physical iPhone.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Settings")
        }
    }
}

#Preview {
    SettingsView()
}
