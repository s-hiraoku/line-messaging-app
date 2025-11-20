---
name: Implement: Card Image Area Editor
description: Main orchestrator for implementing OpenSpec change 'add-card-image-area-editor'
category: Implementation
tags: [implementation, openspec, orchestrator, add-card-image-area-editor]
---

# OpenSpec Change Implementation: add-card-image-area-editor

## Change Overview

**Title**: カードタイプメッセージの画像エリア分割エディタの追加

**Summary**:
現在のカードタイプメッセージエディタ(商品、場所、人物、画像の4種類)に、LINE Official Account Manager と同等の画像エリア分割機能を追加します。ユーザーは画像上に最大10個の領域を定義し、各領域にテキストラベルとアクション(URI/Message/Postback)を設定できます。Canvas ベースのビジュアルエディタで直感的に操作可能です。

**Key Features**:
- Canvas ベースのビジュアルエディタ
- ドラッグ&リサイズによる領域編集
- テキストラベル配置
- ImageCropUploader との統合
- Jotai + localStorage による状態管理
- Cloudinary でのテキスト画像合成
- LINE Imagemap メッセージとしての送信

## Implementation Strategy
This command orchestrates specialized sub-agents to implement the change systematically.

**Generated Sub-Agents**:
- `/implement-add-card-image-area-editor-frontend` - Frontend implementation
- `/implement-add-card-image-area-editor-api` - API implementation
- `/implement-add-card-image-area-editor-test` - Test implementation

## Execution Phases

### Phase 1: Parallel Implementation
Frontend と API の実装は独立しているため、並列実行が可能です。

**Option A: 並列実行 (推奨)**
```bash
# フロントエンド実装
/implement-add-card-image-area-editor-frontend

# API実装 (並列実行可能)
/implement-add-card-image-area-editor-api
```

両方のエージェントを同時に実行することで、実装時間を短縮できます。

**Option B: 順次実行**
```bash
# 1. フロントエンド実装
/implement-add-card-image-area-editor-frontend

# 2. API実装
/implement-add-card-image-area-editor-api
```

順次実行する場合は、フロントエンド → API の順序を推奨します。

### Phase 2: Testing
実装完了後、テストを実行します:

```bash
/implement-add-card-image-area-editor-test
```

### Phase 3: Validation
最終検証を実行します:

```bash
# Type check
npx tsc --noEmit

# Run all tests
npm test

# Lint
npm run lint

# OpenSpec validation
openspec validate add-card-image-area-editor --strict
```

### Phase 4: Update Tasks
`openspec/changes/add-card-image-area-editor/tasks.md` を更新:
- 実装済みタスクに `[x]` チェックマークを追加
- 全ての要件が満たされていることを確認

## Progress Tracking

Use TodoWrite to track progress:
- [ ] Phase 1: Implementation complete
  - [ ] Frontend implementation
  - [ ] API implementation
- [ ] Phase 2: Tests complete
- [ ] Phase 3: Validation passed
- [ ] Phase 4: Tasks updated

## Implementation Details

### Phase 1: Frontend Implementation

**Responsibilities:**
- Canvas ベースのビジュアルエディタ (ImageAreaCanvas)
- 領域管理 UI (ImageAreaEditor, ImageAreaList, ImageAreaForm)
- 状態管理 (Jotai atoms, hooks)
- カードフォーム統合 (全4種類)
- localStorage 永続化
- キーボード操作・アクセシビリティ

**Key Files:**
- `src/app/dashboard/message-items/card/_components/image-area-*.tsx`
- `src/app/dashboard/message-items/card/_components/hooks/use-image-area-*.ts`
- `src/state/message/card-image-areas-atom.ts`
- `src/app/dashboard/message-items/card/_components/card-form-*.tsx` (更新)

**Run:**
```bash
/implement-add-card-image-area-editor-frontend
```

### Phase 1: API Implementation

**Responsibilities:**
- Cloudinary テキストオーバーレイ (`text-overlay.ts`)
- LINE Imagemap 変換ロジック (`imagemap-converter.ts`)
- payload-normalizer 拡張 (imageAreas 分岐処理)
- message-schemas 拡張 (imageAreaSchema)

**Key Files:**
- `src/lib/cloudinary/text-overlay.ts`
- `src/lib/line/imagemap-converter.ts`
- `src/lib/line/payload-normalizer.ts` (更新)
- `src/lib/line/message-schemas.ts` (更新)

**Run:**
```bash
/implement-add-card-image-area-editor-api
```

### Phase 2: Test Implementation

**Responsibilities:**
- ユニットテスト (validation, hooks, API)
- コンポーネントテスト (Canvas, Editor, List, Form)
- 統合テスト (カードフォーム, 送信フロー, localStorage)

