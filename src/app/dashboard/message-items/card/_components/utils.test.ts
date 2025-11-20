/**
 * Card Message Editor - Utility Functions Tests
 *
 * Comprehensive test suite for card validation, conversion, and creation utilities
 */

import { describe, it, expect } from 'vitest';
import {
  validateAction,
  validateCard,
  cardToCarouselColumn,
  createDefaultCard,
} from './utils';
import type {
  CardAction,
  ProductCard,
  LocationCard,
  PersonCard,
  ImageCard,
  TemplateArea,
} from './types';

describe('validateAction', () => {
  describe('label validation', () => {
    it('should fail when label is missing', () => {
      const action: CardAction = {
        type: 'uri',
        label: '',
        uri: 'https://example.com',
      };

      const errors = validateAction(action);

      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual({
        field: 'label',
        message: 'アクションラベルは必須です',
      });
    });

    it('should fail when label is only whitespace', () => {
      const action: CardAction = {
        type: 'uri',
        label: '   ',
        uri: 'https://example.com',
      };

      const errors = validateAction(action);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('label');
    });

    it('should fail when label exceeds 20 characters', () => {
      const action: CardAction = {
        type: 'uri',
        label: 'この文字列は20文字を超えています超えています',
        uri: 'https://example.com',
      };

      const errors = validateAction(action);

      expect(errors).toContainEqual({
        field: 'label',
        message: 'アクションラベルは20文字以内で入力してください',
      });
    });

    it('should pass with valid label (20 characters)', () => {
      const action: CardAction = {
        type: 'uri',
        label: '12345678901234567890',
        uri: 'https://example.com',
      };

      const errors = validateAction(action);
      const labelErrors = errors.filter((e) => e.field === 'label');

      expect(labelErrors).toHaveLength(0);
    });
  });

  describe('URI action validation', () => {
    it('should fail when URI is missing', () => {
      const action: CardAction = {
        type: 'uri',
        label: '詳細を見る',
        uri: '',
      };

      const errors = validateAction(action);

      expect(errors).toContainEqual({
        field: 'uri',
        message: 'URIは必須です',
      });
    });

    it('should fail when URI is only whitespace', () => {
      const action: CardAction = {
        type: 'uri',
        label: '詳細を見る',
        uri: '   ',
      };

      const errors = validateAction(action);

      expect(errors).toContainEqual({
        field: 'uri',
        message: 'URIは必須です',
      });
    });

    it('should fail when URI does not start with http or https', () => {
      const action: CardAction = {
        type: 'uri',
        label: '詳細を見る',
        uri: 'ftp://example.com',
      };

      const errors = validateAction(action);

      expect(errors).toContainEqual({
        field: 'uri',
        message: 'URIはhttpまたはhttpsで始まる必要があります',
      });
    });

    it('should pass with valid HTTPS URI', () => {
      const action: CardAction = {
        type: 'uri',
        label: '詳細を見る',
        uri: 'https://example.com',
      };

      const errors = validateAction(action);

      expect(errors).toHaveLength(0);
    });

    it('should pass with valid HTTP URI', () => {
      const action: CardAction = {
        type: 'uri',
        label: '詳細を見る',
        uri: 'http://example.com',
      };

      const errors = validateAction(action);

      expect(errors).toHaveLength(0);
    });
  });

  describe('message action validation', () => {
    it('should fail when text is missing', () => {
      const action: CardAction = {
        type: 'message',
        label: '送信する',
        text: '',
      };

      const errors = validateAction(action);

      expect(errors).toContainEqual({
        field: 'text',
        message: 'メッセージテキストは必須です',
      });
    });

    it('should fail when text is only whitespace', () => {
      const action: CardAction = {
        type: 'message',
        label: '送信する',
        text: '   ',
      };

      const errors = validateAction(action);

      expect(errors).toContainEqual({
        field: 'text',
        message: 'メッセージテキストは必須です',
      });
    });

    it('should pass with valid text', () => {
      const action: CardAction = {
        type: 'message',
        label: '送信する',
        text: 'こんにちは',
      };

      const errors = validateAction(action);

      expect(errors).toHaveLength(0);
    });
  });

  describe('postback action validation', () => {
    it('should fail when data is missing', () => {
      const action: CardAction = {
        type: 'postback',
        label: 'アクション',
        data: '',
      };

      const errors = validateAction(action);

      expect(errors).toContainEqual({
        field: 'data',
        message: 'ポストバックデータは必須です',
      });
    });

    it('should fail when data is only whitespace', () => {
      const action: CardAction = {
        type: 'postback',
        label: 'アクション',
        data: '   ',
      };

      const errors = validateAction(action);

      expect(errors).toContainEqual({
        field: 'data',
        message: 'ポストバックデータは必須です',
      });
    });

    it('should pass with valid data', () => {
      const action: CardAction = {
        type: 'postback',
        label: 'アクション',
        data: 'action=buy&item=123',
      };

      const errors = validateAction(action);

      expect(errors).toHaveLength(0);
    });

    it('should pass with valid data and displayText', () => {
      const action: CardAction = {
        type: 'postback',
        label: 'アクション',
        data: 'action=buy&item=123',
        displayText: '購入しました',
      };

      const errors = validateAction(action);

      expect(errors).toHaveLength(0);
    });
  });
});

