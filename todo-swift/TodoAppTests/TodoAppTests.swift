import XCTest
@testable import TodoApp

final class TodoAppTests: XCTestCase {
    func testAppModuleIsAvailable() {
        let view = ContentView()
        XCTAssertFalse(String(describing: view).isEmpty)
    }
}
