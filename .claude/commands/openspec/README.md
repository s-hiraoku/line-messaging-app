# OpenSpec スラッシュコマンド

OpenSpecの開発ワークフローを効率化するためのカスタムスラッシュコマンド群です。

## コマンド一覧

### `/openspec:proposal`
新しいOpenSpec changeの提案を作成します。

**使用タイミング**: 新機能追加、破壊的変更、アーキテクチャ変更などを計画する時

**実行内容**:
- プロジェクト状態の確認（`openspec list`, `openspec list --specs`）
- 一意な change-id の選択
- proposal.md, tasks.md, design.md のスキャフォールド
- spec delta の作成
- strict validation の実行

**使い方**:
```bash
/openspec:proposal
```

### `/openspec:prepare <change-id>`
**NEW!** OpenSpec changeを分析し、**専用サブエージェント**と実装用コマンドを自動生成します。

**使用タイミング**: 承認されたOpenSpec changeの実装を開始する前

**実行内容**:
1. OpenSpec changeの完全分析（proposal, design, tasks, spec deltas）
2. 実装スコープの判定（frontend, API, database, MCP integration, testなど）
3. **各領域に特化したサブエージェントコマンドを生成**
4. サブエージェントをオーケストレーションするメインコマンドを生成
5. 依存関係と並列実行の最適化

**使い方**:
```bash
# 既存のchangeを確認
openspec list

# 実装コマンドを生成
/openspec:prepare add-rich-menu-preview

# 成功すると、以下のコマンドが生成される:
# - /implement-add-rich-menu-preview (メイン)
# - /implement-add-rich-menu-preview-frontend
# - /implement-add-rich-menu-preview-api
# - /implement-add-rich-menu-preview-database
# - /implement-add-rich-menu-preview-test
```

**生成されるコマンドの構造**:
```
.claude/commands/
  ├── implement-<change-id>.md           # メインオーケストレーター
  ├── implement-<change-id>-frontend.md  # フロントエンド専用agent
  ├── implement-<change-id>-api.md       # API専用agent
  ├── implement-<change-id>-database.md  # データベース専用agent
  ├── implement-<change-id>-mcp.md       # MCP統合agent（必要時）
  └── implement-<change-id>-test.md      # テスト専用agent
```

**各サブエージェントの特徴**:
- **完全特化**: その change の要件に完全特化したプロンプト
- **独立実行**: 各領域を個別に実行可能
- **MCP対応**: Figma, Playwright, DeepWikiなどのMCPツールも活用
- **適材適所**: フロントエンド、API、DB、テストそれぞれに最適化
- **再利用可能**: 保存されるので、何度でも実行・カスタマイズ可能

### `/implement-<change-id>`
**自動生成コマンド**: `/openspec:prepare` で生成される**メインオーケストレーター**コマンド

**使用タイミング**: `/openspec:prepare` 実行後、実装を全体的に開始する時

**実行内容**:
このコマンドは、生成された各サブエージェントを適切な順序で実行します：

1. **Phase 1: Database** - データベース変更（依存関係のため最初）
2. **Phase 2: Parallel Implementation** - フロントエンド、API、MCPを並列実行
3. **Phase 3: Testing** - テスト実装と実行
4. **Phase 4: Validation** - 全体の検証とOpenSpec validation
5. **Phase 5: Update Tasks** - tasks.mdの更新

**使い方**:
```bash
# 全てのサブエージェントを順序良く実行
/implement-add-rich-menu-preview
```

**実行の流れ**:
```
┌─────────────────────────────────┐
│ Phase 1: Database               │
│ /implement-<id>-database        │
└───────────┬─────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ Phase 2: Parallel               │
│ /implement-<id>-frontend  ┐     │
│ /implement-<id>-api       ├並列 │
│ /implement-<id>-mcp       ┘     │
└───────────┬─────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ Phase 3: Testing                │
│ /implement-<id>-test            │
└───────────┬─────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ Phase 4: Validation             │
│ - npm test / lint / tsc         │
│ - openspec validate --strict    │
└─────────────────────────────────┘
```

