# OpenSpec 実践例とTips

このドキュメントでは、OpenSpecコマンドの実践的な使用例とベストプラクティスを紹介します。

## 目次

1. [実践例](#実践例)
2. [Tips & Tricks](#tips--tricks)
3. [トラブルシューティング](#トラブルシューティング)

## 実践例

### 例1: リッチメニュープレビュー機能の追加

**シナリオ**: リッチメニューの編集画面にリアルタイムプレビュー機能を追加する

**実装スコープ**:
- フロントエンド: Reactコンポーネント追加
- バックエンド: プレビューAPI追加
- データベース: 変更なし

#### Step 1: 提案作成

```bash
/openspec:proposal
```

**作成されたファイル**:
```
openspec/changes/add-rich-menu-preview/
├── proposal.md
├── tasks.md
└── specs/
    └── rich-menu-editor/
        └── spec.md
```

**proposal.md の内容**:
```markdown
# Change: Add Rich Menu Preview Feature

## Why
リッチメニュー編集時に、ユーザーが変更内容を即座に確認できないため、
編集→保存→確認のサイクルが非効率になっている。

## What Changes
- リアルタイムプレビューコンポーネントの追加
- プレビュー用API endpoint の追加
- 編集画面UIの改善

## Impact
- Affected specs: rich-menu-editor
- Affected code:
  - src/components/rich-menu/
  - src/app/api/rich-menu/preview/
```

#### Step 2: 実装準備

```bash
/openspec:prepare add-rich-menu-preview
```

**出力**:
```
✅ 実装用コマンドを生成しました！

Change ID: add-rich-menu-preview
Command: /implement-add-rich-menu-preview
Location: .claude/commands/implement-add-rich-menu-preview.md

このコマンドは以下を実行します：
- Phase 1: フロントエンド構造の探索（Explore agent）
- Phase 2: プレビューコンポーネントの実装（frontend-refactoring-expert）
- Phase 2: プレビューAPI実装（general-purpose、並列実行）
- Phase 3: テストとリント実行
- Phase 4: フロントエンドコードレビュー
```

**生成されたコマンドの中身**:
```markdown
---
name: Implement: Add Rich Menu Preview Feature
description: Implementation for OpenSpec change 'add-rich-menu-preview'
category: Implementation
tags: [implementation, openspec, add-rich-menu-preview]
---

# OpenSpec Change Implementation: add-rich-menu-preview

## Change Overview
リッチメニュー編集画面にリアルタイムプレビュー機能を追加します。

## Implementation Strategy
- Frontend: RichMenuPreview コンポーネント作成
- Backend: /api/rich-menu/preview endpoint 追加
- 並列実行: Frontend と Backend は独立して実装可能

## Execution Steps

### Phase 1: Exploration
Launch Explore agent to understand current implementation:
- Task 1: Explore rich menu components (thoroughness: "medium")
  - Focus: src/components/rich-menu/
  - Report: 既存コンポーネント構造、状態管理方法
...
```

#### Step 3: 実装実行

```bash
/implement-add-rich-menu-preview
```

**実行ログ**:
```
Phase 1: Exploration
├─ ✅ Explore rich menu components完了
│  - 既存: RichMenuEditor, RichMenuCanvas
│  - State: Jotai atoms使用（richMenuAtom）
│  - Style: Tailwind CSS
│
Phase 2: Implementation (並列実行)
├─ ✅ Frontend implementation 完了
│  - Created: src/components/rich-menu/rich-menu-preview.tsx
│  - Updated: src/app/dashboard/rich-menu/edit/[id]/page.tsx
│  - Tests: rich-menu-preview.test.tsx
│
└─ ✅ Backend implementation 完了
   - Created: src/app/api/rich-menu/preview/route.ts
   - Tests: route.test.ts

Phase 3: Testing
├─ ✅ npm test - All tests passed
├─ ✅ npm run lint - No issues
└─ ✅ Type check - No errors

Phase 4: Code Review
└─ ✅ Frontend code review completed
   - Accessibility: ✅ ARIA labels added
   - Performance: ✅ useMemo for preview rendering
   - Security: ✅ Input sanitization implemented
```

#### Step 4: デプロイ & アーカイブ

```bash
# デプロイ後
/openspec:archive add-rich-menu-preview
```

**結果**:
```
✅ Change archived successfully!

Location: openspec/changes/archive/2025-11-12-add-rich-menu-preview/
Updated specs: openspec/specs/rich-menu-editor/spec.md
Validation: PASSED
```

---

### 例2: メッセージスケジュール機能の追加

**シナリオ**: メッセージを指定時刻に自動送信する機能を追加

**実装スコープ**:
- フロントエンド: スケジュール設定UI
- バックエンド: スケジュールAPI、ジョブ処理
- データベース: ScheduledMessage モデル追加

#### Step 1: 提案作成

```bash
/openspec:proposal
# change-id: add-message-scheduling
```

**作成されたファイル構成**:
```
openspec/changes/add-message-scheduling/
├── proposal.md
├── tasks.md
├── design.md  # 複雑な機能なのでdesign.mdを作成
└── specs/
    ├── message-management/
    │   └── spec.md
    └── job-processing/
        └── spec.md  # 新しいcapability
```

**design.md のポイント**:
```markdown
## Context
メッセージを将来の特定時刻に送信する機能が必要。

## Decisions
- ジョブ処理: Upstash QStash を使用（既存インフラ）
- タイムゾーン: ユーザーのローカルタイムゾーンで指定
- キャンセル機能: 送信前であればキャンセル可能

## Risks / Trade-offs
- QStash の制限: 最大スケジュール期間は1年
- タイムゾーン: サーバー側でUTCに変換して保存
```

#### Step 2: 実装準備

```bash
/openspec:prepare add-message-scheduling
```

**生成されるコマンドの特徴**:
- 3つのドメイン（Frontend/Backend/Database）を検出
- Database migration を最初に実行（依存関係）
- Frontend と Backend は並列実行可能

#### Step 3: 実装

```bash
/implement-add-message-scheduling
```

**実行順序**:
```
Phase 1: Exploration（並列）
├─ Frontend structure
├─ Backend APIs
└─ Database schema

Phase 2.1: Database Migration（順次 - 最初に実行）
└─ Prisma schema update → migrate dev

Phase 2.2: Implementation（並列 - DB完了後）
├─ Frontend: スケジュール設定UI
├─ Backend: Schedule API実装
└─ Backend: QStash ジョブハンドラー

Phase 3: Testing
└─ Integration tests for scheduled messages

Phase 4: Code Review
└─ Frontend review
```

---

### 例3: シンプルなバグ修正

**シナリオ**: ユーザー名の表示が切れる問題を修正

**実装スコープ**: CSS調整のみ

#### 直接実装（/openspec:apply を使用）

```bash
# Step 1: 提案
/openspec:proposal
# change-id: fix-username-truncation

# Step 2: シンプルなので apply で直接実装
/openspec:apply

# Step 3: アーカイブ
/openspec:archive fix-username-truncation
```

**いつ `/openspec:apply` を使うべきか**:
- 単一ファイルの変更
- CSS/スタイリングの修正
- 簡単なバグフィックス
- ドキュメントのみの更新

**いつ `/openspec:prepare` を使うべきか**:
- 複数ファイル・ドメインにまたがる変更
- 新機能追加
- データベーススキーマ変更
- 複雑なリファクタリング

---

## Tips & Tricks

### 1. 並列実行の最大活用

**自動検出される並列実行可能なタスク**:
- フロントエンドとバックエンドの独立実装
- 複数のAPIエンドポイント追加
- 複数の独立したコンポーネント作成

**手動調整が必要な場合**:
生成されたコマンドを編集：
```markdown
**Parallel Group 1: Multiple Components**
Launch these agents in parallel:
- Task 1: UserProfile component
- Task 2: UserSettings component
- Task 3: UserAvatar component
```

### 2. Agent選択の最適化

| タスク | 推奨Agent | 理由 |
|--------|-----------|------|
| React/Next.js実装 | frontend-refactoring-expert | React特化、最適化済み |
| UIコンポーネントレビュー | frontend-code-reviewer | A11y、パフォーマンスチェック |
| API実装 | general-purpose | 柔軟な実装対応 |
| Prisma schema変更 | general-purpose | DB操作、migration実行 |
| コードベース探索 | Explore (medium) | 効率的な構造理解 |

### 3. 段階的な検証

**各Phaseで検証**:
```bash
# Phase 2完了後
npm test        # 実装したテストを実行
npm run lint    # コード品質確認

# Phase 3完了後
npm run build   # ビルド確認（本番前）
```

### 4. Change IDの命名戦略

**Good**:
- `add-message-scheduling` - 明確で具体的
- `update-auth-flow` - 何を更新するか明確
- `refactor-api-client` - リファクタリング対象が明確

**Bad**:
- `fix-bug` - 何のバグか不明
- `update` - 何を更新するか不明
- `new-feature` - どの機能か不明

### 5. 実装中断時の再開方法

```bash
# TodoWrite で進捗を確認
# 完了したタスクを tasks.md に手動で記録

# 同じコマンドで再開
/implement-<change-id>
# 完了済みのタスクはスキップ可能と指示
```

### 6. 生成されたコマンドのカスタマイズ

**よくあるカスタマイズ**:

**1. Agentの変更**:
```markdown
# 変更前
Subagent type: general-purpose

# 変更後（より特化したagentを使用）
Subagent type: frontend-refactoring-expert
```

**2. 並列実行グループの調整**:
```markdown
# より多くのタスクを並列化
**Parallel Group 1: All Independent Tasks**
- Task 1: Frontend
- Task 2: Backend
- Task 3: Tests
- Task 4: Documentation
```

**3. プロンプトの詳細化**:
```markdown
# より具体的な指示を追加
Your goal:
1. Create component in src/components/
2. Follow existing Button component patterns
3. Use className prop for styling
4. Add proper TypeScript types
5. Include JSDoc comments
```

### 7. 複数Changeの並行開発

```bash
# Change 1の準備
/openspec:prepare add-feature-a

# Change 2の準備
/openspec:prepare add-feature-b

# 独立して実装可能
/implement-add-feature-a
/implement-add-feature-b
```

**注意**: Spec conflictに注意
```bash
# 両方のchangeが同じspecを変更していないか確認
openspec show add-feature-a --json | grep "specs"
openspec show add-feature-b --json | grep "specs"
```

### 8. エラーからの回復

**Task agentが失敗した場合**:

1. **エラーの確認**:
```
Agent報告: "Type error in src/components/foo.tsx"
```

2. **手動修正**:
```bash
# エラーを手動で修正
# 例: 型定義を追加
```

3. **該当Phaseを再実行**:
```bash
# 生成されたコマンドで該当部分を再実行
/implement-<change-id>
# Phase 2から再開することを指示
```

### 9. カスタムAgentの追加

プロジェクト固有のAgentが必要な場合:

```markdown
# implement-<change-id>.md に追加
Task: Custom Domain Logic
```
Subagent type: general-purpose
Prompt:
You are implementing custom business logic for our LINE messaging platform.

Project-specific context:
- Use src/lib/line/ for LINE API interactions
- Follow error handling patterns in src/lib/errors.ts
- Update corresponding Jotai atoms in src/state/

[具体的な実装タスク]
```

### 10. 進捗の可視化

**TodoWrite を最大活用**:
```markdown
- [ ] Phase 1: Exploration
  - [ ] Frontend structure explored
  - [ ] Backend APIs reviewed
- [ ] Phase 2: Implementation
  - [ ] Database migration created
  - [ ] Frontend components implemented
  - [ ] Backend APIs implemented
- [ ] Phase 3: Testing
  - [ ] Unit tests passing
  - [ ] Integration tests passing
- [ ] Phase 4: Review
  - [ ] Code review completed
```

---

## トラブルシューティング

### 問題1: `/openspec:prepare` が Change を見つけられない

**症状**:
```
Error: Change 'add-feature-xyz' not found
```

**解決方法**:
```bash
# 1. 利用可能なchangeを確認
openspec list

# 2. 正しいchange-idを確認
ls -la openspec/changes/

# 3. 正しいIDで再実行
/openspec:prepare <correct-change-id>
```

### 問題2: 生成されたコマンドが見つからない

**症状**:
```
/implement-add-feature-xyz command not found
```

**解決方法**:
```bash
# 1. コマンドファイルが生成されているか確認
ls -la .claude/commands/implement-*.md

# 2. 生成されていない場合、prepare を再実行
/openspec:prepare add-feature-xyz

# 3. Claude Codeを再起動（コマンドキャッシュ更新）
```

### 問題3: Task agentが期待と異なる実装をする

**症状**:
Agent が仕様と異なるコードを実装した

**解決方法**:

**方法1: プロンプトを調整して再実行**
```markdown
# .claude/commands/implement-<change-id>.md を編集

# 変更前
Prompt:
Create a new component...

# 変更後（より詳細に）
Prompt:
Create a new component following these exact specifications:
- File: src/components/features/component-name.tsx
- Props: { userId: string, onUpdate: (data) => void }
- Use existing fetchUser utility from src/lib/api/users.ts
- Follow Button component patterns for styling
```

**方法2: 手動で修正**
```bash
# 1. Agentの出力を確認
# 2. 必要な部分を手動修正
# 3. tasks.mdを更新
```

### 問題4: 並列実行が機能しない

**症状**:
Task agents が順次実行されている

**原因**:
生成されたコマンドが並列実行を指示していない可能性

**解決方法**:
```markdown
# implement-<change-id>.md を編集

# 明示的に並列実行を指示
**IMPORTANT**: Launch these agents in parallel using a single message with multiple Task tool calls.

Do NOT execute them sequentially. Create one message with 3 Task tool calls.
```

### 問題5: Validation エラー

**症状**:
```
openspec validate <change-id> --strict
Error: Requirement must have at least one scenario
```

**解決方法**:
```markdown
# specs/capability/spec.md を確認・修正

# ❌ 間違い
### Requirement: User Authentication

# ✅ 正しい
### Requirement: User Authentication

#### Scenario: Successful login
- **WHEN** user provides valid credentials
- **THEN** JWT token is returned
```

### 問題6: デプロイ後の仕様同期

**症状**:
Archive後、specsが更新されていない

**解決方法**:
```bash
# 1. Archiveコマンドが --skip-specs を使っていないか確認
# 2. 手動でspecsを更新
openspec archive <change-id> --yes

# 3. Validation確認
openspec validate --strict

# 4. 必要に応じて手動で specs を編集
```

### 問題7: 複数のChangeが競合

**症状**:
2つのchangeが同じspecを変更している

**解決方法**:
```bash
# 1. 競合を確認
openspec show change-1 --json | jq '.deltas[].capability'
openspec show change-2 --json | jq '.deltas[].capability'

# 2. 調整方法を選択:
# Option A: 1つのChangeにマージ
# Option B: 順次実装（依存関係を明示）
# Option C: Specを分割（異なるcapabilityに）
```

### 問題8: テストが失敗する

**症状**:
Phase 3 でテストが失敗

**デバッグ手順**:
```bash
# 1. 詳細なエラー確認
npm test -- --verbose

# 2. 特定のテストファイルを実行
npm test -- path/to/test-file.test.tsx

# 3. 実装を確認
# 4. テストまたは実装を修正
# 5. 再実行
npm test
```

### 問題9: 生成されたコマンドが長すぎる

**症状**:
implement-<change-id>.md が非常に長く、読みづらい

**最適化方法**:
```markdown
# プロンプトを簡潔に
# 変更前（冗長）
Prompt:
You need to create a component. The component should...
[100行以上のプロンプト]

# 変更後（簡潔）
Prompt:
Create UserProfile component following project patterns.

Reference:
- Existing: src/components/user/user-card.tsx
- Specs: openspec/changes/<id>/specs/user-profile/spec.md
- Tasks: Items 3.1-3.5 in tasks.md
```

### 問題10: メモリ/パフォーマンス問題

**症状**:
多数のAgentを並列起動してリソース不足

**解決方法**:
```markdown
# グループを小さく分割
# 変更前（6つ並列）
**Parallel Group 1:**
- Task 1-6

# 変更後（2グループに分割）
**Parallel Group 1:**
- Task 1-3

**Parallel Group 2: (Run after Group 1)**
- Task 4-6
```

---

## まとめ

### ベストプラクティスチェックリスト

実装前:
- [ ] `openspec list` で既存のchangeを確認
- [ ] `openspec list --specs` で既存の仕様を確認
- [ ] Change IDは明確で一意
- [ ] Proposal は簡潔で理解しやすい

実装中:
- [ ] `/openspec:prepare` で専用コマンドを生成（複雑な実装の場合）
- [ ] 生成されたコマンドを確認・必要に応じて調整
- [ ] TodoWriteで進捗を追跡
- [ ] 各フェーズでテスト・検証

実装後:
- [ ] 全てのテストが通過
- [ ] Lintエラーなし
- [ ] tasks.mdの全項目が完了
- [ ] デプロイ確認
- [ ] `/openspec:archive` で仕様を更新

### 参考リンク

- [OpenSpec AGENTS.md](../openspec/AGENTS.md)
- [OpenSpec Implementation Workflow](./openspec-implementation-workflow.md)
- [Slash Commands README](../.claude/commands/openspec/README.md)
- [Project CLAUDE.md](../CLAUDE.md)
