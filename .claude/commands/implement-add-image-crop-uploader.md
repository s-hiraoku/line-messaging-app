---
name: Implement: Add Image Crop Uploader
description: Implementation for OpenSpec change 'add-image-crop-uploader'
category: Implementation
tags: [implementation, openspec, add-image-crop-uploader, frontend, react, image-upload]
---

# OpenSpec Change Implementation: add-image-crop-uploader

## Change Overview

**Problem**: 現在の `ImageUploader` コンポーネントは画像ファイルをそのままアップロードする機能しかなく、LINEメッセージングアプリでリッチメッセージやカード型メッセージを作成する際に画像を適切なサイズや比率に調整できません。

**Solution**: `ImageCropUploader` コンポーネントを作成し、画像のクロップ（切り取り）とズーム機能を提供します。

**主要機能**:
1. 画像選択（ドラッグ&ドロップ、ファイル選択、貼り付け）
2. クロップエディタ（画像のズーム・位置調整、クロップ領域は中央固定）
3. アスペクト比制御（Props経由、UI上にセレクター表示なし）
4. クロップ実行（Canvas API → Blob生成 → Cloudinaryアップロード）

**技術スタック**:
- `react-easy-crop`: React用画像クロップライブラリ
- Canvas API: クライアント側での画像クロップ
- 既存の `/api/uploads/image` エンドポイントを再利用

## Implementation Strategy

このchangeは **フロントエンド専用** の実装です：
- ✅ 新しいReactコンポーネント作成
- ✅ 既存の `ImageUploader` のパターンを踏襲
- ✅ Tailwind CSSでスタイリング
- ✅ Vitestでテスト
- ❌ バックエンド変更なし（既存APIを再利用）
- ❌ データベース変更なし

**実装フェーズ**:
1. Phase 1: 依存関係のインストールと既存コード理解
2. Phase 2: コア機能実装（コンポーネント + ユーティリティ）
3. Phase 3: UI/UX拡張とバリデーション
4. Phase 4: テスト実装
5. Phase 5: コードレビューと最終調整

## Execution Steps

### Phase 1: Setup and Exploration

**Step 1.1: Install react-easy-crop**
```bash
npm install react-easy-crop
```

**Step 1.2: Explore existing ImageUploader**
Launch Explore agent to understand the current implementation:

```
Subagent type: Explore
Thoroughness: medium
Prompt:
Explore the existing ImageUploader component and related code:

Files to examine:
- src/app/dashboard/_components/image-uploader.tsx
- src/app/api/uploads/image/route.ts (upload endpoint)

Focus on:
1. File validation logic (file types, size, dimensions)
2. Upload flow (FormData, fetch, progress handling)
3. Error handling patterns
4. UI/UX patterns (Tailwind CSS classes, error display)
5. Props interface design

Report:
- Validation constants (ALLOWED_TYPES, MAX_FILE_SIZE, MIN_DIMENSION)
- Upload API endpoint details
- Error message formats
- Reusable patterns for the new component
```

### Phase 2: Core Implementation

**Step 2.1: Create crop utility functions**
Launch frontend-refactoring-expert to create utility functions:

```
Subagent type: frontend-refactoring-expert
Prompt:
Create utility functions for image cropping in a new file:
`src/lib/crop-utils.ts`

Implement the following functions based on design.md specifications:

1. `createImage(url: string): Promise<HTMLImageElement>`
   - Load image from URL asynchronously
   - Handle errors appropriately

2. `getCroppedImg(imageSrc: string, pixelCrop: Area, outputFormat?: 'image/jpeg' | 'image/png'): Promise<Blob>`
   - Use Canvas API to crop image
   - Accept pixelCrop from react-easy-crop
   - Return Blob with 0.95 JPEG quality
   - Handle errors with meaningful messages

3. Type definition for Area (from react-easy-crop):
```typescript
interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

Requirements from spec.md:
- Client-side cropping using Canvas API
- Must handle Canvas to Blob conversion
- Error message: "画像の切り取りに失敗しました。別の画像を選択してください。"

Follow existing code patterns from src/app/dashboard/_components/image-uploader.tsx
```

**Step 2.2: Create ImageCropUploader component**
Launch frontend-refactoring-expert to create the main component:

```
Subagent type: frontend-refactoring-expert
Prompt:
Create the ImageCropUploader component:
`src/app/dashboard/_components/image-crop-uploader.tsx`

Component specifications (from design.md and spec.md):

