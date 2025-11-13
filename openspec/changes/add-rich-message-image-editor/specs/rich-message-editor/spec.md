# Capability: Rich Message Image Editor

## ADDED Requirements

### Requirement: Image Upload

The system SHALL allow users to upload images via multiple methods (file selection, drag & drop, clipboard paste). Images SHALL be uploaded to Cloudinary and the URL SHALL be retrieved.

#### Scenario: Upload via file selection button

- **GIVEN** a user is on the rich message page
- **WHEN** the user clicks the file selection button and selects a valid image file (JPEG/PNG, 1024x1024px or larger)
- **THEN** the image SHALL be uploaded to Cloudinary
- **AND** the image URL SHALL be retrieved after successful upload
- **AND** the image SHALL be displayed in the editor

#### Scenario: Upload via drag and drop

- **GIVEN** a user is on the rich message page
- **WHEN** the user drags and drops a valid image file into the drop area
- **THEN** the image SHALL be automatically uploaded to Cloudinary
- **AND** the image SHALL be displayed in the editor after successful upload

#### Scenario: Upload via clipboard paste

- **GIVEN** a user is on the rich message page
- **AND** there is image data in the clipboard
- **WHEN** the user presses Ctrl/Cmd + V
- **THEN** the image SHALL be uploaded to Cloudinary
- **AND** the image SHALL be displayed in the editor after successful upload

#### Scenario: Attempt to upload invalid image file

- **GIVEN** a user is on the rich message page
- **WHEN** the user attempts to upload an invalid file (non-image or smaller than 1024x1024px)
- **THEN** an error message SHALL be displayed
- **AND** the message SHALL state "画像サイズは1024x1024px以上である必要があります" or similar
- **AND** the upload SHALL NOT be executed

### Requirement: Visual Area Editor - Area Creation

The system SHALL allow users to visually create rectangular tap areas by dragging on the image.

#### Scenario: Create new area

