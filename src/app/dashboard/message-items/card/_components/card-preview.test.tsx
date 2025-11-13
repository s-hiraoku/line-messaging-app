/**
 * CardPreview Component Tests
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CardPreview } from './card-preview';
import type { Card } from './types';

describe('CardPreview', () => {
  it('renders empty state when no cards provided', () => {
    render(<CardPreview cards={[]} />);
    expect(screen.getByText('カードがありません')).toBeInTheDocument();
  });

  it('renders product card with price', () => {
    const cards: Card[] = [
      {
        id: '1',
        type: 'product',
        title: 'Test Product',
        description: 'Product description',
        price: 1000,
        imageUrl: 'https://example.com/image.jpg',
        actions: [
          { type: 'uri', label: 'Buy Now', uri: 'https://example.com' }
        ]
      }
    ];

    render(<CardPreview cards={cards} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Product description')).toBeInTheDocument();
    expect(screen.getByText('¥1,000')).toBeInTheDocument();
  });

  it('renders location card with address and hours', () => {
    const cards: Card[] = [
      {
        id: '1',
        type: 'location',
        title: 'Test Location',
        address: '123 Test St',
        hours: '9:00-18:00',
        imageUrl: 'https://example.com/image.jpg',
        actions: []
      }
    ];

    render(<CardPreview cards={cards} />);
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('123 Test St')).toBeInTheDocument();
    expect(screen.getByText('9:00-18:00')).toBeInTheDocument();
  });

  it('renders person card with tags', () => {
    const cards: Card[] = [
      {
        id: '1',
        type: 'person',
        name: 'John Doe',
        description: 'Software Engineer',
        tags: ['React', 'TypeScript'],
        imageUrl: 'https://example.com/image.jpg',
        actions: []
      }
    ];

    render(<CardPreview cards={cards} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('renders image card with optional fields', () => {
    const cards: Card[] = [
      {
        id: '1',
        type: 'image',
        title: 'Beautiful Image',
        description: 'A stunning view',
        imageUrl: 'https://example.com/image.jpg',
        actions: []
      }
    ];

    render(<CardPreview cards={cards} />);
    expect(screen.getByText('Beautiful Image')).toBeInTheDocument();
    expect(screen.getByText('A stunning view')).toBeInTheDocument();
  });

  it('displays card indicator for multiple cards', () => {
    const cards: Card[] = [
      {
        id: '1',
        type: 'product',
        title: 'Card 1',
        description: 'Description 1',
        imageUrl: 'https://example.com/image1.jpg',
        actions: []
      },
      {
        id: '2',
        type: 'product',
        title: 'Card 2',
        description: 'Description 2',
        imageUrl: 'https://example.com/image2.jpg',
        actions: []
      }
    ];

    render(<CardPreview cards={cards} />);
    const indicators = screen.getAllByText('1 / 2');
    expect(indicators.length).toBeGreaterThan(0);
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    const cards: Card[] = [
      {
        id: '1',
        type: 'product',
        title: 'Test Product',
        description: 'Description',
        imageUrl: 'https://example.com/image.jpg',
        actions: [
          { type: 'uri', label: 'Visit Website', uri: 'https://example.com' },
          { type: 'message', label: 'Send Message', text: 'Hello' }
        ]
      }
    ];

    render(<CardPreview cards={cards} />);
    expect(screen.getByText('Visit Website')).toBeInTheDocument();
    expect(screen.getByText('Send Message')).toBeInTheDocument();
  });

  it('shows scroll hint for multiple cards', () => {
    const cards: Card[] = [
      {
        id: '1',
        type: 'product',
        title: 'Card 1',
        description: 'Description',
        imageUrl: 'https://example.com/image.jpg',
        actions: []
      },
      {
        id: '2',
        type: 'product',
        title: 'Card 2',
        description: 'Description',
        imageUrl: 'https://example.com/image.jpg',
        actions: []
      }
    ];

    render(<CardPreview cards={cards} />);
    expect(screen.getByText('左右にスクロールしてカードを確認')).toBeInTheDocument();
  });
});
