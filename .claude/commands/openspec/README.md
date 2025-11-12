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
**NEW!** OpenSpec changeを分析し、実装用の専用コマンドを自動生成します。

**使用タイミング**: 承認されたOpenSpec changeの実装を開始する前

**実行内容**:
1. OpenSpec changeの完全分析（proposal, design, tasks, spec deltas）
2. 実装スコープの判定（フロントエンド、バックエンド、DB、テストなど）
3. Task agentの種類と呼び出し順序の決定
4. `.claude/commands/implement-<change-id>.md` の生成
5. 並列実行可能なタスクの最適化

**使い方**:
```bash
# 既存のchangeを確認
openspec list

# 実装コマンドを生成
/openspec:prepare add-rich-menu-preview

# 成功すると、新しいコマンド /implement-add-rich-menu-preview が使用可能に
```

**生成されるコマンドの特徴**:
- Change内容に完全特化した実装手順
- 各Task agentへの詳細なプロンプト
- 並列実行の最適化
- 段階的な実行（探索→実装→テスト→レビュー）
- TodoWriteによる進捗追跡

### `/implement-<change-id>`
**自動生成コマンド**: `/openspec:prepare` で生成される実装専用コマンド

**使用タイミング**: `/openspec:prepare` 実行後、実装を開始する時

**実行内容**:
1. **Phase 1: Exploration** - Explore agentでコードベースを理解
2. **Phase 2: Implementation** - Frontend/Backend/Database agentを起動して実装
3. **Phase 3: Testing** - テスト実行と検証
4. **Phase 4: Code Review** - フロントエンド変更のレビュー（該当する場合）

**使い方**:
```bash
# 例: add-rich-menu-preview の実装を開始
/implement-add-rich-menu-preview
```

**実行の流れ**:
```
┌─────────────────────────┐
│ Phase 1: Exploration    │
│ - Explore agent 起動    │
│ - 並列で複数領域を調査  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Phase 2: Implementation │
│ - Frontend agent        │
│ - Backend agent         │
│ - Database agent        │
│ ※並列実行可能なものは  │
│   1メッセージで起動     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Phase 3: Testing        │
│ - npm test              │
│ - npm run lint          │
│ - Type check            │
│ - OpenSpec要件検証      │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Phase 4: Code Review    │
│ - frontend-code-reviewer│
│ - 品質・A11y・Perf確認  │
└─────────────────────────┘
```

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

# ステップ2: 実装準備
/openspec:prepare add-rich-menu-preview
# → .claude/commands/implement-add-rich-menu-preview.md 生成
# → フロントエンド実装（コンポーネント追加）を検出
# → バックエンド実装（API追加）を検出
# → 並列実行可能なタスクを特定

# ステップ3: 実装実行
/implement-add-rich-menu-preview
# → Phase 1: Explore agents が src/components と src/app/api を調査
# → Phase 2: Frontend agent と Backend agent が並列実行
# → Phase 3: テストとリント実行
# → Phase 4: Frontend code review

# ステップ4: デプロイ後
/openspec:archive add-rich-menu-preview
```

### 例2: データベーススキーマの変更

```bash
# ステップ1: 提案
/openspec:proposal
# → change-id: add-message-scheduling を作成

# ステップ2: 実装準備
/openspec:prepare add-message-scheduling
# → Prismaスキーマ変更を検出
# → マイグレーション実行を含む

# ステップ3: 実装
/implement-add-message-scheduling
# → Database agent が schema.prisma を更新
# → マイグレーション作成: npx prisma migrate dev
# → Backend agent が scheduling ロジック実装
# → テスト実行

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

### Task agentが期待通りに動作しない

生成されたコマンドファイルを確認：
```bash
# コマンド内容を確認
cat .claude/commands/implement-<change-id>.md

# 必要に応じて手動編集
# - Agent の種類を変更
# - プロンプトを調整
# - 実行順序を変更
```

### 実装途中で中断したい

```bash
# TodoWriteで進捗を確認
# 完了したタスクを tasks.md に反映

# 後から再開する場合
/implement-<change-id>
# → 既に完了したタスクはスキップ可能
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
→ `/openspec:prepare` で専用コマンド生成

### 4. 並列実行の最大活用
生成されたコマンドは自動的に並列実行を最適化しますが、
必要に応じて手動調整も可能：

```markdown
# implement-<change-id>.md を編集
**Parallel Group 1: Frontend and Backend**
Launch these agents in parallel (single message, multiple Task calls):
- Task 1: Frontend implementation
- Task 2: Backend implementation
- Task 3: Database migration
```

### 5. 進捗を可視化
TodoWrite を活用して、実装の進捗を常に追跡：
- [ ] Phase 1: Exploration
- [ ] Phase 2: Implementation
- [ ] Phase 3: Testing
- [ ] Phase 4: Code Review

### 6. 段階的な検証
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
- `prepare`: 複雑な実装向け。専用コマンドを生成し、Task agentの並列実行を最適化
- `apply`: シンプルな実装向け。tasks.mdに従って順次実装

**Q: 生成されたコマンドは再利用できる？**

A: はい。`.claude/commands/implement-<change-id>.md` は保存されるので、何度でも実行可能です。実装途中で中断した場合も再実行できます。

**Q: 生成されたコマンドをカスタマイズできる？**

A: はい。`.claude/commands/implement-<change-id>.md` を直接編集してください。Agent の種類、プロンプト、実行順序など全て調整可能です。

**Q: 複数のchangeを同時に実装できる？**

A: それぞれのchangeに対して `prepare` を実行すれば、複数の `/implement-<change-id>` コマンドが作成されます。ただし、conflictに注意してください。

**Q: Task agentが失敗したらどうする？**

A:
1. エラーメッセージを確認
2. 生成されたコマンドのプロンプトを調整
3. 該当フェーズを再実行
4. 必要に応じて手動で修正

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
