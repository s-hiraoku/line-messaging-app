# Capability: Image Upload

## Overview

This capability provides image upload functionality for the LINE messaging application, allowing users to upload images to Cloudinary for use in messages, rich menus, and other features.

## ADDED Requirements

### Requirement: Image Crop and Zoom

The system SHALL provide crop and zoom functionality to allow users to adjust images before uploading, ensuring images meet LINE messaging requirements and design standards.

#### Scenario: User crops image with zoom control

**Given** a user has selected an image file (JPEG or PNG)
**When** the crop editor is displayed
**Then** the user can:
- See the image in a crop area fixed at the center of the modal
- Zoom in and out using a slider control (range: 1x to 3x)
- Pan the image by dragging (crop area remains fixed)
- See a visual indication of the crop boundaries
- The crop area aspect ratio is determined by the component's props

#### Scenario: User executes crop

**Given** a user has adjusted the crop area and zoom
**When** the user clicks the "切り取る" (Crop) button
**Then**:
- The image is cropped using Canvas API on the client side
- A new Blob is generated from the cropped image
- The Blob is uploaded to Cloudinary via `/api/uploads/image`
- Upload progress is displayed (0% to 100%)
- On success, the Cloudinary URL is returned via callback
- On failure, an error message is displayed

#### Scenario: User cancels crop

**Given** a user is in the crop editor
**When** the user clicks the "キャンセル" (Cancel) button or presses ESC
**Then**:
- The crop editor closes
- No upload occurs
- The component returns to the initial file selection state

### Requirement: File Validation for Crop Uploader

The crop uploader SHALL validate files using the same rules as the existing `ImageUploader` to maintain consistency.

#### Scenario: File type validation

**Given** a user selects or drops a file
**When** the file type is not JPEG or PNG
**Then**:
- The file is rejected
- An error message is displayed: "JPEG または PNG 形式の画像ファイルを選択してください"
- The crop editor does not open

#### Scenario: File size validation

**Given** a user selects or drops a file
**When** the file size exceeds 10MB
**Then**:
- The file is rejected
- An error message displays the current size and maximum allowed size
- The crop editor does not open

#### Scenario: Image dimension validation (pre-crop)

**Given** a user selects or drops an image file
**When** the image dimensions are less than 1024x1024 pixels
**Then**:
- The file is rejected
- An error message displays the current dimensions and minimum required
- The crop editor does not open

#### Scenario: Cropped image dimension validation

**Given** a user has adjusted the crop area
**When** the resulting cropped image would be smaller than the minimum dimensions (default: 240x240px)
**Then**:
- The crop button is disabled
- A warning message is displayed below the crop area
- The user must adjust the crop or zoom to meet minimum dimensions

### Requirement: File Input Methods

The crop uploader SHALL support multiple file input methods for user convenience.

#### Scenario: File selection via file picker

**Given** the crop uploader is displayed
**When** the user clicks "ファイルを選択" or clicks anywhere in the drop zone
**Then**:
- A file picker dialog opens
- Only JPEG and PNG files are selectable (via file filter)
- After selection, the file is validated and the crop editor opens if valid

#### Scenario: File drag and drop

**Given** the crop uploader is displayed
**When** the user drags an image file over the drop zone
**Then**:
- The drop zone highlights (border color changes to blue)
- When the file is dropped:
  - The file is validated
  - The crop editor opens if the file is valid
  - An error message is displayed if the file is invalid

#### Scenario: File paste from clipboard

**Given** the crop uploader is displayed and focused
**When** the user pastes an image from clipboard (Cmd/Ctrl+V)
**Then**:
- The pasted image is validated
- The crop editor opens if the image is valid
- An error message is displayed if the image is invalid

### Requirement: Crop Editor UI Controls

The crop editor SHALL provide intuitive controls for image adjustment.

#### Scenario: Zoom slider interaction

**Given** the crop editor is open
**When** the user moves the zoom slider
**Then**:
- The zoom value displays as a percentage (100% to 300%)
- The image zooms smoothly in real-time
- The crop area remains centered and fixed size
- The image scales proportionally

#### Scenario: Image panning with mouse/touch

**Given** the crop editor is open and the image is zoomed
**When** the user drags the image
**Then**:
- The image moves in the direction of the drag
- The crop area remains fixed at the center of the modal
- Panning is bounded (image cannot be dragged completely out of crop area)
- On touch devices, single-finger drag pans, pinch zooms

### Requirement: Upload Progress and Feedback

The system SHALL provide clear feedback to users during the upload process.

#### Scenario: Upload progress indication

**Given** the user has clicked "切り取る"
**When** the cropped image is being uploaded
**Then**:
- The crop editor UI is disabled (no interaction allowed)
- A progress bar is displayed showing 0% to 100%
- The current percentage is displayed as text
- The "切り取る" button text changes to "アップロード中..."

#### Scenario: Upload success feedback

