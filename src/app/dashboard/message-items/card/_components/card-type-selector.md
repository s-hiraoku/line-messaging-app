# CardTypeSelector Component

## Overview

The `CardTypeSelector` is a modal component that allows users to select a card type when adding a new card to the card message editor. It provides an intuitive visual interface with descriptions for each card type.

## Features

- **Modal Dialog**: Full-screen overlay with centered content
- **4 Card Types**: Product, Location, Person, and Image cards
- **Visual Design**: Each type has a unique icon and color scheme
- **Descriptions**: Clear explanations for each card type's use case
- **Keyboard Support**: Escape key to close the modal
- **Click Outside**: Close modal by clicking the overlay
- **Responsive**: Works on desktop and mobile screens
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Usage

### Basic Implementation

```tsx
import { useState } from 'react';
import { CardTypeSelector } from './card-type-selector';
import type { CardType } from './types';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (type: CardType) => {
    console.log('Selected type:', type);
    // Handle card creation with the selected type
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Add Card
      </button>

      <CardTypeSelector
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={handleSelect}
      />
    </>
  );
}
```

### Integration with Card Editor

```tsx
import { CardTypeSelector } from './card-type-selector';
import { createDefaultCard } from './utils';

function CardEditor() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const handleAddCard = () => {
    if (cards.length < 9) {
      setIsSelectorOpen(true);
    }
  };

  const handleTypeSelect = (type: CardType) => {
    const newCard = createDefaultCard(type);
    setCards(prev => [...prev, newCard]);
  };

  return (
    <>
      <button onClick={handleAddCard}>
        Add New Card
      </button>

      <CardTypeSelector
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelect={handleTypeSelect}
      />
    </>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | Yes | Controls the visibility of the modal |
| `onClose` | `() => void` | Yes | Callback when modal should close (Escape key, overlay click, or close button) |
| `onSelect` | `(type: CardType) => void` | Yes | Callback when a card type is selected. Automatically closes modal after selection. |

## Card Types

### Product (`'product'`)
- **Icon**: Shopping Bag
- **Color**: Blue
- **Use Case**: E-commerce products, sale items
- **Fields**: Title, description, price, image, actions

### Location (`'location'`)
- **Icon**: Map Pin
- **Color**: Green
- **Use Case**: Stores, venues, event locations
- **Fields**: Title, address, hours, image, actions

### Person (`'person'`)
- **Icon**: User
- **Color**: Purple
- **Use Case**: Staff profiles, contacts
- **Fields**: Name, description, tags, image, actions

### Image (`'image'`)
- **Icon**: Image
- **Color**: Yellow
- **Use Case**: Simple image with caption
- **Fields**: Title (optional), description (optional), image, actions

## Behavior

### Opening the Modal
- Modal appears with backdrop blur and dark overlay
- Body scroll is prevented when modal is open
- Focus is managed appropriately

### Selecting a Type
1. User clicks on one of the four card type buttons
2. `onSelect` callback is triggered with the selected type
3. Modal automatically closes
4. Parent component handles card creation

### Closing the Modal
Modal can be closed by:
- Clicking the X button in the top-right
- Pressing the Escape key
- Clicking outside the modal content (on the overlay)

### User Guidance
- Each card type shows an icon, name, and description
- Hover effects provide visual feedback
- Help text warns that card type cannot be changed later
- Arrow indicator appears on hover

## Styling

The component uses Tailwind CSS with the project's design system:
- Dark theme (slate colors)
- Consistent with other modal components
- Responsive grid layout (1 column mobile, 2 columns desktop)
- Smooth transitions and hover effects

## Accessibility

- Semantic HTML structure
- ARIA labels for icon buttons
- Keyboard navigation support
- Focus management
- Screen reader friendly

## Testing

Comprehensive test suite covers:
- Rendering when open/closed
- All 4 card types display correctly
- Selection triggers correct callback
- Close button functionality
- Overlay click closes modal
- Escape key closes modal
- Modal content click doesn't close modal
- Proper callback parameters

Run tests:
```bash
npm test card-type-selector.test.tsx
```

## Examples

See `card-type-selector.example.tsx` for:
- Basic usage
- Integration with card creation flow
- State management patterns

## Notes

- Card type cannot be changed after creation (immutable)
- Maximum 9 cards can be added to a card message
- Component follows the project's modal pattern from `card-list.tsx`
- Uses Lucide React icons for consistency
- Prevents body scroll when open

## Related Components

- `CardList`: Displays and manages the list of cards
- `ProductForm`, `LocationForm`, `PersonForm`, `ImageForm`: Type-specific form components
- `createDefaultCard`: Utility to create new card with default values

## File Structure

```
card/_components/
├── card-type-selector.tsx          # Main component
├── card-type-selector.test.tsx     # Test suite
├── card-type-selector.example.tsx  # Usage examples
└── card-type-selector.md           # This documentation
```
