---
name: OpenSpec: Prepare
description: Analyze OpenSpec change and generate implementation slash command with agent orchestration.
category: OpenSpec
tags: [openspec, prepare, codegen]
---
<!-- OPENSPEC:START -->
**Purpose**
このコマンドは指定されたOpenSpec changeを分析し、その実装に特化したカスタムスラッシュコマンドを自動生成します。

**Usage**
```
/openspec:prepare <change-id>
```

**実行内容**
1. OpenSpec changeの内容を完全に分析
2. 実装に必要なTask agentの種類と呼び出し順序を決定
3. `.claude/commands/implement-<change-id>.md` を生成
4. 生成されたコマンドで `/implement-<change-id>` が使用可能になる

**Steps**

1. **Change IDの取得と検証**
   - コマンド引数から change-id を取得
   - `openspec list` で存在確認
   - 存在しない場合はエラーメッセージを表示して終了

2. **Change内容の完全読み込み**
   以下のファイルを全て読み込んで分析：
   - `openspec/changes/<change-id>/proposal.md` - 変更の目的と概要
   - `openspec/changes/<change-id>/design.md` - 技術的決定（存在する場合）
   - `openspec/changes/<change-id>/tasks.md` - 実装タスクリスト
   - `openspec/changes/<change-id>/specs/**/spec.md` - 全ての仕様デルタ

3. **実装スコープの分析**
   各タスクを分析して以下を判定：

   **フロントエンド実装が必要か？**
   - React/Next.jsコンポーネント作成・修正
   - UIの追加・変更
   - Jotai state管理の変更
   - → 必要なら `frontend-refactoring-expert` と `frontend-code-reviewer` を使用

   **バックエンド実装が必要か？**
   - API route の作成・修正 (src/app/api/)
   - サービスロジックの追加 (src/lib/)
   - 認証・認可の変更
   - → 必要なら `general-purpose` agent を使用

   **データベース変更が必要か？**
   - Prismaスキーマの修正
   - マイグレーション作成
   - シードデータ更新
   - → 必要なら `general-purpose` agent を使用

   **テスト実装が必要か？**
   - 単体テスト作成
   - 統合テスト作成
   - E2Eテスト作成
   - → 必要なら `general-purpose` agent を使用

4. **依存関係と並列実行の判定**
   - どのタスクが独立して実行可能か特定
   - 依存関係があるタスクの順序を決定
   - 並列実行可能なタスクグループを作成

5. **実装用スラッシュコマンドの生成**

   以下のテンプレートを使用して `.claude/commands/implement-<change-id>.md` を作成：

```markdown
---
name: Implement: <Change Title>
description: Implementation for OpenSpec change '<change-id>'
category: Implementation
tags: [implementation, openspec, <change-id>]
---

# OpenSpec Change Implementation: <change-id>

## Change Overview
<proposal.mdの内容を要約>

## Implementation Strategy
<分析した実装スコープと戦略>

## Execution Steps

### Phase 1: Exploration
<コードベースの理解が必要な場合>
Launch Explore agents in parallel to understand current implementation:
- Task 1: Explore <domain 1> (thoroughness: "medium")
  - Focus: <具体的な探索ポイント>
  - Report: <必要な情報>
- Task 2: Explore <domain 2> (thoroughness: "medium")
  - Focus: <具体的な探索ポイント>
  - Report: <必要な情報>

### Phase 2: Implementation
<実装フェーズ - 並列実行可能なものは並列で>

**Parallel Group 1: <グループ名>**
Launch these agents in parallel (single message, multiple Task calls):

Task 1: <Frontend/Backend/Database> Implementation
```
Subagent type: <agent-type>
Prompt:
You are implementing <specific component> for OpenSpec change '<change-id>'.

Context:
- Change ID: <change-id>
- Proposal: <key points>
- Requirements:
<spec.mdから関連要件を抽出>

Implementation tasks:
<tasks.mdから該当タスクを抽出>

Technical constraints:
<design.mdから関連する技術的決定>

Your goal:
1. <具体的な実装ステップ1>
2. <具体的な実装ステップ2>
3. <具体的な実装ステップ3>

