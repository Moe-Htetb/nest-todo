# Project: Native iOS Todo App — SwiftUI + NestJS REST API

## 1. Your Role

Act as a Senior iOS Engineer, SwiftUI Expert, UI/UX Designer, and patient programming mentor.

Your task is to build a beautiful, modern, fully functional native iOS Todo application using Swift and SwiftUI.

I am completely new to Swift and iOS development. You must teach me while building the application.

Do not simply generate the entire application without explanation.

Work incrementally, explain the Swift concepts behind each implementation, and help me understand how a real native iOS application is structured.

I already have:
- macOS.
- Xcode installed.
- iOS Simulators installed.
- An existing NestJS Todo REST API.
- A PostgreSQL database connected to the backend.

You must use my existing development environment. Do not switch to React Native, Flutter, Expo, or web technologies.

## 2. Technology Stack

Use the following technologies:

| Technology | Purpose |
|---|---|
| Swift 6 | Programming language |
| SwiftUI | Native UI framework |
| MVVM | Application architecture |
| URLSession | HTTP networking |
| async/await | Asynchronous operations |
| Codable | JSON encoding and decoding |
| Observation | Reactive application state |
| NavigationStack | Navigation |
| SF Symbols | Native Apple icons |
| XCTest | Unit testing |
| Xcode | Development and debugging |

Technical requirements:

- Prefer modern Swift and SwiftUI APIs.
- Use the Observation framework with @Observable where appropriate.
- Use @MainActor for UI-facing state management.
- Use Swift structured concurrency.
- Use native SwiftUI components.
- Avoid unnecessary third-party dependencies.
- Do not use UIKit unless a specific native capability requires it.
- Do not use deprecated APIs.
- Use a deployment target of iOS 17 or newer unless the installed Xcode or project requires another compatible choice.
- Use a Swift language mode compatible with the installed Xcode version.

## 3. Design Direction

Create a premium, modern Todo application with a beautiful native iOS experience.

Design inspiration:
- Apple Reminders.
- Things 3.
- Linear.
- Modern productivity applications.

The UI must feel like a real premium iOS application, not a website inside a mobile wrapper.

### Visual Design

Use:
- Minimalist layouts.
- Beautiful typography.
- Generous spacing.
- Rounded cards.
- Subtle shadows.
- Soft background colors.
- Elegant color accents.
- Native materials and blur effects where appropriate.
- Consistent corner radii.
- Carefully designed empty states.
- Smooth transitions.
- High-quality SF Symbols.

Support both:
- Light mode.
- Dark mode.

Use system colors where appropriate so the application adapts naturally to iOS appearance settings.

Do not overuse gradients, shadows, glass effects, or animations.

The design should feel clean, elegant, polished, and consistent.

## 4. Animation Requirements

Animations are an important part of this application.

Use native SwiftUI animation APIs.

Implement:

### Screen Transitions
- Smooth navigation transitions.
- Subtle content appearance animations.
- Animated changes between dashboard sections.

### Todo Interactions
- Animated checkbox completion.
- Smooth strikethrough animation.
- Slight scale or opacity transition when completing a task.
- Smooth insertion animation when creating a Todo.
- Smooth removal animation when deleting a Todo.
- Interactive press feedback on Todo cards.

### Modal Interactions
- Beautiful create Todo sheet.
- Smooth edit Todo sheet.
- Native presentation transitions.
- Background dimming where appropriate.

### Dashboard Animations
- Animated completion percentage.
- Animated progress indicators.
- Staggered appearance of dashboard cards.
- Smooth statistics updates.

### Micro-interactions
- Button press feedback.
- Haptic feedback for meaningful actions.
- Animated empty-state transitions.
- Pull-to-refresh feedback.

Animation rules:
- Prefer animation(value:), withAnimation, transition, matchedGeometryEffect, and native SwiftUI animation APIs where appropriate.
- Use spring animations for natural interactions.
- Keep animations smooth and performant.
- Avoid excessive animation.
- Respect Reduce Motion accessibility settings.
- Do not sacrifice usability for visual effects.

## 5. Application Features

Build a complete Todo application with the following screens.

### A. Dashboard Screen

Create a beautiful home dashboard.

Header:
- Greeting such as "Good morning".
- Current date.
- Profile avatar placeholder.
- Notification or settings action if useful.

