/**
 * Card List Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CardList } from './card-list';
import type { Card, ProductCard, LocationCard } from './types';

describe('CardList', () => {
  const mockCards: Card[] = [
    {
      id: 'card-1',
      type: 'product',
      title: 'テスト商品',
      description: 'テスト説明',
      imageUrl: 'https://example.com/image1.jpg',
      actions: [
        {
          type: 'uri',
          label: '詳細',
          uri: 'https://example.com',
        },
      ],
    } as ProductCard,
    {
      id: 'card-2',
      type: 'location',
      title: 'テスト場所',
      address: 'テスト住所',
      imageUrl: 'https://example.com/image2.jpg',
      actions: [
        {
          type: 'message',
          label: '選択',
          text: 'selected',
        },
      ],
    } as LocationCard,
  ];

  const defaultProps = {
    cards: mockCards,
    selectedId: null,
    onSelect: vi.fn(),
    onDelete: vi.fn(),
    onReorder: vi.fn(),
    onAdd: vi.fn(),
  };

  it('should render card list with correct count', () => {
    render(<CardList {...defaultProps} />);
    expect(screen.getByText(/カード一覧/)).toBeInTheDocument();
    expect(screen.getByText(/\(2 \/ 9\)/)).toBeInTheDocument();
  });

  it('should display all cards', () => {
    render(<CardList {...defaultProps} />);
    expect(screen.getByText('テスト商品')).toBeInTheDocument();
    expect(screen.getByText('テスト場所')).toBeInTheDocument();
  });

  it('should show card type badges', () => {
    render(<CardList {...defaultProps} />);
    expect(screen.getByText('商品')).toBeInTheDocument();
    expect(screen.getByText('場所')).toBeInTheDocument();
  });

  it('should highlight selected card', () => {
    render(<CardList {...defaultProps} selectedId="card-1" />);
    const cards = screen.getAllByRole('button', { name: /ドラッグして並び替え/ });
    const selectedCard = cards[0].closest('div[class*="border"]');
    expect(selectedCard?.className).toContain('border-blue-500');
  });

  it('should call onSelect when card is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CardList {...defaultProps} onSelect={onSelect} />);

    await user.click(screen.getByText('テスト商品'));
    expect(onSelect).toHaveBeenCalledWith('card-1');
  });

  it('should call onAdd when add button is clicked', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<CardList {...defaultProps} onAdd={onAdd} />);

    await user.click(screen.getByRole('button', { name: /カードを追加/ }));
    expect(onAdd).toHaveBeenCalled();
  });

  it('should disable add button when max cards reached', () => {
    const maxCards: Card[] = Array.from({ length: 9 }, (_, i) => ({
      ...mockCards[0],
      id: `card-${i}`,
    }));

    render(<CardList {...defaultProps} cards={maxCards} />);
    const addButton = screen.getByRole('button', { name: /カードを追加/ });
    expect(addButton).toBeDisabled();
    expect(screen.getByText(/最大9枚までカードを作成できます/)).toBeInTheDocument();
  });

  it('should disable delete button when only one card exists', () => {
    render(<CardList {...defaultProps} cards={[mockCards[0]]} />);
    const deleteButtons = screen.getAllByLabelText('カードを削除');
    expect(deleteButtons[0]).toBeDisabled();
    expect(screen.getByText(/少なくとも1枚のカードが必要です/)).toBeInTheDocument();
  });

  it('should show confirmation dialog when delete is clicked', async () => {
    const user = userEvent.setup();
    render(<CardList {...defaultProps} />);

    const deleteButtons = screen.getAllByLabelText('カードを削除');
    await user.click(deleteButtons[0]);

    expect(screen.getByText('カードを削除しますか?')).toBeInTheDocument();
    expect(screen.getByText(/「テスト商品」を削除してもよろしいですか?/)).toBeInTheDocument();
  });

  it('should call onDelete when deletion is confirmed', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<CardList {...defaultProps} onDelete={onDelete} />);

    // Click delete button
    const deleteButtons = screen.getAllByLabelText('カードを削除');
    await user.click(deleteButtons[0]);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: '削除' });
    await user.click(confirmButton);

    expect(onDelete).toHaveBeenCalledWith('card-1');
  });

  it('should close dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<CardList {...defaultProps} />);

    // Click delete button
    const deleteButtons = screen.getAllByLabelText('カードを削除');
    await user.click(deleteButtons[0]);

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    await user.click(cancelButton);

    // Dialog should be closed
    expect(screen.queryByText('カードを削除しますか?')).not.toBeInTheDocument();
  });

  it('should show card thumbnails', () => {
    render(<CardList {...defaultProps} />);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', 'https://example.com/image1.jpg');
    expect(images[1]).toHaveAttribute('src', 'https://example.com/image2.jpg');
  });

  it('should show placeholder icon when no image', () => {
    const cardsWithoutImage = [
      {
        ...mockCards[0],
        imageUrl: '',
      },
    ];
    render(<CardList {...defaultProps} cards={cardsWithoutImage} />);

    // The icon should be in the placeholder div
    const placeholder = screen.getByText('テスト商品').closest('div')?.previousSibling as HTMLElement | null;
    expect(placeholder?.querySelector('svg')).toBeInTheDocument();
  });
});
