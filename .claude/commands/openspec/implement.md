---
name: OpenSpec: Implement
description: Analyze OpenSpec change, create specialized agents, and execute implementation efficiently.
category: OpenSpec
tags: [openspec, implement, agents]
---
<!-- OPENSPEC:START -->
**Purpose**
This command automates the implementation of approved OpenSpec changes by:
1. Analyzing the change proposal, design, and tasks
2. Creating specialized Task agents for different aspects of implementation
3. Orchestrating agents to work in parallel where possible
4. Tracking progress and ensuring all tasks are completed

**Guardrails**
- Always read the full proposal, design, and tasks before creating agents
- Create agents that are appropriately scoped for their specific work
- Favor parallel execution when tasks are independent
- Keep implementations minimal and focused on spec requirements
- Refer to `openspec/AGENTS.md` for OpenSpec conventions

**Steps**
Track these steps as TODOs and complete them one by one.

1. **Validate and Load Change**
   - Determine the change ID from conversation context or ask user
   - Run `openspec list` to verify the change exists
   - Run `openspec show <id>` to get change overview
   - Read `changes/<id>/proposal.md` to understand the "why" and "what"
   - Read `changes/<id>/design.md` (if present) for technical decisions
   - Read `changes/<id>/tasks.md` for implementation checklist
   - Read all delta specs in `changes/<id>/specs/*/spec.md` to understand requirements

2. **Analyze Implementation Scope**
   - Identify affected capabilities and their domains (frontend, backend, database, etc.)
   - Group tasks by domain and identify dependencies
   - Determine which tasks can run in parallel vs sequentially
   - Identify potential implementation risks or blockers

3. **Create Specialized Agents**
   Based on the analysis, create appropriate agents:

   **Frontend Tasks:**
   - Use `Task` tool with `subagent_type: "Explore"` to understand current frontend structure
   - Use `Task` tool with `subagent_type: "frontend-refactoring-expert"` for React/Next.js component changes
   - Use `Task` tool with `subagent_type: "frontend-code-reviewer"` after frontend implementation

   **Backend/API Tasks:**
   - Use `Task` tool with `subagent_type: "Explore"` to understand API structure
   - Use `Task` tool with `subagent_type: "general-purpose"` for API endpoint implementation

   **Database Tasks:**
   - Use `Task` tool with `subagent_type: "general-purpose"` for schema changes
   - Include Prisma migration and seed script updates

   **Testing Tasks:**
   - Use `Task` tool with `subagent_type: "general-purpose"` for test implementation

   **Documentation Tasks:**
   - Use `Task` tool with `subagent_type: "general-purpose"` for docs updates

4. **Execute Agents in Optimal Order**
   - Launch independent agents in parallel using a single message with multiple Task calls
   - Wait for results and validate completion before proceeding
   - For dependent tasks, run sequentially after prerequisites complete
   - Example parallel execution:
     ```
     Task 1: Explore frontend structure (thoroughness: "medium")
     Task 2: Explore backend API structure (thoroughness: "medium")
     Task 3: Review database schema requirements
     ```

5. **Track Progress and Update Tasks**
   - Use TodoWrite to track overall progress
   - As each agent completes, mark corresponding task items as done
   - Update `tasks.md` with `- [x]` for completed items
   - Identify and address any blockers or issues

6. **Validate Implementation**
   - Run tests: `npm test`
   - Run linter: `npm run lint`
   - Run type check: `npx tsc --noEmit`
   - Verify all requirements from spec deltas are satisfied
   - Use frontend-code-reviewer agent for final review if frontend changes were made

7. **Finalize**
   - Ensure all tasks in `tasks.md` are marked complete
   - Confirm implementation matches spec requirements
   - Run `openspec validate <id> --strict` to verify consistency
   - Report completion to user with summary of changes

**Agent Creation Examples**

Example 1: Frontend Component Addition
```markdown
You are implementing the frontend portion of OpenSpec change `add-rich-menu-preview`.

Context:
- Proposal: [summary from proposal.md]
- Requirements: [key requirements from spec deltas]
- Tasks:
  - Create RichMenuPreview component
  - Add preview to editor page
  - Implement real-time updates

Your goal is to:
1. Create the new component in src/components/rich-menu/
2. Follow existing patterns in the codebase
3. Use TypeScript with proper typing
4. Style with Tailwind CSS
5. Write unit tests for the component

Return a summary of what you implemented and any issues encountered.
```

Example 2: API Endpoint Implementation
```markdown
You are implementing the API portion of OpenSpec change `add-message-scheduling`.

Context:
- Proposal: [summary from proposal.md]
- Requirements: [key requirements from spec deltas]
- Design decisions: [key points from design.md]

Your goal is to:
1. Create new API routes in src/app/api/messages/schedule/
2. Implement schedule logic in src/lib/messaging/
3. Update Prisma schema if needed
4. Add appropriate error handling and validation
5. Write integration tests

Return a summary of implementation and any dependencies that need attention.
```

Example 3: Database Schema Changes
```markdown
You are implementing database changes for OpenSpec change `add-template-versioning`.

Context:
- Current schema: [relevant parts from prisma/schema.prisma]
- Requirements: [key requirements from spec deltas]

Your goal is to:
1. Update prisma/schema.prisma with new fields/models
2. Create migration: `npx prisma migrate dev --name add-template-versioning`
3. Update seed script in prisma/seed.ts if needed
4. Generate Prisma client: `npx prisma generate`
5. Test migration rollback

Return a summary of schema changes and migration status.
```

**Parallel Execution Strategy**

When launching multiple agents, use a single message with multiple Task tool calls:

```
I'm now going to launch three agents in parallel to work on different aspects:

1. Frontend exploration agent (Explore) - to understand component structure
2. Backend implementation agent (general-purpose) - to create API endpoints
3. Database schema agent (general-purpose) - to update Prisma schema

[Then make 3 Task tool calls in one message]
```

**Error Handling**

If an agent reports issues:
- Review the agent's findings
- Determine if it's a blocker or can be worked around
- Update tasks.md to reflect current state
- Create new agents to address specific issues if needed
- Keep user informed of progress and blockers

**Reference Commands**
- `openspec list` - List all changes
- `openspec show <id>` - View change details
- `openspec show <id> --json --deltas-only` - Get structured delta info
- `openspec validate <id> --strict` - Validate change
- `rg -n "Requirement:|Scenario:" openspec/specs` - Search existing specs
- `npm test` - Run tests
- `npm run lint` - Run linter

**Best Practices**
- Always read full context before creating agents
- Create focused agents with clear, specific tasks
- Use parallel execution for independent work
- Track progress with TodoWrite
- Validate incrementally, not just at the end
- Keep implementations aligned with OpenSpec requirements
- Update tasks.md in real-time as work completes
<!-- OPENSPEC:END -->
