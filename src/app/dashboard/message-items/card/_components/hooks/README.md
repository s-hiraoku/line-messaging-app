# Card Message Editor - Hooks

Custom React hooks for the card message editor.

## Available Hooks

### `useCardPersistence`

Auto-saves card message editor state to localStorage with debouncing and provides restoration capabilities for draft recovery.

#### Features

- **Auto-save**: Automatically saves to localStorage after 3 seconds of inactivity (configurable)
- **Debouncing**: Prevents excessive writes to localStorage
- **Stale data detection**: Automatically removes data older than 7 days (configurable)
- **Validation**: Validates data structure before restoration
- **Error handling**: Gracefully handles localStorage errors and quota exceeded
- **Restoration notification**: Provides timestamp information for user feedback

#### Basic Usage

```tsx
import { useState, useEffect } from 'react';
import { useCardPersistence } from './hooks/use-card-persistence';
import type { Card } from './types';

function CardEditor() {
  const [cards, setCards] = useState<Card[]>([]);
  const [altText, setAltText] = useState('');

  // Initialize persistence
  const { restore, clear, hasSavedData, savedAt } = useCardPersistence(
    cards,
    altText
  );

  // Restore on mount
  useEffect(() => {
    const saved = restore();
    if (saved) {
      setCards(saved.cards);
      setAltText(saved.altText);
      // Show notification
      console.log('Restored from:', new Date(saved.timestamp));
    }
  }, [restore]);

  // Clear after successful send
  const handleSend = async () => {
    await sendMessage(cards, altText);
    clear();
  };

  return (
    <div>
      {hasSavedData && (
        <div>Draft saved at: {savedAt && new Date(savedAt).toLocaleString()}</div>
      )}
      {/* Editor UI */}
    </div>
  );
}
```

#### Custom Configuration

```tsx
const { restore, clear, hasSavedData } = useCardPersistence(cards, altText, {
  debounceMs: 5000,     // Wait 5 seconds before saving
  maxAgeDays: 30,       // Keep data for 30 days
  storageKey: 'my-key', // Use custom localStorage key
});
```

#### API

##### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `cards` | `Card[]` | Yes | - | Current card data to save |
| `altText` | `string` | Yes | - | Alternative text for the message |
| `options` | `UseCardPersistenceOptions` | No | See below | Configuration options |

##### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `debounceMs` | `number` | `3000` | Debounce delay in milliseconds |
| `maxAgeDays` | `number` | `7` | Maximum age of saved data in days |
| `storageKey` | `string` | `'card-message-editor-draft'` | localStorage key |

##### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `restore` | `() => SavedCardData \| null` | Restore saved data from localStorage |
| `clear` | `() => void` | Clear saved data from localStorage |
| `hasSavedData` | `boolean` | Whether valid saved data exists |
| `savedAt` | `number \| null` | Timestamp of the saved data (if exists) |

##### SavedCardData Type

```typescript
interface SavedCardData {
  timestamp: number;
  altText: string;
  cards: Card[];
}
```

#### Usage Examples

##### Example 1: Basic Usage with Notification

```tsx
function CardEditorWithNotification() {
  const [cards, setCards] = useState<Card[]>([]);
  const [altText, setAltText] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  const { restore, clear, hasSavedData, savedAt } = useCardPersistence(
    cards,
    altText
  );

  useEffect(() => {
    const saved = restore();
    if (saved) {
      setCards(saved.cards);
      setAltText(saved.altText);
      setShowNotification(true);

      // Auto-hide after 5 seconds
      setTimeout(() => setShowNotification(false), 5000);
    }
  }, [restore]);

  return (
    <div>
      {showNotification && savedAt && (
        <div className="notification">
          Draft restored from {new Date(savedAt).toLocaleString()}
        </div>
      )}
      {/* Editor UI */}
    </div>
  );
}
```

##### Example 2: Manual Save Control

```tsx
function CardEditorWithManualSave() {
  const [cards, setCards] = useState<Card[]>([]);
  const [altText, setAltText] = useState('');

  // Use very long debounce to effectively disable auto-save
  const { restore, clear } = useCardPersistence(cards, altText, {
    debounceMs: 999999,
  });

  // Manual save by clearing and immediately changing state
  const handleManualSave = () => {
    // Trigger save by forcing a state change
    setCards([...cards]);
  };

  return (
    <div>
      <button onClick={handleManualSave}>Save Draft</button>
      {/* Editor UI */}
    </div>
  );
}
```

##### Example 3: Multiple Editors on Same Page

