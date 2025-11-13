import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductForm } from './card-form-product';
import type { ProductCard } from './types';

// Mock ImageUploader component
vi.mock('@/app/dashboard/_components/image-uploader', () => ({
  ImageUploader: ({ onImageUploaded, placeholder }: { onImageUploaded: (url: string) => void; placeholder?: string }) => (
    <div data-testid="image-uploader">
      <p>{placeholder}</p>
      <button
        onClick={() => onImageUploaded('https://example.com/test-image.jpg')}
      >
        Upload Image
      </button>
    </div>
  ),
}));

// Mock ActionEditor component
vi.mock('./action-editor', () => ({
  ActionEditor: ({ actions, onChange }: { actions: unknown[]; onChange: (actions: unknown[]) => void }) => (
    <div data-testid="action-editor">
      <p>Actions: {actions.length}</p>
      <button
        onClick={() => onChange([...actions, { type: 'uri', label: 'Test', uri: 'https://example.com' }])}
      >
        Add Action
      </button>
    </div>
  ),
}));

describe('ProductForm', () => {
  const defaultCard: ProductCard = {
    id: 'test-card-1',
    type: 'product',
    title: 'Test Product',
    description: 'Test Description',
    price: 1000,
    imageUrl: 'https://example.com/image.jpg',
    actions: [
      { type: 'uri', label: 'View', uri: 'https://example.com' },
    ],
  };

  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all form fields correctly', () => {
    render(<ProductForm card={defaultCard} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/タイトル/)).toBeInTheDocument();
    expect(screen.getByLabelText(/説明/)).toBeInTheDocument();
    expect(screen.getByLabelText(/価格/)).toBeInTheDocument();
    expect(screen.getAllByText(/画像/)[0]).toBeInTheDocument();
    expect(screen.getByTestId('action-editor')).toBeInTheDocument();
  });

  it('displays current card values', () => {
    render(<ProductForm card={defaultCard} onChange={mockOnChange} />);

    const titleInput = screen.getByLabelText(/タイトル/) as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(/説明/) as HTMLTextAreaElement;
    const priceInput = screen.getByLabelText(/価格/) as HTMLInputElement;

    expect(titleInput.value).toBe('Test Product');
    expect(descriptionInput.value).toBe('Test Description');
    expect(priceInput.value).toBe('1000');
  });

  it('shows character count for title', () => {
    render(<ProductForm card={defaultCard} onChange={mockOnChange} />);

    expect(screen.getByText('12/40文字')).toBeInTheDocument();
  });

  it('shows character count for description', () => {
    render(<ProductForm card={defaultCard} onChange={mockOnChange} />);

    expect(screen.getByText('16/60文字')).toBeInTheDocument();
  });

  it('calls onChange when title is updated', async () => {
    const user = userEvent.setup();
    render(<ProductForm card={defaultCard} onChange={mockOnChange} />);

    const titleInput = screen.getByLabelText(/タイトル/) as HTMLInputElement;
    await user.clear(titleInput);
    await user.type(titleInput, 'New');

    // Check that onChange was called
    expect(mockOnChange).toHaveBeenCalled();
    // After clear and typing "New", verify the onChange was called with title updates
    const calls = mockOnChange.mock.calls;
    const hasTitleUpdate = calls.some(call => call[0].title !== undefined && call[0].title !== 'Test Product');
    expect(hasTitleUpdate).toBe(true);
  });

  it('calls onChange when description is updated', async () => {
    const user = userEvent.setup();
    render(<ProductForm card={defaultCard} onChange={mockOnChange} />);

    const descriptionInput = screen.getByLabelText(/説明/) as HTMLTextAreaElement;
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'Updated');

    // Check that onChange was called
    expect(mockOnChange).toHaveBeenCalled();
    // After clear and typing "Updated", verify the onChange was called with description updates
    const calls = mockOnChange.mock.calls;
    const hasDescriptionUpdate = calls.some(call => call[0].description !== undefined && call[0].description !== 'Test Description');
    expect(hasDescriptionUpdate).toBe(true);
  });

  it('calls onChange when price is updated', async () => {
    const user = userEvent.setup();
    render(<ProductForm card={defaultCard} onChange={mockOnChange} />);

    const priceInput = screen.getByLabelText(/価格/) as HTMLInputElement;
    await user.clear(priceInput);
    await user.type(priceInput, '500');

    // Check that onChange was called
    expect(mockOnChange).toHaveBeenCalled();
    // Verify at least one call contains a price update
    const calls = mockOnChange.mock.calls;
    expect(calls.some(call => call[0].price !== undefined)).toBe(true);
  });

  it('allows clearing price (optional field)', async () => {
    const user = userEvent.setup();
    render(<ProductForm card={defaultCard} onChange={mockOnChange} />);

    const priceInput = screen.getByLabelText(/価格/);
    await user.clear(priceInput);

    expect(mockOnChange).toHaveBeenCalledWith({ price: undefined });
  });

  it('validates required fields and shows errors', async () => {
    const emptyCard: ProductCard = {
      ...defaultCard,
      title: '',
      description: '',
      imageUrl: '',
      actions: [],
    };

    render(<ProductForm card={emptyCard} onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();
      expect(screen.getByText('説明は必須です')).toBeInTheDocument();
      expect(screen.getByText('画像は必須です')).toBeInTheDocument();
      expect(screen.getByText('アクションは最低1つ必要です')).toBeInTheDocument();
    });
  });

  it('validates title max length (40 characters)', async () => {
    const longTitleCard: ProductCard = {
      ...defaultCard,
      title: 'a'.repeat(41),
    };

    render(<ProductForm card={longTitleCard} onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText('タイトルは40文字以内で入力してください')).toBeInTheDocument();
    });
  });

  it('validates description max length (60 characters)', async () => {
    const longDescriptionCard: ProductCard = {
      ...defaultCard,
      description: 'a'.repeat(61),
    };

    render(<ProductForm card={longDescriptionCard} onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText('説明は60文字以内で入力してください')).toBeInTheDocument();
    });
  });

  it('validates price is non-negative', async () => {
    const negativePriceCard: ProductCard = {
      ...defaultCard,
      price: -100,
    };

    render(<ProductForm card={negativePriceCard} onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText('価格は0以上で入力してください')).toBeInTheDocument();
    });
  });

  it('calls onChange when image is uploaded', async () => {
    const user = userEvent.setup();
    render(<ProductForm card={defaultCard} onChange={mockOnChange} />);

    const uploadButton = screen.getByText('Upload Image');
    await user.click(uploadButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      imageUrl: 'https://example.com/test-image.jpg',
    });
  });

  it('displays uploaded image preview', () => {
    render(<ProductForm card={defaultCard} onChange={mockOnChange} />);

    const imagePreview = screen.getByAltText('アップロード済み画像') as HTMLImageElement;
    expect(imagePreview).toBeInTheDocument();
    // Next.js Image component transforms the src URL, so we just verify it exists and contains the original URL
    expect(imagePreview.src).toContain('example.com');
  });

  it('shows validation summary when errors exist', async () => {
    const invalidCard: ProductCard = {
      ...defaultCard,
      title: '',
      description: '',
    };

    render(<ProductForm card={invalidCard} onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText('入力内容に問題があります')).toBeInTheDocument();
    });
  });

  it('enforces max length on title input', async () => {
    const user = userEvent.setup();
    render(<ProductForm card={defaultCard} onChange={mockOnChange} />);

    const titleInput = screen.getByLabelText(/タイトル/) as HTMLInputElement;
    expect(titleInput).toHaveAttribute('maxLength', '40');
  });

  it('enforces max length on description input', async () => {
    const user = userEvent.setup();
    render(<ProductForm card={defaultCard} onChange={mockOnChange} />);

    const descriptionInput = screen.getByLabelText(/説明/) as HTMLTextAreaElement;
    expect(descriptionInput).toHaveAttribute('maxLength', '60');
  });

  it('allows only non-negative numbers for price', () => {
    render(<ProductForm card={defaultCard} onChange={mockOnChange} />);

    const priceInput = screen.getByLabelText(/価格/) as HTMLInputElement;
    expect(priceInput).toHaveAttribute('type', 'number');
    expect(priceInput).toHaveAttribute('min', '0');
  });
});
