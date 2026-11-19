import Foundation

struct Todo: Identifiable, Codable, Hashable {
    let id: UUID
    var title: String
    var description: String?
    var completed: Bool
    let createdAt: Date
    let updatedAt: Date

    var isCompleted: Bool {
        completed
    }

    enum CodingKeys: String, CodingKey {
        case id
        case title
        case description
        case completed
        case createdAt
        case updatedAt
    }

    init(
        id: UUID,
        title: String,
        description: String?,
        completed: Bool,
        createdAt: Date,
        updatedAt: Date
    ) {
        self.id = id
        self.title = title
        self.description = description
        self.completed = completed
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(UUID.self, forKey: .id)
        title = try container.decode(String.self, forKey: .title)
        description = try container.decodeIfPresent(String.self, forKey: .description)
        completed = try container.decode(Bool.self, forKey: .completed)
        createdAt = try Self.decodeDate(from: container, forKey: .createdAt)
        updatedAt = try Self.decodeDate(from: container, forKey: .updatedAt)
    }

    private static func decodeDate(
        from container: KeyedDecodingContainer<CodingKeys>,
        forKey key: CodingKeys
    ) throws -> Date {
        if let date = try? container.decode(Date.self, forKey: key) {
            return date
        }

        let string = try container.decode(String.self, forKey: key)
        let formatter = ISO8601DateFormatter()

        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = formatter.date(from: string) {
            return date
        }

        formatter.formatOptions = [.withInternetDateTime]
        if let date = formatter.date(from: string) {
            return date
        }

        throw DecodingError.dataCorruptedError(
            forKey: key,
            in: container,
            debugDescription: "Invalid ISO 8601 date: \(string)"
        )
    }
}

extension Todo {
    static var samples: [Todo] {
        let now = Date()
        let calendar = Calendar.current

        func daysAgo(_ days: Int, hour: Int = 9) -> Date {
            let date = calendar.date(byAdding: .day, value: -days, to: now) ?? now
            return calendar.date(bySettingHour: hour, minute: 0, second: 0, of: date) ?? date
        }

        return [
            Todo(id: UUID(), title: "Finalize onboarding flow", description: "Polish the welcome screens and add progress indicators.", completed: false, createdAt: daysAgo(0, hour: 8), updatedAt: daysAgo(0, hour: 8)),
            Todo(id: UUID(), title: "Review API contracts", description: "Confirm pagination and error responses with the backend.", completed: false, createdAt: daysAgo(0, hour: 10), updatedAt: daysAgo(0, hour: 11)),
            Todo(id: UUID(), title: "Write unit tests", description: nil, completed: false, createdAt: daysAgo(1), updatedAt: daysAgo(1)),
            Todo(id: UUID(), title: "Design empty states", description: "Create friendly messages for the dashboard and task list.", completed: true, createdAt: daysAgo(2), updatedAt: daysAgo(1)),
            Todo(id: UUID(), title: "Set up SwiftUI project", description: "Create the Xcode project and run it in the simulator.", completed: true, createdAt: daysAgo(4), updatedAt: daysAgo(3)),
            Todo(id: UUID(), title: "Inspect NestJS endpoints", description: nil, completed: true, createdAt: daysAgo(5), updatedAt: daysAgo(5))
        ]
    }
}