**Props interface**:
```typescript
type AspectRatioPreset = 'FREE' | 'SQUARE' | 'LANDSCAPE' | 'PORTRAIT';

interface CustomAspectRatio {
  label: string;
  value: number;
}

interface ImageCropUploaderProps {
  onImageUploaded: (url: string) => void;
  defaultAspectRatio?: AspectRatioPreset | number;
  aspectRatioOptions?: Array<AspectRatioPreset | CustomAspectRatio>;
  allowAspectRatioChange?: boolean;
  minCroppedWidth?: number;
  minCroppedHeight?: number;
  placeholder?: string;
}
```

**State management**:
```typescript
interface ImageCropUploaderState {
  selectedFile: File | null;
  isCropping: boolean;
  imageSrc: string | null;
  crop: { x: number; y: number };
  zoom: number;
  aspectRatio: number;
  croppedAreaPixels: Area | null;
  isUploading: boolean;
  uploadProgress: number;
  uploadedUrl: string | null;
  error: UploadError | null;
}
```

**UI Layout** (from design.md):
```
┌─────────────────────────────────────────┐
│  画像クロップ                       × │ ← Header
├─────────────────────────────────────────┤
│   ┌───────────────────────────────┐   │
│   │   [Crop Area - Fixed Center]  │   │ ← react-easy-crop
│   │   画像をドラッグして位置調整   │   │ ← クロップ領域は中央固定
│   └───────────────────────────────┘   │ ← 画像のみドラッグ・ズーム可能
│   ズーム: [────●─────] 100%            │ ← Zoom Slider
├─────────────────────────────────────────┤
│               [キャンセル] [切り取る]   │ ← Footer
└─────────────────────────────────────────┘
```

**Implementation requirements**:

1. File Input Methods (Requirement from spec.md):
   - Drag & drop support
   - File picker dialog (click to open)
   - Paste from clipboard (Cmd/Ctrl+V)

2. File Validation (reuse from existing ImageUploader):
   - File types: JPEG, PNG only
   - Max file size: 10MB
   - Min dimensions before crop: 1024x1024px
   - Min dimensions after crop: 240x240px (configurable via props)

3. Crop Editor UI:
   - Modal dialog (center of screen)
   - Integrate react-easy-crop component
   - Crop area: FIXED at center (does not move)
   - Image: Draggable and zoomable (1x to 3x)
   - Zoom slider with percentage display (100% to 300%)
   - NO aspect ratio selector in UI (controlled by props only)

4. Crop Execution:
   - Use getCroppedImg utility from src/lib/crop-utils.ts
   - Generate Blob from Canvas
   - Upload to /api/uploads/image via FormData
   - Show upload progress (0% to 100%)
   - Call onImageUploaded callback with Cloudinary URL

5. Error Handling (from spec.md):
   - Validation errors: Display before crop editor opens
   - Crop errors: "画像の切り取りに失敗しました。別の画像を選択してください。"
   - Upload errors: Display error message, keep crop editor open, allow retry
   - Network errors: "ネットワークエラーが発生しました。インターネット接続を確認してください。"

6. Keyboard Accessibility:
   - Tab navigation: Close button → Zoom slider → Cancel → Crop
   - ESC key: Close modal
   - Enter key on Crop button: Execute crop
   - Focus trap within modal

7. Responsive Design:
   - Desktop (>= 1024px): 600px width modal
   - Tablet (768px - 1023px): 90% width modal
   - Mobile (< 768px): Full screen modal

8. Styling:
   - Use Tailwind CSS matching existing design
   - Follow patterns from existing ImageUploader
   - Dark theme colors (slate-800, slate-900)

Constants to define:
```typescript
const ASPECT_RATIOS = {
  FREE: 0,
  SQUARE: 1,
  LANDSCAPE: 16/9,
  PORTRAIT: 9/16,
} as const;

const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_DIMENSION = 1024;
const DEFAULT_MIN_CROPPED_DIMENSION = 240;
```

Return:
- Complete component implementation
- Files created
- Any issues or blockers
```

### Phase 3: UI Enhancement and Validation

**Step 3.1: Add comprehensive validation**
Launch frontend-refactoring-expert to enhance validation:

```
Subagent type: frontend-refactoring-expert
Prompt:
Enhance validation in ImageCropUploader component:

Add validation for:

1. **Pre-crop validation** (before crop editor opens):
   - File type: "JPEG または PNG 形式の画像ファイルを選択してください"
   - File size: "ファイルサイズは 10MB 以下にしてください（現在: X.XXMBs）"
   - Image dimensions: "画像のサイズは 1024x1024px 以上にしてください（現在: WxHpx）"

