# Card Message Editor Components

This directory contains components for the Card Message Editor feature, which allows users to create and edit LINE carousel template messages with a visual interface.

## Components

### CardList

The main list component that displays and manages card items with drag & drop functionality.

**Location**: `card-list.tsx`

**Features**:
- Display cards in a vertical list with thumbnails
- Drag & drop reordering using @dnd-kit
- Visual feedback for selected cards
- Add new cards (max 9)
- Delete cards with confirmation dialog (min 1)
- Card type badges (Product, Location, Person, Image)
- Card count display (X / 9)

**Props**:
```typescript
interface CardListProps {
  cards: Card[];              // Array of card objects
  selectedId: string | null;  // ID of currently selected card
  onSelect: (id: string) => void;      // Callback when card is selected
  onDelete: (id: string) => void;      // Callback when card is deleted
  onReorder: (oldIndex: number, newIndex: number) => void;  // Callback when cards are reordered
  onAdd: () => void;          // Callback when add button is clicked
}
```

**Usage Example**:
```tsx
import { CardList } from './_components/card-list';
import { useState } from 'react';

function MyEditor() {
  const [cards, setCards] = useState<Card[]>([...]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleReorder = (oldIndex: number, newIndex: number) => {
    const newCards = [...cards];
    const [removed] = newCards.splice(oldIndex, 1);
    newCards.splice(newIndex, 0, removed);
    setCards(newCards);
  };

  return (
    <CardList
      cards={cards}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onDelete={(id) => setCards(cards.filter(c => c.id !== id))}
      onReorder={handleReorder}
      onAdd={handleAddCard}
    />
  );
}
```

## Type Definitions

### Card Types

**Location**: `types.ts`

All card types extend `BaseCard`:

```typescript
interface BaseCard {
  id: string;           // Unique identifier
  type: CardType;       // 'product' | 'location' | 'person' | 'image'
  imageUrl: string;     // HTTPS URL (required)
  actions: CardAction[]; // 1-3 actions
}
```

**Product Card**:
```typescript
interface ProductCard extends BaseCard {
  type: 'product';
  title: string;        // Max 40 chars
  description: string;  // Max 60 chars
  price?: number;       // Optional
}
```

**Location Card**:
```typescript
interface LocationCard extends BaseCard {
  type: 'location';
  title: string;        // Max 40 chars
  address: string;      // Max 60 chars
  hours?: string;       // Max 60 chars, optional
}
```

**Person Card**:
```typescript
interface PersonCard extends BaseCard {
  type: 'person';
  name: string;         // Max 40 chars
  description: string;  // Max 60 chars
  tags?: string[];      // Each tag max 20 chars
}
```

**Image Card**:
```typescript
interface ImageCard extends BaseCard {
  type: 'image';
  title?: string;       // Max 40 chars, optional
  description?: string; // Max 60 chars, optional
}
```

### Action Types

```typescript
interface URIAction {
  type: 'uri';
  label: string;  // Max 20 chars
  uri: string;    // HTTP/HTTPS URL
}

interface MessageAction {
  type: 'message';
  label: string;  // Max 20 chars
  text: string;   // Max 300 chars
}

interface PostbackAction {
  type: 'postback';
  label: string;        // Max 20 chars
  data: string;         // Max 300 chars
  displayText?: string; // Optional
}
```

## Utility Functions

**Location**: `utils.ts`

### validateCard(card: Card): ValidationError[]

Validates a card based on its type and returns an array of validation errors.

```typescript
const errors = validateCard(card);
if (errors.length > 0) {
  console.error('Validation failed:', errors);
}
```

### validateAction(action: CardAction): ValidationError[]

Validates a single action and returns validation errors.

### cardToCarouselColumn(card: Card)

Converts a card to LINE Messaging API carousel column format.

```typescript
const column = cardToCarouselColumn(card);
// Returns LINE API format:
// {
//   thumbnailImageUrl: string,
//   title?: string,
//   text: string,
//   actions: [...],
// }
```

### createDefaultCard(type: CardType): Card

Creates a new card with default values based on type.

```typescript
const newCard = createDefaultCard('product');
// Returns a ProductCard with pre-filled values
```

## Dependencies

### External Dependencies

- **@dnd-kit/core** (^6.3.1): Core drag and drop functionality
- **@dnd-kit/sortable** (^10.0.0): Sortable list utilities
- **@dnd-kit/utilities** (^3.2.2): Utility functions for DnD
- **lucide-react**: Icons for UI elements

### Internal Dependencies

- `Card`, `CardAction`, `CardType` types from `./types`
- Utility functions from `./utils`

## Testing

**Location**: `card-list.test.tsx`

The component has comprehensive test coverage including:
- Rendering card list with correct count
- Displaying all cards with type badges
- Card selection and highlighting
- Add/delete functionality
- Max/min card constraints
- Delete confirmation dialog
- Thumbnail display

**Run tests**:
```bash
npm test -- card-list.test.tsx
```

## Accessibility

The CardList component includes:
- Keyboard navigation support for drag & drop
- Proper ARIA labels for interactive elements
- Visual feedback for dragging state
- Focus management for dialogs

## Styling

The component uses Tailwind CSS utility classes with the following color scheme:
- Background: slate-800/slate-900 variants
- Borders: slate-600/slate-700
- Selected state: blue-500/blue-900
- Type badges: blue-400 (product), green-400 (location), purple-400 (person), yellow-400 (image)
- Delete button: red-400/red-600

## Performance Considerations

1. **React.memo optimization**: Consider wrapping SortableCardItem in React.memo if performance issues arise
2. **Drag handle**: Uses touch-action CSS to prevent scroll conflicts
3. **Image loading**: Uses native img elements (consider switching to Next.js Image for optimization)
4. **Event handlers**: All callbacks are passed from parent to maintain single source of truth

## Future Improvements

- [ ] Add virtualization for large card lists (if limit increases beyond 9)
- [ ] Add keyboard shortcuts for common operations
- [ ] Implement undo/redo functionality
- [ ] Add card duplication feature
- [ ] Support for card templates
- [ ] Bulk operations (select multiple, delete multiple)

## Related Documentation

- [OpenSpec Design Document](../../../../../openspec/changes/add-card-message-editor/design.md)
- [OpenSpec Specification](../../../../../openspec/changes/add-card-message-editor/specs/card-message-editor/spec.md)
- [LINE Messaging API - Carousel Template](https://developers.line.biz/ja/reference/messaging-api/#carousel)
