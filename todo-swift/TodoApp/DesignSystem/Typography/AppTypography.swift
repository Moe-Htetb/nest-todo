import SwiftUI

enum AppTypography {
    static func greeting(_ text: String) -> Text {
        Text(text)
            .font(.system(.largeTitle, design: .rounded, weight: .bold))
    }

    static func sectionTitle(_ text: String) -> Text {
        Text(text)
            .font(.system(.title3, design: .rounded, weight: .semibold))
    }

    static func cardTitle(_ text: String) -> Text {
        Text(text)
            .font(.system(.headline, design: .rounded, weight: .semibold))
    }

    static func metric(_ text: String) -> Text {
        Text(text)
            .font(.system(.title, design: .rounded, weight: .bold))
            .monospacedDigit()
    }

    static func caption(_ text: String) -> Text {
        Text(text)
            .font(.system(.caption, design: .rounded, weight: .medium))
            .foregroundStyle(.secondary)
    }
}
