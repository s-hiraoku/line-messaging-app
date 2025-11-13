---
name: OpenSpec: Prepare
description: Analyze OpenSpec change and generate implementation slash command with agent orchestration.
category: OpenSpec
tags: [openspec, prepare, codegen]
---
<!-- OPENSPEC:START -->
**Purpose**
このコマンドは指定されたOpenSpec changeを分析し、以下を自動生成します：
1. **専用サブエージェントコマンド**: 実装領域ごとに特化したカスタムエージェント
2. **メイン実装コマンド**: サブエージェントをオーケストレーションするコマンド

**生成されるコマンド構造**
```
/openspec:prepare add-rich-menu-preview
  ↓ 生成
.claude/commands/
  ├── implement-add-rich-menu-preview.md           # メインオーケストレーター
  ├── implement-add-rich-menu-preview-frontend.md  # フロントエンド専用agent
  ├── implement-add-rich-menu-preview-api.md       # API専用agent
  └── implement-add-rich-menu-preview-database.md  # データベース専用agent
```

**Usage**
```bash
/openspec:prepare <change-id>
```

**実行内容**
1. OpenSpec changeの内容を完全に分析
2. 必要な実装領域を特定（frontend, backend, database, MCP integrationなど）
3. 各領域に特化したサブエージェントコマンドを生成
4. サブエージェントを統合するメインコマンドを生成

---

## Steps

### 1. Change IDの取得と検証
- コマンド引数から change-id を取得
- `openspec list` で存在確認
- 存在しない場合はエラーメッセージを表示して終了

### 2. Change内容の完全読み込み
以下のファイルを全て読み込んで分析：
- `openspec/changes/<change-id>/proposal.md` - 変更の目的と概要
- `openspec/changes/<change-id>/design.md` - 技術的決定（存在する場合）
- `openspec/changes/<change-id>/tasks.md` - 実装タスクリスト
- `openspec/changes/<change-id>/specs/**/spec.md` - 全ての仕様デルタ

### 3. 実装スコープの分析

OpenSpec changeから以下を抽出：

#### 3.1 必要な実装領域の特定
各領域について、実装が必要かどうかを判定：

**フロントエンド実装**
- React/Next.jsコンポーネント作成・修正
- UIの追加・変更
- Jotai state管理の変更
- Tailwind CSSスタイリング
- → 必要なら `implement-<change-id>-frontend.md` を生成

**バックエンドAPI実装**
- API route の作成・修正 (src/app/api/)
- サービスロジックの追加 (src/lib/)
- 認証・認可の変更
- → 必要なら `implement-<change-id>-api.md` を生成

**データベース実装**
- Prismaスキーマの修正
- マイグレーション作成
- シードデータ更新
- → 必要なら `implement-<change-id>-database.md` を生成

**MCP統合**
- 既存MCPサーバーの活用（Figma, Playwright, DeepWikiなど）
- 新規MCP連携の必要性
- → 必要なら `implement-<change-id>-mcp.md` を生成

**テスト実装**
- 単体テスト作成
- 統合テスト作成
- E2Eテスト作成
- → 必要なら `implement-<change-id>-test.md` を生成

#### 3.2 依存関係の判定
- どのサブエージェントが独立して実行可能か
- 依存関係があるサブエージェントの順序
- 並列実行可能なサブエージェントグループ

#### 3.3 必要なツール・MCPの特定
- ファイル操作（Read, Write, Edit）
- コマンド実行（Bash）
- MCP統合（Figma, Playwright, WebFetchなど）
- その他の specialized tools

### 4. サブエージェントコマンドの生成

特定された各領域について、専用のサブエージェントコマンドを生成：

#### 4.1 フロントエンドエージェント（必要な場合）

**ファイル**: `.claude/commands/implement-<change-id>-frontend.md`