2. **Post-crop validation** (real-time in crop editor):
   - Monitor croppedAreaPixels from react-easy-crop
   - Calculate resulting crop dimensions
   - If < minCroppedWidth or < minCroppedHeight:
     - Disable "切り取る" button
     - Show warning: "切り取り後のサイズが小さすぎます。ズームまたは切り取り範囲を調整してください。"

3. **Error display patterns**:
   - Use same error UI as existing ImageUploader
   - Show error with AlertCircle icon
   - Allow dismissing errors
   - Clear errors when user takes corrective action

Follow error handling patterns from:
src/app/dashboard/_components/image-uploader.tsx

Return:
- Updated validation logic
- Error message components
- Real-time validation feedback
```

### Phase 4: Testing

**Step 4.1: Create unit tests for crop utilities**
Launch general-purpose agent to create tests:

```
Subagent type: general-purpose
Prompt:
Create unit tests for crop utility functions:
`src/lib/crop-utils.test.ts`

Test cases for getCroppedImg:
1. Successfully crops image with valid parameters
2. Returns Blob with correct MIME type (JPEG)
3. Returns Blob with correct MIME type (PNG)
4. Handles invalid image source
5. Handles Canvas toBlob failure
6. Respects JPEG quality parameter

Test cases for createImage:
1. Successfully loads valid image URL
2. Handles invalid image URL
3. Handles network errors

Use Vitest and @testing-library/react patterns from existing tests.
Reference: src/app/dashboard/_components/image-uploader.test.tsx (if exists)

Return:
- Test file with all test cases
- Mock setup for Canvas API
- Coverage report
```

**Step 4.2: Create component tests**
Launch general-purpose agent to create component tests:

```
Subagent type: general-purpose
Prompt:
Create component tests for ImageCropUploader:
`src/app/dashboard/_components/image-crop-uploader.test.tsx`

Test scenarios (from spec.md):

1. **File Input Methods**:
   - File selection via file picker
   - Drag and drop file
   - Paste from clipboard

2. **File Validation**:
   - Reject non-JPEG/PNG files
   - Reject files > 10MB
   - Reject images < 1024x1024px
   - Accept valid files

3. **Crop Editor**:
   - Opens crop editor on valid file
   - Displays zoom slider
   - Zoom value updates (100% to 300%)
   - Crop and Cancel buttons present

4. **Aspect Ratio Control**:
   - Uses defaultAspectRatio prop
   - No aspect ratio selector visible in UI
   - Crop area respects aspect ratio

5. **Crop Execution**:
   - Executes crop on button click
   - Shows upload progress
   - Calls onImageUploaded callback
   - Handles upload errors

6. **Keyboard Accessibility**:
   - ESC key closes modal
   - Tab navigation works
   - Enter key executes crop

7. **Error Handling**:
   - Displays validation errors
   - Displays crop errors
   - Displays upload errors
   - Allows retry after error

Mock:
- react-easy-crop component
- fetch for upload API
- Canvas API

Use Vitest + @testing-library/react
Follow patterns from existing tests

Return:
- Complete test file
- All test scenarios covered
- Test execution results
```

### Phase 5: Example and Documentation

**Step 5.1: Create example usage page**
Launch frontend-refactoring-expert to create example:

```
Subagent type: frontend-refactoring-expert
Prompt:
Create example usage page:
`src/app/dashboard/_components/image-crop-uploader-example.tsx`

Show multiple usage examples:

1. **Basic usage** (default settings):
```tsx
<ImageCropUploader onImageUploaded={(url) => console.log(url)} />
```

2. **Fixed square crop**:
```tsx
<ImageCropUploader
  onImageUploaded={(url) => console.log(url)}
  defaultAspectRatio="SQUARE"
  allowAspectRatioChange={false}
/>
```

3. **Landscape crop with custom min dimensions**:
```tsx
<ImageCropUploader
  onImageUploaded={(url) => console.log(url)}
  defaultAspectRatio="LANDSCAPE"
  minCroppedWidth={480}
  minCroppedHeight={270}
/>
```

4. **Custom aspect ratio (4:3)**:
```tsx
<ImageCropUploader
  onImageUploaded={(url) => console.log(url)}
  defaultAspectRatio={4/3}
/>
```

Include:
- Live preview of uploaded images
- Code snippets for each example
- Explanation of props

Style with Tailwind CSS matching dashboard pages

Return:
- Example file
- Usage instructions
```

**Step 5.2: Add JSDoc comments**
Launch frontend-refactoring-expert to add documentation:

```
Subagent type: frontend-refactoring-expert
Prompt:
Add comprehensive JSDoc comments to:
- src/app/dashboard/_components/image-crop-uploader.tsx
- src/lib/crop-utils.ts

