# Toast 通知の使い方

このドキュメントでは、アプリケーションでToast通知を使用する方法について説明します。

## 基本的な使い方

```typescript
import { toast } from '@/lib/toast';

// 成功メッセージ
toast.success('保存しました');

// エラーメッセージ
toast.error('エラーが発生しました');

// 情報メッセージ
toast.info('処理を開始しました');

// 警告メッセージ
toast.warning('この操作は取り消せません');
```

## オプション付きToast

### 説明文を追加

```typescript
toast.success('保存しました', {
  description: '変更が正常に保存されました',
});
```

### 表示時間を変更

```typescript
toast.info('一時的なメッセージ', {
  duration: 2000, // 2秒間表示
});
```

### アクションボタンを追加

```typescript
toast.success('メッセージを送信しました', {
  action: {
    label: '元に戻す',
    onClick: () => {
      // 元に戻す処理
      console.log('Undo action');
    },
  },
});
```

### キャンセルボタンを追加

```typescript
toast.warning('ファイルを削除しますか？', {
  duration: 5000,
  cancel: {
    label: 'キャンセル',
    onClick: () => {
      console.log('Cancelled');
    },
  },
});
```

## ローディング状態

### 基本的なローディング

```typescript
const toastId = toast.loading('処理中...');

// 処理が完了したら更新
setTimeout(() => {
  toast.success('完了しました');
  toast.dismiss(toastId);
}, 2000);
```

### Promise を使ったローディング

```typescript
toast.promise(
  fetch('/api/data').then(res => res.json()),
  {
    loading: 'データを読み込み中...',
    success: 'データを読み込みました',
    error: 'データの読み込みに失敗しました',
  }
);
```

### 動的なメッセージ

```typescript
toast.promise(
  saveData(),
  {
    loading: '保存中...',
    success: (data) => `${data.count}件のデータを保存しました`,
    error: (error) => `エラー: ${error.message}`,
  }
);
```

## 実用例

### フォーム送信

```typescript
const handleSubmit = async (data: FormData) => {
  const toastId = toast.loading('送信中...');

  try {
    await submitForm(data);
    toast.success('送信しました', {
      description: 'フォームが正常に送信されました',
    });
    toast.dismiss(toastId);
  } catch (error) {
    toast.error('送信に失敗しました', {
      description: error.message,
    });
    toast.dismiss(toastId);
  }
};
```

### API呼び出し

```typescript
const deleteItem = async (id: string) => {
  toast.promise(
    fetch(`/api/items/${id}`, { method: 'DELETE' }),
    {
      loading: '削除中...',
      success: 'アイテムを削除しました',
      error: '削除に失敗しました',
    }
  );
};
```

### ファイルアップロード

```typescript
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  toast.promise(
    fetch('/api/upload', {
      method: 'POST',
      body: formData,
    }).then(res => res.json()),
    {
      loading: `${file.name}をアップロード中...`,
      success: (data) => `${file.name}をアップロードしました`,
      error: (error) => `アップロードに失敗しました: ${error.message}`,
    }
  );
};
```

### コピー機能

```typescript
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('コピーしました', {
      description: 'クリップボードにコピーされました',
      duration: 2000,
    });
  } catch (error) {
    toast.error('コピーに失敗しました');
  }
};
```

### 一括操作

```typescript
const bulkDelete = async (ids: string[]) => {
  toast.promise(
    Promise.all(ids.map(id => deleteItem(id))),
    {
      loading: `${ids.length}件のアイテムを削除中...`,
      success: (results) => `${results.length}件のアイテムを削除しました`,
      error: '一部のアイテムの削除に失敗しました',
    }
  );
};
```

## Toast を閉じる

### 特定のToastを閉じる

```typescript
const toastId = toast.success('メッセージ');
toast.dismiss(toastId);
```

### すべてのToastを閉じる

```typescript
toast.dismiss();
```

## カスタマイズ

### カスタムToast

```typescript
toast.custom('カスタムメッセージ', {
  duration: 3000,
  action: {
    label: 'アクション',
    onClick: () => console.log('Action clicked'),
  },
});
```

## スタイリング

Toastのスタイルは `src/components/ui/sonner.tsx` でカスタマイズできます。
現在のテーマに自動的に適応します。

## 位置

デフォルトでは、Toastは画面の右上に表示されます。
位置を変更する場合は、`src/app/layout.tsx` の `<Toaster />` コンポーネントで設定できます。

```typescript
<Toaster position="bottom-right" />
```

利用可能な位置:
- `top-left`
- `top-center`
- `top-right` (デフォルト)
- `bottom-left`
- `bottom-center`
- `bottom-right`

## ベストプラクティス

1. **適切なタイプを使用する**: 成功、エラー、情報、警告を適切に使い分ける
2. **簡潔なメッセージ**: メッセージは短く明確に
3. **説明文を活用**: 詳細情報は description に記載
4. **適切な表示時間**: 重要なメッセージは長めに、一時的なメッセージは短めに
5. **Promise を活用**: 非同期処理では promise メソッドを使用して自動的に状態を更新
6. **アクションボタン**: ユーザーがすぐにアクションを取れるようにする

## トラブルシューティング

### Toastが表示されない

1. `src/app/layout.tsx` に `<Toaster />` が追加されているか確認
2. `sonner` パッケージがインストールされているか確認
3. コンソールにエラーが出ていないか確認

### スタイルが適用されない

1. Tailwind CSS の設定を確認
2. `globals.css` が正しく読み込まれているか確認
3. テーマプロバイダーが正しく設定されているか確認
