import Foundation

struct APIErrorResponse: Decodable {
    let message: APIErrorMessage?

    enum APIErrorMessage: Decodable {
        case single(String)
        case multiple([String])

        init(from decoder: Decoder) throws {
            let container = try decoder.singleValueContainer()
            if let text = try? container.decode(String.self) {
                self = .single(text)
            } else {
                self = .multiple(try container.decode([String].self))
            }
        }

        var text: String {
            switch self {
            case .single(let message):
                return message
            case .multiple(let messages):
                return messages.joined(separator: "\n")
            }
        }
    }
}

enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case http(statusCode: Int, message: String?)
    case decoding(String)
    case transport(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "The API URL is invalid."
        case .invalidResponse:
            return "The server returned an unexpected response."
        case .http(let statusCode, let message):
            if let message, !message.isEmpty {
                return message
            }
            switch statusCode {
            case 400:
                return "The request was invalid."
            case 404:
                return "The task was not found."
            case 500...599:
                return "The server had a problem. Please try again."
            default:
                return "The request failed (HTTP \(statusCode))."
            }
        case .decoding(let detail):
            return "Could not read the server response. \(detail)"
        case .transport(let error):
            return "Could not connect to the server. \(error.localizedDescription)"
        }
    }
}