- **GIVEN** an image is displayed in the editor
- **WHEN** the user performs mousedown, drag, and mouseup on the image
- **THEN** a semi-transparent rectangular area SHALL be created in the dragged region
- **AND** the created area SHALL have a default action (URI: https://example.com)
- **AND** the area SHALL be added to the area list

#### Scenario: Preview during drag

- **GIVEN** an image is displayed in the editor
- **WHEN** the user is dragging (between mousedown and mouseup)
- **THEN** the drag region SHALL be displayed as a preview rectangle in real-time
- **AND** the area SHALL be finalized on mouseup

#### Scenario: Minimum size constraint

- **GIVEN** an image is displayed in the editor
- **WHEN** the user attempts to create an area smaller than 50x50px
- **THEN** the area SHALL be created with minimum size (50x50px)
- **AND** a warning message SHALL be displayed ("タップエリアは最小50x50pxである必要があります")

### Requirement: Visual Area Editor - Area Editing

The system SHALL allow users to select, move, and resize created areas.

#### Scenario: Select area

- **GIVEN** multiple areas are created on the image
- **WHEN** the user clicks on an area
- **THEN** that area SHALL be highlighted (blue border)
- **AND** resize handles (8 directions) SHALL be displayed
- **AND** the corresponding area in the area list SHALL be highlighted
- **AND** the action settings for the selected area SHALL be displayed in ActionEditor

#### Scenario: Move area

- **GIVEN** an area is selected
- **WHEN** the user drags the center of the area
- **THEN** the area SHALL move following the mouse movement
- **AND** the area SHALL be constrained within image boundaries

#### Scenario: Resize area

- **GIVEN** an area is selected
- **WHEN** the user drags a resize handle
- **THEN** the area size SHALL change in the drag direction
- **AND** the area SHALL NOT become smaller than minimum size (50x50px)
- **AND** the area SHALL be constrained within image boundaries

### Requirement: Coordinate System Conversion

The system SHALL accurately convert coordinates between display size and LINE API required size (1040x1040).

#### Scenario: Coordinate conversion on API submission

- **GIVEN** an area with 400x300px display size is created in the editor
- **AND** the editor display size is 800x800px
- **WHEN** the user clicks the send button
- **THEN** the area coordinates SHALL be converted to 1040x1040 base
- **AND** the converted coordinates SHALL be sent to LINE API
- **AND** x, y, width, height SHALL all be integer values

#### Scenario: Conversion when loading saved data

- **GIVEN** there is area data saved with 1040x1040 base coordinates
- **WHEN** the editor loads that data
- **THEN** the coordinates SHALL be converted to match the current editor display size
- **AND** the areas SHALL be displayed at correct positions and sizes

### Requirement: Area List and Area Management

The system SHALL display all created areas in a list and allow management.

#### Scenario: Display area list

- **GIVEN** 3 areas are created on the image
- **WHEN** the editor page is displayed
- **THEN** the area list SHALL show 3 areas as "Area 1", "Area 2", "Area 3"
- **AND** each area SHALL have a delete button

#### Scenario: Select from area list

- **GIVEN** multiple areas are displayed in the area list
- **WHEN** the user clicks "Area 2" in the area list
- **THEN** the corresponding area SHALL be highlighted in the editor
- **AND** the action settings for that area SHALL be displayed in ActionEditor

#### Scenario: Delete area

- **GIVEN** "Area 2" is displayed in the area list
- **WHEN** the user clicks the delete button for "Area 2"
- **THEN** a confirmation dialog SHALL be displayed
- **WHEN** the user confirms deletion
- **THEN** "Area 2" SHALL be removed from the area list
- **AND** the corresponding area SHALL be removed from the editor

### Requirement: Action Configuration

The system SHALL allow users to configure URI action or Message action for each area.

#### Scenario: Configure URI action

- **GIVEN** an area is selected
- **AND** ActionEditor is displayed
- **WHEN** the user selects "URI" as action type
- **AND** the user enters "https://example.com/page1" in the URI input field
- **THEN** the selected area's action SHALL be updated to URI type
- **AND** linkUri SHALL be set to "https://example.com/page1"

#### Scenario: Configure Message action

- **GIVEN** an area is selected
- **AND** ActionEditor is displayed
- **WHEN** the user selects "Message" as action type
- **AND** the user enters "このエリアがタップされました" in the text input field
- **THEN** the selected area's action SHALL be updated to Message type
- **AND** text SHALL be set to "このエリアがタップされました"

#### Scenario: Validate action

- **GIVEN** an area is selected
- **AND** the action type is "URI"
- **WHEN** the user enters an invalid URL (e.g. "not a url")
- **THEN** an error message SHALL be displayed
- **AND** the send button SHALL be disabled

### Requirement: Real-time Preview

The system SHALL display configured content in real-time preview.

#### Scenario: Initial preview display

- **GIVEN** an image is uploaded
- **AND** 2 areas are created
- **WHEN** the preview section is displayed
- **THEN** the image SHALL be displayed in LINE-style message UI
- **AND** the 2 areas SHALL be displayed as semi-transparent overlays

#### Scenario: Update preview on area addition

- **GIVEN** preview is displayed
- **WHEN** a new area is created
- **THEN** the preview SHALL be automatically updated
- **AND** the new area SHALL be displayed in the preview

#### Scenario: Update preview on action change

- **GIVEN** an area is selected
- **AND** preview is displayed
- **WHEN** the action type is changed from "URI" to "Message"
- **THEN** the area display in preview SHALL be updated
- **AND** the action details SHALL be displayed in a tooltip or info panel

### Requirement: Form Validation and Submission

The system SHALL validate that all required fields are correctly filled before submission.

#### Scenario: Submit with complete input

- **GIVEN** an image is uploaded
- **AND** at least one area is created
- **AND** all areas have valid actions configured
- **AND** a target user is selected
- **AND** alt text is entered
- **WHEN** the user clicks the send button
- **THEN** the form SHALL pass validation
- **AND** the message SHALL be sent to LINE API
- **AND** a success message SHALL be displayed

#### Scenario: Attempt to submit without image upload

- **GIVEN** no image is uploaded
- **WHEN** the user clicks the send button
- **THEN** an error message "画像をアップロードしてください" SHALL be displayed
- **AND** the submission SHALL NOT be executed

#### Scenario: Attempt to submit without creating areas

- **GIVEN** an image is uploaded
- **AND** no areas are created
- **WHEN** the user clicks the send button
- **THEN** an error message "少なくとも1つのタップエリアを作成してください" SHALL be displayed
- **AND** the submission SHALL NOT be executed

#### Scenario: Attempt to submit with invalid action

- **GIVEN** an image is uploaded
- **AND** an area is created
- **AND** one area's URI action is an invalid URL ("not a url")
- **WHEN** the user clicks the send button
- **THEN** an error message "Area 1: 有効なURLを入力してください" SHALL be displayed
- **AND** the corresponding area SHALL be highlighted
- **AND** the submission SHALL NOT be executed

### Requirement: Error Handling

The system SHALL display appropriate error messages for all error cases.

#### Scenario: Image upload failure

- **GIVEN** a user is attempting to upload an image
- **WHEN** an error response is returned from Cloudinary API
- **THEN** an error message "画像のアップロードに失敗しました。もう一度お試しください。" SHALL be displayed
- **AND** the state SHALL return to before upload attempt

#### Scenario: Message send failure

- **GIVEN** all inputs are valid
- **WHEN** the user clicks the send button
- **AND** an error response is returned from LINE API
- **THEN** an error message "メッセージの送信に失敗しました" SHALL be displayed
- **AND** detailed error information SHALL be displayed
- **AND** the form input SHALL be preserved

#### Scenario: Network error

- **GIVEN** a user is attempting to send a message
- **WHEN** a network error occurs
- **THEN** an error message "ネットワークエラーが発生しました。接続を確認してください。" SHALL be displayed
- **AND** a retry button SHALL be displayed

### Requirement: Integration with Existing Features

The system SHALL allow the new editor UI to coexist with the existing manual input UI.

#### Scenario: Switch between visual editor and manual input

- **GIVEN** a user is on the rich message page
- **WHEN** the user clicks the "手動入力モード" toggle
- **THEN** the visual editor SHALL be hidden
- **AND** the traditional baseURL manual input field SHALL be displayed
- **AND** the area coordinate manual input fields SHALL be displayed

#### Scenario: Save send history

- **GIVEN** a user created a rich message using the visual editor
- **WHEN** the user sends the message
- **THEN** the message SHALL be saved to the database
- **AND** MessageType SHALL be "RICH_MESSAGE"
- **AND** imagemap data SHALL be saved in the content field
- **AND** the message SHALL be viewable in the send history page
