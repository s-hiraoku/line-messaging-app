# Design: Add Image Crop Uploader

## Architecture

### Component Structure

```
ImageCropUploader (Main Component)
├── FileDropZone (Step 1: File Selection)
├── CropEditor (Step 2: Crop/Zoom/Adjust)
│   ├── react-easy-crop (Crop Area UI)
│   ├── ZoomSlider (Zoom Control)
│   └── AspectRatioSelector (Aspect Ratio Options)
└── UploadProgress (Step 3: Upload Status)
```

### State Management

```typescript
interface ImageCropUploaderState {
  // File selection
  selectedFile: File | null;

  // Crop editor
  isCropping: boolean;
  imageSrc: string | null;
  crop: { x: number; y: number };
  zoom: number;
  aspectRatio: number; // e.g., 1 for 1:1, 16/9 for 16:9
  croppedAreaPixels: Area | null; // From react-easy-crop

  // Upload
  isUploading: boolean;
  uploadProgress: number;
  uploadedUrl: string | null;

  // Error
  error: UploadError | null;
}
```

## Technical Decisions

### 1. Library Selection: react-easy-crop

**Why react-easy-crop?**
- ✅ Lightweight (~8KB gzipped)
- ✅ Touch-friendly (mobile support)
- ✅ Simple API
- ✅ TypeScript support
- ✅ Active maintenance
- ✅ Zoom and pan gestures built-in
- ✅ Aspect ratio enforcement

**Alternatives considered:**
- `react-image-crop`: More configuration required, less intuitive API
- `cropperjs`: Vanilla JS library, React wrapper adds complexity

### 2. Crop Implementation

**Client-side cropping using Canvas API:**

```typescript
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputFormat: 'image/jpeg' | 'image/png' = 'image/jpeg'
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx?.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas to Blob failed'));
      },
      outputFormat,
      0.95 // JPEG quality
    );
  });
}
```

