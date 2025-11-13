# Design: Card Message Editor

## Context

現在のカードメッセージ送信機能は、3つの固定カードをハードコードで送信する簡易実装です。LINE Official Account Managerと同等の機能を提供するため、動的なカード作成・編集が可能なビジュアルエディタを実装します。

### 既存システム
- 既存の `/api/line/send` エンドポイントを利用
- ImageUploader、UserSelector、DebugPanel コンポーネントが利用可能
- Cloudinary統合済み

### 参考実装
- リッチメッセージエディタ (`src/app/dashboard/message-items/rich/`)
  - 同様のパターン（エディタ + プレビュー）
  - ImageUploader統合
  - デバッグパネル表示

## Goals / Non-Goals

### Goals
- LINE Official Account Managerと同等のカードタイプメッセージ作成機能
- 直感的なビジュアルエディタUI
- リアルタイムプレビュー
- 包括的なバリデーション
- localStorage による作業内容の自動保存

### Non-Goals
- Flex Message のサポート（別の機能として実装）
- Image Carousel Template（将来の拡張で対応）
- Buttons Template / Confirm Template（将来の拡張で対応）
- サーバーサイドでのカードテンプレート保存（初期バージョンでは不要）

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│              card/page.tsx (Main)                    │
│  ┌────────────────────────┐  ┌────────────────────┐ │
│  │   UserSelector         │  │   AltText Input    │ │
│  └────────────────────────┘  └────────────────────┘ │
│                                                      │
│  ┌─────────────────────────────────────────────────┐│
│  │           CardEditor                             ││
│  │  ┌─────────────────┐  ┌─────────────────────┐  ││
│  │  │   CardList      │  │   Selected Card Form │  ││
│  │  │   - Card Items  │  │   - ProductForm      │  ││
│  │  │   - Add Button  │  │   - LocationForm     │  ││
│  │  │   - DnD Support │  │   - PersonForm       │  ││
│  │  │                 │  │   - ImageForm        │  ││
│  │  └─────────────────┘  │   - ActionEditor     │  ││
│  │                       └─────────────────────┘  ││
│  └─────────────────────────────────────────────────┘│
│                                                      │
│  ┌─────────────────────────────────────────────────┐│
│  │           CardPreview                            ││
│  │   - Carousel Display                             ││
│  │   - Horizontal Scroll                            ││
│  └─────────────────────────────────────────────────┘│
│                                                      │
│  ┌────────────────┐  ┌────────────────────────────┐│
│  │  Send Button   │  │  DebugPanel (dev only)      ││
│  └────────────────┘  └────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

## Data Model

### TypeScript Types

```typescript
// Card Types
type CardType = 'product' | 'location' | 'person' | 'image';

// Base Card Interface
interface BaseCard {
  id: string;  // UUID for internal management
  type: CardType;
  imageUrl: string;  // Required for all types
  actions: CardAction[];  // Max 3 actions
}

// Product Card
interface ProductCard extends BaseCard {
  type: 'product';
  title: string;  // Max 40 chars, required
  description: string;  // Max 60 chars, required
  price?: number;  // Optional
}

// Location Card
interface LocationCard extends BaseCard {
  type: 'location';
  title: string;  // Max 40 chars, required
  address: string;  // Max 60 chars, required
  hours?: string;  // Max 60 chars, optional
}

// Person Card
interface PersonCard extends BaseCard {
  type: 'person';
  name: string;  // Max 40 chars, required
  description: string;  // Max 60 chars, required
  tags?: string[];  // Each tag max 20 chars, optional
}

// Image Card
interface ImageCard extends BaseCard {
  type: 'image';
  title?: string;  // Max 40 chars, optional
  description?: string;  // Max 60 chars, optional
}

// Union Type
type Card = ProductCard | LocationCard | PersonCard | ImageCard;

// Action Types
interface URIAction {
  type: 'uri';
  label: string;  // Max 20 chars
  uri: string;  // HTTPS only
}

interface MessageAction {
  type: 'message';
  label: string;  // Max 20 chars
  text: string;  // Max 300 chars
}

interface PostbackAction {
  type: 'postback';
  label: string;  // Max 20 chars
  data: string;  // Max 300 chars
  displayText?: string;  // Optional
}

type CardAction = URIAction | MessageAction | PostbackAction;

// Form State
interface CardFormState {
  lineUserId: string;
  altText: string;  // Max 400 chars
  cards: Card[];  // Min 1, Max 9
  selectedCardId: string | null;
}
```