Include:
- Component description
- Props documentation with examples
- Function parameter descriptions
- Return value descriptions
- Usage examples in @example tags

Follow JSDoc patterns from existing components

Return:
- Updated files with JSDoc comments
```

### Phase 6: Testing and Validation

**Step 6.1: Run all tests**
```bash
npm test -- image-crop-uploader
npm run lint
npx tsc --noEmit
```

**Step 6.2: Manual testing checklist**
Test in development mode:
1. ✅ File selection works (picker, drag&drop, paste)
2. ✅ Validation rejects invalid files
3. ✅ Crop editor opens with valid file
4. ✅ Zoom slider works (1x to 3x)
5. ✅ Image panning works (drag to adjust position)
6. ✅ Crop area stays fixed at center
7. ✅ Aspect ratio is controlled by props
8. ✅ "切り取る" button executes crop
9. ✅ Upload progress displays
10. ✅ Cloudinary URL is returned
11. ✅ Error messages display correctly
12. ✅ ESC key closes modal
13. ✅ Responsive on mobile, tablet, desktop
14. ✅ Keyboard navigation works

### Phase 7: Code Review

Launch frontend-code-reviewer to review all changes:

```
Subagent type: frontend-code-reviewer
Prompt:
Review all frontend changes for OpenSpec change 'add-image-crop-uploader':

Files to review:
- src/app/dashboard/_components/image-crop-uploader.tsx
- src/lib/crop-utils.ts
- src/app/dashboard/_components/image-crop-uploader-example.tsx
- src/lib/crop-utils.test.ts
- src/app/dashboard/_components/image-crop-uploader.test.tsx

Review for:
1. Code quality and best practices
2. Accessibility compliance (ARIA labels, keyboard navigation, focus management)
3. Performance optimizations (memo, useCallback, memory leaks)
4. Security considerations (XSS, file validation)
5. Semantic HTML usage
6. TypeScript type safety
7. Error handling completeness
8. Responsive design
9. Consistency with existing codebase patterns

Report findings and suggest improvements.
```

## Progress Tracking

Use TodoWrite to track progress:

```typescript
todos: [
  { content: "Phase 1: Install react-easy-crop", status: "pending", activeForm: "Installing react-easy-crop" },
  { content: "Phase 1: Explore existing ImageUploader", status: "pending", activeForm: "Exploring existing ImageUploader" },
  { content: "Phase 2: Create crop utility functions", status: "pending", activeForm: "Creating crop utility functions" },
  { content: "Phase 2: Create ImageCropUploader component", status: "pending", activeForm: "Creating ImageCropUploader component" },
  { content: "Phase 3: Add comprehensive validation", status: "pending", activeForm: "Adding comprehensive validation" },
  { content: "Phase 4: Create unit tests for crop utilities", status: "pending", activeForm: "Creating unit tests for crop utilities" },
  { content: "Phase 4: Create component tests", status: "pending", activeForm: "Creating component tests" },
  { content: "Phase 5: Create example usage page", status: "pending", activeForm: "Creating example usage page" },
  { content: "Phase 5: Add JSDoc comments", status: "pending", activeForm: "Adding JSDoc comments" },
  { content: "Phase 6: Run tests and validation", status: "pending", activeForm: "Running tests and validation" },
  { content: "Phase 7: Frontend code review", status: "pending", activeForm: "Running frontend code review" },
]
```

## Final Checklist

After all phases complete:
1. ✅ All tests pass (`npm test`)
2. ✅ Linting passes (`npm run lint`)
3. ✅ Type checking passes (`npx tsc --noEmit`)
4. ✅ Manual testing complete
5. ✅ Code review complete
6. ✅ All tasks in `openspec/changes/add-image-crop-uploader/tasks.md` checked
7. ✅ Component works on mobile, tablet, desktop
8. ✅ Accessibility verified (keyboard navigation, ARIA)
9. ✅ Documentation complete (JSDoc, examples)

## Reference
- Change location: `openspec/changes/add-image-crop-uploader/`
- Proposal: `openspec/changes/add-image-crop-uploader/proposal.md`
- Tasks: `openspec/changes/add-image-crop-uploader/tasks.md`
- Design: `openspec/changes/add-image-crop-uploader/design.md`
- Specs: `openspec/changes/add-image-crop-uploader/specs/image-upload/spec.md`

## Notes

- **No backend changes**: Reuses existing `/api/uploads/image` endpoint
- **No database changes**: Pure frontend component
- **Aspect ratio control**: Via props only, no UI selector
- **Crop area**: Fixed at center of modal, image is draggable/zoomable
- **Upload flow**: Canvas → Blob → FormData → Cloudinary
