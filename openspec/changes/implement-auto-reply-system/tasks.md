# Tasks: Implement Auto-Reply System

## Phase 1: Data Model & Infrastructure

- [ ] **データベーススキーマの定義**
  - [ ] `AutoReply`モデルをschema.prismaに追加
  - [ ] `AutoReplyLog`モデルをschema.prismaに追加
  - [ ] `DefaultAutoReply`モデルをschema.prismaに追加
  - [ ] `MatchType` enumを追加
  - [ ] 必要なインデックスを定義
  - Validation: スキーマファイルが正しく記述され、`npx prisma validate`が成功すること

- [ ] **データベースマイグレーション**
  - [ ] マイグレーションファイルを生成(`npx prisma migrate dev`)
  - [ ] マイグレーションを実行してテーブルを作成
  - Validation: `npx prisma migrate status`で最新のマイグレーションが適用されていること

- [ ] **シードデータの作成**
  - [ ] サンプルの自動応答ルールをseed.tsに追加
  - [ ] デフォルト応答の初期データを追加
  - Validation: `npx prisma db seed`が成功し、データが挿入されること

## Phase 2: Business Logic

- [ ] **マッチングエンジンの実装**
  - [ ] `src/lib/auto-reply/matcher.ts`を作成
  - [ ] `findMatchingReply`関数を実装
  - [ ] `matchByType`関数を実装(EXACT, CONTAINS, STARTS_WITH, ENDS_WITHのサポート)
  - [ ] 優先度とキーワードマッチングのロジックを実装
  - Validation: ユニットテストを作成し、全てのマッチタイプが正しく動作すること

- [ ] **実行エンジンの実装**
  - [ ] `src/lib/auto-reply/executor.ts`を作成
  - [ ] `executeAutoReply`関数を実装
  - [ ] ログ記録機能を実装
  - [ ] エラーハンドリングを実装
  - Validation: 応答送信とログ記録が正しく動作すること

- [ ] **Webhookとの統合**
  - [ ] `src/app/api/line/webhook/route.ts`を更新
  - [ ] 固定の応答メッセージを自動応答システムに置き換え
  - [ ] テキストメッセージイベントで`executeAutoReply`を呼び出す
  - Validation: Webhook経由でメッセージを受信した際に自動応答が動作すること

## Phase 3: API Implementation

- [ ] **Auto-Reply Management API**
  - [ ] `GET /api/auto-reply` - 応答ルール一覧の取得
  - [ ] `POST /api/auto-reply` - 新規応答ルールの作成
  - [ ] `GET /api/auto-reply/[id]` - 特定ルールの取得
  - [ ] `PUT /api/auto-reply/[id]` - ルールの更新
  - [ ] `DELETE /api/auto-reply/[id]` - ルールの削除
  - [ ] `PATCH /api/auto-reply/[id]/toggle` - 有効/無効の切り替え
  - Validation: 各エンドポイントのテストを作成し、正しく動作すること

- [ ] **Default Reply API**
  - [ ] `GET /api/auto-reply/default` - デフォルト応答の取得
  - [ ] `PUT /api/auto-reply/default` - デフォルト応答の更新
  - Validation: デフォルト応答の取得・更新が正しく動作すること

- [ ] **Analytics API**
  - [ ] `GET /api/auto-reply/analytics` - 応答履歴の統計
  - [ ] `GET /api/auto-reply/logs` - 応答ログ一覧
  - [ ] `GET /api/auto-reply/[id]/logs` - 特定ルールのログ
  - Validation: 統計情報とログが正しく取得できること

## Phase 4: UI Components

- [ ] **共通コンポーネント**
  - [ ] キーワード入力用のタグコンポーネント(`KeywordInput.tsx`)
  - [ ] 優先度入力コンポーネント(`PriorityInput.tsx`)
  - [ ] マッチタイプ選択コンポーネント(`MatchTypeSelect.tsx`)
  - Validation: 各コンポーネントが正しく動作し、ユーザー入力を適切に処理すること

