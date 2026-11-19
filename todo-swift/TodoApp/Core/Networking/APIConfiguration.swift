import Foundation

enum APIEnvironment {
    case development
    case production(baseURL: String)

    var baseURL: URL {
        switch self {
        case .development:
            #if targetEnvironment(simulator)
            return URL(string: "http://localhost:3000/api")!
            #else
            return URL(string: "http://192.168.100.138:3000/api")!
            #endif
        case .production(let urlString):
            return URL(string: urlString) ?? URL(string: "http://localhost:3000/api")!
        }
    }
}

enum APIConfiguration {
    static let current: APIEnvironment = .development
    static var baseURL: URL { current.baseURL }
}
