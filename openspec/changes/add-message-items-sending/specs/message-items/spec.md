# Capability: Message Items Sending

## ADDED Requirements

### Requirement: Rich Message Sending
The system SHALL allow users to send LINE rich messages (created in LINE Official Account Manager) to individual users.

#### Scenario: Send rich message with valid message ID
- **GIVEN** a user is on the message items page
- **WHEN** the user selects a target LINE user, selects "Rich Message" type, enters a valid rich message ID, and submits the form
- **THEN** the system SHALL send the rich message to the target user via LINE Messaging API
- **AND** the system SHALL save the message to the database with type `RICH_MESSAGE`
- **AND** the system SHALL display a success message with delivery status

#### Scenario: Send rich message with invalid message ID
- **GIVEN** a user is on the message items page
- **WHEN** the user enters an invalid or non-existent rich message ID and submits the form
- **THEN** the system SHALL return an error from LINE Messaging API
- **AND** the system SHALL display a detailed error message to the user
- **AND** the system SHALL NOT save the failed message to the database

#### Scenario: Display API debug information in development mode
- **GIVEN** the application is running in development mode
- **WHEN** a user sends a rich message
- **THEN** the system SHALL display a debug panel with:
  - API request URL and method
  - Request body
  - Response status and body
  - cURL command for reproducing the request

### Requirement: Card-Type Message Sending
The system SHALL allow users to send LINE card-type messages (created in LINE Official Account Manager) to individual users.

#### Scenario: Send card-type message with valid message ID
- **GIVEN** a user is on the message items page
- **WHEN** the user selects a target LINE user, selects "Card-Type Message" type, enters a valid card-type message ID, and submits the form
- **THEN** the system SHALL send the card-type message to the target user via LINE Messaging API
- **AND** the system SHALL save the message to the database with type `CARD_TYPE`
- **AND** the system SHALL display a success message with delivery status

#### Scenario: Send card-type message with invalid message ID
- **GIVEN** a user is on the message items page
- **WHEN** the user enters an invalid or non-existent card-type message ID and submits the form
- **THEN** the system SHALL return an error from LINE Messaging API
- **AND** the system SHALL display a detailed error message to the user
- **AND** the system SHALL NOT save the failed message to the database

### Requirement: User Selection
The system SHALL provide a user-friendly interface to select target LINE users for message items.

#### Scenario: Search and select user
- **GIVEN** a user is on the message items page
- **WHEN** the user types a search query in the user selector
- **THEN** the system SHALL fetch matching users from `/api/users?q={searchTerm}`
- **AND** the system SHALL display a list of matching users with:
  - Display name
  - LINE User ID
  - Profile picture (if available)

#### Scenario: Select user from list
- **GIVEN** a user has searched for target users
- **WHEN** the user clicks on a user in the search results
- **THEN** the system SHALL populate the selected user's LINE User ID in the form
- **AND** the system SHALL display the selected user's name in the input field

### Requirement: Message Type Selection
The system SHALL allow users to choose between rich message and card-type message when sending message items.

#### Scenario: Select message type
- **GIVEN** a user is on the message items page
- **WHEN** the user views the message type field
- **THEN** the system SHALL display options for:
  - Rich Message
  - Card-Type Message
- **AND** the system SHALL allow the user to select one option

### Requirement: Message ID Validation
The system SHALL validate message IDs before sending to LINE Messaging API.

#### Scenario: Validate message ID format
- **GIVEN** a user is entering a message ID
- **WHEN** the user submits the form
- **THEN** the system SHALL validate that the message ID is not empty
- **AND** the system SHALL validate that the message ID contains only valid characters

#### Scenario: Empty message ID
- **GIVEN** a user is on the message items page
- **WHEN** the user submits the form without entering a message ID
- **THEN** the system SHALL display a validation error message
- **AND** the system SHALL prevent form submission

### Requirement: Message History Recording
The system SHALL record all message item sends in the database for tracking and analytics.

#### Scenario: Record sent message item
- **GIVEN** a message item has been successfully sent
- **WHEN** the LINE Messaging API returns a success response
- **THEN** the system SHALL save a `Message` record with:
  - `type`: `RICH_MESSAGE` or `CARD_TYPE`
  - `content`: JSON object containing message type and ID
  - `direction`: `OUTBOUND`
  - `userId`: target user's database ID
  - `deliveryStatus`: "sent"
  - `createdAt`: current timestamp

#### Scenario: Query message items history
- **GIVEN** message items have been sent
- **WHEN** a user queries the message history
- **THEN** the system SHALL return message records with type `RICH_MESSAGE` or `CARD_TYPE`
- **AND** the system SHALL include the message ID in the `content` field

### Requirement: Navigation Integration
The system SHALL integrate the message items page into the dashboard navigation.

#### Scenario: Access message items page from navigation
- **GIVEN** a user is on any dashboard page
- **WHEN** the user views the sidebar navigation
- **THEN** the system SHALL display a "メッセージアイテム" (Message Items) menu item
- **AND** the menu item SHALL be placed in the "メッセージ管理" (Message Management) section

#### Scenario: Navigate to message items page
- **GIVEN** a user is viewing the dashboard navigation
- **WHEN** the user clicks on the "メッセージアイテム" menu item
- **THEN** the system SHALL navigate to `/dashboard/message-items`
- **AND** the system SHALL highlight the menu item as active

### Requirement: Error Handling
The system SHALL provide clear error messages and handle failures gracefully when sending message items.

#### Scenario: Handle LINE API error
- **GIVEN** a user attempts to send a message item
- **WHEN** the LINE Messaging API returns an error (e.g., 400, 404, 500)
- **THEN** the system SHALL display an error message with:
  - Error code from LINE API
  - Error description
  - Suggested actions (e.g., "Check message ID", "Try again later")

#### Scenario: Handle network error
- **GIVEN** a user attempts to send a message item
- **WHEN** a network error occurs (e.g., timeout, connection refused)
- **THEN** the system SHALL display a generic error message
- **AND** the system SHALL suggest retrying the request

### Requirement: UI Consistency
The message items page SHALL follow the same design patterns and components as other message sending pages.

#### Scenario: Consistent layout
- **GIVEN** a user views the message items page
- **THEN** the page SHALL use the same layout structure as other message pages (text, image, video, etc.)
- **AND** the page SHALL include:
  - Page title
  - Form fields
  - Submit button
  - Debug panel (development mode only)

#### Scenario: Consistent styling
- **GIVEN** a user interacts with the message items page
- **THEN** all UI components SHALL use Tailwind CSS classes consistent with the rest of the application
- **AND** the color scheme, spacing, and typography SHALL match other dashboard pages