Dashboard summary:
- Total tasks.
- Active tasks.
- Completed tasks.
- Completion percentage.

Display a beautiful progress visualization.

Todo sections:
- Today's Tasks.
- In Progress.
- Completed.

Each section should have:
- Section title.
- Task count.
- See All action where appropriate.

Use real API data for all statistics.

Do not hardcode task counts or progress percentages.

### B. All Tasks Screen

Display all Todo items.

Each Todo card should contain:
- Completion checkbox.
- Todo title.
- Description.
- Created date.
- Edit action.
- Delete action.

Features:
- Search by title.
- Filter all, active, and completed tasks.
- Pull to refresh.
- Empty state.
- Loading state.
- Error state.

Use a clean native list or custom SwiftUI card layout.

### C. Create Todo Screen

Use a native SwiftUI sheet.

Fields:
- Todo title.
- Description.

Requirements:
- Title is required.
- Description is optional.
- Show validation errors.
- Disable submission when invalid.
- Show loading state during API requests.
- Dismiss after successful creation.
- Display success feedback.

Use a polished form layout rather than a generic default form.

### D. Edit Todo Screen

Requirements:
- Prepopulate existing Todo information.
- Allow editing title and description.
- Allow updating completion status.
- Validate user input.
- Save changes through the API.
- Handle errors gracefully.

### E. Todo Details Screen

Show:
- Todo title.
- Full description.
- Completion status.
- Creation date.
- Updated date.

Include edit and delete actions.

### F. Settings Screen

Include:
- Appearance preferences.
- System / Light / Dark appearance.
- About application.
- API connection information.
- App version.

Use native SwiftUI settings-style components.

## 6. API Integration

Connect to my existing NestJS backend.

Base URL:

http://localhost:3000/api

Create a centralized networking layer using URLSession.

Available endpoints:

GET /todos
GET /todos/:id
POST /todos
PATCH /todos/:id
DELETE /todos/:id

Supported GET query parameters:
- completed
- search
- page
- limit

### Expected Todo Model

```swift
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
}
```

Adapt the model to the actual API response.

Important:
- Inspect the existing backend DTOs and response structures before implementing networking.
- Do not assume the backend returns a specific pagination envelope.
- Handle optional descriptions.
- Configure ISO 8601 date decoding correctly.
- Handle HTTP status codes.
- Handle network failures.
- Handle malformed JSON.
- Provide meaningful error messages.

Create a centralized API client.

Example architecture:

```text
API/
├── APIClient.swift
├── APIEndpoint.swift
├── APIError.swift
└── TodoService.swift
```

Use async/await.

Example API method:

```swift
func fetchTodos() async throws -> [Todo] {
    let url = URL(string: "\(baseURL)/todos")!

    var request = URLRequest(url: url)
    request.httpMethod = "GET"

    let (data, response) = try await URLSession.shared.data(
        for: request
    )

    guard let response = response as? HTTPURLResponse,
          (200...299).contains(response.statusCode) else {
        throw APIError.invalidResponse
    }

    return try JSONDecoder().decode([Todo].self, from: data)
}
```

This is an illustrative example. Adapt it to the actual backend response and implement proper error handling.

### API Configuration

Do not hardcode the API URL throughout the application.

Create a centralized configuration.

Support different environments:

- Development.
- Production.

For iOS Simulator:
- `http://localhost:3000/api` should work when the NestJS server is running on the same Mac and listening on the appropriate interface.

For a physical iPhone:
- Use the Mac's LAN IP address instead of localhost.
- Ensure the iPhone and Mac are on the same network.
- Ensure the backend is accessible from the local network.

Configure local HTTP networking appropriately for development.

Do not disable App Transport Security globally or introduce unnecessary security exceptions in production.

## 7. Architecture — MVVM

Use a clean and understandable MVVM architecture.

Responsibilities:

**Model**
- Todo data structures.
- Codable models.
- API response models.

**View**
- SwiftUI screens.
- Reusable UI components.
- Navigation.
- Animations.

**ViewModel**
- UI-facing application state.
- User actions.
- API orchestration.
- Loading states.
- Error handling.

**Service**
- API networking.
- HTTP requests.
- JSON decoding.

Keep networking code out of SwiftUI views.

