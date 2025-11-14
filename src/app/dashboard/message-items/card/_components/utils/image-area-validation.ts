import type { ImageArea, CardAction } from '../types';

/**
 * Validation error structure
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Maximum number of image areas allowed
 */
export const MAX_IMAGE_AREAS = 10;

/**
 * Maximum label length
 */
export const MAX_LABEL_LENGTH = 20;

/**
 * Minimum area dimensions
 */
export const MIN_AREA_WIDTH = 50;
export const MIN_AREA_HEIGHT = 50;

/**
 * Validates an image area and returns errors if any
 */
export function validateImageArea(
  area: ImageArea,
  imageWidth: number,
  imageHeight: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Label validation
  if (!area.label || area.label.trim().length === 0) {
    errors.push({
      field: 'label',
      message: 'ラベルは必須です',
    });
  } else if (area.label.length > MAX_LABEL_LENGTH) {
    errors.push({
      field: 'label',
      message: `ラベルは${MAX_LABEL_LENGTH}文字以内で入力してください`,
    });
  }

  // Position and size validation
  if (area.x < 0 || area.x >= imageWidth) {
    errors.push({
      field: 'x',
      message: 'X座標が画像範囲外です',
    });
  }

  if (area.y < 0 || area.y >= imageHeight) {
    errors.push({
      field: 'y',
      message: 'Y座標が画像範囲外です',
    });
  }

  if (area.width < MIN_AREA_WIDTH) {
    errors.push({
      field: 'width',
      message: `幅は${MIN_AREA_WIDTH}px以上にしてください`,
    });
  }

  if (area.height < MIN_AREA_HEIGHT) {
    errors.push({
      field: 'height',
      message: `高さは${MIN_AREA_HEIGHT}px以上にしてください`,
    });
  }

  if (area.x + area.width > imageWidth) {
    errors.push({
      field: 'width',
      message: '領域が画像の右端を超えています',
    });
  }

  if (area.y + area.height > imageHeight) {
    errors.push({
      field: 'height',
      message: '領域が画像の下端を超えています',
    });
  }

  // Action validation
  const actionErrors = validateAction(area.action);
  errors.push(...actionErrors);

  return errors;
}

/**
 * Validates an action
 */
export function validateAction(action: CardAction): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!action.label || action.label.trim().length === 0) {
    errors.push({
      field: 'action.label',
      message: 'アクションのラベルは必須です',
    });
  } else if (action.label.length > 20) {
    errors.push({
      field: 'action.label',
      message: 'アクションのラベルは20文字以内で入力してください',
    });
  }

  if (action.type === 'uri') {
    if (!action.uri || action.uri.trim().length === 0) {
      errors.push({
        field: 'action.uri',
        message: 'URLは必須です',
      });
    } else if (!action.uri.startsWith('https://')) {
      errors.push({
        field: 'action.uri',
        message: 'URLはHTTPSで始まる必要があります',
      });
    }
  } else if (action.type === 'message') {
    if (!action.text || action.text.trim().length === 0) {
      errors.push({
        field: 'action.text',
        message: 'メッセージテキストは必須です',
      });
    } else if (action.text.length > 300) {
      errors.push({
        field: 'action.text',
        message: 'メッセージテキストは300文字以内で入力してください',
      });
    }
  } else if (action.type === 'postback') {
    if (!action.data || action.data.trim().length === 0) {
      errors.push({
        field: 'action.data',
        message: 'ポストバックデータは必須です',
      });
    } else if (action.data.length > 300) {
      errors.push({
        field: 'action.data',
        message: 'ポストバックデータは300文字以内で入力してください',
      });
    }

    if (action.displayText && action.displayText.length > 300) {
      errors.push({
        field: 'action.displayText',
        message: '表示テキストは300文字以内で入力してください',
      });
    }
  }

  return errors;
}

/**
 * Checks if two areas overlap
 */
export function areasOverlap(area1: ImageArea, area2: ImageArea): boolean {
  return !(
    area1.x + area1.width <= area2.x ||
    area2.x + area2.width <= area1.x ||
    area1.y + area1.height <= area2.y ||
    area2.y + area2.height <= area1.y
  );
}

/**
 * Checks for overlapping areas and returns warnings
 */
export function checkAreaOverlaps(areas: ImageArea[]): string[] {
  const warnings: string[] = [];

  for (let i = 0; i < areas.length; i++) {
    for (let j = i + 1; j < areas.length; j++) {
      if (areasOverlap(areas[i], areas[j])) {
        warnings.push(
          `領域「${areas[i].label}」と「${areas[j].label}」が重なっています`
        );
      }
    }
  }

  return warnings;
}

/**
 * Constrains area position and size within image bounds
 */
export function constrainArea(
  area: ImageArea,
  imageWidth: number,
  imageHeight: number
): ImageArea {
  const constrained = { ...area };

  // Constrain position
  constrained.x = Math.max(0, Math.min(constrained.x, imageWidth - MIN_AREA_WIDTH));
  constrained.y = Math.max(0, Math.min(constrained.y, imageHeight - MIN_AREA_HEIGHT));

  // Constrain size
  constrained.width = Math.max(
    MIN_AREA_WIDTH,
    Math.min(constrained.width, imageWidth - constrained.x)
  );
  constrained.height = Math.max(
    MIN_AREA_HEIGHT,
    Math.min(constrained.height, imageHeight - constrained.y)
  );

  return constrained;
}
