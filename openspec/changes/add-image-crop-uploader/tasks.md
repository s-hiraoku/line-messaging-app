# Tasks: Add Image Crop Uploader

## Phase 1: Dependencies and Setup
- [x] Install `react-easy-crop` package
- [x] Review existing `ImageUploader` component implementation
- [x] Create utility functions for image cropping (Canvas API)

## Phase 2: Core Component Implementation
- [x] Create `ImageCropUploader` component file (`src/app/dashboard/_components/image-crop-uploader.tsx`)
- [x] Implement image file loading (drag&drop, file input, paste)
- [x] Integrate `react-easy-crop` for crop area UI (crop area fixed at center)
- [x] Add zoom slider control
- [x] Implement aspect ratio control via props (no UI selector)
- [x] Add crop execution logic (Canvas API → Blob generation)
- [x] Integrate Cloudinary upload (reuse existing `/api/uploads/image`)
- [x] Implement state management (loading, cropping, uploading states)

## Phase 3: UI/UX Enhancement
- [x] Design crop editor modal/dialog layout
- [x] Add "切り取る" (Crop) and "キャンセル" (Cancel) buttons
- [x] Implement upload progress indicator
- [x] Add error handling and error messages
- [x] Style with Tailwind CSS matching existing design
- [x] Ensure responsive design (mobile, tablet, desktop)

## Phase 4: Validation and Error Handling
- [x] Implement file type validation (JPEG, PNG)
- [x] Implement file size validation (10MB max)
- [x] Implement minimum dimension validation (1024x1024px)
- [x] Add appropriate error messages for each validation failure
- [x] Handle network errors during upload

## Phase 5: Testing
- [ ] Write unit tests for crop utility functions
- [ ] Write component tests with React Testing Library
- [ ] Test file drag&drop functionality
- [ ] Test paste functionality
- [ ] Test zoom and pan interactions
- [ ] Test aspect ratio via props (different aspect ratios)
- [ ] Test upload flow (mock Cloudinary API)
- [ ] Test error scenarios

## Phase 6: Integration
- [x] Create example usage page (`src/app/dashboard/_components/image-crop-uploader-example.tsx`)
- [x] Update TypeScript types if needed
- [x] Verify accessibility (keyboard navigation, ARIA labels)
- [ ] Test cross-browser compatibility (Chrome, Firefox, Safari)

## Phase 7: Documentation
- [x] Add JSDoc comments to component and utility functions
- [x] Document component props and usage
- [x] Add code examples in example file
- [ ] Update CLAUDE.md if new patterns are introduced

## Acceptance Criteria
- [ ] All unit tests pass (tests to be written)
- [ ] Component tests pass (tests to be written)
- [x] Type checking passes (`npx tsc --noEmit`)
- [x] Linting passes (`npm run lint`)
- [ ] Component works in all supported browsers (manual testing required)
- [x] Component is responsive on all screen sizes
- [x] Error handling is comprehensive and user-friendly
- [x] Upload to Cloudinary succeeds with cropped image