```markdown
---
name: <Change Title>: Frontend Agent
description: Frontend implementation agent for OpenSpec change '<change-id>'
category: Implementation
tags: [implementation, frontend, <change-id>]
---

# Frontend Implementation Agent: <change-id>

## Your Role
You are a specialized frontend implementation agent for OpenSpec change '<change-id>'.
You focus exclusively on React/Next.js components, UI, state management, and styling.

## Change Context

**Proposal Summary**:
<proposal.mdから関連部分を要約>

**Frontend Requirements**:
<spec deltasからフロントエンド関連の要件を抽出>
- Requirement ID: <要件の詳細>
- Requirement ID: <要件の詳細>

**Design Decisions**:
<design.mdからフロントエンド関連の技術的決定>

**Tasks**:
<tasks.mdからフロントエンド関連タスクを抽出>
- [ ] <タスク1>
- [ ] <タスク2>

## Implementation Guidelines

### Components to Create/Modify
<具体的なコンポーネントリスト>
- src/components/<path>/<ComponentName>.tsx
- src/app/<path>/page.tsx

### State Management
<Jotai atoms の追加・修正>
- src/state/<domain>/<atom-name>.ts

### Styling
- Use Tailwind CSS classes
- Follow existing component patterns
- Ensure responsive design
- Consider accessibility (ARIA labels, semantic HTML)

### Testing
- Write unit tests in <ComponentName>.test.tsx
- Use @testing-library/react
- Test user interactions and edge cases

## Tools Available
- **Read**: Read existing files to understand patterns
- **Write**: Create new component files
- **Edit**: Modify existing files
- **Bash**: Run tests (`npm test`), type check (`npx tsc`)
- **Glob/Grep**: Search for existing patterns

## Project Conventions
Follow conventions from:
- CLAUDE.md: 2-space indent, TypeScript strict mode, kebab-case filenames
- Existing component patterns in src/components/
- Jotai state management patterns in src/state/

## Execution Steps

1. **Explore Existing Code**
   - Read similar components for patterns
   - Understand current state management structure
   - Review existing API integration patterns

2. **Implement Components**
   - Create new components following existing patterns
   - Use TypeScript with proper typing
   - Apply Tailwind CSS for styling
   - Ensure semantic HTML and accessibility

3. **State Management**
   - Create/update Jotai atoms
   - Implement state logic
   - Connect components to state

4. **Testing**
   - Write unit tests for components
   - Test user interactions
   - Verify edge cases

5. **Validation**
   - Run type check: `npx tsc --noEmit`
   - Run tests: `npm test`
   - Run linter: `npm run lint`

## Success Criteria
- [ ] All frontend requirements from spec deltas are satisfied
- [ ] Components follow project conventions
- [ ] TypeScript has no errors
- [ ] Unit tests pass
- [ ] Code is accessible and responsive

## Return Format
When complete, provide:
1. **Summary**: Brief description of what was implemented
2. **Files**: List of created/modified files
3. **Tests**: Test results and coverage
4. **Issues**: Any blockers or issues encountered
5. **Next Steps**: Suggestions for integration or follow-up work
```

#### 4.2 APIエージェント（必要な場合）

**ファイル**: `.claude/commands/implement-<change-id>-api.md`

```markdown
---
name: <Change Title>: API Agent
description: Backend API implementation agent for OpenSpec change '<change-id>'
category: Implementation
tags: [implementation, backend, api, <change-id>]
---

# API Implementation Agent: <change-id>

## Your Role
You are a specialized backend API implementation agent for OpenSpec change '<change-id>'.
You focus exclusively on API routes, business logic, and service layer implementation.

## Change Context

**Proposal Summary**:
<proposal.mdから関連部分を要約>

**API Requirements**:
<spec deltasからAPI関連の要件を抽出>
- Endpoint: <method> <path>
  - Input: <request schema>
  - Output: <response schema>
  - Validation: <rules>

**Design Decisions**:
<design.mdからAPI関連の技術的決定>

**Tasks**:
<tasks.mdからAPI関連タスクを抽出>
- [ ] <タスク1>
- [ ] <タスク2>

## Implementation Guidelines

### API Routes to Create/Modify
<具体的なAPIルートリスト>
- src/app/api/<path>/route.ts

### Service Layer
<ビジネスロジックの配置>
- src/lib/<domain>/<service-name>.ts

### Authentication & Authorization
<認証・認可の要件>
- Required: <認証方式>
- Permissions: <権限チェック>

### Error Handling
- Use appropriate HTTP status codes
- Return consistent error format
- Log errors appropriately

### Testing
- Write integration tests
- Test error cases
- Verify authentication/authorization

## Tools Available
- **Read**: Read existing API routes and services
- **Write**: Create new files
- **Edit**: Modify existing files
- **Bash**: Run tests, database migrations
- **Glob/Grep**: Search for patterns

## Project Conventions
Follow conventions from:
- CLAUDE.md: RESTful API design principles
- Existing API route patterns in src/app/api/
- Service layer patterns in src/lib/
- Error handling patterns

## Execution Steps

1. **Explore Existing Code**
   - Read similar API routes for patterns
   - Understand service layer structure
   - Review authentication middleware

2. **Implement API Routes**
   - Create route handlers (GET, POST, PUT, DELETE)
   - Implement request validation
   - Add authentication checks
   - Implement business logic

3. **Service Layer**
   - Create service functions
   - Implement business logic
   - Handle database operations
   - Add error handling

4. **Testing**
   - Write integration tests
   - Test happy paths and error cases
   - Verify authentication/authorization

5. **Validation**
   - Run tests: `npm test`
   - Run linter: `npm run lint`
   - Test API endpoints manually if needed

## Success Criteria
- [ ] All API requirements from spec deltas are satisfied
- [ ] API routes follow RESTful principles
- [ ] Authentication/authorization implemented correctly
- [ ] Error handling is consistent
- [ ] Integration tests pass

## Return Format
When complete, provide:
1. **Summary**: Brief description of implemented API endpoints
2. **Files**: List of created/modified files
3. **API Documentation**: Request/response examples
4. **Tests**: Test results
5. **Issues**: Any blockers or issues encountered
```

