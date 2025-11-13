---
name: Implement: Card Message Editor
description: Implementation for OpenSpec change 'add-card-message-editor'
category: Implementation
tags: [implementation, openspec, add-card-message-editor]
---

# OpenSpec Change Implementation: add-card-message-editor

## Change Overview

現在のカードメッセージ送信機能は3つの固定カードをハードコードで送信する簡易実装です。この実装では、LINE Official Account Managerと同等のカードタイプメッセージエディタを構築します。

**主な機能:**
- 4種類のカードタイプ（商品、場所、人物、画像）
- カードの動的管理（追加・編集・削除、最大9枚）
- ドラッグ&ドロップでの並び替え
- 各カードに最大3つのアクションボタン
- カルーセルプレビュー
- localStorage による自動保存

## Implementation Strategy

**技術スタック:**
- State Management: React useState（シンプルさ重視）
- Drag & Drop: @dnd-kit/core（モダン、軽量）
- Image Upload: 既存 ImageUploader コンポーネント
- Validation: リアルタイム + 送信前チェック

**実装アプローチ:**
1. **Phase 1**: 型定義とユーティリティ（基盤）
2. **Phase 2-3**: コンポーネント実装（並列実行可能）
3. **Phase 4**: 統合とテスト

## Execution Steps

### Phase 1: Foundation - Types and Utils

Task: Create type definitions and utility functions
```
Subagent type: frontend-refactoring-expert
Prompt:
You are implementing the foundation for the card message editor (OpenSpec change 'add-card-message-editor').

Context:
- Change ID: add-card-message-editor
- This is a complete rewrite of src/app/dashboard/message-items/card/page.tsx
- Reference implementation: src/app/dashboard/message-items/rich/ (similar pattern)

Implementation tasks:

1. Create `src/app/dashboard/message-items/card/_components/types.ts`:
   - CardType enum: 'product' | 'location' | 'person' | 'image'
   - BaseCard interface with id, type, imageUrl, actions[]
   - ProductCard extends BaseCard with title, description, price?
   - LocationCard extends BaseCard with title, address, hours?
   - PersonCard extends BaseCard with name, description, tags?
   - ImageCard extends BaseCard with title?, description?
   - Card union type
   - URIAction, MessageAction, PostbackAction interfaces
   - CardAction union type
   - CardFormState interface

2. Create `src/app/dashboard/message-items/card/_components/utils.ts`:
   - validateCard(card: Card): ValidationError[] function
   - validateAction(action: CardAction): ValidationError[] function
   - cardToCarouselColumn(card: Card): CarouselColumn function
   - createDefaultCard(type: CardType): Card function

Validation rules (from design.md lines 405-523):
- Product: title 1-40 chars, description 1-60 chars, price >= 0
- Location: title 1-40 chars, address 1-60 chars, hours max 60 chars
- Person: name 1-40 chars, description 1-60 chars, tags max 20 chars each
- Image: title max 40 chars, description max 60 chars
- Actions: label 1-20 chars, max 3 actions per card, min 1 action
- All cards: imageUrl required, HTTPS only

LINE API conversion (from design.md lines 149-198):
- Product: text = description + "\n価格: {price}円" (if price exists)
- Location: text = address + "\n営業時間: {hours}" (if hours exists)
- Person: text = description + "\n#{tag1} #{tag2}..." (if tags exist)
- Image: text = description or ' ' (LINE requires text field)

Return:
- Summary of created files
- TypeScript types overview
- Validation rules implemented
```

### Phase 2: Core Components (Parallel Implementation)

**Launch these agents in parallel using a single message with multiple Task tool calls:**

Task 1: ActionEditor Component
```
Subagent type: frontend-refactoring-expert
Prompt:
Implement ActionEditor component for card message editor (OpenSpec change 'add-card-message-editor').

Create `src/app/dashboard/message-items/card/_components/action-editor.tsx`:

Props:
- actions: CardAction[]
- onChange: (actions: CardAction[]) => void
- maxActions?: number (default: 3)

Features:
- Add/edit/delete actions (max 3)
- Action type selection: URI, Message, Postback
- Type-specific input fields:
  - URI: label (max 20), uri (HTTPS)
  - Message: label (max 20), text (max 300)
  - Postback: label (max 20), data (max 300), displayText? (optional)
- Real-time validation
- Error display

UI Requirements:
- Tailwind CSS dark theme (match existing app style)
- Add action button (disabled if maxActions reached)
- Delete button for each action
- Clear validation error messages

Return summary of implementation.
```