### `/implement-<change-id>-*` (サブエージェント)
**自動生成コマンド**: `/openspec:prepare` で生成される**領域特化型エージェント**

**使用タイミング**: 特定の領域だけを実装・修正したい時

**生成されるサブエージェント**:

#### `/implement-<change-id>-frontend`
- **役割**: React/Next.jsコンポーネント、UI、Jotai state実装
- **責任範囲**: src/components/, src/app/, src/state/
- **含まれる内容**: 要件、タスク、実装ガイドライン、プロジェクト規約
- **独立実行**: 可能（APIやDBが既に実装されている場合）

#### `/implement-<change-id>-api`
- **役割**: API routes、サービスロジック実装
- **責任範囲**: src/app/api/, src/lib/
- **含まれる内容**: エンドポイント仕様、認証・認可、エラーハンドリング
- **独立実行**: 可能（DBが既に実装されている場合）

#### `/implement-<change-id>-database`
- **役割**: Prismaスキーマ変更、マイグレーション
- **責任範囲**: prisma/schema.prisma, prisma/seed.ts
- **含まれる内容**: モデル定義、リレーション、インデックス、マイグレーション戦略
- **独立実行**: 可能（通常は最初に実行）

#### `/implement-<change-id>-mcp`
- **役割**: MCP統合（Figma, Playwright, DeepWikiなど）
- **責任範囲**: MCP tool呼び出し、外部サービス連携
- **含まれる内容**: 使用するMCPツール、統合ポイント、エラーハンドリング
- **独立実行**: 可能（他の実装と並行）

#### `/implement-<change-id>-test`
- **役割**: 単体テスト・統合テストの実装
- **責任範囲**: *.test.ts, *.test.tsx
- **含まれる内容**: テストシナリオ、カバレッジ要件
- **独立実行**: 可能（他の実装完了後）

**サブエージェント個別実行の使い方**:
```bash
# フロントエンドだけ実装
/implement-add-rich-menu-preview-frontend

# APIだけ実装
/implement-add-rich-menu-preview-api

# データベースだけ変更
/implement-add-rich-menu-preview-database

# テストだけ追加
/implement-add-rich-menu-preview-test
```

**サブエージェントの利点**:
- **細かい粒度**: 必要な部分だけ実装できる
- **イテレーション**: 一つの領域を何度も調整できる
- **デバッグ**: 問題がある領域だけ再実行できる
- **並行作業**: 複数人で異なる領域を担当できる
- **カスタマイズ**: 生成されたコマンドファイルを編集して調整可能

### `/openspec:apply`
承認されたOpenSpec changeを実装します。

**使用タイミング**: シンプルな実装や、カスタムコマンド不要な場合

**実行内容**:
- proposal.md, design.md, tasks.md の読み込み
- tasks.md に従った順次実装
- 完了後のチェックリスト更新

**使い方**:
```bash
/openspec:apply
```

**注意**: 複雑な実装の場合は `/openspec:prepare` + `/implement-<change-id>` の使用を推奨

### `/openspec:archive <change-id>`
デプロイ済みのOpenSpec changeをアーカイブします。

**使用タイミング**: 実装が完了し、本番環境にデプロイされた後

**実行内容**:
- change-id の確認
- `openspec archive <id> --yes` の実行
- spec の更新
- strict validation

**使い方**:
```bash
/openspec:archive add-rich-menu-preview
```

## 推奨ワークフロー

### パターンA: 複雑な実装（推奨）

```bash
# 1. 提案作成
/openspec:proposal

# 2. レビュー・承認を待つ
# （チームレビュー、必要に応じて修正）

# 3. 実装コマンドを生成
/openspec:prepare <change-id>

# 4. 生成されたコマンドで実装
/implement-<change-id>

# 5. デプロイ後にアーカイブ
/openspec:archive <change-id>
```