describe('validateCard', () => {
  describe('common validation (all card types)', () => {
    it('should fail when imageUrl is missing', () => {
      const card: ProductCard = {
        id: 'card-1',
        type: 'product',
        imageUrl: '',
        title: '商品名',
        description: '説明',
        actions: [
          {
            type: 'uri',
            label: '詳細',
            uri: 'https://example.com',
          },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toContainEqual({
        field: 'imageUrl',
        message: '画像URLは必須です',
      });
    });

    it('should fail when imageUrl is only whitespace', () => {
      const card: ProductCard = {
        id: 'card-1',
        type: 'product',
        imageUrl: '   ',
        title: '商品名',
        description: '説明',
        actions: [
          {
            type: 'uri',
            label: '詳細',
            uri: 'https://example.com',
          },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toContainEqual({
        field: 'imageUrl',
        message: '画像URLは必須です',
      });
    });

    it('should fail when imageUrl does not start with https', () => {
      const card: ProductCard = {
        id: 'card-1',
        type: 'product',
        imageUrl: 'http://example.com/image.jpg',
        title: '商品名',
        description: '説明',
        actions: [
          {
            type: 'uri',
            label: '詳細',
            uri: 'https://example.com',
          },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toContainEqual({
        field: 'imageUrl',
        message: '画像URLはHTTPSで始まる必要があります',
      });
    });

    it('should allow missing imageUrl when template is configured', () => {
      const templateAreas: TemplateArea[] = [
        { id: 'area-1', x: 0, y: 0, width: 512, height: 512, imageUrl: 'https://example.com/a.jpg' },
      ];

      const card: ProductCard = {
        id: 'card-1',
        type: 'product',
        imageUrl: '',
        templateEnabled: true,
        title: '商品名',
        description: '説明',
        templateId: 'split-1-full',
        templateAreas,
        actions: [
          {
            type: 'uri',
            label: '詳細',
            uri: 'https://example.com',
          },
        ],
      };

      const errors = validateCard(card);

      expect(errors.find((err) => err.field === 'imageUrl')).toBeUndefined();
    });

    it('should fail when template is enabled but no templateId provided', () => {
      const card: ProductCard = {
        id: 'card-1',
        type: 'product',
        imageUrl: '',
        templateEnabled: true,
        title: '商品名',
        description: '説明',
        actions: [
          {
            type: 'uri',
            label: '詳細',
            uri: 'https://example.com',
          },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toContainEqual({
        field: 'templateId',
        message: 'テンプレートを選択してください',
      });
    });

    it('should fail when templateId is set but areas are missing', () => {
      const card: ProductCard = {
        id: 'card-1',
        type: 'product',
        imageUrl: '',
        templateEnabled: true,
        title: '商品名',
        description: '説明',
        templateId: 'split-1-full',
        templateAreas: [],
        actions: [
          {
            type: 'uri',
            label: '詳細',
            uri: 'https://example.com',
          },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toContainEqual({
        field: 'templateAreas',
        message: 'テンプレートのエリアを設定してください',
      });
    });

    it('should fail when actions array is empty', () => {
      const card: ProductCard = {
        id: 'card-1',
        type: 'product',
        imageUrl: 'https://example.com/image.jpg',
        title: '商品名',
        description: '説明',
        actions: [],
      };

      const errors = validateCard(card);

      expect(errors).toContainEqual({
        field: 'actions',
        message: '最低1つのアクションが必要です',
      });
    });

    it('should fail when actions exceed 3', () => {
      const card: ProductCard = {
        id: 'card-1',
        type: 'product',
        imageUrl: 'https://example.com/image.jpg',
        title: '商品名',
        description: '説明',
        actions: [
          { type: 'uri', label: 'アクション1', uri: 'https://example.com/1' },
          { type: 'uri', label: 'アクション2', uri: 'https://example.com/2' },
          { type: 'uri', label: 'アクション3', uri: 'https://example.com/3' },
          { type: 'uri', label: 'アクション4', uri: 'https://example.com/4' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toContainEqual({
        field: 'actions',
        message: 'アクションは最大3つまでです',
      });
    });

    it('should validate nested action errors', () => {
      const card: ProductCard = {
        id: 'card-1',
        type: 'product',
        imageUrl: 'https://example.com/image.jpg',
        title: '商品名',
        description: '説明',
        actions: [
          { type: 'uri', label: '', uri: 'https://example.com' },
          { type: 'message', label: '送信', text: '' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toContainEqual({
        field: 'actions[0].label',
        message: 'アクションラベルは必須です',
      });
      expect(errors).toContainEqual({
        field: 'actions[1].text',
        message: 'メッセージテキストは必須です',
      });
    });
  });

  describe('product card validation', () => {
    it('should fail when title is missing', () => {
      const card: ProductCard = {
        id: 'card-1',
        type: 'product',
        imageUrl: 'https://example.com/image.jpg',
        title: '',
        description: '説明',
        actions: [
          { type: 'uri', label: '詳細', uri: 'https://example.com' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toContainEqual({
        field: 'title',
        message: '商品名は必須です',
      });
    });

    it('should fail when title exceeds 40 characters', () => {
      const card: ProductCard = {
        id: 'card-1',
        type: 'product',
        imageUrl: 'https://example.com/image.jpg',
        title: 'a'.repeat(41),
        description: '説明',
        actions: [
          { type: 'uri', label: '詳細', uri: 'https://example.com' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toContainEqual({
        field: 'title',
        message: '商品名は40文字以内で入力してください',
      });
    });

    it('should fail when description is missing', () => {
      const card: ProductCard = {
        id: 'card-1',
        type: 'product',
        imageUrl: 'https://example.com/image.jpg',
        title: '商品名',
        description: '',
        actions: [
          { type: 'uri', label: '詳細', uri: 'https://example.com' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toContainEqual({
        field: 'description',
        message: '説明は必須です',
      });
    });

    it('should fail when description exceeds 60 characters', () => {
      const card: ProductCard = {
        id: 'card-1',
        type: 'product',
        imageUrl: 'https://example.com/image.jpg',
        title: '商品名',
        description: 'b'.repeat(61),
        actions: [
          { type: 'uri', label: '詳細', uri: 'https://example.com' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toContainEqual({
        field: 'description',
        message: '説明は60文字以内で入力してください',
      });
    });

    it('should fail when price is negative', () => {
      const card: ProductCard = {
        id: 'card-1',
        type: 'product',
        imageUrl: 'https://example.com/image.jpg',
        title: '商品名',
        description: '説明',
        price: -100,
        actions: [
          { type: 'uri', label: '詳細', uri: 'https://example.com' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toContainEqual({
        field: 'price',
        message: '価格は0以上の値を入力してください',
      });
    });

    it('should pass with valid product card (with price)', () => {
      const card: ProductCard = {
        id: 'card-1',
        type: 'product',
        imageUrl: 'https://example.com/image.jpg',
        title: '商品名',
        description: '商品の説明',
        price: 1000,
        actions: [
          { type: 'uri', label: '詳細', uri: 'https://example.com' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toHaveLength(0);
    });

    it('should pass with valid product card (without price)', () => {
      const card: ProductCard = {
        id: 'card-1',
        type: 'product',
        imageUrl: 'https://example.com/image.jpg',
        title: '商品名',
        description: '商品の説明',
        actions: [
          { type: 'uri', label: '詳細', uri: 'https://example.com' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toHaveLength(0);
    });
  });

  describe('location card validation', () => {
    it('should fail when title is missing', () => {
      const card: LocationCard = {
        id: 'card-1',
        type: 'location',
        imageUrl: 'https://example.com/image.jpg',
        title: '',
        address: '東京都渋谷区',
        actions: [
          { type: 'uri', label: '地図', uri: 'https://example.com' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toContainEqual({
        field: 'title',
        message: '場所名は必須です',
      });
    });

    it('should fail when title exceeds 40 characters', () => {
      const card: LocationCard = {
        id: 'card-1',
        type: 'location',
        imageUrl: 'https://example.com/image.jpg',
        title: 'c'.repeat(41),
        address: '東京都渋谷区',
        actions: [
          { type: 'uri', label: '地図', uri: 'https://example.com' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toContainEqual({
        field: 'title',
        message: '場所名は40文字以内で入力してください',
      });
    });

    it('should fail when address is missing', () => {
      const card: LocationCard = {
        id: 'card-1',
        type: 'location',
        imageUrl: 'https://example.com/image.jpg',
        title: 'レストラン',
        address: '',
        actions: [
          { type: 'uri', label: '地図', uri: 'https://example.com' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toContainEqual({
        field: 'address',
        message: '住所は必須です',
      });
    });

    it('should fail when address exceeds 60 characters', () => {
      const card: LocationCard = {
        id: 'card-1',
        type: 'location',
        imageUrl: 'https://example.com/image.jpg',
        title: 'レストラン',
        address: 'd'.repeat(61),
        actions: [
          { type: 'uri', label: '地図', uri: 'https://example.com' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toContainEqual({
        field: 'address',
        message: '住所は60文字以内で入力してください',
      });
    });

    it('should fail when hours exceeds 60 characters', () => {
      const card: LocationCard = {
        id: 'card-1',
        type: 'location',
        imageUrl: 'https://example.com/image.jpg',
        title: 'レストラン',
        address: '東京都渋谷区',
        hours: 'e'.repeat(61),
        actions: [
          { type: 'uri', label: '地図', uri: 'https://example.com' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toContainEqual({
        field: 'hours',
        message: '営業時間は60文字以内で入力してください',
      });
    });

    it('should pass with valid location card (with hours)', () => {
      const card: LocationCard = {
        id: 'card-1',
        type: 'location',
        imageUrl: 'https://example.com/image.jpg',
        title: 'レストラン',
        address: '東京都渋谷区1-2-3',
        hours: '11:00-22:00',
        actions: [
          { type: 'uri', label: '地図', uri: 'https://example.com' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toHaveLength(0);
    });

    it('should pass with valid location card (without hours)', () => {
      const card: LocationCard = {
        id: 'card-1',
        type: 'location',
        imageUrl: 'https://example.com/image.jpg',
        title: 'レストラン',
        address: '東京都渋谷区1-2-3',
        actions: [
          { type: 'uri', label: '地図', uri: 'https://example.com' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toHaveLength(0);
    });
  });

  describe('person card validation', () => {
    it('should fail when name is missing', () => {
      const card: PersonCard = {
        id: 'card-1',
        type: 'person',
        imageUrl: 'https://example.com/image.jpg',
        name: '',
        description: '説明',
        actions: [
          { type: 'uri', label: 'プロフィール', uri: 'https://example.com' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toContainEqual({
        field: 'name',
        message: '名前は必須です',
      });
    });

    it('should fail when name exceeds 40 characters', () => {
      const card: PersonCard = {
        id: 'card-1',
        type: 'person',
        imageUrl: 'https://example.com/image.jpg',
        name: 'f'.repeat(41),
        description: '説明',
        actions: [
          { type: 'uri', label: 'プロフィール', uri: 'https://example.com' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toContainEqual({
        field: 'name',
        message: '名前は40文字以内で入力してください',
      });
    });

    it('should fail when description is missing', () => {
      const card: PersonCard = {
        id: 'card-1',
        type: 'person',
        imageUrl: 'https://example.com/image.jpg',
        name: '山田太郎',
        description: '',
        actions: [
          { type: 'uri', label: 'プロフィール', uri: 'https://example.com' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toContainEqual({
        field: 'description',
        message: '説明は必須です',
      });
    });

    it('should fail when description exceeds 60 characters', () => {
      const card: PersonCard = {
        id: 'card-1',
        type: 'person',
        imageUrl: 'https://example.com/image.jpg',
        name: '山田太郎',
        description: 'g'.repeat(61),
        actions: [
          { type: 'uri', label: 'プロフィール', uri: 'https://example.com' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toContainEqual({
        field: 'description',
        message: '説明は60文字以内で入力してください',
      });
    });

    it('should fail when any tag exceeds 20 characters', () => {
      const card: PersonCard = {
        id: 'card-1',
        type: 'person',
        imageUrl: 'https://example.com/image.jpg',
        name: '山田太郎',
        description: 'エンジニア',
        tags: ['エンジニア', 'このタグは20文字を超えているためエラーになります'],
        actions: [
          { type: 'uri', label: 'プロフィール', uri: 'https://example.com' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toContainEqual({
        field: 'tags[1]',
        message: 'タグは20文字以内で入力してください',
      });
    });

    it('should pass with valid person card (with tags)', () => {
      const card: PersonCard = {
        id: 'card-1',
        type: 'person',
        imageUrl: 'https://example.com/image.jpg',
        name: '山田太郎',
        description: 'エンジニア',
        tags: ['フロントエンド', 'React', 'TypeScript'],
        actions: [
          { type: 'uri', label: 'プロフィール', uri: 'https://example.com' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toHaveLength(0);
    });

    it('should pass with valid person card (without tags)', () => {
      const card: PersonCard = {
        id: 'card-1',
        type: 'person',
        imageUrl: 'https://example.com/image.jpg',
        name: '山田太郎',
        description: 'エンジニア',
        actions: [
          { type: 'uri', label: 'プロフィール', uri: 'https://example.com' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toHaveLength(0);
    });
  });

  describe('image card validation', () => {
    it('should fail when title exceeds 40 characters', () => {
      const card: ImageCard = {
        id: 'card-1',
        type: 'image',
        imageUrl: 'https://example.com/image.jpg',
        title: 'h'.repeat(41),
        actions: [
          { type: 'uri', label: '詳細', uri: 'https://example.com' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toContainEqual({
        field: 'title',
        message: 'タイトルは40文字以内で入力してください',
      });
    });

    it('should fail when description exceeds 60 characters', () => {
      const card: ImageCard = {
        id: 'card-1',
        type: 'image',
        imageUrl: 'https://example.com/image.jpg',
        description: 'i'.repeat(61),
        actions: [
          { type: 'uri', label: '詳細', uri: 'https://example.com' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toContainEqual({
        field: 'description',
        message: '説明は60文字以内で入力してください',
      });
    });

    it('should pass with valid image card (with title and description)', () => {
      const card: ImageCard = {
        id: 'card-1',
        type: 'image',
        imageUrl: 'https://example.com/image.jpg',
        title: '画像タイトル',
        description: '画像の説明',
        actions: [
          { type: 'uri', label: '詳細', uri: 'https://example.com' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toHaveLength(0);
    });

    it('should pass with valid image card (without title and description)', () => {
      const card: ImageCard = {
        id: 'card-1',
        type: 'image',
        imageUrl: 'https://example.com/image.jpg',
        actions: [
          { type: 'uri', label: '詳細', uri: 'https://example.com' },
        ],
      };

      const errors = validateCard(card);

      expect(errors).toHaveLength(0);
    });
  });
});

describe('cardToCarouselColumn', () => {
  describe('product card conversion', () => {
    it('should convert product card without price', () => {
      const card: ProductCard = {
        id: 'card-1',
        type: 'product',
        imageUrl: 'https://example.com/product.jpg',
        title: '商品名',
        description: '商品の説明',
        actions: [
          { type: 'uri', label: '購入', uri: 'https://example.com/buy' },
        ],
      };

      const result = cardToCarouselColumn(card);

      expect(result).toEqual({
        thumbnailImageUrl: 'https://example.com/product.jpg',
        title: '商品名',
        text: '商品の説明',
        actions: [
          {
            type: 'uri',
            label: '購入',
            uri: 'https://example.com/buy',
          },
        ],
      });
    });

    it('should convert product card with price', () => {
      const card: ProductCard = {
        id: 'card-1',
        type: 'product',
        imageUrl: 'https://example.com/product.jpg',
        title: '商品名',
        description: '商品の説明',
        price: 1500,
        actions: [
          { type: 'uri', label: '購入', uri: 'https://example.com/buy' },
        ],
      };

      const result = cardToCarouselColumn(card);

      expect(result).toEqual({
        thumbnailImageUrl: 'https://example.com/product.jpg',
        title: '商品名',
        text: '商品の説明\n価格: 1,500円',
        actions: [
          {
            type: 'uri',
            label: '購入',
            uri: 'https://example.com/buy',
          },
        ],
      });
    });

    it('should format large price with comma separators', () => {
      const card: ProductCard = {
        id: 'card-1',
        type: 'product',
        imageUrl: 'https://example.com/product.jpg',
        title: '商品名',
        description: '商品の説明',
        price: 1234567,
        actions: [
          { type: 'uri', label: '購入', uri: 'https://example.com/buy' },
        ],
      };

      const result = cardToCarouselColumn(card);

      expect(result.text).toBe('商品の説明\n価格: 1,234,567円');
    });
  });

  describe('location card conversion', () => {
    it('should convert location card without hours', () => {
      const card: LocationCard = {
        id: 'card-1',
        type: 'location',
        imageUrl: 'https://example.com/location.jpg',
        title: 'レストラン',
        address: '東京都渋谷区1-2-3',
        actions: [
          { type: 'uri', label: '地図を見る', uri: 'https://example.com/map' },
        ],
      };

      const result = cardToCarouselColumn(card);

      expect(result).toEqual({
        thumbnailImageUrl: 'https://example.com/location.jpg',
        title: 'レストラン',
        text: '東京都渋谷区1-2-3',
        actions: [
          {
            type: 'uri',
            label: '地図を見る',
            uri: 'https://example.com/map',
          },
        ],
      });
    });

    it('should convert location card with hours', () => {
      const card: LocationCard = {
        id: 'card-1',
        type: 'location',
        imageUrl: 'https://example.com/location.jpg',
        title: 'レストラン',
        address: '東京都渋谷区1-2-3',
        hours: '11:00-22:00',
        actions: [
          { type: 'uri', label: '地図を見る', uri: 'https://example.com/map' },
        ],
      };

      const result = cardToCarouselColumn(card);

      expect(result).toEqual({
        thumbnailImageUrl: 'https://example.com/location.jpg',
        title: 'レストラン',
        text: '東京都渋谷区1-2-3\n営業時間: 11:00-22:00',
        actions: [
          {
            type: 'uri',
            label: '地図を見る',
            uri: 'https://example.com/map',
          },
        ],
      });
    });
  });

  describe('person card conversion', () => {
    it('should convert person card without tags', () => {
      const card: PersonCard = {
        id: 'card-1',
        type: 'person',
        imageUrl: 'https://example.com/person.jpg',
        name: '山田太郎',
        description: 'エンジニア',
        actions: [
          {
            type: 'uri',
            label: 'プロフィール',
            uri: 'https://example.com/profile',
          },
        ],
      };

      const result = cardToCarouselColumn(card);

      expect(result).toEqual({
        thumbnailImageUrl: 'https://example.com/person.jpg',
        title: '山田太郎',
        text: 'エンジニア',
        actions: [
          {
            type: 'uri',
            label: 'プロフィール',
            uri: 'https://example.com/profile',
          },
        ],
      });
    });

    it('should convert person card with tags', () => {
      const card: PersonCard = {
        id: 'card-1',
        type: 'person',
        imageUrl: 'https://example.com/person.jpg',
        name: '山田太郎',
        description: 'エンジニア',
        tags: ['フロントエンド', 'React', 'TypeScript'],
        actions: [
          {
            type: 'uri',
            label: 'プロフィール',
            uri: 'https://example.com/profile',
          },
        ],
      };

      const result = cardToCarouselColumn(card);

      expect(result).toEqual({
        thumbnailImageUrl: 'https://example.com/person.jpg',
        title: '山田太郎',
        text: 'エンジニア\n#フロントエンド #React #TypeScript',
        actions: [
          {
            type: 'uri',
            label: 'プロフィール',
            uri: 'https://example.com/profile',
          },
        ],
      });
    });

    it('should convert person card with empty tags array', () => {
      const card: PersonCard = {
        id: 'card-1',
        type: 'person',
        imageUrl: 'https://example.com/person.jpg',
        name: '山田太郎',
        description: 'エンジニア',
        tags: [],
        actions: [
          {
            type: 'uri',
            label: 'プロフィール',
            uri: 'https://example.com/profile',
          },
        ],
      };

      const result = cardToCarouselColumn(card);

      expect(result.text).toBe('エンジニア');
    });
  });

  describe('image card conversion', () => {
    it('should convert image card with title and description', () => {
      const card: ImageCard = {
        id: 'card-1',
        type: 'image',
        imageUrl: 'https://example.com/image.jpg',
        title: '画像タイトル',
        description: '画像の説明',
        actions: [
          { type: 'uri', label: '詳細', uri: 'https://example.com/detail' },
        ],
      };

      const result = cardToCarouselColumn(card);

      expect(result).toEqual({
        thumbnailImageUrl: 'https://example.com/image.jpg',
        title: '画像タイトル',
        text: '画像の説明',
        actions: [
          {
            type: 'uri',
            label: '詳細',
            uri: 'https://example.com/detail',
          },
        ],
      });
    });

    it('should convert image card without title and description', () => {
      const card: ImageCard = {
        id: 'card-1',
        type: 'image',
        imageUrl: 'https://example.com/image.jpg',
        actions: [
          { type: 'uri', label: '詳細', uri: 'https://example.com/detail' },
        ],
      };

      const result = cardToCarouselColumn(card);

      expect(result).toEqual({
        thumbnailImageUrl: 'https://example.com/image.jpg',
        text: ' ',
        actions: [
          {
            type: 'uri',
            label: '詳細',
            uri: 'https://example.com/detail',
          },
        ],
      });
    });

    it('should use space when description is undefined (LINE API requirement)', () => {
      const card: ImageCard = {
        id: 'card-1',
        type: 'image',
        imageUrl: 'https://example.com/image.jpg',
        title: 'タイトルのみ',
        actions: [
          { type: 'uri', label: '詳細', uri: 'https://example.com/detail' },
        ],
      };

      const result = cardToCarouselColumn(card);

      expect(result.text).toBe(' ');
    });
  });

  describe('action conversion', () => {
    it('should convert URI action', () => {
      const card: ImageCard = {
        id: 'card-1',
        type: 'image',
        imageUrl: 'https://example.com/image.jpg',
        actions: [
          { type: 'uri', label: 'リンク', uri: 'https://example.com' },
        ],
      };

      const result = cardToCarouselColumn(card);

      expect(result.actions[0]).toEqual({
        type: 'uri',
        label: 'リンク',
        uri: 'https://example.com',
      });
    });

    it('should convert message action', () => {
      const card: ImageCard = {
        id: 'card-1',
        type: 'image',
        imageUrl: 'https://example.com/image.jpg',
        actions: [{ type: 'message', label: '送信', text: 'こんにちは' }],
      };

      const result = cardToCarouselColumn(card);

      expect(result.actions[0]).toEqual({
        type: 'message',
        label: '送信',
        text: 'こんにちは',
      });
    });

    it('should convert postback action without displayText', () => {
      const card: ImageCard = {
        id: 'card-1',
        type: 'image',
        imageUrl: 'https://example.com/image.jpg',
        actions: [
          { type: 'postback', label: 'アクション', data: 'action=test' },
        ],
      };

      const result = cardToCarouselColumn(card);

      expect(result.actions[0]).toEqual({
        type: 'postback',
        label: 'アクション',
        data: 'action=test',
      });
    });

    it('should convert postback action with displayText', () => {
      const card: ImageCard = {
        id: 'card-1',
        type: 'image',
        imageUrl: 'https://example.com/image.jpg',
        actions: [
          {
            type: 'postback',
            label: 'アクション',
            data: 'action=test',
            displayText: '実行しました',
          },
        ],
      };

      const result = cardToCarouselColumn(card);

      expect(result.actions[0]).toEqual({
        type: 'postback',
        label: 'アクション',
        data: 'action=test',
        displayText: '実行しました',
      });
    });

    it('uses template image when templateEnabled is true', () => {
      const card: ProductCard = {
        id: 'card-1',
        type: 'product',
        imageUrl: '',
        templateEnabled: true,
        templateImageUrl: 'https://example.com/template.jpg',
        title: '商品名',
        description: '説明',
        actions: [
          { type: 'uri', label: '詳細', uri: 'https://example.com' },
        ],
      };

      const column = cardToCarouselColumn(card);
      expect(column.thumbnailImageUrl).toBe('https://example.com/template.jpg');
    });

    it('should convert multiple actions', () => {
      const card: ImageCard = {
        id: 'card-1',
        type: 'image',
        imageUrl: 'https://example.com/image.jpg',
        actions: [
          { type: 'uri', label: 'リンク', uri: 'https://example.com' },
          { type: 'message', label: '送信', text: 'こんにちは' },
          { type: 'postback', label: 'アクション', data: 'action=test' },
        ],
      };

      const result = cardToCarouselColumn(card);

      expect(result.actions).toHaveLength(3);
      expect(result.actions[0].type).toBe('uri');
      expect(result.actions[1].type).toBe('message');
      expect(result.actions[2].type).toBe('postback');
    });
  });
});

describe('createDefaultCard', () => {
  describe('product card creation', () => {
    it('should create default product card', () => {
      const card = createDefaultCard('product') as ProductCard;

      expect(card.type).toBe('product');
      expect(card.id).toMatch(/^card-\d+-[a-z0-9]+$/);
      expect(card.imageUrl).toBe('');
      expect(card.templateEnabled).toBe(false);
      expect(card.templateId).toBeNull();
      expect(card.templateAreas).toEqual([]);
      expect(card.templatePreviewUrl).toBeNull();
      expect(card.templateImageUrl).toBeNull();
      expect(card.title).toBe('商品名');
      expect(card.description).toBe('商品の説明をここに入力してください');
      expect(card.price).toBeUndefined();
      expect(card.actions).toHaveLength(1);
      expect(card.actions[0]).toEqual({
        type: 'uri',
        label: '詳細を見る',
        uri: 'https://example.com',
      });
    });

    it('should create unique IDs for multiple product cards', () => {
      const card1 = createDefaultCard('product');
      const card2 = createDefaultCard('product');

      expect(card1.id).not.toBe(card2.id);
    });
  });

  describe('location card creation', () => {
    it('should create default location card', () => {
      const card = createDefaultCard('location') as LocationCard;

      expect(card.type).toBe('location');
      expect(card.id).toMatch(/^card-\d+-[a-z0-9]+$/);
      expect(card.imageUrl).toBe('');
      expect(card.templateEnabled).toBe(false);
      expect(card.templateId).toBeNull();
      expect(card.templateAreas).toEqual([]);
      expect(card.templatePreviewUrl).toBeNull();
      expect(card.templateImageUrl).toBeNull();
      expect(card.title).toBe('場所名');
      expect(card.address).toBe('住所をここに入力してください');
      expect(card.hours).toBeUndefined();
      expect(card.actions).toHaveLength(1);
      expect(card.actions[0]).toEqual({
        type: 'uri',
        label: '詳細を見る',
        uri: 'https://example.com',
      });
    });
  });

  describe('person card creation', () => {
    it('should create default person card', () => {
      const card = createDefaultCard('person') as PersonCard;

      expect(card.type).toBe('person');
      expect(card.id).toMatch(/^card-\d+-[a-z0-9]+$/);
      expect(card.imageUrl).toBe('');
      expect(card.templateEnabled).toBe(false);
      expect(card.templateId).toBeNull();
      expect(card.templateAreas).toEqual([]);
      expect(card.templatePreviewUrl).toBeNull();
      expect(card.templateImageUrl).toBeNull();
      expect(card.name).toBe('名前');
      expect(card.description).toBe('説明をここに入力してください');
      expect(card.tags).toEqual([]);
      expect(card.actions).toHaveLength(1);
      expect(card.actions[0]).toEqual({
        type: 'uri',
        label: '詳細を見る',
        uri: 'https://example.com',
      });
    });
  });

  describe('image card creation', () => {
    it('should create default image card', () => {
      const card = createDefaultCard('image') as ImageCard;

      expect(card.type).toBe('image');
      expect(card.id).toMatch(/^card-\d+-[a-z0-9]+$/);
      expect(card.imageUrl).toBe('');
      expect(card.templateEnabled).toBe(false);
      expect(card.templateId).toBeNull();
      expect(card.templateAreas).toEqual([]);
      expect(card.templatePreviewUrl).toBeNull();
      expect(card.templateImageUrl).toBeNull();
      expect(card.title).toBeUndefined();
      expect(card.description).toBeUndefined();
      expect(card.actions).toHaveLength(1);
      expect(card.actions[0]).toEqual({
        type: 'uri',
        label: '詳細を見る',
        uri: 'https://example.com',
      });
    });
  });

  describe('error handling', () => {
    it('should throw error for unknown card type', () => {
      expect(() => {
        // @ts-expect-error Testing invalid type
        createDefaultCard('unknown');
      }).toThrow('Unknown card type: unknown');
    });
  });

  describe('ID uniqueness', () => {
    it('should generate unique IDs across different card types', () => {
      const cards = [
        createDefaultCard('product'),
        createDefaultCard('location'),
        createDefaultCard('person'),
        createDefaultCard('image'),
      ];

      const ids = cards.map((card) => card.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(4);
    });
  });
});