#### 4.3 データベースエージェント（必要な場合）

**ファイル**: `.claude/commands/implement-<change-id>-database.md`

```markdown
---
name: <Change Title>: Database Agent
description: Database implementation agent for OpenSpec change '<change-id>'
category: Implementation
tags: [implementation, database, prisma, <change-id>]
---

# Database Implementation Agent: <change-id>

## Your Role
You are a specialized database implementation agent for OpenSpec change '<change-id>'.
You focus exclusively on Prisma schema changes, migrations, and data seeding.

## Change Context

**Proposal Summary**:
<proposal.mdから関連部分を要約>

**Database Requirements**:
<spec deltasからデータベース関連の要件を抽出>
- New models: <モデル名とフィールド>
- Modified models: <変更内容>
- Relationships: <リレーションシップ>
- Indexes: <必要なインデックス>

**Design Decisions**:
<design.mdからデータベース関連の技術的決定>

**Tasks**:
<tasks.mdからデータベース関連タスクを抽出>
- [ ] <タスク1>
- [ ] <タスク2>

## Implementation Guidelines

### Schema Changes
<Prismaスキーマの変更内容>
- Models to add/modify in prisma/schema.prisma
- Fields and types
- Relations
- Indexes and constraints

### Migration Strategy
- Migration name: <change-id>
- Backwards compatibility considerations
- Data migration needs (if any)

### Seed Data
<シードデータの追加・更新>
- Update prisma/seed.ts if needed
- Test data for development

## Tools Available
- **Read**: Read current schema
- **Edit**: Modify schema.prisma
- **Bash**: Run Prisma commands
  - `npx prisma migrate dev --name <change-id>`
  - `npx prisma generate`
  - `npx prisma db seed`

## Project Conventions
Follow conventions from:
- CLAUDE.md: Database design best practices
- Existing schema patterns in prisma/schema.prisma
- Naming conventions (camelCase for fields, PascalCase for models)

## Execution Steps

1. **Explore Current Schema**
   - Read prisma/schema.prisma
   - Understand existing models and relations
   - Identify impact of changes

2. **Update Schema**
   - Add/modify models
   - Define fields with appropriate types
   - Set up relations
   - Add indexes for performance

3. **Create Migration**
   - Run: `npx prisma migrate dev --name <change-id>`
   - Review generated SQL
   - Test migration on development database

4. **Update Seed Script**
   - Modify prisma/seed.ts if needed
   - Add test data for new models
   - Run: `npx prisma db seed`

5. **Generate Client**
   - Run: `npx prisma generate`
   - Verify TypeScript types are updated

6. **Validation**
   - Test migration rollback (if possible)
   - Verify data integrity
   - Check performance of new indexes

## Success Criteria
- [ ] All database requirements from spec deltas are satisfied
- [ ] Schema follows project conventions
- [ ] Migration runs successfully
- [ ] Prisma client types are generated
- [ ] Seed script updated (if needed)

## Return Format
When complete, provide:
1. **Summary**: Brief description of schema changes
2. **Migration**: Migration name and status
3. **Models**: List of added/modified models
4. **Issues**: Any blockers or issues encountered
5. **Next Steps**: Notes for API/service integration
```