Task 2: CardList Component
```
Subagent type: frontend-refactoring-expert
Prompt:
Implement CardList component for card message editor (OpenSpec change 'add-card-message-editor').

Create `src/app/dashboard/message-items/card/_components/card-list.tsx`:

Props:
- cards: Card[]
- selectedId: string | null
- onSelect: (id: string) => void
- onDelete: (id: string) => void
- onReorder: (oldIndex: number, newIndex: number) => void
- onAdd: () => void

Features:
- Display card list with thumbnails
- Drag & drop reordering using @dnd-kit/core
- Add card button (disabled if 9 cards exist)
- Delete button for each card (disabled if only 1 card)
- Visual feedback for selected card
- Confirmation dialog for delete

Important:
- Install @dnd-kit/core if not already installed: npm install @dnd-kit/core
- Use @dnd-kit/sortable for list sorting
- Show card type icon/badge
- Display card count "X / 9"

Return summary of implementation and any dependencies added.
```

Task 3: CardPreview Component
```
Subagent type: frontend-refactoring-expert
Prompt:
Implement CardPreview component for card message editor (OpenSpec change 'add-card-message-editor').

Create `src/app/dashboard/message-items/card/_components/card-preview.tsx`:

Props:
- cards: Card[]

Features:
- Carousel-style display (horizontal scroll)
- Mock LINE UI styling
- Display based on card type:
  - Product: image, title, description + price
  - Location: image, title, address + hours
  - Person: image, name, description + tags
  - Image: image, title, description
- Show action buttons (non-functional in preview)
- Responsive layout

UI Requirements:
- Use Tailwind CSS
- Mock LINE message bubble appearance
- Smooth horizontal scroll
- Show "X / Y" card indicator

Return summary of implementation.
```

### Phase 3: Card Type Forms (Parallel Implementation)

**Launch these agents in parallel using a single message with multiple Task tool calls:**

Task 1: Product Form
```
Subagent type: frontend-refactoring-expert
Prompt:
Implement ProductForm component for card message editor (OpenSpec change 'add-card-message-editor').

Create `src/app/dashboard/message-items/card/_components/card-form-product.tsx`:

Props:
- card: ProductCard
- onChange: (updates: Partial<ProductCard>) => void

Fields:
- Title (required, max 40 chars)
- Description (required, max 60 chars)
- Price (optional, number >= 0)
- Image (required, use existing ImageUploader component)
- Actions (use ActionEditor component, required, max 3)

Features:
- Real-time validation with debounce (500ms)
- Character count display
- Error messages
- ImageUploader integration from src/app/dashboard/_components/image-uploader.tsx

Return summary of implementation.
```

Task 2: Location Form
```
Subagent type: frontend-refactoring-expert
Prompt:
Implement LocationForm component for card message editor (OpenSpec change 'add-card-message-editor').

Create `src/app/dashboard/message-items/card/_components/card-form-location.tsx`:

Props:
- card: LocationCard
- onChange: (updates: Partial<LocationCard>) => void

Fields:
- Title (required, max 40 chars)
- Address (required, max 60 chars)
- Hours (optional, max 60 chars)
- Image (required, use ImageUploader)
- Actions (use ActionEditor, required, max 3)

Features:
- Real-time validation with debounce
- Character count display
- Error messages

Return summary of implementation.
```

Task 3: Person Form
```
Subagent type: frontend-refactoring-expert
Prompt:
Implement PersonForm component for card message editor (OpenSpec change 'add-card-message-editor').

Create `src/app/dashboard/message-items/card/_components/card-form-person.tsx`:

Props:
- card: PersonCard
- onChange: (updates: Partial<PersonCard>) => void

Fields:
- Name (required, max 40 chars)
- Description (required, max 60 chars)
- Tags (optional, multiple, each max 20 chars)
  - Add tag on Enter key
  - Remove tag button for each tag
  - Tag input with chips/badges display
- Image (required, use ImageUploader)
- Actions (use ActionEditor, required, max 3)

Features:
- Real-time validation
- Character count display
- Tag management UI

Return summary of implementation.
```

Task 4: Image Form
```
Subagent type: frontend-refactoring-expert
Prompt:
Implement ImageForm component for card message editor (OpenSpec change 'add-card-message-editor').

Create `src/app/dashboard/message-items/card/_components/card-form-image.tsx`:

Props:
- card: ImageCard
- onChange: (updates: Partial<ImageCard>) => void

Fields:
- Image (required, use ImageUploader) - primary focus
- Title (optional, max 40 chars)
- Description (optional, max 60 chars)
- Actions (use ActionEditor, required, max 3)

Features:
- Real-time validation
- Character count display
- Larger image preview than other forms

Return summary of implementation.
```

### Phase 4: Integration Components

**Sequential Steps (run one after the other):**

