/**
 * Card Message Editor - Utility Functions
 *
 * Provides validation and conversion utilities for card messages:
 * - Validation for cards and actions
 * - Conversion to LINE Messaging API format
 * - Default card creation
 */

import type {
  Card,
  CardAction,
  CardType,
  ProductCard,
  LocationCard,
  PersonCard,
  ImageCard,
  ValidationError,
  TemplateArea,
} from './types';

/**
 * Validates a card action
 */
export function validateAction(action: CardAction): ValidationError[] {
  const errors: ValidationError[] = [];

  // Label validation (1-20 characters)
  if (!action.label || action.label.trim().length === 0) {
    errors.push({
      field: 'label',
      message: 'アクションラベルは必須です',
    });
  } else if (action.label.length > 20) {
    errors.push({
      field: 'label',
      message: 'アクションラベルは20文字以内で入力してください',
    });
  }

  // Type-specific validation
  if (action.type === 'uri') {
    if (!action.uri || action.uri.trim().length === 0) {
      errors.push({
        field: 'uri',
        message: 'URIは必須です',
      });
    } else if (!action.uri.startsWith('https://') && !action.uri.startsWith('http://')) {
      errors.push({
        field: 'uri',
        message: 'URIはhttpまたはhttpsで始まる必要があります',
      });
    }
  } else if (action.type === 'message') {
    if (!action.text || action.text.trim().length === 0) {
      errors.push({
        field: 'text',
        message: 'メッセージテキストは必須です',
      });
    }
  } else if (action.type === 'postback') {
    if (!action.data || action.data.trim().length === 0) {
      errors.push({
        field: 'data',
        message: 'ポストバックデータは必須です',
      });
    }
  }

  return errors;
}

/**
 * Validates a card based on its type
 */
export function validateCard(card: Card): ValidationError[] {
  const errors: ValidationError[] = [];
  const usingTemplate = !!card.templateEnabled;

  // Image URL validation (required, HTTPS only)
  if (!usingTemplate) {
    if (!card.imageUrl || card.imageUrl.trim().length === 0) {
      errors.push({
        field: 'imageUrl',
        message: '画像URLは必須です',
      });
    } else if (!card.imageUrl.startsWith('https://')) {
      errors.push({
        field: 'imageUrl',
        message: '画像URLはHTTPSで始まる必要があります',
      });
    }
  } else {
    if (!card.templateId) {
      errors.push({
        field: 'templateId',
        message: 'テンプレートを選択してください',
      });
    }

    if (!card.templateAreas || card.templateAreas.length === 0) {
      errors.push({
        field: 'templateAreas',
        message: 'テンプレートのエリアを設定してください',
      });
    } else if (card.templateAreas.some((area) => !area.imageUrl)) {
      errors.push({
        field: 'templateAreas',
        message: 'すべてのテンプレートエリアに画像を設定してください',
      });
    }
  }

  // Actions validation (min 1, max 3)
  if (!card.actions || card.actions.length === 0) {
    errors.push({
      field: 'actions',
      message: '最低1つのアクションが必要です',
    });
  } else if (card.actions.length > 3) {
    errors.push({
      field: 'actions',
      message: 'アクションは最大3つまでです',
    });
  } else {
    // Validate each action
    card.actions.forEach((action, index) => {
      const actionErrors = validateAction(action);
      actionErrors.forEach((error) => {
        errors.push({
          field: `actions[${index}].${error.field}`,
          message: error.message,
        });
      });
    });
  }

  // Type-specific validation
  switch (card.type) {
    case 'product': {
      const productCard = card as ProductCard;
      if (!productCard.title || productCard.title.trim().length === 0) {
        errors.push({
          field: 'title',
          message: '商品名は必須です',
        });
      } else if (productCard.title.length > 40) {
        errors.push({
          field: 'title',
          message: '商品名は40文字以内で入力してください',
        });
      }

      if (!productCard.description || productCard.description.trim().length === 0) {
        errors.push({
          field: 'description',
          message: '説明は必須です',
        });
      } else if (productCard.description.length > 60) {
        errors.push({
          field: 'description',
          message: '説明は60文字以内で入力してください',
        });
      }

      if (productCard.price !== undefined && productCard.price < 0) {
        errors.push({
          field: 'price',
          message: '価格は0以上の値を入力してください',
        });
      }
      break;
    }

    case 'location': {
      const locationCard = card as LocationCard;
      if (!locationCard.title || locationCard.title.trim().length === 0) {
        errors.push({
          field: 'title',
          message: '場所名は必須です',
        });
      } else if (locationCard.title.length > 40) {
        errors.push({
          field: 'title',
          message: '場所名は40文字以内で入力してください',
        });
      }

      if (!locationCard.address || locationCard.address.trim().length === 0) {
        errors.push({
          field: 'address',
          message: '住所は必須です',
        });
      } else if (locationCard.address.length > 60) {
        errors.push({
          field: 'address',
          message: '住所は60文字以内で入力してください',
        });
      }

      if (locationCard.hours && locationCard.hours.length > 60) {
        errors.push({
          field: 'hours',
          message: '営業時間は60文字以内で入力してください',
        });
      }
      break;
    }

    case 'person': {
      const personCard = card as PersonCard;
      if (!personCard.name || personCard.name.trim().length === 0) {
        errors.push({
          field: 'name',
          message: '名前は必須です',
        });
      } else if (personCard.name.length > 40) {
        errors.push({
          field: 'name',
          message: '名前は40文字以内で入力してください',
        });
      }

      if (!personCard.description || personCard.description.trim().length === 0) {
        errors.push({
          field: 'description',
          message: '説明は必須です',
        });
      } else if (personCard.description.length > 60) {
        errors.push({
          field: 'description',
          message: '説明は60文字以内で入力してください',
        });
      }

      if (personCard.tags && personCard.tags.length > 0) {
        personCard.tags.forEach((tag, index) => {
          if (tag.length > 20) {
            errors.push({
              field: `tags[${index}]`,
              message: 'タグは20文字以内で入力してください',
            });
          }
        });
      }
      break;
    }

    case 'image': {
      const imageCard = card as ImageCard;
      if (imageCard.title && imageCard.title.length > 40) {
        errors.push({
          field: 'title',
          message: 'タイトルは40文字以内で入力してください',
        });
      }

      if (imageCard.description && imageCard.description.length > 60) {
        errors.push({
          field: 'description',
          message: '説明は60文字以内で入力してください',
        });
      }
      break;
    }
  }

  return errors;
}