#### 4.4 MCP統合エージェント（必要な場合）

**ファイル**: `.claude/commands/implement-<change-id>-mcp.md`

```markdown
---
name: <Change Title>: MCP Integration Agent
description: MCP integration agent for OpenSpec change '<change-id>'
category: Implementation
tags: [implementation, mcp, integration, <change-id>]
---

# MCP Integration Agent: <change-id>

## Your Role
You are a specialized MCP integration agent for OpenSpec change '<change-id>'.
You focus on integrating with MCP servers (Figma, Playwright, DeepWiki, etc.).

## Change Context

**Proposal Summary**:
<proposal.mdから関連部分を要約>

**MCP Integration Requirements**:
<spec deltasからMCP関連の要件を抽出>
- MCP Server: <サーバー名>
- Tools needed: <MCPツール名>
- Integration points: <どこでMCPを使うか>

**Design Decisions**:
<design.mdからMCP関連の技術的決定>

## Available MCP Servers

**Figma Dev Mode** (`mcp__figma-dev-mode-mcp-server__*`)
- get_design_context: Get UI code from Figma
- get_screenshot: Capture Figma designs
- get_variable_defs: Get design variables

**Playwright** (`mcp__playwright__*`)
- browser_navigate: Navigate to URLs
- browser_snapshot: Capture page accessibility tree
- browser_click: Interact with elements
- browser_take_screenshot: Take screenshots

**DeepWiki** (`mcp__deepwiki__*`)
- read_wiki_contents: View repository documentation
- ask_question: Ask questions about repositories

## Implementation Guidelines

### Integration Points
<MCPをどこで使うか>
- Component: <コンポーネント名>
- API Route: <ルート名>
- Service: <サービス名>

### MCP Tool Usage
<具体的なMCPツールの使い方>
1. Tool: <ツール名>
   - Purpose: <目的>
   - Parameters: <パラメータ>
   - Expected output: <期待される出力>

## Tools Available
- **MCP Tools**: <必要なMCPツール>
- **Read/Write/Edit**: File operations
- **Bash**: Run tests and commands

## Execution Steps

1. **Understand Integration Needs**
   - Identify where MCP tools are needed
   - Understand data flow
   - Plan error handling

2. **Implement Integration**
   - Add MCP tool calls at appropriate points
   - Handle MCP responses
   - Implement error handling
   - Add retry logic if needed

3. **Testing**
   - Test MCP integration
   - Verify error handling
   - Test edge cases (MCP unavailable, etc.)

4. **Documentation**
   - Document MCP usage
   - Add code comments
   - Update README if needed

## Success Criteria
- [ ] MCP integration works correctly
- [ ] Error handling is robust
- [ ] Integration is well-documented
- [ ] Tests pass

## Return Format
When complete, provide:
1. **Summary**: Brief description of MCP integration
2. **MCP Tools Used**: List of MCP tools and their purpose
3. **Files**: List of created/modified files
4. **Testing**: Test results
5. **Issues**: Any blockers or issues encountered
```

#### 4.5 テストエージェント（必要な場合）

**ファイル**: `.claude/commands/implement-<change-id>-test.md`

