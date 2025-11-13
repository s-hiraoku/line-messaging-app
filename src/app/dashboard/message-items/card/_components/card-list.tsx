'use client';

/**
 * Card List Component
 *
 * Displays a draggable list of cards for the card message editor.
 * Features:
 * - Drag & drop reordering using @dnd-kit
 * - Card selection
 * - Add/delete cards
 * - Visual feedback for selected card
 * - Card count display (X / 9)
 */

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Trash2,
  GripVertical,
  ShoppingBag,
  MapPin,
  User,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import type { Card } from './types';

interface CardListProps {
  cards: Card[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
  onAdd: () => void;
}

interface SortableCardItemProps {
  card: Card;
  isSelected: boolean;
  canDelete: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

/**
 * Confirmation Dialog Component
 */
function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-xl">
        <div className="mb-4 flex items-start gap-3">
          <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm text-slate-300">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Get card type icon and label
 */
function getCardTypeInfo(type: Card['type']) {
  switch (type) {
    case 'product':
      return { icon: ShoppingBag, label: '商品', color: 'text-blue-400' };
    case 'location':
      return { icon: MapPin, label: '場所', color: 'text-green-400' };
    case 'person':
      return { icon: User, label: '人物', color: 'text-purple-400' };
    case 'image':
      return { icon: ImageIcon, label: '画像', color: 'text-yellow-400' };
  }
}

/**
 * Get card title for display
 */
function getCardTitle(card: Card): string {
  switch (card.type) {
    case 'product':
      return card.title || '商品名未設定';
    case 'location':
      return card.title || '場所名未設定';
    case 'person':
      return card.name || '名前未設定';
    case 'image':
      return card.title || '画像カード';
  }
}

/**
 * Sortable Card Item
 */
function SortableCardItem({
  card,
  isSelected,
  canDelete,
  onSelect,
  onDelete,
}: SortableCardItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const typeInfo = getCardTypeInfo(card.type);
  const TypeIcon = typeInfo.icon;
  const cardTitle = getCardTitle(card);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative rounded-lg border bg-slate-800/60 transition
        ${isSelected ? 'border-blue-500 bg-blue-900/20' : 'border-slate-700 hover:border-slate-600'}
        ${isDragging ? 'opacity-50' : ''}
      `}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-slate-400 hover:text-slate-300 active:cursor-grabbing"
          aria-label="ドラッグして並び替え"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Thumbnail */}
        <div
          className="h-12 w-12 flex-shrink-0 cursor-pointer overflow-hidden rounded border border-slate-600"
          onClick={onSelect}
        >
          {card.imageUrl ? (
            <img
              src={card.imageUrl}
              alt={cardTitle}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-700">
              <TypeIcon className={`h-6 w-6 ${typeInfo.color}`} />
            </div>
          )}
        </div>

        {/* Card Info */}
        <div className="flex-1 cursor-pointer overflow-hidden" onClick={onSelect}>
          <div className="flex items-center gap-2">
            <TypeIcon className={`h-4 w-4 flex-shrink-0 ${typeInfo.color}`} />
            <span className="text-xs font-medium text-slate-400">{typeInfo.label}</span>
          </div>
          <p className="mt-1 truncate text-sm font-medium text-white">{cardTitle}</p>
        </div>

        {/* Delete Button */}
        <button
          onClick={onDelete}
          disabled={!canDelete}
          className="flex-shrink-0 text-slate-400 transition hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-slate-400"
          aria-label="カードを削除"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Card List Component
 */
export function CardList({ cards, selectedId, onSelect, onDelete, onReorder, onAdd }: CardListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = cards.findIndex((card) => card.id === active.id);
      const newIndex = cards.findIndex((card) => card.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(oldIndex, newIndex);
      }
    }
  };

  const handleDeleteClick = (card: Card) => {
    if (cards.length <= 1) {
      // Show error message if trying to delete the last card
      return;
    }

    setDeleteConfirm({
      id: card.id,
      title: getCardTitle(card),
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm) {
      onDelete(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const canAddCard = cards.length < 9;
  const canDeleteCard = cards.length > 1;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">
          カード一覧 <span className="text-slate-500">({cards.length} / 9)</span>
        </h3>
        <button
          onClick={onAdd}
          disabled={!canAddCard}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" />
          カードを追加
        </button>
      </div>

      {/* Card List */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {cards.map((card) => (
              <SortableCardItem
                key={card.id}
                card={card}
                isSelected={selectedId === card.id}
                canDelete={canDeleteCard}
                onSelect={() => onSelect(card.id)}
                onDelete={() => handleDeleteClick(card)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Helper Text */}
      {!canAddCard && (
        <p className="text-xs text-slate-500">最大9枚までカードを作成できます</p>
      )}
      {!canDeleteCard && (
        <p className="text-xs text-slate-500">少なくとも1枚のカードが必要です</p>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm !== null}
        title="カードを削除しますか?"
        message={`「${deleteConfirm?.title}」を削除してもよろしいですか? この操作は取り消せません。`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