**Why client-side?**
- ✅ Instant feedback (no server round-trip)
- ✅ Reduces server load
- ✅ Works offline
- ✅ Privacy-friendly (image doesn't leave browser until final upload)

### 3. Upload Flow

```
1. User selects image file
   ↓
2. Load into memory (FileReader → data URL)
   ↓
3. Show crop editor (react-easy-crop)
   ↓
4. User adjusts crop area and zoom
   ↓
5. User clicks "切り取る"
   ↓
6. Execute crop (Canvas API → Blob)
   ↓
7. Upload Blob to /api/uploads/image (existing endpoint)
   ↓
8. Return Cloudinary URL
```

**Upload API reuse:**
- ✅ Reuse existing `/api/uploads/image` endpoint
- ✅ No backend changes required
- ✅ Blob can be uploaded as FormData just like File object

### 4. Aspect Ratio Options

```typescript
const ASPECT_RATIOS = {
  FREE: 0,        // No constraint
  SQUARE: 1,      // 1:1 (for profile images, icons)
  LANDSCAPE: 16/9, // 16:9 (for banners, rich messages)
  PORTRAIT: 9/16,  // 9:16 (for vertical images)
} as const;
```

**Default:** FREE (user can choose any crop area)

### 5. Validation Rules

Same as existing `ImageUploader`:
- **File types:** JPEG, PNG
- **Max file size:** 10MB
- **Min dimensions:** 1024x1024px (before crop)
- **Post-crop min dimensions:** 240x240px (configurable)

### 6. Error Handling

```typescript
type UploadError = {
  message: string;
  type: 'validation' | 'crop' | 'upload';
};

// Examples:
// - Validation: "JPEG または PNG 形式の画像ファイルを選択してください"
// - Crop: "画像の切り取りに失敗しました"
// - Upload: "アップロードに失敗しました: [reason]"
```

### 7. Component API

```typescript
type AspectRatioPreset = 'FREE' | 'SQUARE' | 'LANDSCAPE' | 'PORTRAIT';

interface CustomAspectRatio {
  label: string;
  value: number; // e.g., 16/9, 4/3, 1/1
}

interface ImageCropUploaderProps {
  /** Callback fired when image is successfully uploaded */
  onImageUploaded: (url: string) => void;

  /** Default aspect ratio (default: 'FREE') */
  defaultAspectRatio?: AspectRatioPreset | number;

  /** Available aspect ratio options for the selector
   * If not provided, defaults to all presets: FREE, SQUARE, LANDSCAPE, PORTRAIT
   * Can be a mix of presets and custom ratios
   */
  aspectRatioOptions?: Array<AspectRatioPreset | CustomAspectRatio>;

  /** Allow aspect ratio selection in UI (default: true)
   * If false, only the defaultAspectRatio is used (no selector shown)
   */
  allowAspectRatioChange?: boolean;

  /** Minimum dimensions after crop (default: 240x240) */
  minCroppedWidth?: number;
  minCroppedHeight?: number;

  /** Custom placeholder text */
  placeholder?: string;
}
```

**使用例**:

```tsx
// Example 1: Use preset aspect ratios
<ImageCropUploader
  onImageUploaded={handleUpload}
  defaultAspectRatio="SQUARE"
  aspectRatioOptions={['SQUARE', 'LANDSCAPE']}
/>

// Example 2: Fixed aspect ratio (no selection)
<ImageCropUploader
  onImageUploaded={handleUpload}
  defaultAspectRatio="SQUARE"
  allowAspectRatioChange={false}
/>

// Example 3: Custom aspect ratios
<ImageCropUploader
  onImageUploaded={handleUpload}
  defaultAspectRatio={4/3}
  aspectRatioOptions={[
    'FREE',
    'SQUARE',
    { label: '4:3', value: 4/3 },
    { label: '2:3', value: 2/3 },
  ]}
/>

// Example 4: Default behavior (all presets available)
<ImageCropUploader onImageUploaded={handleUpload} />
```

## UI/UX Considerations

### Modal vs Inline

**Decision: Modal Dialog**
- ✅ Focuses user attention on crop task
- ✅ Doesn't disturb page layout
- ✅ Common pattern in image editors
- ✅ Easy to dismiss (ESC key, backdrop click)

### Layout

```
┌─────────────────────────────────────────┐
│  画像クロップ                       × │ ← Header
├─────────────────────────────────────────┤
│                                         │
│   ┌───────────────────────────────┐   │
│   │                               │   │
│   │   [Crop Area - Fixed Center]  │   │ ← react-easy-crop
│   │   画像をドラッグして位置調整   │   │ ← クロップ領域は中央固定
│   │                               │   │ ← 画像のみドラッグ・ズーム可能
│   └───────────────────────────────┘   │
│                                         │
│   ズーム: [────●─────] 100%            │ ← Zoom Slider
│                                         │
├─────────────────────────────────────────┤
│               [キャンセル] [切り取る]   │ ← Footer
└─────────────────────────────────────────┘
```

**注**: アスペクト比はコンポーネントのPropsで指定するため、UI上にセレクターは表示しません。

### Responsive Design

- **Desktop:** Full modal (600px width)
- **Tablet:** Full modal (90% width)
- **Mobile:** Full screen modal

## Performance Considerations

1. **Image loading:** Use `createImage()` helper to load image asynchronously
2. **Canvas operations:** Perform crop on user action (not on every state change)
3. **Memory management:** Revoke object URLs after use
4. **Large images:** Consider downscaling if original > 4000px (configurable)

## Accessibility

- ✅ Keyboard navigation (Tab, Enter, ESC)
- ✅ ARIA labels for all interactive elements
- ✅ Focus management (trap focus in modal)
- ✅ Screen reader announcements for state changes

## Future Enhancements (Out of Scope)

- Image rotation (90°, 180°, 270°)
- Image filters (brightness, contrast, saturation)
- Multiple image crop (batch processing)
- Undo/Redo for crop adjustments
- Save crop presets