**Given** the image upload has completed successfully
**When** the Cloudinary URL is received
**Then**:
- A success message is displayed briefly (3 seconds)
- The component returns to the initial state
- The `onImageUploaded` callback is called with the Cloudinary URL

#### Scenario: Upload error feedback

**Given** the image upload has failed
**When** an error occurs (network error, API error, etc.)
**Then**:
- An error message is displayed with the specific error reason
- The crop editor remains open
- The user can retry by clicking "切り取る" again
- The user can cancel and start over

### Requirement: Responsive Design

The crop uploader SHALL work correctly on all device sizes.

#### Scenario: Desktop display

**Given** the viewport width is >= 1024px
**When** the crop editor opens
**Then**:
- The crop editor is displayed as a centered modal (600px width)
- The crop area has sufficient space for comfortable editing
- All controls (slider, buttons) are easily accessible

#### Scenario: Tablet display

**Given** the viewport width is between 768px and 1023px
**When** the crop editor opens
**Then**:
- The crop editor modal uses 90% of viewport width
- The crop area scales proportionally
- Touch interactions work smoothly

#### Scenario: Mobile display

**Given** the viewport width is < 768px
**When** the crop editor opens
**Then**:
- The crop editor is displayed full-screen
- The crop area uses maximum available space
- Touch gestures (pinch zoom, pan) work correctly
- All buttons are large enough for touch interaction

### Requirement: Keyboard Accessibility

The crop uploader SHALL be fully keyboard accessible.

#### Scenario: Focus management in modal

**Given** the crop editor modal is open
**When** the user presses Tab
**Then**:
- Focus cycles through interactive elements in order:
  1. Close button (×)
  2. Zoom slider
  3. Cancel button
  4. Crop button
- Focus is trapped within the modal (does not move to background content)
- First element is focused when modal opens

#### Scenario: ESC key to cancel

**Given** the crop editor modal is open
**When** the user presses the ESC key
**Then**:
- The modal closes immediately
- No upload occurs
- Focus returns to the trigger element (if applicable)

#### Scenario: Enter key to confirm crop

**Given** the crop editor modal is open and the crop button is focused
**When** the user presses Enter
**Then**:
- The crop operation is triggered (same as clicking the button)
- The upload process begins

### Requirement: Error Handling

The crop uploader SHALL handle all error scenarios gracefully.

#### Scenario: Network error during upload

**Given** the user has clicked "切り取る"
**When** a network error occurs during upload
**Then**:
- An error message is displayed: "ネットワークエラーが発生しました。インターネット接続を確認してください。"
- The crop editor remains open
- The user can retry the upload

#### Scenario: API error response

**Given** the user has clicked "切り取る"
**When** the Cloudinary API returns an error
**Then**:
- An error message is displayed with the API error message
- The crop editor remains open
- The user can retry or cancel

#### Scenario: Canvas crop failure

**Given** the user has clicked "切り取る"
**When** the Canvas API fails to generate the cropped image
**Then**:
- An error message is displayed: "画像の切り取りに失敗しました。別の画像を選択してください。"
- The crop editor remains open
- The user can try adjusting the crop or select a different image

### Requirement: Component Integration

The crop uploader SHALL integrate seamlessly with existing application components.

#### Scenario: API compatibility with existing uploader

**Given** the application uses the existing `ImageUploader` API
**When** developers switch to `ImageCropUploader`
**Then**:
- The same props interface is supported:
  - `onImageUploaded: (url: string) => void`
  - `placeholder?: string`
- Additional optional props are available:
  - `defaultAspectRatio?: AspectRatioPreset | number`
  - `aspectRatioOptions?: Array<AspectRatioPreset | CustomAspectRatio>`
  - `allowAspectRatioChange?: boolean`
  - `minCroppedWidth?: number`
  - `minCroppedHeight?: number`

#### Scenario: Configurable aspect ratio via props

**Given** a developer wants to customize available aspect ratios
**When** they pass `aspectRatioOptions` prop
**Then**:
- Only the specified aspect ratios appear in the selector
- Example: `aspectRatioOptions={['SQUARE', 'LANDSCAPE']}` shows only 2 options
- Example: `aspectRatioOptions={[{ label: '4:3', value: 4/3 }]}` shows custom ratio

#### Scenario: Fixed aspect ratio mode

**Given** a developer wants to enforce a specific aspect ratio
**When** they pass `allowAspectRatioChange={false}` and `defaultAspectRatio="SQUARE"`
**Then**:
- The aspect ratio selector is hidden from the UI
- The crop area is locked to the specified ratio
- Users cannot change the aspect ratio

#### Scenario: Reuse of existing upload endpoint

**Given** the cropped image Blob is ready
**When** the upload is initiated
**Then**:
- The Blob is sent to `/api/uploads/image` as FormData
- The same validation and upload logic is used
- The Cloudinary response format is identical
- No backend changes are required
