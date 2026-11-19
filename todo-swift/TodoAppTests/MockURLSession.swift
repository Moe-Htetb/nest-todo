import Foundation
@testable import TodoApp

final class MockURLSession: URLSessionProtocol {
    struct Stub {
        let statusCode: Int
        let data: Data
    }

    var stubs: [Stub] = []
    var thrownError: Error?
    private(set) var requests: [URLRequest] = []

    func data(for request: URLRequest) async throws -> (Data, URLResponse) {
        requests.append(request)

        if let thrownError {
            throw thrownError
        }

        guard let url = request.url else {
            throw URLError(.badURL)
        }

        let stub = stubs.isEmpty
            ? Stub(statusCode: 200, data: Data())
            : stubs[min(requests.count - 1, stubs.count - 1)]

        let response = HTTPURLResponse(
            url: url,
            statusCode: stub.statusCode,
            httpVersion: nil,
            headerFields: nil
        )

        guard let response else {
            throw URLError(.badServerResponse)
        }

        return (stub.data, response)
    }
}
