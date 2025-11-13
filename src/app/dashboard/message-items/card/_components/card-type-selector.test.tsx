import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CardTypeSelector } from './card-type-selector';

describe('CardTypeSelector', () => {
  const mockOnClose = vi.fn();
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <CardTypeSelector isOpen={false} onClose={mockOnClose} onSelect={mockOnSelect} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render modal when isOpen is true', () => {
    render(
      <CardTypeSelector isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />
    );
    expect(screen.getByText('カードタイプを選択')).toBeInTheDocument();
    expect(screen.getByText('作成するカードのタイプを選んでください')).toBeInTheDocument();
  });

  it('should render all 4 card type options', () => {
    render(
      <CardTypeSelector isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />
    );

    expect(screen.getByText('商品')).toBeInTheDocument();
    expect(screen.getByText('場所')).toBeInTheDocument();
    expect(screen.getByText('人物')).toBeInTheDocument();
    expect(screen.getByText('画像')).toBeInTheDocument();
  });

  it('should display descriptions for each card type', () => {
    render(
      <CardTypeSelector isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />
    );

    expect(screen.getByText('ECサイトの商品や販売アイテムの紹介に最適')).toBeInTheDocument();
    expect(screen.getByText('店舗やイベント会場などの場所情報の共有に')).toBeInTheDocument();
    expect(screen.getByText('スタッフ紹介やプロフィール表示に')).toBeInTheDocument();
    expect(screen.getByText('シンプルな画像とキャプションの表示に')).toBeInTheDocument();
  });

  it('should call onSelect and onClose when a card type is clicked', () => {
    render(
      <CardTypeSelector isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />
    );

    const productButton = screen.getByText('商品').closest('button');
    fireEvent.click(productButton!);

    expect(mockOnSelect).toHaveBeenCalledWith('product');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <CardTypeSelector isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />
    );

    const closeButton = screen.getByRole('button', { name: '閉じる' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('should call onClose when overlay is clicked', () => {
    const { container } = render(
      <CardTypeSelector isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />
    );

    // Get the outermost overlay div
    const overlay = container.firstChild as HTMLElement;
    fireEvent.click(overlay);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not close when clicking inside the modal content', () => {
    render(
      <CardTypeSelector isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />
    );

    const modalContent = screen.getByText('カードタイプを選択').closest('div');
    fireEvent.click(modalContent!);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should call onClose when Escape key is pressed', () => {
    render(
      <CardTypeSelector isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onSelect with correct card type for each option', () => {
    render(
      <CardTypeSelector isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />
    );

    // Test product
    fireEvent.click(screen.getByText('商品').closest('button')!);
    expect(mockOnSelect).toHaveBeenCalledWith('product');

    vi.clearAllMocks();

    // Re-render for location test
    render(
      <CardTypeSelector isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />
    );
    fireEvent.click(screen.getAllByText('場所')[0].closest('button')!);
    expect(mockOnSelect).toHaveBeenCalledWith('location');

    vi.clearAllMocks();

    // Re-render for person test
    render(
      <CardTypeSelector isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />
    );
    fireEvent.click(screen.getAllByText('人物')[0].closest('button')!);
    expect(mockOnSelect).toHaveBeenCalledWith('person');

    vi.clearAllMocks();

    // Re-render for image test
    render(
      <CardTypeSelector isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />
    );
    fireEvent.click(screen.getAllByText('画像')[0].closest('button')!);
    expect(mockOnSelect).toHaveBeenCalledWith('image');
  });

  it('should display help text about card type immutability', () => {
    render(
      <CardTypeSelector isOpen={true} onClose={mockOnClose} onSelect={mockOnSelect} />
    );

    expect(
      screen.getByText('カードタイプは後から変更できません。用途に合わせて適切なタイプを選択してください。')
    ).toBeInTheDocument();
  });
});