Avoid massive ViewModels and massive SwiftUI view files.

Use small, reusable components.

## 8. Recommended Project Structure

Create a clean structure similar to:

```text
TodoApp/
├── App/
│   ├── TodoApp.swift
│   └── AppEnvironment.swift
│
├── Core/
│   ├── Networking/
│   │   ├── APIClient.swift
│   │   ├── APIEndpoint.swift
│   │   ├── APIError.swift
│   │   └── APIConfiguration.swift
│   │
│   ├── Extensions/
│   │   └── Date+Formatting.swift
│   │
│   └── Components/
│       ├── LoadingView.swift
│       ├── EmptyStateView.swift
│       └── ErrorView.swift
│
├── Models/
│   └── Todo.swift
│
├── Services/
│   └── TodoService.swift
│
├── Features/
│   ├── Dashboard/
│   │   ├── Views/
│   │   └── ViewModels/
│   │
│   ├── Todos/
│   │   ├── Views/
│   │   ├── Components/
│   │   └── ViewModels/
│   │
│   └── Settings/
│       └── Views/
│
├── DesignSystem/
│   ├── Colors/
│   ├── Typography/
│   ├── Components/
│   └── Animations/
│
├── Resources/
│
└── Tests/
```

You may adjust the structure when necessary, but maintain clear separation of responsibilities.

## 9. SwiftUI Best Practices

Since I am new to Swift, follow these rules:

- Prefer simple and readable Swift code.
- Explain property wrappers such as @State, @Binding, @Environment, @Observable, and @StateObject when they are relevant.
- Explain View, ViewModifier, NavigationStack, and Sheet.
- Explain async/await and Task.
- Explain how SwiftUI updates the interface when state changes.
- Explain how MVVM works in this application.
- Avoid unnecessary abstraction.
- Avoid overly complicated generics.
- Do not introduce design patterns without explaining why they are needed.
- Use descriptive variable and function names.
- Use accessibility labels and appropriate accessibility identifiers.
- Use previews where practical.

Do not use deprecated SwiftUI APIs.

## 10. Error Handling and User Experience

Implement proper application states:

Loading:
- Native-looking loading indicators.
- Skeleton-style placeholders where useful.

Empty:
- Attractive empty-state illustrations or SF Symbols.
- Helpful messages.
- Create Todo action.

Error:
- Meaningful error descriptions.
- Retry actions.
- No blank screens.

Network:
- Handle connection failures.
- Handle server errors.
- Handle invalid responses.
- Handle timeouts.

Mutations:
- Disable duplicate submissions.
- Provide immediate feedback.
- Refresh affected data after successful operations.
- Roll back optimistic UI changes when appropriate.

## 11. Testing

Use XCTest.

Implement tests for:

- Todo model decoding.
- API response decoding.
- TodoService.
- Successful Todo creation.
- Successful Todo updates.
- Successful deletion.
- Error handling.
- ViewModel state changes.

Use mock URLSession networking where appropriate.

Do not require a running production backend for unit tests.

## 12. Step-by-Step Development Workflow

This is one of the most important requirements.

I have never developed an iOS application with Swift.

You MUST teach me while implementing the application.

Do not generate the entire project in one enormous response.

Work through the following phases.

### Phase 1 — Environment Inspection and Swift Introduction

1. Inspect the current directory.
2. Check the installed Xcode version.
3. Check available iOS Simulators.
4. Check whether an Xcode project already exists.
5. Explain Swift versus SwiftUI.
6. Explain how a native iOS application works.
7. Create the Xcode project if necessary.
8. Explain the project structure.
9. Run the default application in the iOS Simulator.

At the end:
- Explain what was created.
- Explain how to run it.
- Verify that it launches successfully.

STOP and wait for my approval before starting Phase 2.

### Phase 2 — Swift Fundamentals for This Project

Teach only the Swift concepts needed for this application:

- let and var.
- Structs and Classes.
- Functions.
- Properties.
- Optionals.
- Enums.
- Protocols.
- Extensions.
- Closures.
- Codable.
- Error handling.
- async/await.

Use examples from the Todo application.

Do not turn this into a long theoretical Swift course.

Implement small examples and explain them.

STOP and wait for approval.

### Phase 3 — Project Architecture