**このパターンが適している場合**:
- フロントエンドとバックエンドの両方に変更がある
- 複数の独立したタスクがある
- データベーススキーマの変更が必要
- 大規模な機能追加

**メリット**:
- Task agentが自動的に最適な順序で実行される
- 並列実行による時間短縮
- 各フェーズの完了条件が明確
- 進捗が可視化される

### パターンB: シンプルな実装

```bash
# 1. 提案作成
/openspec:proposal

# 2. レビュー・承認を待つ

# 3. 直接実装
/openspec:apply

# 4. デプロイ後にアーカイブ
/openspec:archive <change-id>
```

**このパターンが適している場合**:
- 単一ファイルの変更
- バグフィックス的な変更
- ドキュメントのみの更新
- シンプルなAPI追加

## 使用例

### 例1: リッチメニュープレビュー機能の追加

```bash
# ステップ1: 提案作成
/openspec:proposal
# → change-id: add-rich-menu-preview を作成
# → proposal.md, tasks.md, specs/ を編集
# → openspec validate add-rich-menu-preview --strict

# ステップ2: 実装準備（サブエージェント生成）
/openspec:prepare add-rich-menu-preview
# → 分析結果:
#   - フロントエンド実装が必要（Reactコンポーネント）
#   - API実装が必要（プレビューエンドポイント）
#   - データベース変更なし
#   - MCP統合: Figma Dev Mode使用
#   - テスト実装必要
# → 生成されるコマンド:
#   ✓ /implement-add-rich-menu-preview (メイン)
#   ✓ /implement-add-rich-menu-preview-frontend
#   ✓ /implement-add-rich-menu-preview-api
#   ✓ /implement-add-rich-menu-preview-mcp
#   ✓ /implement-add-rich-menu-preview-test

# ステップ3: 実装実行（全体を一気に）
/implement-add-rich-menu-preview
# → Phase 1: Database - スキップ（変更なし）
# → Phase 2: Parallel Implementation
#   - /implement-add-rich-menu-preview-frontend 実行
#   - /implement-add-rich-menu-preview-api 実行
#   - /implement-add-rich-menu-preview-mcp 実行
# → Phase 3: Testing
#   - /implement-add-rich-menu-preview-test 実行
# → Phase 4: Validation
#   - npm test, lint, tsc
#   - openspec validate --strict

# または、個別に実行する場合:
/implement-add-rich-menu-preview-frontend  # フロントエンドだけ先に実装
/implement-add-rich-menu-preview-api       # APIを後から追加
/implement-add-rich-menu-preview-test      # テストを最後に追加

# ステップ4: デプロイ後
/openspec:archive add-rich-menu-preview
```

### 例2: データベーススキーマの変更

```bash
# ステップ1: 提案
/openspec:proposal
# → change-id: add-message-scheduling を作成

# ステップ2: 実装準備（サブエージェント生成）
/openspec:prepare add-message-scheduling
# → 分析結果:
#   - データベース変更が必要（ScheduledMessage モデル追加）
#   - API実装が必要（スケジューリングエンドポイント）
#   - バックグラウンドジョブ実装
#   - テスト実装必要
# → 生成されるコマンド:
#   ✓ /implement-add-message-scheduling (メイン)
#   ✓ /implement-add-message-scheduling-database
#   ✓ /implement-add-message-scheduling-api
#   ✓ /implement-add-message-scheduling-test

# ステップ3: 段階的な実装
# まずデータベーススキーマを変更
/implement-add-message-scheduling-database
# → schema.prisma に ScheduledMessage モデル追加
# → マイグレーション作成: npx prisma migrate dev --name add-message-scheduling
# → Prisma client 生成

# 次にAPI実装
/implement-add-message-scheduling-api
# → src/app/api/messages/schedule/route.ts 作成
# → src/lib/scheduling/ にスケジューリングロジック実装
# → バックグラウンドジョブ設定

# 最後にテスト
/implement-add-message-scheduling-test
# → 単体テスト・統合テスト作成
# → スケジューリングロジックのテスト
# → エッジケースの検証

# ステップ4: アーカイブ
/openspec:archive add-message-scheduling
```

