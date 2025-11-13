/**
 * Card Message Editor - Type Definitions
 *
 * Defines types for the card message editor, including:
 * - Card types (product, location, person, image)
 * - Action types (URI, message, postback)
 * - Form state management
 */

/**
 * Card types supported by the editor
 */
export type CardType = 'product' | 'location' | 'person' | 'image';

/**
 * Action types for card interactions
 */
export interface URIAction {
  type: 'uri';
  label: string;
  uri: string;
}

export interface MessageAction {
  type: 'message';
  label: string;
  text: string;
}

export interface PostbackAction {
  type: 'postback';
  label: string;
  data: string;
  displayText?: string;
}

/**
 * Union type for all card actions
 */
export type CardAction = URIAction | MessageAction | PostbackAction;

/**
 * Base card interface with common fields
 */
export interface BaseCard {
  id: string;
  type: CardType;
  imageUrl: string;
  actions: CardAction[];
}

/**
 * Product card - for e-commerce items
 */
export interface ProductCard extends BaseCard {
  type: 'product';
  title: string;
  description: string;
  price?: number;
}

/**
 * Location card - for places and venues
 */
export interface LocationCard extends BaseCard {
  type: 'location';
  title: string;
  address: string;
  hours?: string;
}

/**
 * Person card - for profiles and contacts
 */
export interface PersonCard extends BaseCard {
  type: 'person';
  name: string;
  description: string;
  tags?: string[];
}

/**
 * Image card - for simple image with caption
 */
export interface ImageCard extends BaseCard {
  type: 'image';
  title?: string;
  description?: string;
}

/**
 * Union type for all card types
 */
export type Card = ProductCard | LocationCard | PersonCard | ImageCard;

/**
 * Form state for the card editor
 */
export interface CardFormState {
  cards: Card[];
  selectedCardId: string | null;
  isPreviewOpen: boolean;
  isSending: boolean;
  errors: Record<string, string[]>;
}

/**
 * Validation error structure
 */
export interface ValidationError {
  field: string;
  message: string;
}