### LINE API Format Conversion

```typescript
// Internal format -> LINE Carousel Template
function cardsToCarouselTemplate(cards: Card[]): CarouselTemplate {
  return {
    type: 'carousel',
    columns: cards.map(card => cardToColumn(card))
  };
}

function cardToColumn(card: Card): CarouselColumn {
  const base = {
    thumbnailImageUrl: card.imageUrl,
    actions: card.actions.map(actionToLineAction)
  };

  switch (card.type) {
    case 'product':
      return {
        ...base,
        title: card.title,
        text: card.price
          ? `${card.description}\n価格: ${card.price}円`
          : card.description
      };

    case 'location':
      return {
        ...base,
        title: card.title,
        text: card.hours
          ? `${card.address}\n営業時間: ${card.hours}`
          : card.address
      };

    case 'person':
      const tags = card.tags?.map(t => `#${t}`).join(' ') || '';
      return {
        ...base,
        title: card.name,
        text: tags ? `${card.description}\n${tags}` : card.description
      };

    case 'image':
      return {
        ...base,
        title: card.title || undefined,
        text: card.description || ' '  // LINE requires text, use space if empty
      };
  }
}
```

## Component Design

### CardEditor (Container Component)

**State Management:**
- `cards: Card[]` - Array of card objects
- `selectedCardId: string | null` - Currently editing card
- `showTypeSelector: boolean` - Show/hide type selector dialog

**Key Methods:**
- `addCard(type: CardType)` - Add new card
- `updateCard(id: string, updates: Partial<Card>)` - Update card
- `deleteCard(id: string)` - Delete card
- `reorderCards(oldIndex: number, newIndex: number)` - Reorder cards
- `selectCard(id: string)` - Select card for editing

**Responsibilities:**
- Manage card array state
- Coordinate between CardList and Card Forms
- Enforce business rules (min 1, max 9 cards)

### CardList (Presentation Component)

**Props:**
- `cards: Card[]`
- `selectedId: string | null`
- `onSelect: (id: string) => void`
- `onDelete: (id: string) => void`
- `onReorder: (oldIndex, newIndex) => void`
- `onAdd: () => void`

**Responsibilities:**
- Display card list with thumbnails
- Handle drag & drop (using @dnd-kit/core)
- Show add card button
- Visual feedback for selected card

### Card Form Components

Each card type has a dedicated form component:
- `CardFormProduct`
- `CardFormLocation`
- `CardFormPerson`
- `CardFormImage`

**Common Props:**
- `card: Card` - Current card data
- `onChange: (updates: Partial<Card>) => void` - Update callback

**Responsibilities:**
- Type-specific input fields
- Real-time validation
- ImageUploader integration
- ActionEditor integration

### ActionEditor (Reusable Component)

**Props:**
- `actions: CardAction[]`
- `onChange: (actions: CardAction[]) => void`
- `maxActions: number` (default: 3)

**Responsibilities:**
- Add/edit/delete actions
- Action type switching
- Type-specific input fields
- Validation

### CardPreview (Presentation Component)

**Props:**
- `cards: Card[]`

**Responsibilities:**
- Carousel-style display
- Horizontal scroll
- Mock LINE UI styling
- Real-time updates

## Technical Decisions

### 1. State Management

**Decision:** Use React useState and props drilling (no global state)

**Rationale:**
- Component tree is shallow (2-3 levels)
- State is localized to card editor page
- No need for Jotai atoms complexity
- Easier to understand and maintain

**Alternatives Considered:**
- Jotai atoms: Overkill for page-local state
- useReducer: Unnecessary complexity for this use case

### 2. Drag & Drop Library

**Decision:** Use @dnd-kit/core

**Rationale:**
- Modern, actively maintained
- Built for React and TypeScript
- Better accessibility support
- Smaller bundle size than react-beautiful-dnd
- Better touch device support

**Alternatives Considered:**
- react-beautiful-dnd: Deprecated, no longer maintained
- react-dnd: More low-level, harder to use

### 3. Form Validation Strategy

**Decision:** Real-time validation with debounce

**Rationale:**
- Immediate feedback improves UX
- Debounce prevents performance issues
- Show errors only after user finishes typing
- Final validation before submit

**Implementation:**
```typescript
const useValidation = (value: string, validator: (v: string) => string | null) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setError(validator(value));
    }, 500);  // 500ms debounce

    return () => clearTimeout(timer);
  }, [value]);

  return error;
};
```

### 4. Image Upload

**Decision:** Reuse existing ImageUploader component

**Rationale:**
- Already integrated with Cloudinary
- Consistent UX across app
- Handles validation and error states
- Proven implementation

### 5. localStorage Schema

**Decision:** Save entire form state as JSON

**Schema:**
```typescript
{
  key: 'card-message-editor-draft',
  value: {
    timestamp: number,
    altText: string,
    cards: Card[]
  }
}
```

**Rationale:**
- Simple to implement
- Captures all necessary state
- Easy to restore
- Timestamp for stale data detection

### 6. Component Splitting Strategy

**Decision:** Split by card type (4 form components)

**Rationale:**
- Each card type has unique fields
- Prevents complex conditional rendering
- Easier to maintain and test
- Better TypeScript type narrowing

**Alternatives Considered:**
- Single form with conditional fields: Too complex, hard to maintain
- Field-level components: Over-engineering, unnecessary abstraction

## Data Flow

```
User Input
    ↓