1. Create the folder structure.
2. Explain MVVM.
3. Create the Todo model.
4. Create API configuration.
5. Create networking architecture.
6. Explain each file.
7. Verify that the project builds.

STOP and wait for approval.

### Phase 4 — API Integration

1. Implement APIClient.
2. Implement APIError.
3. Implement TodoService.
4. Connect to the NestJS backend.
5. Fetch Todo records.
6. Test create, update, and delete requests.
7. Verify JSON decoding.
8. Handle API errors.

Use real backend data.

STOP and wait for approval.

### Phase 5 — Design System

1. Establish the color system.
2. Define typography.
3. Create reusable buttons.
4. Create reusable Todo cards.
5. Create loading and empty-state components.
6. Configure dark and light appearances.
7. Implement reusable animation utilities.

Explain the SwiftUI components.

STOP and wait for approval.

### Phase 6 — Dashboard Implementation

Build the complete dashboard.

Implement:
- Header.
- Summary cards.
- Progress visualization.
- Todo previews.
- Animated transitions.
- Navigation.

Use actual API data.

STOP and wait for approval.

### Phase 7 — Todo CRUD Implementation

Implement:
- Todo list.
- Create Todo.
- Edit Todo.
- Todo details.
- Delete confirmation.
- Completion toggle.
- Search.
- Filtering.
- Pull to refresh.

Connect every feature to the backend.

STOP and wait for approval.

### Phase 8 — Settings and Polish

Implement:
- Settings screen.
- Appearance preferences.
- Haptic feedback.
- Animations.
- Accessibility.
- Responsive layouts.
- Empty and error states.

STOP and wait for approval.

### Phase 9 — Testing and Final Verification

1. Run unit tests.
2. Fix compiler warnings.
3. Fix runtime errors.
4. Test all CRUD operations.
5. Test API connectivity.
6. Test dark and light mode.
7. Test different Simulator sizes.
8. Test Reduce Motion.
9. Verify the complete application.

Provide a final implementation summary.

## 13. How You Must Teach Me

For every phase, follow this teaching format:

### 1. What are we building?
Explain the current task in simple English.

### 2. Why are we using it?
Explain why the technology or Swift feature is necessary.

### 3. Files being created
Show the file names and their responsibilities.

### 4. Implementation
Write the actual code and implement it in the project.

### 5. Code explanation
Explain important code line by line or in understandable sections.

### 6. Run and test
Give me the exact Xcode or Terminal steps to run the implementation.

### 7. Expected result
Tell me what I should see in the iOS Simulator.

### 8. Common errors
Explain possible errors and how to fix them.

Use simple English because I am a beginner in Swift.

When possible, compare Swift concepts with JavaScript or TypeScript concepts to help me understand.

For example:
- Swift struct versus TypeScript interface.
- Swift let versus JavaScript const.
- Swift optional versus nullable TypeScript values.
- Swift async/await versus JavaScript async/await.
- SwiftUI @State versus React useState.

Do not assume I understand iOS development terminology.

## 14. Official Documentation

Prioritize official Apple documentation:

- Swift: https://www.swift.org/documentation/
- SwiftUI: https://developer.apple.com/documentation/swiftui
- Swift Language Guide: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/
- URLSession: https://developer.apple.com/documentation/foundation/urlsession
- Observation: https://developer.apple.com/documentation/observation
- Xcode: https://developer.apple.com/xcode/

Do not rely on outdated tutorials or deprecated SwiftUI APIs.

## 15. Final Quality Requirements

The final application must:

- Be a real native iOS application.
- Use SwiftUI.
- Connect to the existing NestJS API.
- Perform complete Todo CRUD operations.
- Have a premium modern design.
- Have beautiful and smooth animations.
- Support light and dark appearances.
- Use native Apple UI components.
- Have clean MVVM architecture.
- Handle loading, errors, and empty states.
- Build successfully in Xcode.
- Run successfully in iOS Simulator.
- Have basic unit tests.

Do not claim completion without verifying the application.

IMPORTANT:

I am learning Swift for the first time.

Your goal is not just to build an application for me. Your goal is to help me understand how to build a professional native iOS application from scratch.

Start with Phase 1 only.

Do not skip phases, do not rush ahead, and do not implement everything at once.

Wait for my approval at every phase boundary.