Task 1: CardTypeSelector Component
```
Subagent type: frontend-refactoring-expert
Prompt:
Implement CardTypeSelector component for card message editor (OpenSpec change 'add-card-message-editor').

Create `src/app/dashboard/message-items/card/_components/card-type-selector.tsx`:

Props:
- isOpen: boolean
- onClose: () => void
- onSelect: (type: CardType) => void

Features:
- Modal/dialog display
- 4 card type options with:
  - Icon/visual representation
  - Type name (商品、場所、人物、画像)
  - Brief description
- Click to select type
- Close button

UI:
- Use Tailwind CSS
- Modal overlay
- Card-style buttons for each type
- Responsive grid layout

Return summary of implementation.
```

Task 2: CardEditor Main Component
```
Subagent type: frontend-refactoring-expert
Prompt:
Implement CardEditor main component for card message editor (OpenSpec change 'add-card-message-editor').

Create `src/app/dashboard/message-items/card/_components/card-editor.tsx`:

State Management:
- cards: Card[] (managed internally)
- selectedCardId: string | null
- showTypeSelector: boolean

Props:
- initialCards?: Card[]
- onChange: (cards: Card[]) => void

Key Methods:
- addCard(type: CardType): void
- updateCard(id: string, updates: Partial<Card>): void
- deleteCard(id: string): void
- reorderCards(oldIndex: number, newIndex: number): void
- selectCard(id: string): void

Layout:
- Left side: CardList component
- Right side: Selected card form (dynamic based on type)
  - Show CardFormProduct/Location/Person/Image based on selected card type
  - If no card selected, show "Select a card to edit" message

Business Rules:
- Minimum 1 card (prevent deleting last card)
- Maximum 9 cards (disable add if limit reached)
- Default to first card selected on mount

Integrate:
- CardList
- CardTypeSelector
- All card form components
- Validation from utils.ts

Return summary of implementation.
```

Task 3: localStorage Persistence Hook
```
Subagent type: frontend-refactoring-expert
Prompt:
Implement persistence hook for card message editor (OpenSpec change 'add-card-message-editor').

Create `src/app/dashboard/message-items/card/_components/hooks/use-card-persistence.ts`:

Hook: useCardPersistence(cards: Card[], altText: string)

Features:
- Auto-save to localStorage after 3 seconds of inactivity (debounce)
- Key: 'card-message-editor-draft'
- Save: { timestamp, altText, cards }
- Load on mount
- Clear on successful send
- Return: { restore: () => SavedData | null, clear: () => void, hasSavedData: boolean }

Implementation:
- Use useEffect with debounce
- Check timestamp for stale data (> 7 days)
- Show restoration notification toast/message

Return summary of implementation.
```

### Phase 5: Main Page Integration

Task: Rewrite Card Message Page
```
Subagent type: frontend-refactoring-expert
Prompt:
Completely rewrite the card message page for OpenSpec change 'add-card-message-editor'.

File: `src/app/dashboard/message-items/card/page.tsx`

Requirements:

1. **State Management:**
   - lineUserId: string (UserSelector)
   - altText: string (max 400 chars)
   - cards: Card[] (from CardEditor)
   - status: 'idle' | 'sending' | 'success' | 'error'
   - error: string | null
   - lastRequest, lastResponse (for DebugPanel)

2. **Components to Integrate:**
   - UserSelector (existing: src/app/dashboard/_components/user-selector.tsx)
   - CardEditor (new)
   - CardPreview (new)
   - DebugPanel (existing: src/app/dashboard/_components/debug-panel.tsx)
   - useCardPersistence hook

3. **Layout:**
   - Info banner explaining card message feature
   - UserSelector
   - Alt text input
   - Main editor area:
     - CardEditor (left/top)
     - CardPreview (right/bottom)
   - Send button with validation
   - DebugPanel (development only)

4. **Send Logic:**
   - Validate all cards before send
   - Convert cards to LINE Carousel Template using utils
   - POST to /api/line/send with:
     ```json
     {
       "to": lineUserId,
       "messages": [{
         "type": "template",
         "altText": altText,
         "template": {
           "type": "carousel",
           "columns": [...converted cards]
         }
       }]
     }
     ```
   - Handle success/error
   - Clear localStorage on success
   - Update DebugPanel

5. **Validation:**
   - Require lineUserId
   - Require altText (max 400 chars)
   - Require at least 1 card
   - Validate all cards using validateCard()
   - Show aggregate errors

6. **UI Requirements:**
   - Tailwind CSS dark theme
   - Responsive layout (desktop: side-by-side, mobile: stacked)
   - Loading states
   - Success/error messages
   - Validation hints

Reference existing implementation: src/app/dashboard/message-items/rich/page.tsx

Return summary of changes and any issues encountered.
```

### Phase 6: Testing and Validation

