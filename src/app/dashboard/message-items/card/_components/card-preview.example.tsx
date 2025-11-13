/**
 * CardPreview Component Usage Example
 *
 * This file demonstrates how to use the CardPreview component
 * with different card types and configurations.
 */

import { CardPreview } from './card-preview';
import type { Card } from './types';

/**
 * Example: Product Cards
 */
export function ProductCardsExample() {
  const cards: Card[] = [
    {
      id: '1',
      type: 'product',
      title: 'スマートフォン Pro',
      description: '最新の高性能スマートフォン。優れたカメラ性能と長時間バッテリー。',
      price: 89800,
      imageUrl: 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_1_cafe.png',
      actions: [
        {
          type: 'uri',
          label: '詳細を見る',
          uri: 'https://example.com/products/1'
        },
        {
          type: 'message',
          label: '購入する',
          text: 'スマートフォン Proを購入したい'
        }
      ]
    },
    {
      id: '2',
      type: 'product',
      title: 'ワイヤレスイヤホン',
      description: 'ノイズキャンセリング機能付き。クリアな音質で音楽を楽しめます。',
      price: 15800,
      imageUrl: 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_2_restaurant.png',
      actions: [
        {
          type: 'uri',
          label: '詳細を見る',
          uri: 'https://example.com/products/2'
        }
      ]
    }
  ];

  return <CardPreview cards={cards} />;
}

/**
 * Example: Location Cards
 */
export function LocationCardsExample() {
  const cards: Card[] = [
    {
      id: '1',
      type: 'location',
      title: 'カフェ・ド・パリ',
      address: '東京都渋谷区道玄坂1-2-3',
      hours: '平日 10:00-22:00 / 土日 9:00-23:00',
      imageUrl: 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_1_cafe.png',
      actions: [
        {
          type: 'uri',
          label: '地図を見る',
          uri: 'https://maps.example.com/cafe'
        },
        {
          type: 'postback',
          label: '予約する',
          data: 'action=reserve&location=1'
        }
      ]
    },
    {
      id: '2',
      type: 'location',
      title: 'レストラン・ボナペティ',
      address: '東京都港区六本木3-4-5',
      hours: 'ランチ 11:30-15:00 / ディナー 17:00-23:00',
      imageUrl: 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_2_restaurant.png',
      actions: [
        {
          type: 'uri',
          label: '地図を見る',
          uri: 'https://maps.example.com/restaurant'
        }
      ]
    }
  ];

  return <CardPreview cards={cards} />;
}

/**
 * Example: Person Cards
 */
export function PersonCardsExample() {
  const cards: Card[] = [
    {
      id: '1',
      type: 'person',
      name: '山田 太郎',
      description: 'フルスタックエンジニア。Webアプリケーション開発が得意です。',
      tags: ['React', 'TypeScript', 'Node.js'],
      imageUrl: 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_1_cafe.png',
      actions: [
        {
          type: 'uri',
          label: 'プロフィール',
          uri: 'https://example.com/profile/yamada'
        },
        {
          type: 'message',
          label: 'メッセージ',
          text: '山田さんに連絡したい'
        }
      ]
    },
    {
      id: '2',
      type: 'person',
      name: '佐藤 花子',
      description: 'UI/UXデザイナー。ユーザー体験を第一に考えたデザインを提供します。',
      tags: ['Figma', 'Adobe XD', 'UI Design'],
      imageUrl: 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_2_restaurant.png',
      actions: [
        {
          type: 'uri',
          label: 'ポートフォリオ',
          uri: 'https://example.com/portfolio/sato'
        }
      ]
    }
  ];

  return <CardPreview cards={cards} />;
}

/**
 * Example: Image Cards
 */
export function ImageCardsExample() {
  const cards: Card[] = [
    {
      id: '1',
      type: 'image',
      title: '桜の季節',
      description: '満開の桜が美しい春の風景。',
      imageUrl: 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_1_cafe.png',
      actions: [
        {
          type: 'uri',
          label: '詳細を見る',
          uri: 'https://example.com/gallery/1'
        }
      ]
    },
    {
      id: '2',
      type: 'image',
      title: '夏の海',
      description: '青い空と透き通った海が広がる夏のビーチ。',
      imageUrl: 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_2_restaurant.png',
      actions: [
        {
          type: 'message',
          label: 'いいね',
          text: 'この写真にいいねしました'
        }
      ]
    },
    {
      id: '3',
      type: 'image',
      imageUrl: 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_3_violate.png',
      actions: []
    }
  ];

  return <CardPreview cards={cards} />;
}

/**
 * Example: Mixed Card Types
 */
export function MixedCardsExample() {
  const cards: Card[] = [
    {
      id: '1',
      type: 'product',
      title: '新商品',
      description: '期間限定の特別価格でご提供中！',
      price: 2980,
      imageUrl: 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_1_cafe.png',
      actions: [
        {
          type: 'uri',
          label: '購入',
          uri: 'https://example.com/shop/new'
        }
      ]
    },
    {
      id: '2',
      type: 'location',
      title: '店舗のご案内',
      address: '東京都新宿区新宿1-1-1',
      hours: '10:00-20:00',
      imageUrl: 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_2_restaurant.png',
      actions: [
        {
          type: 'uri',
          label: 'アクセス',
          uri: 'https://maps.example.com/store'
        }
      ]
    },
    {
      id: '3',
      type: 'person',
      name: 'スタッフ紹介',
      description: '店長の鈴木です。皆様のご来店をお待ちしております！',
      imageUrl: 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_3_violate.png',
      actions: [
        {
          type: 'message',
          label: '質問する',
          text: '店長に質問があります'
        }
      ]
    }
  ];

  return <CardPreview cards={cards} />;
}

/**
 * Example: Empty State
 */
export function EmptyCardsExample() {
  return <CardPreview cards={[]} />;
}