Code patterns to follow:
- <プロジェクトの規約>
- <既存パターン>

Return:
- Summary of implementation
- Files created/modified
- Any blockers or issues
- Next steps if any
```

Task 2: <次のタスク>
<同様の形式で記述>

**Sequential Step: <ステップ名>**
<前のステップが完了してから実行する必要があるタスク>

### Phase 3: Testing and Validation
Task: Run tests and validation
```
Subagent type: general-purpose
Prompt:
Run all tests and validations for the implemented changes:

1. Run unit tests: `npm test`
2. Run linter: `npm run lint`
3. Run type check: `npx tsc --noEmit`
4. Review test coverage
5. Validate against OpenSpec requirements:
<要件リストを列挙>

Report any failures and suggest fixes.
```

### Phase 4: Code Review (Frontend changes only)
<フロントエンド実装がある場合>
Task: Frontend code review
```
Subagent type: frontend-code-reviewer
Prompt:
Review all frontend changes made for OpenSpec change '<change-id>':

Files to review:
<変更されたファイルリスト>

Review for:
- Code quality and best practices
- Accessibility compliance
- Performance optimizations
- Security considerations
- Semantic HTML usage

Report findings and suggest improvements.
```

## Progress Tracking

Use TodoWrite to track:
- [ ] Phase 1: Exploration complete
- [ ] Phase 2: Implementation complete
  - [ ] <サブタスク1>
  - [ ] <サブタスク2>
- [ ] Phase 3: Tests passing
- [ ] Phase 4: Code review complete (if applicable)
- [ ] All tasks in openspec/changes/<change-id>/tasks.md marked complete

## Final Checklist

After all phases complete:
1. Update `openspec/changes/<change-id>/tasks.md` with all checkmarks
2. Run `openspec validate <change-id> --strict`
3. Confirm all spec requirements are satisfied
4. Prepare summary of changes for user

## Reference
- Change location: `openspec/changes/<change-id>/`
- Proposal: `openspec/changes/<change-id>/proposal.md`
- Tasks: `openspec/changes/<change-id>/tasks.md`
- Design: `openspec/changes/<change-id>/design.md` <if exists>
- Specs: `openspec/changes/<change-id>/specs/`
```

6. **生成完了の報告**
   ユーザーに以下を報告：
   ```
   ✅ 実装用コマンドを生成しました！

   Change ID: <change-id>
   Command: /implement-<change-id>
   Location: .claude/commands/implement-<change-id>.md

   実装を開始するには以下を実行してください：
   /implement-<change-id>

   このコマンドは以下を実行します：
   - <実行内容のサマリー>
   ```

**実装詳細**

生成するコマンドの構造：
- 全ての Task agent 呼び出しは具体的なプロンプトを含める
- プロンプトには change-id、要件、制約を明示
- 並列実行すべきタスクは明示的にグループ化
- 各フェーズの完了条件を明確にする
- 進捗追跡用の TodoWrite の使用を指示

Agent 選択ルール：
- フロントエンド（React/Next.js）: `frontend-refactoring-expert` + `frontend-code-reviewer`
- バックエンド（API/サービス）: `general-purpose`
- データベース（Prisma）: `general-purpose`
- テスト実装: `general-purpose`
- コードベース探索: `Explore` (thoroughness: "medium")

並列実行の指示方法：
```markdown
Launch these agents in parallel using a single message with multiple Task tool calls:
- Task 1: [description]
- Task 2: [description]
- Task 3: [description]
```

**エラーハンドリング**

- Change IDが見つからない場合: エラーメッセージを表示
- 必要なファイルが存在しない場合: 警告して続行
- タスクが空の場合: 最小限の実装コマンドを生成

**注意事項**

- 生成されるコマンドは OpenSpec の変更内容に完全に特化したものになる
- 各 Task agent への指示は具体的で実行可能な形にする
- プロジェクトの規約（AGENTS.md、CLAUDE.md）を考慮する
- 実装の際は常に最小限の変更を優先する
<!-- OPENSPEC:END -->