Task 1: Create Unit Tests
```
Subagent type: general-purpose
Prompt:
Create unit tests for the card message editor utilities (OpenSpec change 'add-card-message-editor').

Test Files to Create:
1. `src/app/dashboard/message-items/card/_components/utils.test.ts`
2. `src/app/dashboard/message-items/card/_components/action-editor.test.tsx`

Test Coverage:

For utils.test.ts:
- validateCard(): test all card types with valid/invalid data
- validateAction(): test all action types with valid/invalid data
- cardToCarouselColumn(): test conversion for all card types
- createDefaultCard(): test default creation for all types

For action-editor.test.tsx:
- Render with no actions
- Add action
- Edit action
- Delete action
- Maximum actions limit (3)
- Type switching
- Validation display

Use Vitest + Testing Library (existing setup).

Return test results summary.
```

Task 2: Run All Tests and Linting
```
Subagent type: general-purpose
Prompt:
Run all tests and validation for the card message editor implementation (OpenSpec change 'add-card-message-editor').

Execute:
1. npm test -- card (run card-related tests)
2. npm run lint (check for linting errors)
3. npx tsc --noEmit (type check)

If any errors are found:
- Fix them
- Re-run tests
- Report fixes made

Return:
- Test results summary
- Lint results
- Type check results
- Any fixes applied
```

### Phase 7: Code Review

Task: Frontend Code Review
```
Subagent type: frontend-code-reviewer
Prompt:
Review all frontend changes made for OpenSpec change 'add-card-message-editor'.

Files to review:
- src/app/dashboard/message-items/card/page.tsx
- src/app/dashboard/message-items/card/_components/*.tsx
- src/app/dashboard/message-items/card/_components/hooks/*.ts

Review for:
1. Code Quality:
   - Component structure and organization
   - Props vs state management
   - useCallback/useMemo optimization
   - React.memo usage for performance

2. Accessibility:
   - Keyboard navigation for all interactive elements
   - ARIA labels for buttons and inputs
   - Focus management in modals/dialogs
   - Screen reader support

3. Performance:
   - Unnecessary re-renders
   - Large component trees
   - Heavy computations that should be memoized

4. Security:
   - XSS prevention in user inputs
   - URL validation for URI actions
   - Safe localStorage usage

5. Best Practices:
   - Semantic HTML usage
   - Tailwind CSS consistency
   - Error handling patterns
   - TypeScript type safety

6. Requirements Validation:
   Check implementation against OpenSpec requirements:
   - All 4 card types supported
   - Max 9 cards, min 1 card enforced
   - Max 3 actions per card
   - Character limits enforced
   - Drag & drop working
   - localStorage auto-save
   - Validation working
   - LINE API conversion correct

Report findings and suggest improvements.
```

## Progress Tracking

Use TodoWrite to track implementation progress:

Phase 1: Foundation
- [ ] Types and interfaces defined
- [ ] Utility functions created
- [ ] Validation logic implemented
- [ ] LINE API conversion functions ready

Phase 2: Core Components
- [ ] ActionEditor component complete
- [ ] CardList component with DnD complete
- [ ] CardPreview component complete

Phase 3: Card Type Forms
- [ ] ProductForm complete
- [ ] LocationForm complete
- [ ] PersonForm complete
- [ ] ImageForm complete

Phase 4: Integration
- [ ] CardTypeSelector complete
- [ ] CardEditor main component complete
- [ ] localStorage hook complete

Phase 5: Main Page
- [ ] page.tsx rewritten
- [ ] All components integrated
- [ ] Send logic working

Phase 6: Testing
- [ ] Unit tests created
- [ ] All tests passing
- [ ] Linting clean
- [ ] Type check passing

Phase 7: Code Review
- [ ] Frontend code review complete
- [ ] Issues addressed

## Final Checklist

After all phases complete:
1. [ ] Verify all tasks in openspec/changes/add-card-message-editor/tasks.md
2. [ ] Test manually in browser:
   - [ ] Create all 4 card types
   - [ ] Add/edit/delete cards
   - [ ] Drag & drop reordering
   - [ ] Add/edit actions
   - [ ] Image upload
   - [ ] Validation errors display
   - [ ] localStorage save/restore
   - [ ] Send message to LINE
   - [ ] Check actual LINE app display
3. [ ] Update tasks.md with completion status
4. [ ] Run `openspec validate add-card-message-editor --strict`
5. [ ] Prepare summary for user

## Dependencies

- @dnd-kit/core (for drag & drop)
- Existing components: ImageUploader, UserSelector, DebugPanel
- Existing utils: validateCard, validateAction

## Reference

- Change: `openspec/changes/add-card-message-editor/`
- Proposal: `openspec/changes/add-card-message-editor/proposal.md`
- Design: `openspec/changes/add-card-message-editor/design.md`
- Tasks: `openspec/changes/add-card-message-editor/tasks.md`
- Specs: `openspec/changes/add-card-message-editor/specs/card-message-editor/spec.md`

## Notes

- Follow existing code patterns from rich message editor
- Use Tailwind CSS dark theme consistently
- Ensure TypeScript strict mode compliance
- Test in actual LINE app before marking complete