## トラブルシューティング

### `/openspec:prepare` でエラーが出る

**エラー: "Change not found"**
```bash
# 利用可能なchangeを確認
openspec list

# 正しいchange-idを使用
/openspec:prepare <正しいchange-id>
```

**エラー: "No tasks found in tasks.md"**
- tasks.md が空または形式が不正
- 手動で tasks.md を確認・修正してから再実行

### `/implement-<change-id>` が見つからない

```bash
# コマンドが生成されているか確認
ls -la .claude/commands/implement-*.md

# 生成されていない場合は prepare を再実行
/openspec:prepare <change-id>
```

### サブエージェントが生成されない

```bash
# OpenSpec changeを確認
openspec show <change-id>

# proposal.md, tasks.md, spec deltasが正しいか確認
cat openspec/changes/<change-id>/proposal.md
cat openspec/changes/<change-id>/tasks.md

# 実装領域が明確でない場合、タスクを明確化してから再実行
/openspec:prepare <change-id>
```

### サブエージェントが期待通りに動作しない

生成されたコマンドファイルをカスタマイズ：
```bash
# サブエージェントの内容を確認
cat .claude/commands/implement-<change-id>-frontend.md

# 必要に応じて手動編集
# - プロンプトを調整
# - 要件を追加/削除
# - 実行ステップを変更
# - MCPツールの使用を追加/削除

# 編集後、再実行
/implement-<change-id>-frontend
```

### 実装途中で中断したい

```bash
# TodoWriteで進捗を確認
# 完了したタスクを tasks.md に反映

# 後から再開する場合:

# 全体を再開
/implement-<change-id>
# → 既に完了したタスクはスキップ可能

# または、特定のサブエージェントだけ再実行
/implement-<change-id>-api  # APIだけ再実行
```

### サブエージェント間の依存関係でエラーが出る

```bash
# 正しい順序で実行:
# 1. Database (他への依存関係のため最初)
/implement-<change-id>-database

# 2. API (データベースに依存)
/implement-<change-id>-api

# 3. Frontend (APIに依存)
/implement-<change-id>-frontend

# 4. Test (全ての実装に依存)
/implement-<change-id>-test
```

## ベストプラクティス

### 1. 常に最新のOpenSpecドキュメントを確認
```bash
# 現在のchangeを確認
openspec list

# 既存の仕様を確認
openspec list --specs

# 重複を避ける
rg -n "Requirement:" openspec/specs
```

### 2. Change IDの命名規則
- kebab-case を使用: `add-feature-name`
- 動詞から始める: `add-`, `update-`, `remove-`, `refactor-`
- 短く具体的に: `add-2fa` ではなく `add-two-factor-auth`

### 3. 複雑な実装は必ず prepare を使う
- フロントエンド + バックエンド
- 複数ファイルにまたがる変更
- データベーススキーマ変更
- MCP統合が必要
→ `/openspec:prepare` で専用サブエージェント生成

**メリット**:
- 各領域に特化したエージェントが生成される
- 独立した実装・テスト・デバッグが可能
- MCPツールの使用が適切に設定される
- 並列実行が最適化される

### 4. サブエージェントのカスタマイズ
生成されたサブエージェントは編集可能：

```bash
# サブエージェントを確認
cat .claude/commands/implement-<change-id>-frontend.md

# 必要に応じて編集
# - 要件を追加
# - 実装ステップを調整
# - MCPツールを追加
# - プロジェクト固有のガイドラインを追加

# 編集後、再実行
/implement-<change-id>-frontend
```

### 5. サブエージェントの並列実行
独立したサブエージェントは並列実行可能：

```bash
# データベースを先に実行
/implement-<change-id>-database

# 完了後、フロントエンドとAPIを同時に開始
# （異なるターミナルまたは順次実行）
/implement-<change-id>-frontend
/implement-<change-id>-api
```