**Key Files:**
- `src/app/dashboard/message-items/card/_components/**/*.test.tsx`
- `src/lib/cloudinary/text-overlay.test.ts`
- `src/lib/line/imagemap-converter.test.ts`

**Run:**
```bash
/implement-add-card-image-area-editor-test
```

## Error Handling

If any sub-agent reports issues:
1. Review the error message
2. Determine if it's a blocker
3. Fix the issue or adjust the plan
4. Re-run the failed sub-agent
5. Continue with remaining phases

## Direct Sub-Agent Execution

You can also run sub-agents directly for focused work:
- `/implement-add-card-image-area-editor-frontend` - Work on frontend only
- `/implement-add-card-image-area-editor-api` - Work on API only
- `/implement-add-card-image-area-editor-test` - Work on tests only

This is useful for:
- Iterating on a specific area
- Debugging issues
- Making adjustments

## Dependencies

**External:**
- Cloudinary SDK (既存)
- ImageCropUploader component (既存)
- ActionEditor component (既存)
- Jotai (既存)

**Internal:**
- Canvas patterns from Imagemap editor: `src/app/dashboard/message-items/rich/_components/`
- Card form patterns: `src/app/dashboard/message-items/card/_components/`

## Final Checklist

After all phases complete:
- [ ] All sub-agents completed successfully
- [ ] All tests pass (`npm test`)
- [ ] Type check passes (`npx tsc --noEmit`)
- [ ] Linter passes (`npm run lint`)
- [ ] OpenSpec validation passes (`openspec validate add-card-image-area-editor --strict`)
- [ ] Manual testing in browser:
  - [ ] ImageCropUploader で画像アップロード
  - [ ] 画像エリア分割トグル有効化
  - [ ] Canvas で領域追加・編集・削除
  - [ ] テキストラベル設定
  - [ ] アクション設定
  - [ ] カード送信 (Imagemap メッセージ)
  - [ ] LINE アプリでの表示確認
- [ ] Tasks.md updated with all checkmarks
- [ ] Implementation matches spec requirements

## Acceptance Criteria

From `tasks.md` Acceptance Criteria section:
- [ ] ユーザーが画像エリア分割機能を有効化できる
- [ ] ユーザーが画像上に最大10個の領域を追加できる
- [ ] ユーザーが各領域をドラッグ&リサイズできる
- [ ] ユーザーが各領域にテキストラベルを設定できる
- [ ] ユーザーが各領域にアクション(URI/Message/Postback)を設定できる
- [ ] ユーザーが領域を削除・並び替えできる
- [ ] テキストが Cloudinary で画像に合成される
- [ ] 画像エリア付きカードが LINE Imagemap メッセージとして送信される
- [ ] LINE アプリで正しく表示され、タップ可能である
- [ ] デスクトップ・タブレット・モバイルで動作する
- [ ] localStorage にデータが自動保存される
- [ ] ページリロード後にデータが復元される

## Reference
- Change location: `openspec/changes/add-card-image-area-editor/`
- Proposal: `openspec/changes/add-card-image-area-editor/proposal.md`
- Tasks: `openspec/changes/add-card-image-area-editor/tasks.md`
- Design: `openspec/changes/add-card-image-area-editor/design.md`
- Specs: `openspec/changes/add-card-image-area-editor/specs/card-image-area-editor/spec.md`

## Next Steps
After implementation is complete and validated:
```bash
# Deploy to production
# Then archive the change
/openspec:archive add-card-image-area-editor
```

## Implementation Tips

### Canvas Patterns
参考実装: `src/app/dashboard/message-items/rich/_components/imagemap-canvas.tsx`
- requestAnimationFrame for smooth rendering
- Mouse event handling for drag & resize
- Canvas coordinate system

### ImageCropUploader Integration
- Use `onImageUploaded` callback to get image URL
- Enable image area toggle after successful upload
- Respect aspect ratio presets per card type

### Cloudinary Text Overlay
- Use Transformation API with overlay parameter
- Font: 'Noto Sans JP' for Japanese support
- Background: semi-transparent black for readability

### LINE Imagemap Message
- baseUrl must not include file extension
- baseSize must match image dimensions
- actions array maps to image areas
- Postback actions must be converted to Message (Imagemap doesn't support Postback)

### State Management
- Use Jotai atoms for global state
- localStorage for persistence (debounce 3s)
- Clear localStorage on successful send

### Testing
- Mock Canvas API for component tests
- Mock Cloudinary API for unit tests
- Test keyboard interactions
- Test edge cases (max areas, min size, validation)