Card Form Component
    ↓
onChange callback
    ↓
CardEditor (state update)
    ↓  ↓  ↓
    │  │  └→ localStorage (auto-save after 3s)
    │  └→ CardPreview (real-time update)
    └→ CardList (re-render)
```

## Validation Rules

### Card-Level Validation

```typescript
const validateCard = (card: Card): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Image URL (all types)
  if (!card.imageUrl) {
    errors.push({ field: 'imageUrl', message: '画像は必須です' });
  } else if (!card.imageUrl.startsWith('https://')) {
    errors.push({ field: 'imageUrl', message: 'HTTPS URLを指定してください' });
  }

  // Type-specific validation
  switch (card.type) {
    case 'product':
      if (!card.title || card.title.length > 40) {
        errors.push({ field: 'title', message: 'タイトルは1-40文字で入力してください' });
      }
      if (!card.description || card.description.length > 60) {
        errors.push({ field: 'description', message: '説明は1-60文字で入力してください' });
      }
      if (card.price !== undefined && card.price < 0) {
        errors.push({ field: 'price', message: '価格は0以上で入力してください' });
      }
      break;

    case 'location':
      if (!card.title || card.title.length > 40) {
        errors.push({ field: 'title', message: 'タイトルは1-40文字で入力してください' });
      }
      if (!card.address || card.address.length > 60) {
        errors.push({ field: 'address', message: '住所は1-60文字で入力してください' });
      }
      if (card.hours && card.hours.length > 60) {
        errors.push({ field: 'hours', message: '営業時間は60文字以内で入力してください' });
      }
      break;

    case 'person':
      if (!card.name || card.name.length > 40) {
        errors.push({ field: 'name', message: '名前は1-40文字で入力してください' });
      }
      if (!card.description || card.description.length > 60) {
        errors.push({ field: 'description', message: '説明は1-60文字で入力してください' });
      }
      if (card.tags) {
        card.tags.forEach((tag, i) => {
          if (tag.length > 20) {
            errors.push({ field: `tags[${i}]`, message: `タグは20文字以内で入力してください` });
          }
        });
      }
      break;

    case 'image':
      if (card.title && card.title.length > 40) {
        errors.push({ field: 'title', message: 'タイトルは40文字以内で入力してください' });
      }
      if (card.description && card.description.length > 60) {
        errors.push({ field: 'description', message: '説明は60文字以内で入力してください' });
      }
      break;
  }

  // Actions validation
  if (card.actions.length === 0) {
    errors.push({ field: 'actions', message: '少なくとも1つのアクションが必要です' });
  }
  if (card.actions.length > 3) {
    errors.push({ field: 'actions', message: 'アクションは最大3つまでです' });
  }

  card.actions.forEach((action, i) => {
    const actionErrors = validateAction(action);
    errors.push(...actionErrors.map(e => ({
      ...e,
      field: `actions[${i}].${e.field}`
    })));
  });

  return errors;
};
```

### Action Validation

```typescript
const validateAction = (action: CardAction): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Label (all types)
  if (!action.label || action.label.length > 20) {
    errors.push({ field: 'label', message: 'ラベルは1-20文字で入力してください' });
  }

  // Type-specific
  switch (action.type) {
    case 'uri':
      if (!action.uri) {
        errors.push({ field: 'uri', message: 'URIは必須です' });
      } else if (!action.uri.startsWith('https://') && !action.uri.startsWith('http://')) {
        errors.push({ field: 'uri', message: '有効なURLを入力してください' });
      }
      break;

    case 'message':
      if (!action.text || action.text.length > 300) {
        errors.push({ field: 'text', message: 'テキストは1-300文字で入力してください' });
      }
      break;

    case 'postback':
      if (!action.data || action.data.length > 300) {
        errors.push({ field: 'data', message: 'データは1-300文字で入力してください' });
      }
      break;
  }

  return errors;
};
```

## Performance Considerations

### Optimization Strategies

1. **React.memo for Card Items**
   - Prevent re-render of unchanged cards
   - Only re-render when card data changes

2. **useCallback for Event Handlers**
   - Prevent function recreation on each render
   - Important for drag & drop performance

3. **Debounced Validation**
   - Avoid validation on every keystroke
   - 500ms debounce for input fields

4. **Lazy Load Images**
   - Use `loading="lazy"` for preview images
   - Reduce initial render time

5. **Virtual Scrolling**
   - Not needed for max 9 cards
   - Would be beneficial if limit increases

## Error Handling

### Client-Side Errors

1. **Validation Errors**
   - Display inline with fields
   - Aggregate errors for submit

2. **Upload Errors**
   - Handled by ImageUploader
   - Display upload status

3. **Network Errors**
   - Retry logic for temporary failures
   - User-friendly error messages

### Error Display Strategy

```typescript
interface ErrorDisplay {
  // Field-level errors (inline)
  fieldErrors: Record<string, string>;