### 6. 進捗を可視化
各サブエージェントはTodoWriteを使って進捗を追跡：
- [ ] Database changes complete
- [ ] Frontend implementation complete
- [ ] API implementation complete
- [ ] MCP integration complete
- [ ] Tests complete
- [ ] Validation passed

### 7. 段階的な検証
各フェーズ後に検証：
```bash
# 実装後すぐにテスト
npm test

# リント確認
npm run lint

# 型チェック
npx tsc --noEmit

# OpenSpec検証
openspec validate <change-id> --strict
```

## FAQ

**Q: `/openspec:prepare` と `/openspec:apply` の違いは？**

A:
- `prepare`: 複雑な実装向け。**専用サブエージェント**を生成し、各領域（frontend, API, database等）に特化したコマンドを作成。並列実行とMCP統合に対応。
- `apply`: シンプルな実装向け。tasks.mdに従って順次実装。サブエージェント生成なし。

**Q: サブエージェントとは何ですか？**

A: `/openspec:prepare` で生成される、各実装領域に特化したカスタムスラッシュコマンドです：
- `/implement-<change-id>-frontend` - フロントエンド専用
- `/implement-<change-id>-api` - API専用
- `/implement-<change-id>-database` - データベース専用
- `/implement-<change-id>-mcp` - MCP統合専用
- `/implement-<change-id>-test` - テスト専用

各サブエージェントは独立して実行可能で、その change の要件に完全特化しています。

**Q: 生成されたサブエージェントは再利用できる？**

A: はい。`.claude/commands/implement-<change-id>-*.md` として保存されるので、何度でも実行可能です。実装途中で中断した場合も、特定のサブエージェントだけ再実行できます。

**Q: サブエージェントをカスタマイズできる？**

A: はい。`.claude/commands/implement-<change-id>-frontend.md` などを直接編集してください。プロンプト、要件、実行ステップ、MCPツールの使用など全て調整可能です。

**Q: 全体実行とサブエージェント個別実行、どちらを使うべき？**

A:
- **全体実行** (`/implement-<change-id>`): 初回実装や全体を一気に進めたい時
- **個別実行** (`/implement-<change-id>-frontend` など): 特定領域だけ実装・修正・デバッグしたい時

**Q: サブエージェント間の依存関係は？**

A: 一般的な依存関係:
1. Database → API → Frontend の順
2. MCP integration は並列可能
3. Test は全ての実装完了後

メインコマンド (`/implement-<change-id>`) が自動的に適切な順序で実行します。

**Q: MCPツールはどのように使われる？**

A: `/openspec:prepare` がspec deltasを分析し、必要なMCPツール（Figma, Playwright, DeepWikiなど）を特定。該当するサブエージェント（特に`-mcp`）に適切なMCPツール使用の指示を含めます。

**Q: 複数のchangeを同時に実装できる？**

A: それぞれのchangeに対して `prepare` を実行すれば、複数の `/implement-<change-id>` コマンドとサブエージェントが作成されます。ただし、ファイルのconflictに注意してください。

**Q: サブエージェントが失敗したらどうする？**

A:
1. エラーメッセージを確認
2. 該当するサブエージェントファイルを編集してプロンプト調整
3. サブエージェントを再実行: `/implement-<change-id>-frontend`
4. 必要に応じて手動で修正
5. 他のサブエージェントは影響を受けない（独立実行）

**Q: アーカイブ後にchangeを参照するには？**

A: `openspec/changes/archive/<date>-<change-id>/` に移動されます。必要に応じて参照可能です。

## 関連ドキュメント

- [OpenSpec AGENTS.md](../../openspec/AGENTS.md) - OpenSpecの詳細ガイド
- [Project CLAUDE.md](../../CLAUDE.md) - プロジェクト規約
- [システム設計](../../docs/system-design.md) - アーキテクチャ情報

## サポート

問題が発生した場合：
1. `openspec validate --strict` で検証
2. `openspec show <change-id> --json` で詳細確認
3. 生成されたコマンドファイルを確認
4. 必要に応じて手動調整
