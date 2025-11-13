# CardEditor Component

## Overview

The `CardEditor` is the main orchestrator component for the card message editor. It manages the state and coordinates interactions between the card list, form components, and type selector modal.

## Features

- **State Management**: Manages cards array, selected card, and modal visibility
- **Card Operations**: Add, update, delete, and reorder cards
- **Business Rules**: Enforces 1-9 card limit
- **Dynamic Forms**: Renders appropriate form based on card type
- **Type Safety**: Full TypeScript support with proper type guards
- **Component Integration**: Seamlessly integrates all sub-components

## Props

```typescript
interface CardEditorProps {
  initialCards?: Card[];
  onChange: (cards: Card[]) => void;
}
```

### `initialCards` (optional)

- **Type**: `Card[]`
- **Default**: `undefined` (creates default product card)
- **Description**: Initial cards to populate the editor. If not provided, a default product card is created.

### `onChange` (required)

- **Type**: `(cards: Card[]) => void`
- **Description**: Callback function called whenever the cards array changes. Receives the updated cards array.

## State Management

### Internal State

```typescript
const [cards, setCards] = useState<Card[]>([]);
const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
const [showTypeSelector, setShowTypeSelector] = useState(false);
```

- **cards**: Array of all cards being edited
- **selectedCardId**: ID of the currently selected card for editing
- **showTypeSelector**: Modal visibility state for card type selection

### State Initialization

- If `initialCards` is provided with cards, use them
- Otherwise, create a default product card
- First card is automatically selected on mount

## Key Methods

### `addCard(type: CardType)`

Adds a new card of the specified type.

- **Validation**: Prevents adding if already at 9 cards
- **Behavior**: Creates card with `createDefaultCard()`, adds to array, and selects it
- **Side Effect**: Closes type selector modal

### `updateCard(id: string, updates: Partial<Card>)`

Updates an existing card with partial updates.

- **Type Safety**: Preserves card type through spread operation
- **Immutability**: Creates new array with updated card
- **Performance**: Only updates the specific card, not entire array

### `deleteCard(id: string)`

Deletes a card by ID.

- **Validation**: Prevents deletion if only 1 card remains
- **Selection Logic**: If deleted card was selected, selects another card
  - Selects previous card if available
  - Selects first card if deleting first card
- **Side Effect**: Updates selection state

### `reorderCards(oldIndex: number, newIndex: number)`

Reorders cards through drag and drop.

- **Implementation**: Removes card from old position, inserts at new position
- **Selection**: Maintains current selection after reorder

### `selectCard(id: string)`

Selects a card for editing.

- **Side Effect**: Updates `selectedCardId` state
- **Form Rendering**: Triggers appropriate form component to render

## Layout Structure

```
┌─────────────────────────────────────────────────────┐
│                    CardEditor                       │
├──────────────────┬──────────────────────────────────┤
│   CardList       │   Selected Card Form             │
│   (Left Side)    │   (Right Side)                   │
│   - 320px width  │   - Flex 1                       │
│   - Draggable    │   - Dynamic based on card type   │
│   - Add button   │   - Form header with type label  │
│   - Card count   │   - ProductForm / LocationForm   │
│                  │   - PersonForm / ImageForm       │
└──────────────────┴──────────────────────────────────┘
```

## Form Component Mapping

The editor dynamically renders the appropriate form based on selected card type:

| Card Type  | Form Component    | Description                      |
|------------|-------------------|----------------------------------|
| `product`  | `ProductForm`     | Title, description, price, image |
| `location` | `LocationForm`    | Title, address, hours, image     |
| `person`   | `PersonForm`      | Name, description, tags, image   |
| `image`    | `CardFormImage`   | Optional title/description       |

## Business Rules

### Card Limits

- **Minimum**: 1 card (prevents deletion of last card)
- **Maximum**: 9 cards (prevents adding beyond limit)
- **Enforcement**: Validated in `addCard()` and `deleteCard()`

### Selection Behavior

- First card is selected on mount
- Deleting selected card auto-selects another card
- Adding new card auto-selects it

### Form Updates

- Forms update cards in real-time through `onChange` prop
- Parent component receives updates via `onChange` callback
- All updates maintain immutability

## Component Integration

### CardList

```typescript
<CardList
  cards={cards}
  selectedId={selectedCardId}
  onSelect={selectCard}
  onDelete={deleteCard}
  onReorder={reorderCards}
  onAdd={handleAddCard}
/>
```

### CardTypeSelector

```typescript
<CardTypeSelector
  isOpen={showTypeSelector}
  onClose={handleCloseTypeSelector}
  onSelect={handleTypeSelect}
/>
```

### Form Components

```typescript
// Product Card Example
<ProductForm
  card={selectedCard as ProductCard}
  onChange={(updates) => updateCard(selectedCard.id, updates)}
/>
```

## Usage Examples

### Basic Usage

