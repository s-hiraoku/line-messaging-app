import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PersonForm } from './card-form-person';
import type { PersonCard } from './types';

// Mock the ImageUploader component
vi.mock('@/app/dashboard/_components/image-uploader', () => ({
  ImageUploader: ({
    onImageUploaded,
    placeholder,
  }: {
    onImageUploaded: (url: string) => void;
    placeholder?: string;
  }) => (
    <div data-testid="image-uploader">
      <p>{placeholder}</p>
      <button onClick={() => onImageUploaded('https://example.com/image.jpg')}>
        Upload Image
      </button>
    </div>
  ),
}));

// Mock the ActionEditor component
vi.mock('./action-editor', () => ({
  ActionEditor: ({
    actions,
    onChange,
  }: {
    actions: PersonCard['actions'];
    onChange: (actions: PersonCard['actions']) => void;
  }) => (
    <div data-testid="action-editor">
      <p>Actions: {actions.length}</p>
      <button
        onClick={() =>
          onChange([
            ...actions,
            { type: 'uri', label: 'Test Action', uri: 'https://example.com' },
          ])
        }
      >
        Add Action
      </button>
    </div>
  ),
}));

describe('PersonForm', () => {
  const mockOnChange = vi.fn();

  const createMockCard = (overrides?: Partial<PersonCard>): PersonCard => ({
    id: '1',
    type: 'person',
    name: '',
    description: '',
    tags: [],
    imageUrl: '',
    actions: [],
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    const card = createMockCard({
      name: '山田 太郎',
      description: 'テスト',
      imageUrl: 'https://example.com/image.jpg',
      actions: [{ type: 'uri', label: 'Test', uri: 'https://example.com' }],
    });
    render(<PersonForm card={card} onChange={mockOnChange} />);

    // Check for required field labels by placeholder
    expect(screen.getByPlaceholderText(/例: 山田 太郎/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/例: プロジェクトマネージャー/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/タグを入力してEnterキーで追加/)).toBeInTheDocument();

    // Check for required indicators
    const requiredIndicators = screen.getAllByText('*');
    expect(requiredIndicators.length).toBeGreaterThan(0);
  });

  describe('Name field', () => {
    it('displays name value', () => {
      const card = createMockCard({ name: '山田 太郎' });
      render(<PersonForm card={card} onChange={mockOnChange} />);

      const nameInput = screen.getByPlaceholderText(/例: 山田 太郎/);
      expect(nameInput).toHaveValue('山田 太郎');
    });

    it('calls onChange when name is updated', async () => {
      const user = userEvent.setup();
      const card = createMockCard();
      render(<PersonForm card={card} onChange={mockOnChange} />);

      const nameInput = screen.getByPlaceholderText(/例: 山田 太郎/);
      await user.type(nameInput, '山');

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({ name: expect.stringContaining('山') })
        );
      });
    });

    it('displays character count for name', () => {
      const card = createMockCard({ name: '山田 太郎' });
      render(<PersonForm card={card} onChange={mockOnChange} />);

      expect(screen.getByText('5/40文字')).toBeInTheDocument();
    });

    it('enforces max length of 40 characters', () => {
      const card = createMockCard();
      render(<PersonForm card={card} onChange={mockOnChange} />);

      const nameInput = screen.getByPlaceholderText(/例: 山田 太郎/);
      expect(nameInput).toHaveAttribute('maxLength', '40');
    });

    it('shows validation error for empty name', async () => {
      const card = createMockCard({ name: '' });
      render(<PersonForm card={card} onChange={mockOnChange} />);

      await waitFor(() => {
        expect(screen.getByText('名前は必須です')).toBeInTheDocument();
      });
    });
  });

  describe('Description field', () => {
    it('displays description value', () => {
      const card = createMockCard({ description: 'プロジェクトマネージャー' });
      render(<PersonForm card={card} onChange={mockOnChange} />);

      const descInput = screen.getByPlaceholderText(/例: プロジェクトマネージャー/);
      expect(descInput).toHaveValue('プロジェクトマネージャー');
    });

    it('calls onChange when description is updated', async () => {
      const user = userEvent.setup();
      const card = createMockCard();
      render(<PersonForm card={card} onChange={mockOnChange} />);

      const descInput = screen.getByPlaceholderText(/例: プロジェクトマネージャー/);
      await user.type(descInput, 'エ');

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({ description: expect.stringContaining('エ') })
        );
      });
    });

    it('displays character count for description', () => {
      const card = createMockCard({ description: 'テスト説明' });
      render(<PersonForm card={card} onChange={mockOnChange} />);

      expect(screen.getByText('5/60文字')).toBeInTheDocument();
    });

    it('enforces max length of 60 characters', () => {
      const card = createMockCard();
      render(<PersonForm card={card} onChange={mockOnChange} />);

      const descInput = screen.getByPlaceholderText(/例: プロジェクトマネージャー/);
      expect(descInput).toHaveAttribute('maxLength', '60');
    });
  });

  describe('Tags field', () => {
    it('displays existing tags', () => {
      const card = createMockCard({ tags: ['エンジニア', 'リーダー'] });
      render(<PersonForm card={card} onChange={mockOnChange} />);

      expect(screen.getByText('エンジニア')).toBeInTheDocument();
      expect(screen.getByText('リーダー')).toBeInTheDocument();
    });

    it('adds tag when Enter key is pressed', async () => {
      const user = userEvent.setup();
      const card = createMockCard({ tags: [] });
      render(<PersonForm card={card} onChange={mockOnChange} />);

      const tagInput = screen.getByPlaceholderText(/タグを入力してEnterキーで追加/);
      await user.type(tagInput, 'エンジニア{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith({ tags: ['エンジニア'] });
    });

    it('adds tag when add button is clicked', async () => {
      const user = userEvent.setup();
      const card = createMockCard({ tags: [] });
      render(<PersonForm card={card} onChange={mockOnChange} />);

      const tagInput = screen.getByPlaceholderText(/タグを入力してEnterキーで追加/);
      await user.type(tagInput, 'デザイナー');

      const addButton = screen.getByRole('button', { name: '追加' });
      await user.click(addButton);

      expect(mockOnChange).toHaveBeenCalledWith({ tags: ['デザイナー'] });
    });

    it('removes tag when delete button is clicked', async () => {
      const user = userEvent.setup();
      const card = createMockCard({ tags: ['エンジニア', 'リーダー'] });
      render(<PersonForm card={card} onChange={mockOnChange} />);

      const deleteButton = screen.getByLabelText('タグ "エンジニア" を削除');
      await user.click(deleteButton);

      expect(mockOnChange).toHaveBeenCalledWith({ tags: ['リーダー'] });
    });

    it('does not add empty tag', async () => {
      const user = userEvent.setup();
      const card = createMockCard({ tags: [] });
      render(<PersonForm card={card} onChange={mockOnChange} />);

      const tagInput = screen.getByPlaceholderText(/タグを入力してEnterキーで追加/);
      await user.type(tagInput, '   {Enter}');

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('shows error for duplicate tag', async () => {
      const user = userEvent.setup();
      const card = createMockCard({ tags: ['エンジニア'] });
      render(<PersonForm card={card} onChange={mockOnChange} />);

      const tagInput = screen.getByPlaceholderText(/タグを入力してEnterキーで追加/);
      await user.type(tagInput, 'エンジニア');

      const addButton = screen.getByRole('button', { name: '追加' });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('このタグは既に追加されています')).toBeInTheDocument();
      });
    });

    it('enforces max length of 20 characters for tag input', () => {
      const card = createMockCard({ tags: [] });
      render(<PersonForm card={card} onChange={mockOnChange} />);

      const tagInput = screen.getByPlaceholderText(/タグを入力してEnterキーで追加/);
      // Verify the input has maxLength attribute to prevent typing more than 20 chars
      expect(tagInput).toHaveAttribute('maxLength', '20');
    });

    it('clears input after adding tag', async () => {
      const user = userEvent.setup();
      const card = createMockCard({ tags: [] });
      render(<PersonForm card={card} onChange={mockOnChange} />);

      const tagInput = screen.getByPlaceholderText(
        /タグを入力してEnterキーで追加/
      ) as HTMLInputElement;
      await user.type(tagInput, 'エンジニア{Enter}');

      await waitFor(() => {
        expect(tagInput.value).toBe('');
      });
    });
  });

  describe('Image field', () => {
    it('renders ImageUploader component', () => {
      const card = createMockCard();
      render(<PersonForm card={card} onChange={mockOnChange} />);

      expect(screen.getByTestId('image-uploader')).toBeInTheDocument();
      expect(screen.getByText('プロフィール画像をアップロード')).toBeInTheDocument();
    });

    it('calls onChange when image is uploaded', async () => {
      const user = userEvent.setup();
      const card = createMockCard();
      render(<PersonForm card={card} onChange={mockOnChange} />);

      const uploadButton = screen.getByText('Upload Image');
      await user.click(uploadButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        imageUrl: 'https://example.com/image.jpg',
      });
    });

    it('displays image preview when imageUrl is set', () => {
      const card = createMockCard({ imageUrl: 'https://example.com/person.jpg' });
      render(<PersonForm card={card} onChange={mockOnChange} />);

      expect(screen.getByText('現在の画像:')).toBeInTheDocument();
      const image = screen.getByAltText('プレビュー');
      // Next.js Image component transforms the src URL, so we just check it exists
      expect(image).toHaveAttribute('src');
      expect(image.getAttribute('src')).toContain('example.com');
    });

    it('shows validation error for missing image', async () => {
      const card = createMockCard({ imageUrl: '' });
      render(<PersonForm card={card} onChange={mockOnChange} />);

      await waitFor(() => {
        expect(screen.getByText('画像は必須です')).toBeInTheDocument();
      });
    });
  });

  describe('Actions field', () => {
    it('renders ActionEditor component', () => {
      const card = createMockCard();
      render(<PersonForm card={card} onChange={mockOnChange} />);

      expect(screen.getByTestId('action-editor')).toBeInTheDocument();
    });

    it('calls onChange when actions are updated', async () => {
      const user = userEvent.setup();
      const card = createMockCard({ actions: [] });
      render(<PersonForm card={card} onChange={mockOnChange} />);

      const addActionButton = screen.getByText('Add Action');
      await user.click(addActionButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        actions: [{ type: 'uri', label: 'Test Action', uri: 'https://example.com' }],
      });
    });

    it('shows validation error for missing actions', async () => {
      const card = createMockCard({ actions: [] });
      render(<PersonForm card={card} onChange={mockOnChange} />);

      await waitFor(() => {
        expect(
          screen.getByText('アクションを1つ以上追加してください')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Validation', () => {
    it('validates all fields on mount', async () => {
      const card = createMockCard({
        name: '',
        description: '',
        imageUrl: '',
        actions: [],
      });
      render(<PersonForm card={card} onChange={mockOnChange} />);

      await waitFor(() => {
        expect(screen.getByText('名前は必須です')).toBeInTheDocument();
        expect(screen.getByText('説明は必須です')).toBeInTheDocument();
        expect(screen.getByText('画像は必須です')).toBeInTheDocument();
        expect(
          screen.getByText('アクションを1つ以上追加してください')
        ).toBeInTheDocument();
      });
    });

    it('clears validation errors when fields are filled', async () => {
      const card = createMockCard({ name: '' });
      const { rerender } = render(<PersonForm card={card} onChange={mockOnChange} />);

      await waitFor(() => {
        expect(screen.getByText('名前は必須です')).toBeInTheDocument();
      });

      const updatedCard = createMockCard({ name: '山田 太郎' });
      rerender(<PersonForm card={updatedCard} onChange={mockOnChange} />);

      await waitFor(() => {
        expect(screen.queryByText('名前は必須です')).not.toBeInTheDocument();
      });
    });
  });
});