```markdown
---
name: <Change Title>: Test Agent
description: Testing agent for OpenSpec change '<change-id>'
category: Implementation
tags: [implementation, testing, <change-id>]
---

# Test Implementation Agent: <change-id>

## Your Role
You are a specialized testing agent for OpenSpec change '<change-id>'.
You focus on writing comprehensive tests for the implemented features.

## Change Context

**Proposal Summary**:
<proposal.mdから関連部分を要約>

**Testing Requirements**:
<spec deltasからテスト関連の要件を抽出>
- Unit tests needed: <リスト>
- Integration tests needed: <リスト>
- Test scenarios: <シナリオ>

## Testing Strategy

### Unit Tests
<ユニットテストの対象>
- Components: <コンポーネントリスト>
- Services: <サービスリスト>
- Utilities: <ユーティリティリスト>

### Integration Tests
<統合テストの対象>
- API endpoints: <エンドポイントリスト>
- Database operations: <操作リスト>

### Test Scenarios
<具体的なテストシナリオ>
1. Happy path: <説明>
2. Error cases: <説明>
3. Edge cases: <説明>

## Tools Available
- **Vitest**: Test framework
- **@testing-library/react**: Component testing
- **Bash**: Run tests (`npm test`)

## Execution Steps

1. **Analyze Implementation**
   - Read implemented code
   - Identify test requirements
   - Plan test structure

2. **Write Unit Tests**
   - Test components with Testing Library
   - Test service functions
   - Test utilities
   - Cover edge cases

3. **Write Integration Tests**
   - Test API endpoints
   - Test database operations
   - Test full workflows

4. **Run Tests**
   - Run: `npm test`
   - Check coverage
   - Fix failing tests

5. **Validation**
   - All tests pass
   - Coverage meets requirements
   - Tests are maintainable

## Success Criteria
- [ ] All components have unit tests
- [ ] All API endpoints have integration tests
- [ ] Test coverage is adequate
- [ ] All tests pass
- [ ] Tests follow project conventions

## Return Format
When complete, provide:
1. **Summary**: Brief description of tests written
2. **Test Files**: List of created test files
3. **Coverage**: Test coverage report
4. **Issues**: Any blockers or issues encountered
```

### 5. メイン実装コマンドの生成

全てのサブエージェントを統合するメインコマンドを生成：

**ファイル**: `.claude/commands/implement-<change-id>.md`

```markdown
---
name: Implement: <Change Title>
description: Main orchestrator for implementing OpenSpec change '<change-id>'
category: Implementation
tags: [implementation, openspec, orchestrator, <change-id>]
---

# OpenSpec Change Implementation: <change-id>

## Change Overview
<proposal.mdの内容を要約>

## Implementation Strategy
This command orchestrates specialized sub-agents to implement the change systematically.

**Generated Sub-Agents**:
<生成されたサブエージェントのリスト>
- `/implement-<change-id>-frontend` - Frontend implementation
- `/implement-<change-id>-api` - API implementation
- `/implement-<change-id>-database` - Database changes
- `/implement-<change-id>-mcp` - MCP integration (if applicable)
- `/implement-<change-id>-test` - Test implementation

## Execution Phases

### Phase 1: Database Schema (if applicable)
<データベース変更が必要な場合>
Run database changes first as they may be dependencies for other work:
```bash
/implement-<change-id>-database
```

**Wait for completion** before proceeding to Phase 2.

### Phase 2: Parallel Implementation
<並列実行可能な実装>
Execute these sub-agents in parallel (they are independent):

**Frontend Implementation**:
```bash
/implement-<change-id>-frontend
```

**API Implementation**:
```bash
/implement-<change-id>-api
```

**MCP Integration** (if applicable):
```bash
/implement-<change-id>-mcp
```

You can run these sequentially or ask the user if they want to run them in parallel.

### Phase 3: Testing
<テスト実装と実行>
After implementation is complete, run tests:
```bash
/implement-<change-id>-test
```

### Phase 4: Validation
Run final validation:
```bash
# Type check
npx tsc --noEmit

# Run all tests
npm test

# Lint
npm run lint

# OpenSpec validation
openspec validate <change-id> --strict
```

### Phase 5: Update Tasks
Update `openspec/changes/<change-id>/tasks.md` with completed checkmarks:
- Mark all implemented tasks with `[x]`
- Verify all requirements are satisfied

## Progress Tracking

Use TodoWrite to track progress:
- [ ] Phase 1: Database changes complete (if applicable)
- [ ] Phase 2: Implementation complete
  - [ ] Frontend (if applicable)
  - [ ] API (if applicable)
  - [ ] MCP integration (if applicable)
- [ ] Phase 3: Tests complete
- [ ] Phase 4: Validation passed
- [ ] Phase 5: Tasks updated

## Error Handling

If any sub-agent reports issues:
1. Review the error message
2. Determine if it's a blocker
3. Fix the issue or adjust the plan
4. Re-run the failed sub-agent
5. Continue with remaining phases

## Direct Sub-Agent Execution

You can also run sub-agents directly for focused work:
- `/implement-<change-id>-frontend` - Work on frontend only
- `/implement-<change-id>-api` - Work on API only
- `/implement-<change-id>-database` - Work on database only
- `/implement-<change-id>-mcp` - Work on MCP integration only
- `/implement-<change-id>-test` - Work on tests only

This is useful for:
- Iterating on a specific area
- Debugging issues
- Making adjustments

## Final Checklist

After all phases complete:
- [ ] All sub-agents completed successfully
- [ ] All tests pass (`npm test`)
- [ ] Type check passes (`npx tsc --noEmit`)
- [ ] Linter passes (`npm run lint`)
- [ ] OpenSpec validation passes (`openspec validate <change-id> --strict`)
- [ ] Tasks.md updated with all checkmarks
- [ ] Implementation matches spec requirements

## Reference
- Change location: `openspec/changes/<change-id>/`
- Proposal: `openspec/changes/<change-id>/proposal.md`
- Tasks: `openspec/changes/<change-id>/tasks.md`
- Design: `openspec/changes/<change-id>/design.md` (if exists)
- Specs: `openspec/changes/<change-id>/specs/`

## Next Steps
After implementation is complete and validated:
```bash
# Deploy to production
# Then archive the change
/openspec:archive <change-id>
```
```

