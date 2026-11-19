import SwiftUI

struct ProgressRing: View {
    let progress: Double
    var lineWidth: CGFloat = 12
    var size: CGFloat = 132

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @ScaledMetric(relativeTo: .body) private var adaptiveSize: CGFloat = 132

    private var clampedProgress: Double {
        min(max(progress, 0), 1)
    }

    var body: some View {
        ZStack {
            Circle()
                .stroke(AppColors.accent.opacity(0.14), lineWidth: lineWidth)

            Circle()
                .trim(from: 0, to: clampedProgress)
                .stroke(
                    AppColors.accent,
                    style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .animation(AppAnimation.content(reduceMotion: reduceMotion), value: clampedProgress)

            VStack(spacing: 2) {
                Text("\(Int(clampedProgress * 100))%")
                    .font(.system(.title, design: .rounded, weight: .bold))
                    .monospacedDigit()
                    .contentTransition(.numericText())
                Text("complete")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(width: adaptiveSize * (size / 132), height: adaptiveSize * (size / 132))
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Completion")
        .accessibilityValue("\(Int(clampedProgress * 100)) percent")
    }
}