/**
 * Converts a card to LINE Messaging API carousel column format
 */
export function cardToCarouselColumn(card: Card): {
  thumbnailImageUrl: string;
  title?: string;
  text: string;
  actions: Array<{
    type: string;
    label: string;
    uri?: string;
    text?: string;
    data?: string;
    displayText?: string;
  }>;
} {
  let title: string | undefined;
  let text: string;

  // Convert card-specific fields to LINE API format
  switch (card.type) {
    case 'product': {
      const productCard = card as ProductCard;
      title = productCard.title;
      text = productCard.description;
      if (productCard.price !== undefined) {
        text += `\n価格: ${productCard.price.toLocaleString()}円`;
      }
      break;
    }

    case 'location': {
      const locationCard = card as LocationCard;
      title = locationCard.title;
      text = locationCard.address;
      if (locationCard.hours) {
        text += `\n営業時間: ${locationCard.hours}`;
      }
      break;
    }

    case 'person': {
      const personCard = card as PersonCard;
      title = personCard.name;
      text = personCard.description;
      if (personCard.tags && personCard.tags.length > 0) {
        text += '\n' + personCard.tags.map((tag) => `#${tag}`).join(' ');
      }
      break;
    }

    case 'image': {
      const imageCard = card as ImageCard;
      title = imageCard.title;
      text = imageCard.description || ' '; // LINE requires text field, use space if empty
      break;
    }
  }

  // Convert actions to LINE API format
  const actions = card.actions.map((action) => {
    const baseAction = {
      type: action.type,
      label: action.label,
    };

    if (action.type === 'uri') {
      return { ...baseAction, uri: action.uri };
    } else if (action.type === 'message') {
      return { ...baseAction, text: action.text };
    } else if (action.type === 'postback') {
      return {
        ...baseAction,
        data: action.data,
        ...(action.displayText && { displayText: action.displayText }),
      };
    }

    return baseAction;
  });

  return {
    ...(card.imageUrl ? { thumbnailImageUrl: card.imageUrl } : {}),
    ...(title && { title }),
    text,
    actions,
  };
}

/**
 * Creates a default card with pre-filled values based on type
 */
export function createDefaultCard(type: CardType): Card {
  const baseCard = {
    id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    imageUrl: '',
    templateEnabled: false,
    templateId: null as string | null,
    templateAreas: [] as TemplateArea[],
    templatePreviewUrl: null as string | null,
    actions: [
      {
        type: 'uri' as const,
        label: '詳細を見る',
        uri: 'https://example.com',
      },
    ],
  };

  switch (type) {
    case 'product':
      return {
        ...baseCard,
        type: 'product',
        title: '商品名',
        description: '商品の説明をここに入力してください',
        price: undefined,
      } as ProductCard;

    case 'location':
      return {
        ...baseCard,
        type: 'location',
        title: '場所名',
        address: '住所をここに入力してください',
        hours: undefined,
      } as LocationCard;

    case 'person':
      return {
        ...baseCard,
        type: 'person',
        name: '名前',
        description: '説明をここに入力してください',
        tags: [],
      } as PersonCard;

    case 'image':
      return {
        ...baseCard,
        type: 'image',
        title: undefined,
        description: undefined,
      } as ImageCard;

    default:
      throw new Error(`Unknown card type: ${type}`);
  }
}
