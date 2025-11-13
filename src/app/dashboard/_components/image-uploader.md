# ImageUploader Component

A reusable React component for uploading images to Cloudinary with comprehensive validation and user feedback.

## Features

- **File Selection**: Click to browse or button to select files
- **Drag & Drop**: Visual feedback during drag operations
- **Clipboard Paste**: Paste images directly with Cmd/Ctrl+V
- **Progress Indicator**: Real-time upload progress display
- **Validation**:
  - File type: JPEG/PNG only
  - File size: 10MB maximum
  - Image dimensions: 1024x1024px minimum
- **Error Handling**: Clear error messages for validation and upload failures
- **Dark Theme**: Tailwind CSS styled to match the application theme

## Usage

```tsx
import { ImageUploader } from '@/app/dashboard/_components/image-uploader';

function MyForm() {
  const handleImageUploaded = (url: string) => {
    console.log('Image uploaded:', url);
    // Use the uploaded image URL
  };

  return (
    <ImageUploader
      onImageUploaded={handleImageUploaded}
      placeholder="カスタムプレースホルダー（オプション）"
    />
  );
}
```

## Props

### `onImageUploaded` (required)
- Type: `(url: string) => void`
- Callback function called when an image is successfully uploaded
- Receives the Cloudinary URL of the uploaded image

### `placeholder` (optional)
- Type: `string`
- Default: `"画像ファイルをドラッグ&ドロップ、貼り付け（Cmd/Ctrl+V）、または選択してください"`
- Custom placeholder text displayed in the drop area

## Validation Rules

### File Type
- Allowed: `image/jpeg`, `image/png`
- Error message: "JPEG または PNG 形式の画像ファイルを選択してください"

### File Size
- Maximum: 10MB
- Error message: "ファイルサイズは 10MB 以下にしてください（現在: X.XXMBう）"

### Image Dimensions
- Minimum: 1024x1024px (width and height)
- Error message: "画像のサイズは 1024x1024px 以上にしてください（現在: WxHpx）"

## API Endpoint

The component uses the `/api/uploads/image` endpoint which:
- Accepts: `multipart/form-data` with a `file` field
- Returns: `{ secure_url, public_id, width, height }`
- Requires: Cloudinary environment variables (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)

## States

- **Idle**: Default state, ready for file selection
- **Dragging**: Visual feedback when dragging files over the drop area
- **Uploading**: Shows progress indicator (0-100%)
- **Success**: Shows checkmark icon briefly (3 seconds)
- **Error**: Displays error message with close button

## Testing

Comprehensive test suite included in `image-uploader.test.tsx`:

```bash
npm test -- src/app/dashboard/_components/image-uploader.test.tsx
```

Test coverage includes:
- Component rendering
- File selection
- Drag & drop functionality
- Clipboard paste
- All validation scenarios
- Upload success and error handling
- Progress indicator
- Error dismissal

## Example

See `image-uploader-example.tsx` for a complete working example with image preview.

## Styling

The component uses Tailwind CSS with dark theme colors:
- Background: `bg-slate-900`
- Border: `border-slate-700`
- Text: `text-slate-300`, `text-slate-400`
- Accent: `border-blue-500`, `bg-blue-500`
- Error: `text-red-400`, `border-red-500`
- Success: `text-emerald-400`

## Accessibility

- Keyboard accessible (Tab navigation)
- ARIA labels for screen readers
- Visual feedback for all states
- Clear error messages

## Browser Support

- Modern browsers with File API support
- Drag & Drop API
- Clipboard API
- Image constructor for dimension validation

## Dependencies

- React 18+
- lucide-react (icons: Upload, X, CheckCircle, AlertCircle)
- Tailwind CSS
- Cloudinary account and configuration
