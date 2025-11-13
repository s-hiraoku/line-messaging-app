import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CardEditor } from './card-editor';
import type { Card } from './types';

// Mock the sub-components to isolate CardEditor logic
vi.mock('./card-list', () => ({
  CardList: ({ cards, selectedId, onSelect, onDelete, onReorder, onAdd }: {
    cards: Card[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onReorder: (oldIndex: number, newIndex: number) => void;
    onAdd: () => void;
  }) => (
    <div data-testid="card-list">
      <button onClick={onAdd} data-testid="add-card-button">Add Card</button>
      {cards.map((card) => (
        <div key={card.id} data-testid={`card-${card.id}`}>
          <button onClick={() => onSelect(card.id)} data-testid={`select-${card.id}`}>
            Select {card.id}
          </button>
          <button onClick={() => onDelete(card.id)} data-testid={`delete-${card.id}`}>
            Delete {card.id}
          </button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('./card-type-selector', () => ({
  CardTypeSelector: ({ isOpen, onClose, onSelect }: {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: string) => void;
  }) => (
    isOpen ? (
      <div data-testid="card-type-selector">
        <button onClick={() => onSelect('product')} data-testid="select-product">
          Product
        </button>
        <button onClick={() => onSelect('location')} data-testid="select-location">
          Location
        </button>
        <button onClick={() => onSelect('person')} data-testid="select-person">
          Person
        </button>
        <button onClick={() => onSelect('image')} data-testid="select-image">
          Image
        </button>
        <button onClick={onClose} data-testid="close-selector">Close</button>
      </div>
    ) : null
  ),
}));

vi.mock('./card-form-product', () => ({
  ProductForm: ({ card }: { card: Card }) => (
    <div data-testid="product-form">Product Form: {card.id}</div>
  ),
}));

vi.mock('./card-form-location', () => ({
  LocationForm: ({ card }: { card: Card }) => (
    <div data-testid="location-form">Location Form: {card.id}</div>
  ),
}));

vi.mock('./card-form-person', () => ({
  PersonForm: ({ card }: { card: Card }) => (
    <div data-testid="person-form">Person Form: {card.id}</div>
  ),
}));

vi.mock('./card-form-image', () => ({
  CardFormImage: ({ card }: { card: Card }) => (
    <div data-testid="image-form">Image Form: {card.id}</div>
  ),
}));

describe('CardEditor', () => {
  let mockOnChange: Mock<(cards: Card[]) => void>;

  beforeEach(() => {
    mockOnChange = vi.fn<(cards: Card[]) => void>();
  });

  describe('Initialization', () => {
    it('creates a default product card when no initial cards provided', () => {
      render(<CardEditor onChange={mockOnChange} />);

      // Should have card list rendered
      expect(screen.getByTestId('card-list')).toBeInTheDocument();

      // Should show product form for the default card
      expect(screen.getByTestId('product-form')).toBeInTheDocument();
    });

    it('uses initial cards when provided', () => {
      const initialCards: Card[] = [
        {
          id: 'card-1',
          type: 'location',
          title: 'Tokyo Tower',
          address: 'Tokyo',
          imageUrl: 'https://example.com/image.jpg',
          actions: [{ type: 'uri', label: 'View', uri: 'https://example.com' }],
        },
      ];

      render(<CardEditor initialCards={initialCards} onChange={mockOnChange} />);

      // Should show location form for the initial card
      expect(screen.getByTestId('location-form')).toBeInTheDocument();
      expect(screen.getByText('Location Form: card-1')).toBeInTheDocument();
    });

    it('selects first card by default', async () => {
      const initialCards: Card[] = [
        {
          id: 'card-1',
          type: 'product',
          title: 'Product 1',
          description: 'Desc',
          imageUrl: 'https://example.com/1.jpg',
          actions: [{ type: 'uri', label: 'View', uri: 'https://example.com' }],
        },
        {
          id: 'card-2',
          type: 'location',
          title: 'Location 2',
          address: 'Address',
          imageUrl: 'https://example.com/2.jpg',
          actions: [{ type: 'uri', label: 'View', uri: 'https://example.com' }],
        },
      ];

      render(<CardEditor initialCards={initialCards} onChange={mockOnChange} />);

      // First card should be selected (product form shown)
      await waitFor(() => {
        expect(screen.getByTestId('product-form')).toBeInTheDocument();
      });
    });
  });

  describe('Card Selection', () => {
    it('switches form when selecting different card', async () => {
      const user = userEvent.setup();
      const initialCards: Card[] = [
        {
          id: 'card-1',
          type: 'product',
          title: 'Product',
          description: 'Desc',
          imageUrl: 'https://example.com/1.jpg',
          actions: [{ type: 'uri', label: 'View', uri: 'https://example.com' }],
        },
        {
          id: 'card-2',
          type: 'person',
          name: 'John',
          description: 'Developer',
          imageUrl: 'https://example.com/2.jpg',
          actions: [{ type: 'uri', label: 'View', uri: 'https://example.com' }],
        },
      ];

      render(<CardEditor initialCards={initialCards} onChange={mockOnChange} />);

      // Initially showing product form
      await waitFor(() => {
        expect(screen.getByTestId('product-form')).toBeInTheDocument();
      });

      // Click to select second card
      await user.click(screen.getByTestId('select-card-2'));

      // Should now show person form
      await waitFor(() => {
        expect(screen.getByTestId('person-form')).toBeInTheDocument();
      });
    });
  });

  describe('Card Addition', () => {
    it('opens type selector when adding card', async () => {
      const user = userEvent.setup();
      render(<CardEditor onChange={mockOnChange} />);

      // Type selector should not be visible initially
      expect(screen.queryByTestId('card-type-selector')).not.toBeInTheDocument();

      // Click add card button
      await user.click(screen.getByTestId('add-card-button'));

      // Type selector should now be visible
      expect(screen.getByTestId('card-type-selector')).toBeInTheDocument();
    });

    it('adds new card when type is selected', async () => {
      const user = userEvent.setup();
      render(<CardEditor onChange={mockOnChange} />);

      // Open type selector
      await user.click(screen.getByTestId('add-card-button'));

      // Select location type
      await user.click(screen.getByTestId('select-location'));

      // Type selector should be closed
      await waitFor(() => {
        expect(screen.queryByTestId('card-type-selector')).not.toBeInTheDocument();
      });

      // Location form should be shown (new card is selected)
      await waitFor(() => {
        expect(screen.getByTestId('location-form')).toBeInTheDocument();
      });
    });

    it('closes type selector when close button clicked', async () => {
      const user = userEvent.setup();
      render(<CardEditor onChange={mockOnChange} />);

      // Open type selector
      await user.click(screen.getByTestId('add-card-button'));
      expect(screen.getByTestId('card-type-selector')).toBeInTheDocument();

      // Close selector
      await user.click(screen.getByTestId('close-selector'));

      // Selector should be closed
      await waitFor(() => {
        expect(screen.queryByTestId('card-type-selector')).not.toBeInTheDocument();
      });
    });
  });

  describe('Card Deletion', () => {
    it('prevents deletion of last card', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const initialCards: Card[] = [
        {
          id: 'test-card-1',
          type: 'product',
          title: 'Product 1',
          description: 'Desc',
          imageUrl: 'https://example.com/1.jpg',
          actions: [{ type: 'uri', label: 'View', uri: 'https://example.com' }],
        },
      ];

      render(<CardEditor initialCards={initialCards} onChange={mockOnChange} />);

      // Try to delete the only card
      await user.click(screen.getByTestId('delete-test-card-1'));

      // Should log warning
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cannot delete the last card')
      );

      // Card should still exist
      expect(screen.getByTestId('card-test-card-1')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('deletes card and selects another when multiple cards exist', async () => {
      const user = userEvent.setup();
      const initialCards: Card[] = [
        {
          id: 'card-1',
          type: 'product',
          title: 'Product 1',
          description: 'Desc',
          imageUrl: 'https://example.com/1.jpg',
          actions: [{ type: 'uri', label: 'View', uri: 'https://example.com' }],
        },
        {
          id: 'card-2',
          type: 'location',
          title: 'Location 2',
          address: 'Address',
          imageUrl: 'https://example.com/2.jpg',
          actions: [{ type: 'uri', label: 'View', uri: 'https://example.com' }],
        },
      ];

      render(<CardEditor initialCards={initialCards} onChange={mockOnChange} />);

      // Delete first card
      await user.click(screen.getByTestId('delete-card-1'));

      // First card should be removed
      await waitFor(() => {
        expect(screen.queryByTestId('card-card-1')).not.toBeInTheDocument();
      });

      // Second card should still exist
      expect(screen.getByTestId('card-card-2')).toBeInTheDocument();
    });
  });

  describe('onChange Callback', () => {
    it('calls onChange when cards are modified', async () => {
      const user = userEvent.setup();
      render(<CardEditor onChange={mockOnChange} />);

      // Add a new card
      await user.click(screen.getByTestId('add-card-button'));
      await user.click(screen.getByTestId('select-person'));

      // onChange should have been called with updated cards
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
        const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1];
        expect(lastCall[0]).toHaveLength(2); // Should have 2 cards now
      });
    });
  });

  describe('Card Limit', () => {
    it('prevents adding more than 9 cards', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Create 9 initial cards
      const initialCards: Card[] = Array.from({ length: 9 }, (_, i) => ({
        id: `card-${i + 1}`,
        type: 'product' as const,
        title: `Product ${i + 1}`,
        description: 'Desc',
        imageUrl: 'https://example.com/image.jpg',
        actions: [{ type: 'uri' as const, label: 'View', uri: 'https://example.com' }],
      }));

      render(<CardEditor initialCards={initialCards} onChange={mockOnChange} />);

      // Try to add one more card
      await user.click(screen.getByTestId('add-card-button'));

      // Type selector should not open (maximum reached)
      expect(screen.queryByTestId('card-type-selector')).not.toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });
});
