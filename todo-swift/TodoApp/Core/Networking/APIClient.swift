import Foundation

protocol URLSessionProtocol {
    func data(for request: URLRequest) async throws -> (Data, URLResponse)
}

extension URLSession: URLSessionProtocol {}

struct APIClient {
    private let session: any URLSessionProtocol
    private let baseURL: URL

    init(
        session: any URLSessionProtocol = URLSession.shared,
        baseURL: URL = APIConfiguration.baseURL
    ) {
        self.session = session
        self.baseURL = baseURL
    }

    func request<Response: Decodable>(_ endpoint: APIEndpoint) async throws -> Response {
        let request = try makeRequest(for: endpoint)
        return try await send(request)
    }

    func request<Body: Encodable, Response: Decodable>(
        _ endpoint: APIEndpoint,
        body: Body
    ) async throws -> Response {
        var request = try makeRequest(for: endpoint)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        request.httpBody = try encoder.encode(body)

        return try await send(request)
    }

    private func makeRequest(for endpoint: APIEndpoint) throws -> URLRequest {
        var request = URLRequest(url: try endpoint.url(baseURL: baseURL))
        request.httpMethod = endpoint.method
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        return request
    }

    private func send<Response: Decodable>(_ request: URLRequest) async throws -> Response {
        let data: Data
        let response: URLResponse

        do {
            (data, response) = try await session.data(for: request)
        } catch {
            throw APIError.transport(error)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.http(
                statusCode: httpResponse.statusCode,
                message: Self.errorMessage(from: data)
            )
        }

        do {
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            return try decoder.decode(Response.self, from: data)
        } catch {
            throw APIError.decoding(error.localizedDescription)
        }
    }

    private static func errorMessage(from data: Data) -> String? {
        guard let payload = try? JSONDecoder().decode(APIErrorResponse.self, from: data) else {
            return nil
        }
        return payload.message?.text
    }
}