```tsx
function MultipleEditors() {
  // Editor 1
  const editor1 = useCardPersistence(cards1, altText1, {
    storageKey: 'card-editor-1',
  });

  // Editor 2
  const editor2 = useCardPersistence(cards2, altText2, {
    storageKey: 'card-editor-2',
  });

  return (
    <div>
      <Editor1 persistence={editor1} />
      <Editor2 persistence={editor2} />
    </div>
  );
}
```

#### Best Practices

1. **Restore on Mount**: Always restore saved data in a `useEffect` with empty dependency array to avoid infinite loops.

```tsx
useEffect(() => {
  const saved = restore();
  if (saved) {
    setCards(saved.cards);
    setAltText(saved.altText);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Only run on mount
```

2. **Clear After Success**: Always clear saved data after successful operations to prevent stale data.

```tsx
const handleSend = async () => {
  try {
    await sendMessage(cards, altText);
    clear(); // Clear only after success
  } catch (error) {
    // Don't clear on error - keep draft
    console.error(error);
  }
};
```

3. **User Feedback**: Show users when data is restored and when it's auto-saved.

```tsx
{hasSavedData && (
  <div className="text-xs text-slate-400">
    Draft saved at {savedAt && new Date(savedAt).toLocaleTimeString()}
  </div>
)}
```

4. **Handle Empty State**: Don't save if there's no meaningful data.

```tsx
// Hook already handles this internally
// Empty cards + empty altText = no save
```

5. **Error Handling**: The hook gracefully handles localStorage errors, but you can add additional error handling if needed.

```tsx
useEffect(() => {
  try {
    const saved = restore();
    if (saved) {
      setCards(saved.cards);
      setAltText(saved.altText);
    }
  } catch (error) {
    console.error('Failed to restore:', error);
    // Show error to user
  }
}, [restore]);
```

#### Testing

The hook is fully tested with the following coverage:

- Auto-save functionality with debouncing
- Restore valid and invalid data
- Stale data detection (> 7 days)
- Clear functionality
- Custom configuration
- Edge cases (quota exceeded, invalid JSON, etc.)

Run tests:

```bash
npm test -- use-card-persistence.test.ts
```

#### Implementation Details

##### Storage Format

Data is saved in localStorage with the following structure:

```json
{
  "timestamp": 1234567890,
  "altText": "カードメッセージ",
  "cards": [
    {
      "id": "card-1",
      "type": "product",
      "title": "Sample Product",
      "description": "Description",
      "imageUrl": "https://example.com/image.jpg",
      "price": 1000,
      "actions": [...]
    }
  ]
}
```

##### Debouncing Strategy

The hook uses `setTimeout` with cleanup to implement debouncing:

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    save(cards, altText);
  }, debounceMs);

  return () => clearTimeout(timer);
}, [cards, altText, debounceMs, save]);
```

This ensures:
- Only the latest changes are saved
- Minimizes localStorage writes
- Prevents performance issues

##### Validation

Before restoring, the hook validates:

1. Data exists in localStorage
2. Data is valid JSON
3. Data has required fields (`timestamp`, `altText`, `cards`)
4. Timestamp is not stale (< 7 days by default)

Invalid or stale data is automatically removed.

#### Troubleshooting

##### Data Not Saving

Check:
1. Cards and altText are not both empty
2. localStorage is available and not disabled
3. Quota is not exceeded (check browser console)

##### Data Not Restoring

Check:
1. Data is not stale (> 7 days)
2. localStorage key matches (if using custom key)
3. Browser console for validation errors

##### Quota Exceeded

If you encounter quota exceeded errors:
1. Reduce the number of cards
2. Reduce image URLs length
3. Consider using a different storage solution

#### Browser Compatibility

The hook uses:
- `localStorage` (IE8+)
- `setTimeout` (all browsers)
- `JSON.parse/stringify` (IE8+)

Full support in all modern browsers and IE8+.

#### Performance Considerations

- **Debouncing**: Reduces localStorage writes significantly
- **Validation**: Early validation prevents unnecessary processing
- **Cleanup**: Automatic cleanup of timers prevents memory leaks
- **Stale data removal**: Keeps localStorage clean

#### Security Considerations

- Data is stored in localStorage (client-side only)
- No sensitive data should be stored
- Data is not encrypted
- Users can view/modify localStorage data via DevTools

#### Future Enhancements

Possible improvements:

1. **Compression**: Compress data before saving
2. **Encryption**: Encrypt sensitive data
3. **Versioning**: Support data migration
4. **Cloud sync**: Sync across devices
5. **Undo/Redo**: Integration with undo/redo system

## Related Documentation

- [Card Editor Component](../card-editor.md)
- [Card Types](../types.ts)
- [Card Editor README](../README.md)

## License

Part of the LINE Messaging App project.