- [ ] **応答ルール一覧ページ**
  - [ ] `/dashboard/auto-reply/page.tsx`を作成
  - [ ] 応答ルール一覧の表示
  - [ ] 有効/無効トグル機能
  - [ ] 削除機能(確認ダイアログ付き)
  - [ ] 新規作成ボタン
  - [ ] デフォルト応答設定セクション
  - Validation: 一覧表示、フィルター、ソートが正しく動作すること

- [ ] **応答ルール作成・編集フォーム**
  - [ ] `/dashboard/auto-reply/new/page.tsx`を作成
  - [ ] `/dashboard/auto-reply/[id]/edit/page.tsx`を作成
  - [ ] フォームバリデーション(Zodスキーマ)
  - [ ] プレビュー機能(テストメッセージでマッチング結果を確認)
  - [ ] 保存・キャンセル処理
  - Validation: フォームの入力検証が正しく動作し、データが保存されること

- [ ] **Analytics Dashboard**
  - [ ] `/dashboard/auto-reply/analytics/page.tsx`を作成
  - [ ] サマリーカード(総応答数、最も使用されたルールなど)
  - [ ] ルール別使用状況のグラフ
  - [ ] 応答ログテーブル
  - [ ] 期間フィルター(日/週/月)
  - Validation: 統計情報とグラフが正しく表示されること

## Phase 5: Testing & Validation

- [ ] **Unit Tests**
  - [ ] マッチングロジックのテスト(`matcher.test.ts`)
  - [ ] 実行エンジンのテスト(`executor.test.ts`)
  - [ ] エッジケース(空文字、特殊文字、長文など)のテスト
  - Validation: `npm run test`で全テストがパスすること

- [ ] **Integration Tests**
  - [ ] Webhook→マッチング→応答送信のフローテスト
  - [ ] API エンドポイントの統合テスト
  - [ ] データベース操作のテスト
  - Validation: 統合テストが全てパスすること

- [ ] **Manual Testing**
  - [ ] 実際のLINEアカウントでメッセージ送信テスト
  - [ ] 各マッチタイプの動作確認
  - [ ] 優先度順の応答確認
  - [ ] デフォルト応答の動作確認
  - [ ] 管理画面でのCRUD操作の確認
  - Validation: 実際の使用シナリオで正しく動作すること

## Phase 6: Performance & Security

- [ ] **パフォーマンス最適化**
  - [ ] データベースクエリの最適化
  - [ ] インデックスの効果確認
  - [ ] キャッシュ戦略の実装(Redisまたはメモリキャッシュ)
  - Validation: 応答時間が1秒以内であること

- [ ] **セキュリティ対策**
  - [ ] 入力バリデーションの強化
  - [ ] XSS対策(サニタイゼーション)
  - [ ] レート制限の実装
  - [ ] 認証・認可の確認
  - Validation: セキュリティスキャンツールでクリティカルな問題がないこと

## Phase 7: Documentation & Deployment

- [ ] **ドキュメント作成**
  - [ ] ユーザーガイド(応答ルールの作成方法)
  - [ ] 技術ドキュメント(アーキテクチャ、API仕様)
  - [ ] トラブルシューティングガイド
  - Validation: ドキュメントが完全で分かりやすいこと

- [ ] **デプロイ準備**
  - [ ] 環境変数の確認
  - [ ] マイグレーションのテスト
  - [ ] ロールバック手順の確認
  - Validation: ステージング環境で正しく動作すること

- [ ] **本番デプロイ**
  - [ ] データベースマイグレーションの実行
  - [ ] アプリケーションのデプロイ
  - [ ] 動作確認
  - [ ] モニタリング設定
  - Validation: 本番環境で正しく動作し、エラーがないこと

## Dependencies

- Phase 1 は独立して実行可能
- Phase 2 は Phase 1 に依存
- Phase 3 は Phase 2 に依存
- Phase 4 は Phase 3 に依存(APIが必要)
- Phase 5 は Phase 1-4 の完了後に実行
- Phase 6 は Phase 5 と並行して実行可能
- Phase 7 は Phase 5-6 の完了後に実行

## Notes

- 各フェーズの完了後にレビューを実施
- テストは継続的に実行し、リグレッションを防ぐ
- ユーザーフィードバックを収集し、必要に応じて調整