```typescript
import { CardEditor } from './card-editor';

function MyComponent() {
  const [cards, setCards] = useState<Card[]>([]);

  return (
    <div className="h-screen p-8">
      <CardEditor onChange={setCards} />
    </div>
  );
}
```

### With Initial Cards

```typescript
const initialCards: Card[] = [
  {
    id: 'card-1',
    type: 'product',
    title: 'Product Name',
    description: 'Product description',
    imageUrl: 'https://example.com/image.jpg',
    actions: [
      { type: 'uri', label: 'View', uri: 'https://example.com' }
    ],
  },
];

<CardEditor
  initialCards={initialCards}
  onChange={handleCardsChange}
/>
```

### With Preview and Send

```typescript
function MessageEditor() {
  const [cards, setCards] = useState<Card[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleSend = async () => {
    const columns = cards.map(cardToCarouselColumn);
    await sendMessage({ type: 'carousel', columns });
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <CardEditor onChange={setCards} />
      </div>
      {showPreview && (
        <div>
          <CardPreview cards={cards} />
          <button onClick={handleSend}>Send</button>
        </div>
      )}
    </div>
  );
}
```

## Error Handling

### Console Warnings

The component logs warnings for invalid operations:

```typescript
// Attempting to add 10th card
console.warn('Maximum 9 cards allowed');

// Attempting to delete last card
console.warn('Cannot delete the last card. At least one card is required.');
```

### Type Safety

TypeScript ensures type safety throughout:

```typescript
// Type guard for card-specific updates
switch (selectedCard.type) {
  case 'product':
    return <ProductForm card={selectedCard as ProductCard} ... />;
  case 'location':
    return <LocationForm card={selectedCard as LocationCard} ... />;
  // ...
}
```

## Performance Considerations

### Memoization

Key functions are wrapped in `useCallback` to prevent unnecessary re-renders:

- `addCard`
- `updateCard`
- `deleteCard`
- `reorderCards`
- `selectCard`

### State Updates

- Immutable updates prevent unnecessary re-renders
- Only affected components re-render on state changes
- Form components receive stable callback references

### Effect Dependencies

- `onChange` callback is triggered only when `cards` array changes
- Selection effect runs only when cards or selectedCardId changes

## Styling

### Theme

- Dark theme matching dashboard design
- Slate color palette (slate-700, slate-800, slate-900)
- Blue accents for interactive elements

### Layout

- Responsive grid layout
- Fixed width sidebar (320px) for card list
- Flexible width main area for forms
- Proper spacing and padding

### Visual Hierarchy

- Clear header with card type label
- Bordered sections for visual separation
- Proper contrast for text and backgrounds

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy (h2 for section headers)
- Keyboard navigation support through sub-components
- ARIA labels in sub-components

## Testing

Comprehensive test coverage includes:

- Initialization with/without initial cards
- Card selection and form switching
- Card addition with type selector
- Card deletion with minimum validation
- Card reordering
- onChange callback invocation
- Card limit enforcement (1-9 cards)

See `card-editor.test.tsx` for full test suite.

## Related Components

- **CardList**: Displays draggable list of cards
- **CardTypeSelector**: Modal for selecting card type
- **ProductForm**: Form for product cards
- **LocationForm**: Form for location cards
- **PersonForm**: Form for person cards
- **CardFormImage**: Form for image cards
- **CardPreview**: Preview component for cards
- **ActionEditor**: Action management component

## Type Definitions

```typescript
// Main props interface
interface CardEditorProps {
  initialCards?: Card[];
  onChange: (cards: Card[]) => void;
}

// Card union type
type Card = ProductCard | LocationCard | PersonCard | ImageCard;

// Card type enum
type CardType = 'product' | 'location' | 'person' | 'image';
```

## Future Enhancements

- [ ] Undo/redo functionality
- [ ] Keyboard shortcuts for common operations
- [ ] Bulk card operations (duplicate, delete multiple)
- [ ] Card templates library
- [ ] Export/import card configurations
- [ ] Validation error aggregation
- [ ] Auto-save to local storage
- [ ] Collaborative editing support

## Troubleshooting

### Cards not updating

**Problem**: Changes to cards are not reflected in parent component.

**Solution**: Ensure `onChange` callback is properly connected:

```typescript
const [cards, setCards] = useState<Card[]>([]);
<CardEditor onChange={setCards} /> // Correct
```

### Selected card not showing form

**Problem**: No form is displayed when a card is selected.

**Solution**: Check that card has valid `type` property and matches one of: `'product' | 'location' | 'person' | 'image'`

### Cannot delete card

**Problem**: Delete button doesn't work.

**Solution**: Verify that more than one card exists. The component prevents deleting the last card.

## Version History

- **v1.0.0** (2025-11-13): Initial implementation with full feature set
  - Card CRUD operations
  - Dynamic form rendering
  - Type selector modal
  - Business rules enforcement
  - Comprehensive testing
