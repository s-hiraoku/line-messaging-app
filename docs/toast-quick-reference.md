# Toast 通知 クイックリファレンス

## インポート

```typescript
import { toast } from '@/lib/toast';
```

## 基本的な使い方

```typescript
// 成功
toast.success('保存しました');

// エラー
toast.error('エラーが発生しました');

// 情報
toast.info('処理を開始しました');

// 警告
toast.warning('この操作は取り消せません');

// ローディング
const id = toast.loading('処理中...');
toast.dismiss(id);
```

## よく使うパターン

### 1. API呼び出し with Promise

```typescript
toast.promise(
  fetch('/api/data').then(r => r.json()),
  {
    loading: '読み込み中...',
    success: '読み込みました',
    error: '読み込みに失敗しました',
  }
);
```

### 2. Try-Catch パターン

```typescript
const id = toast.loading('保存中...');
try {
  await saveData();
  toast.success('保存しました');
  toast.dismiss(id);
} catch (error) {
  toast.error('保存に失敗しました');
  toast.dismiss(id);
}
```

### 3. 説明文付き

```typescript
toast.success('保存しました', {
  description: '変更が正常に保存されました',
});
```

### 4. アクション付き

```typescript
toast.success('削除しました', {
  action: {
    label: '元に戻す',
    onClick: () => undo(),
  },
});
```

### 5. カスタム時間

```typescript
toast.info('一時的なメッセージ', {
  duration: 2000, // 2秒
});
```

## カードエディタでの使用例

```typescript
// カード保存
const handleSave = async (card: Card) => {
  toast.promise(
    saveCard(card),
    {
      loading: 'カードを保存中...',
      success: 'カードを保存しました',
      error: '保存に失敗しました',
    }
  );
};

// カード削除
const handleDelete = async (id: string) => {
  toast.promise(
    deleteCard(id),
    {
      loading: 'カードを削除中...',
      success: 'カードを削除しました',
      error: '削除に失敗しました',
    }
  );
};

// バリデーションエラー
const validateCard = (card: Card) => {
  if (!card.title) {
    toast.error('入力エラー', {
      description: 'タイトルは必須です',
    });
    return false;
  }
  return true;
};

// 画像アップロード
const handleImageUpload = async (file: File) => {
  toast.promise(
    uploadImage(file),
    {
      loading: `${file.name}をアップロード中...`,
      success: '画像をアップロードしました',
      error: 'アップロードに失敗しました',
    }
  );
};
```

## Tips

- **成功**: 操作が完了したとき
- **エラー**: エラーが発生したとき
- **情報**: ユーザーに知らせたいとき
- **警告**: 注意が必要なとき
- **ローディング**: 時間がかかる処理のとき

## デフォルト設定

- 位置: 右上 (`top-right`)
- 成功/情報/警告: 4秒間表示
- エラー: 5秒間表示
- ローディング: 手動で閉じるまで表示

## 詳細なドキュメント

詳しい使い方は [Toast 使用ガイド](./toast-usage.md) を参照してください。
