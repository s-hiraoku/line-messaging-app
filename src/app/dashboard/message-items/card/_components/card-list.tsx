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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200">
        <div className="mb-5 flex items-start gap-4">
          <div className="border-2 border-black bg-red-600 p-3">
            <AlertCircle className="h-6 w-6 flex-shrink-0 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-2">{title}</h3>
            <p className="text-sm font-mono text-black/70 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="border-2 border-black bg-white px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#FFFEF5] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="border-2 border-black bg-red-600 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            削除する
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
        group relative border-2 transition-all duration-200
        ${isSelected
          ? 'border-[#00B900] bg-[#00B900]/10 shadow-[4px_4px_0px_0px_rgba(0,185,0,1)]'
          : 'border-black bg-white hover:bg-[#FFFEF5] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
        }
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
      `}
    >
      <div className="flex items-center gap-3 p-4">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-black/60 hover:text-black active:cursor-grabbing transition-colors"
          aria-label="ドラッグして並び替え"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Thumbnail with hover effect */}
        <div
          className="h-14 w-14 flex-shrink-0 cursor-pointer overflow-hidden border-2 border-black transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          onClick={onSelect}
        >
          {card.imageUrl ? (
            <img
              src={card.imageUrl}
              alt={cardTitle}
              className="h-full w-full object-cover transition-transform hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#FFFEF5]">
              <TypeIcon className={`h-7 w-7 text-black`} />
            </div>
          )}
        </div>

        {/* Card Info */}
        <div className="flex-1 cursor-pointer overflow-hidden" onClick={onSelect}>
          <div className="flex items-center gap-2 mb-1">
            <TypeIcon className={`h-4 w-4 flex-shrink-0 text-black`} />
            <span className="text-xs font-bold uppercase tracking-wider text-black/60">{typeInfo.label}</span>
          </div>
          <p className="truncate text-sm font-bold text-black leading-tight">{cardTitle}</p>
        </div>

        {/* Delete Button with improved hover state */}
        <button
          onClick={onDelete}
          disabled={!canDelete}
          className="flex-shrink-0 p-2 border-2 border-black bg-white text-black transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-red-600 hover:text-white hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:text-black disabled:hover:bg-white"
          aria-label="カードを削除"
          title={canDelete ? "カードを削除" : "最低1枚必要です"}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00B900]" />
      )}
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
      {/* Header with improved visual hierarchy */}
      <div className="flex items-center justify-between pb-2 border-b-2 border-black">
        <div>
          <h3 className="text-base font-bold uppercase tracking-wider text-black mb-1">
            カード一覧
          </h3>
          <p className="text-xs font-mono text-black/60">
            {cards.length} / 9 カード {canAddCard && <span className="text-black/40">• あと {9 - cards.length} 枚追加可能</span>}
          </p>
        </div>
        <button
          onClick={onAdd}
          disabled={!canAddCard}
          className="inline-flex items-center gap-2 border-2 border-black bg-[#00B900] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0"
          title={canAddCard ? "新しいカードを追加" : "カードは最大9枚までです"}
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

      {/* Helper Text with icons */}
      <div className="space-y-2">
        {!canAddCard && (
          <div className="flex items-center gap-2 border-2 border-black bg-[#FFE500] px-3 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <AlertCircle className="h-4 w-4 text-black flex-shrink-0" />
            <p className="text-xs font-bold text-black">最大9枚までカードを作成できます</p>
          </div>
        )}
        {!canDeleteCard && (
          <div className="flex items-center gap-2 border-2 border-black bg-[#00B900]/20 px-3 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <AlertCircle className="h-4 w-4 text-black flex-shrink-0" />
            <p className="text-xs font-bold text-black">少なくとも1枚のカードが必要です</p>
          </div>
        )}
      </div>

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