### 6. 生成完了の報告

ユーザーに以下を報告：
```
✅ 実装用コマンドを生成しました！

Change ID: <change-id>
Main Command: /implement-<change-id>

Generated Sub-Agents:
<生成されたサブエージェントのリスト>
- /implement-<change-id>-frontend
- /implement-<change-id>-api
- /implement-<change-id>-database
- /implement-<change-id>-test

使い方:
1. 全て実行: /implement-<change-id>
2. 個別実行: /implement-<change-id>-frontend など

各サブエージェントは以下に保存されています:
.claude/commands/implement-<change-id>-*.md
```

---

## サブエージェント生成のルール

### 生成するかどうかの判定基準

**Frontend Agent** - 以下のいずれかに該当する場合に生成:
- React/Next.jsコンポーネントの作成・修正
- UIの追加・変更
- Jotai state管理の変更
- Tailwind CSSスタイリング

**API Agent** - 以下のいずれかに該当する場合に生成:
- API routeの作成・修正
- サービスロジックの追加
- 認証・認可の変更

**Database Agent** - 以下のいずれかに該当する場合に生成:
- Prismaスキーマの修正
- マイグレーションが必要
- シードデータの更新

**MCP Agent** - 以下のいずれかに該当する場合に生成:
- Figma, Playwright, DeepWikiなどのMCPツール使用
- 外部サービス統合
- ブラウザ自動化

**Test Agent** - 常に生成（テストは必須）

### サブエージェントのプロンプト構造

各サブエージェントのプロンプトには以下を含める：
1. **Role**: エージェントの役割と責任範囲
2. **Context**: Change の背景と要件
3. **Requirements**: 該当領域の具体的な要件（spec deltasから抽出）
4. **Tasks**: 該当領域のタスク（tasks.mdから抽出）
5. **Guidelines**: 実装ガイドライン
6. **Tools**: 使用可能なツール（MCP含む）
7. **Conventions**: プロジェクト規約
8. **Steps**: 実行ステップ
9. **Success Criteria**: 完了条件
10. **Return Format**: 返却形式

### メインコマンドのオーケストレーション

メインコマンドは以下を行う：
1. **依存関係の管理**: データベース → API → フロントエンドの順序
2. **並列実行の指示**: 独立したサブエージェントは並列実行可能であることを明示
3. **進捗追跡**: TodoWriteで全体の進捗を追跡
4. **エラーハンドリング**: サブエージェント失敗時の対応
5. **最終検証**: 全体の検証とtasks.md更新

---

## 注意事項

- 生成されるサブエージェントは OpenSpec の変更内容に完全に特化したものになる
- 各サブエージェントは独立して実行可能にする
- MCPツールの使用は必要に応じて適切に指示する
- プロジェクトの規約（AGENTS.md、CLAUDE.md）を考慮する
- 実装の際は常に最小限の変更を優先する
- サブエージェント間の依存関係を明確にする
- 並列実行可能なものは並列実行を推奨する

## エラーハンドリング

- Change IDが見つからない場合: エラーメッセージを表示
- 必要なファイルが存在しない場合: 警告して続行
- タスクが空の場合: 最小限のサブエージェントを生成
- 実装領域が判定できない場合: ユーザーに確認

<!-- OPENSPEC:END -->
