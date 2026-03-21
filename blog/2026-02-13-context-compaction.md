---
slug: context-compaction
title: "Context Compaction: The Art of Summarizing a 3-Hour Coding Session for Your LLM"
authors: [osamah]
tags: [architecture, ai]
image: /img/blog/context-compaction.png
---

![Context Compaction: The Art of Summarizing a 3-Hour Coding Session for Your LLM](/img/blog/context-compaction.png)

Your AI pair programmer has a 200K token limit. After 3 hours, you're at 150K. What do you do?

<!-- truncate -->

## The Token Limit Problem

You're pair programming with an AI. Three hours in:
- 47 user messages
- 47 assistant responses
- 94 tool calls
- 94 tool results

**Total: ~150K tokens**

The LLM's context window: **200K tokens**

You have 50K tokens left. At this rate, you'll hit the limit in an hour.

**Options:**
1. **Start a new session** — Lose all context
2. **Truncate old messages** — Lose potentially important details
3. **Summarize with the LLM** — Expensive and slow
4. **Context compaction** — Smart compression

## What Is Context Compaction?

Context compaction intelligently reduces token usage while preserving semantic meaning:

```
Before: 847 messages, ~142K tokens
After:  23 messages, ~3K tokens
       
[Context Summary — compacted from 847 messages]

## Original Request
User asked to generate an orbital schema for a task management app...

## Actions Taken
1. Created schema `taskly.orb` with 3 orbitals
2. Validated — fixed 4 errors
3. Compiled to TypeScript shell
4. User requested adding "priority" field

## Current State
- Schema is valid and compiles cleanly
- Working directory: /home/user/projects/taskly
```

## The Compaction Pipeline

Almadar's context compaction follows an 8-step pipeline:

### Step 1: Estimate Tokens

```typescript
function estimateTokens(messages: Message[]): number {
  // Character-based heuristic (80% accurate)
  const totalChars = messages.reduce((sum, m) => {
    const content = typeof m.content === 'string' 
      ? m.content 
      : JSON.stringify(m.content);
    return sum + content.length;
  }, 0);
  
  return totalChars / 4; // ~4 chars per token
}
```

### Step 2: Classify Messages

Not all messages are equal:

| Category | Examples | Compaction Priority |
|----------|----------|---------------------|
| **System** | System prompt, skill instructions | 🔴 Never touch |
| **Anchor** | User's original request | 🟡 Preserve in summary |
| **Tool-heavy** | File reads, validation output | 🟢 Compress first |
| **Reasoning** | Assistant's analysis | 🟡 Summarize |
| **Recent** | Last N messages | 🔴 Never touch |

### Step 3: Partition

Split into old and recent:

```typescript
const keepRecent = 20; // Always keep last 20 messages
const recent = messages.slice(-keepRecent);
const old = messages.slice(0, -keepRecent);
```

### Step 4: Compress Tool Results

Replace large outputs with stubs:

```typescript
// Before: 850 lines of code
{
  role: 'tool',
  content: '<850 lines of TypeScript...>'
}

// After: One line
{
  role: 'tool', 
  content: '[read_file: src/schema.ts — 850 lines]'
}
```

### Step 5: Summarize (Optional)

For the `summarize` or `hybrid` strategy:

```typescript
const summaryPrompt = `
Summarize this conversation for an AI assistant.
Focus on:
1. What the user originally requested
2. What actions have been taken
3. What the current state is
4. Any errors encountered and how they were fixed

Be concise but comprehensive.
`;

const summary = await llm.generate(summaryPrompt, oldMessages);
```

### Step 6: Reassemble

```typescript
const compacted = [
  systemMessage,      // Original system prompt
  summaryMessage,     // Generated summary
  ...recentMessages,  // Last 20 messages unchanged
];
```

### Step 7: Emit Event

```typescript
// Send compaction notice to UI
sse.send({
  type: 'compaction',
  data: {
    messagesBefore: 847,
    messagesAfter: 23,
    tokensBefore: 142000,
    tokensAfter: 3000,
    strategy: 'hybrid',
    summaryLength: summary.length,
  },
});
```

### Step 8: Persist

Store compaction metadata with the session:

```typescript
await sessionManager.recordCompaction(
  threadId,
  originalMessageCount,
  compactedMessageCount,
  'token_limit'
);
```

## Configuration Options

