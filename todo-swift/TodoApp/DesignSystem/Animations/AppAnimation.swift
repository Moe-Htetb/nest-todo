import SwiftUI

enum AppAnimation {
    static let spring = Animation.spring(response: 0.35, dampingFraction: 0.82)
    static let smooth = Animation.easeInOut(duration: 0.28)

    static func interactive(reduceMotion: Bool) -> Animation {
        reduceMotion ? .linear(duration: 0) : spring
    }

    static func content(reduceMotion: Bool) -> Animation {
        reduceMotion ? .linear(duration: 0) : smooth
    }
}
