'use client';

import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { ImageArea } from './types';

interface ImageAreaListProps {
  areas: ImageArea[];
  selectedAreaId: string | null;
  onSelectArea: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ImageAreaList({
  areas,
  selectedAreaId,
  onSelectArea,
  onMoveUp,
  onMoveDown,
  onDelete,
}: ImageAreaListProps) {
  if (areas.length === 0) {
    return (
      <div className="border-2 border-black bg-[#FFFEF5] p-6 text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <p className="text-sm font-mono text-black/60">
          領域がまだありません。<br />
          キャンバス上でドラッグして領域を追加してください。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold uppercase tracking-wider text-black">
          領域リスト
        </p>
        <Badge variant="outline" className="border-2 border-black text-xs">
          {areas.length}/10
        </Badge>
      </div>

      <div className="space-y-2">
        {areas.map((area, index) => {
          const isSelected = area.id === selectedAreaId;

          return (
            <div
              key={area.id}
              className={`border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-300 translate-x-[2px] translate-y-[2px] shadow-none'
                  : 'bg-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
              }`}
              onClick={() => onSelectArea(area.id)}
            >
              <div className="flex items-start gap-2">
                {/* Area Number */}
                <Badge
                  variant="outline"
                  className="mt-0.5 bg-white text-black border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                >
                  {index + 1}
                </Badge>

                {/* Area Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-black truncate uppercase tracking-wider">
                    {area.label || '(未設定)'}
                  </p>
                  <p className="text-xs font-mono text-black/60 mt-1">
                    {area.x}, {area.y} · {area.width}×{area.height}px
                  </p>
                  <Badge
                    variant="secondary"
                    className="text-xs mt-1.5 border-2 border-black bg-[#FFFEF5]"
                  >
                    {area.action.type === 'uri' && 'リンク'}
                    {area.action.type === 'message' && 'メッセージ'}
                    {area.action.type === 'postback' && 'ポストバック'}
                  </Badge>
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveUp(area.id);
                    }}
                    disabled={index === 0}
                    className="h-6 w-6 p-0 border-2 border-black disabled:opacity-30"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveDown(area.id);
                    }}
                    disabled={index === areas.length - 1}
                    className="h-6 w-6 p-0 border-2 border-black disabled:opacity-30"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(area.id);
                    }}
                    className="h-6 w-6 p-0 border-2 border-black text-black hover:text-white hover:bg-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