```typescript
interface CompactionConfig {
  maxTokens: number;           // Trigger threshold (default: 150000)
  triggerThreshold: number;    // 0-1, when to trigger (default: 0.75)
  keepRecentMessages: number;  // Always keep N recent (default: 20)
  strategy: 'truncate' | 'summarize' | 'hybrid';
  summaryModel?: string;       // Use cheaper model for summaries
}
```

### Strategy Comparison

| Strategy | How It Works | Best For |
|----------|--------------|----------|
| **truncate** | Drop oldest messages | Fast, no extra LLM call |
| **summarize** | LLM summarizes old messages | Preserving context |
| **hybrid** | Compress tools, summarize rest | Balance of speed/quality |

## Real-World Example

**Session: Building an E-Commerce Platform**

```
Hour 1:
- Created Order, Product, User entities
- Set up CRUD traits
- Compiled successfully
[Messages: 15, Tokens: ~8K]

Hour 2:
- Added shopping cart orbital
- Implemented checkout flow
- Fixed validation errors
[Messages: 35, Tokens: ~25K]

Hour 3:
- Added payment integration
- Tested end-to-end
- Refactored for performance
[Messages: 67, Tokens: ~62K]

Hour 4:
- Added inventory management
- Realized: Running low on tokens!
```

**Compaction triggered:**

```
[Context Summary — compacted from 67 messages]

## Original Request
Build an e-commerce platform with product catalog, 
shopping cart, and checkout.

## Entities Created
- Product: name, price, inventory
- User: email, name, addresses
- Order: items, total, status
- Cart: items, user relation

## Key Features Implemented
1. Product browsing (entity-table pattern)
2. Shopping cart (session-based)
3. Checkout wizard (3-step flow)
4. Payment integration (Stripe)
5. Inventory management

## Current State
- 5 orbitals defined
- All tests passing
- Ready for deployment

## Recent Focus
Adding inventory management and low-stock alerts.
```

**Result:** 67 messages → 1 summary + 20 recent = 21 messages

## Code Example: Using Compaction

```typescript
// Internal: Almadar's session management system

const sessionManager = new SessionManager({
  mode: 'firestore',
  firestoreDb: db,
  memoryManager,
  compactionConfig: {
    maxTokens: 150000,
    triggerThreshold: 0.8,
    keepRecentMessages: 10,
    strategy: 'hybrid',
  },
});

// Check if compaction needed
const shouldCompact = sessionManager.shouldCompactMessages(messages);

if (shouldCompact) {
  console.log('Compacting context...');
  
  // In your agent loop, trigger compaction
  // before sending to LLM
  const compacted = await compactMessages(
    messages,
    config
  );
  
  // Record for analytics
  await sessionManager.recordCompaction(
    threadId,
    messages.length,
    compacted.length,
    'token_limit'
  );
}

// Get compaction history
const history = sessionManager.getCompactionHistory(threadId);
console.log(`Session compacted ${history.length} times`);
// Session compacted 3 times
```

## Real-World Analogy: Executive Summary

Context compaction is like an executive summary:

**Full Report (500 pages):**
- Every email
- Every meeting transcript  
- Every spreadsheet
- Every draft

**Executive Summary (2 pages):**
- What we were asked to do
- What we did
- Current status
- Next steps

The CEO doesn't read 500 pages. They read the summary and the last few updates.

LLMs work the same way.

## Trade-offs

### What We Keep
- ✅ System instructions (critical)
- ✅ User's original request (context)
- ✅ Recent messages (current state)
- ✅ Error/success patterns (learning)

### What We Lose
- ❌ Exact tool output (replaced with stub)
- ❌ Intermediate reasoning (summarized)
- ❌ Exact file contents (can re-read)

### Mitigations

1. **Re-read on demand:** If LLM needs file contents, it can re-read
2. **Keep key decisions:** Important choices preserved in summary
3. **Track references:** Original messages linked for debugging

## The Takeaway

Context windows are finite. Sessions can be long.

Context compaction bridges the gap:
- **Smart compression:** Keep meaning, reduce tokens
- **Configurable strategies:** Speed vs. quality tradeoffs
- **Transparent:** User sees what's compacted
- **Recoverable:** Can re-fetch compressed data

Because the best AI assistant isn't one with infinite memory — it's one that knows what to remember.

Learn more about [Session Management](./three-execution-models).
