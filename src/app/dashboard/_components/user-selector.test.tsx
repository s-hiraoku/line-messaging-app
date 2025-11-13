import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserSelector } from './user-selector';

describe('UserSelector', () => {
  const mockOnValueChange = vi.fn();
  const mockUsers = [
    {
      id: '1',
      lineUserId: 'U1234567890abcdef',
      displayName: 'Test User 1',
      pictureUrl: 'https://example.com/user1.jpg',
      isFollowing: true,
      createdAt: '2024-01-01T00:00:00Z',
      lastMessageAt: '2024-01-02T00:00:00Z',
    },
    {
      id: '2',
      lineUserId: 'U2234567890abcdef',
      displayName: 'Test User 2',
      pictureUrl: null,
      isFollowing: true,
      createdAt: '2024-01-01T00:00:00Z',
      lastMessageAt: null,
    },
  ];

  beforeEach(() => {
    mockOnValueChange.mockClear();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders search input with placeholder', () => {
    render(
      <UserSelector
        onValueChange={mockOnValueChange}
        placeholder="Search users..."
      />
    );

    expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
  });

  it('renders default placeholder when not provided', () => {
    render(<UserSelector onValueChange={mockOnValueChange} />);

    expect(screen.getByPlaceholderText('ユーザーを検索...')).toBeInTheDocument();
  });

  it('fetches and displays users when typing in search', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: mockUsers, nextCursor: null }),
    });

    render(<UserSelector onValueChange={mockOnValueChange} />);

    const input = screen.getByPlaceholderText('ユーザーを検索...');
    fireEvent.change(input, { target: { value: 'Test' } });

    // Wait for debounce and API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users?q=Test')
      );
    }, { timeout: 500 });

    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
      expect(screen.getByText('Test User 2')).toBeInTheDocument();
    });
  });

  it('displays loading state while fetching', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<UserSelector onValueChange={mockOnValueChange} />);

    const input = screen.getByPlaceholderText('ユーザーを検索...');
    fireEvent.change(input, { target: { value: 'Test' } });

    await waitFor(() => {
      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('calls onValueChange when user is selected', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: mockUsers, nextCursor: null }),
    });

    render(<UserSelector onValueChange={mockOnValueChange} />);

    const input = screen.getByPlaceholderText('ユーザーを検索...');
    fireEvent.change(input, { target: { value: 'Test' } });

    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    }, { timeout: 500 });

    const userButton = screen.getByText('Test User 1').closest('button');
    if (userButton) {
      fireEvent.click(userButton);
    }

    await waitFor(() => {
      expect(mockOnValueChange).toHaveBeenCalledWith('U1234567890abcdef');
    });
  });

  it('displays selected user with clear button', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: mockUsers, nextCursor: null }),
    });

    render(<UserSelector onValueChange={mockOnValueChange} />);

    const input = screen.getByPlaceholderText('ユーザーを検索...');
    fireEvent.change(input, { target: { value: 'Test' } });

    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    }, { timeout: 500 });

    const userButton = screen.getByText('Test User 1').closest('button');
    if (userButton) {
      fireEvent.click(userButton);
    }

    await waitFor(() => {
      // Search input should be replaced with selected user display
      expect(screen.queryByPlaceholderText('ユーザーを検索...')).not.toBeInTheDocument();
      // Clear button should be present
      expect(screen.getByLabelText('選択を解除')).toBeInTheDocument();
    });
  });

  it('clears selection when clear button is clicked', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: mockUsers, nextCursor: null }),
    });

    render(<UserSelector onValueChange={mockOnValueChange} />);

    // Select a user
    const input = screen.getByPlaceholderText('ユーザーを検索...');
    fireEvent.change(input, { target: { value: 'Test' } });

    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    }, { timeout: 500 });

    const userButton = screen.getByText('Test User 1').closest('button');
    if (userButton) {
      fireEvent.click(userButton);
    }

    await waitFor(() => {
      expect(screen.getByLabelText('選択を解除')).toBeInTheDocument();
    });

    // Clear selection
    const clearButton = screen.getByLabelText('選択を解除');
    fireEvent.click(clearButton);

    await waitFor(() => {
      // Search input should be back
      expect(screen.getByPlaceholderText('ユーザーを検索...')).toBeInTheDocument();
    });
  });

  it('displays "no users found" message when search returns empty', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], nextCursor: null }),
    });

    render(<UserSelector onValueChange={mockOnValueChange} />);

    const input = screen.getByPlaceholderText('ユーザーを検索...');
    fireEvent.change(input, { target: { value: 'NonExistent' } });

    await waitFor(() => {
      expect(screen.getByText('ユーザーが見つかりませんでした')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('handles API errors gracefully', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('API Error'));

    render(<UserSelector onValueChange={mockOnValueChange} />);

    const input = screen.getByPlaceholderText('ユーザーを検索...');
    fireEvent.change(input, { target: { value: 'Test' } });

    await waitFor(() => {
      // Should show "no users found" after error
      expect(screen.getByText('ユーザーが見つかりませんでした')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('loads initial user when value prop is provided', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [mockUsers[0]], nextCursor: null }),
    });

    render(
      <UserSelector
        value="U1234567890abcdef"
        onValueChange={mockOnValueChange}
      />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users?q=U1234567890abcdef')
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    });
  });
});
