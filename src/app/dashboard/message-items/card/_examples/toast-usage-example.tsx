/**
 * Toast Usage Example for Card Editor
 *
 * カードエディタでのToast通知の使用例
 */

'use client';

import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import type { Card } from '../_components/types';

/**
 * カード保存処理の例
 */
export function saveCardExample(card: Card) {
  const toastId = toast.loading('カードを保存中...');

  // API呼び出しのシミュレーション
  setTimeout(() => {
    try {
      // 保存処理...
      toast.success('カードを保存しました', {
        description: `${card.type}カードが正常に保存されました`,
      });
      toast.dismiss(toastId);
    } catch (error) {
      toast.error('保存に失敗しました', {
        description: 'もう一度お試しください',
      });
      toast.dismiss(toastId);
    }
  }, 2000);
}

/**
 * カード削除処理の例
 */
export function deleteCardExample(cardId: string, cardTitle: string) {
  toast.promise(
    // 削除API呼び出し（シミュレーション）
    new Promise((resolve) => setTimeout(resolve, 1500)),
    {
      loading: 'カードを削除中...',
      success: `「${cardTitle}」を削除しました`,
      error: '削除に失敗しました',
    }
  );
}

/**
 * 画像アップロード処理の例
 */
export function uploadImageExample(file: File) {
  toast.promise(
    // アップロードAPI呼び出し（シミュレーション）
    new Promise((resolve) => setTimeout(resolve, 3000)),
    {
      loading: `${file.name}をアップロード中...`,
      success: '画像をアップロードしました',
      error: 'アップロードに失敗しました',
    }
  );
}

/**
 * バリデーションエラーの例
 */
export function validationErrorExample() {
  toast.error('入力エラー', {
    description: '必須項目を入力してください',
    duration: 5000,
  });
}

/**
 * カードのコピー処理の例
 */
export function copyCardExample(card: Card) {
  toast.success('カードをコピーしました', {
    duration: 2000,
    action: {
      label: '元に戻す',
      onClick: () => {
        toast.info('コピーを取り消しました');
      },
    },
  });
}

/**
 * 一括削除処理の例
 */
export function bulkDeleteExample(count: number) {
  toast.warning(`${count}枚のカードを削除しますか？`, {
    duration: 6000,
    action: {
      label: '削除',
      onClick: () => {
        toast.promise(
          new Promise((resolve) => setTimeout(resolve, 2000)),
          {
            loading: `${count}枚のカードを削除中...`,
            success: `${count}枚のカードを削除しました`,
            error: '一部のカードの削除に失敗しました',
          }
        );
      },
    },
    cancel: {
      label: 'キャンセル',
    },
  });
}

/**
 * Toast使用例のデモコンポーネント
 */
export function ToastDemoComponent() {
  const sampleCard: Card = {
    id: 'sample-1',
    type: 'product',
    title: 'サンプル商品',
    description: 'これはサンプルです',
    imageUrl: 'https://example.com/image.jpg',
    actions: [],
  };

  return (
    <div className="space-y-4 p-6 border border-slate-700 rounded-lg bg-slate-800/40">
      <h3 className="text-lg font-semibold text-white">Toast通知のデモ</h3>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => saveCardExample(sampleCard)}
        >
          保存デモ
        </Button>

        <Button
          variant="danger"
          size="sm"
          onClick={() => deleteCardExample('sample-1', 'サンプル商品')}
        >
          削除デモ
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => uploadImageExample(new File([''], 'sample.jpg'))}
        >
          アップロードデモ
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => validationErrorExample()}
        >
          エラーデモ
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => copyCardExample(sampleCard)}
        >
          コピーデモ
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => bulkDeleteExample(3)}
        >
          一括削除デモ
        </Button>
      </div>

      <div className="text-xs text-slate-400 mt-4">
        各ボタンをクリックしてToast通知の動作を確認できます
      </div>
    </div>
  );
}