  // Form-level errors (top of form)
  formErrors: string[];

  // Critical errors (modal/toast)
  criticalErrors: string[];
}
```

## Testing Strategy

### Unit Tests

1. **Utility Functions**
   - Validation functions
   - API conversion functions
   - Default card creators

2. **Hooks**
   - useCardPersistence
   - useValidation (if extracted)

### Component Tests

1. **ActionEditor**
   - Add/edit/delete actions
   - Type switching
   - Validation display

2. **Card Forms**
   - Input handling
   - Validation
   - ImageUploader integration

3. **CardList**
   - Card display
   - Selection
   - Drag & drop

### Integration Tests

1. **Full Flow**
   - Create cards
   - Edit cards
   - Reorder cards
   - Submit message

2. **localStorage**
   - Auto-save
   - Restore
   - Clear on submit

## Migration Plan

### Deployment Steps

1. **Pre-deployment**
   - Ensure all tests pass
   - Verify Cloudinary integration
   - Test on staging environment

2. **Deployment**
   - Deploy new code
   - No database migrations needed
   - No API changes needed

3. **Post-deployment**
   - Monitor error logs
   - Check user feedback
   - Verify LINE message delivery

### Rollback Plan

- Revert to previous version if critical bugs found
- No data migration needed (localStorage only)
- No breaking changes to APIs

## Open Questions

1. **Drag & Drop on Mobile**
   - Should we support drag & drop on mobile?
   - Alternative: Up/Down arrows for reordering
   - **Decision:** Use arrow buttons for mobile, DnD for desktop

2. **Template Saving**
   - Should users be able to save card templates for reuse?
   - **Decision:** Not in initial version, consider for future enhancement

3. **Bulk Import**
   - Should we support CSV import for multiple cards?
   - **Decision:** Not in initial version, consider for future enhancement

4. **Image Recommendations**
   - Should we provide image size/ratio recommendations?
   - **Decision:** Yes, display recommended size (1040x1040px) in upload UI

## Future Enhancements

1. **Template Library**
   - Save frequently used card sets
   - Share templates across team

2. **Bulk Import/Export**
   - CSV import for product catalogs
   - JSON export for backup

3. **Advanced Actions**
   - Date-time picker action
   - Camera/Camera roll action

4. **A/B Testing**
   - Create variants of card messages
   - Track performance metrics

5. **Analytics Integration**
   - Track card tap rates
   - Analyze user engagement
