---
slug: agentic-search
title: "Agentic Search: Teaching an AI to Remember Like a Human"
authors: [osamah]
tags: [architecture, ai]
image: /img/blog/agentic-search.png
---

![Agentic Search: Teaching an AI to Remember Like a Human](/img/blog/agentic-search.png)

Vector search finds similar text. Agentic search finds relevant context. The difference is reasoning.

<!-- truncate -->

## The Search Problem

Traditional search asks: *"What documents contain these words?"*

But humans ask: *"What did I mean when I said that?"*

**Example query:** *"How did I handle user authentication?"*

**Vector search approach:**
- Finds docs with "user" and "authentication"
- Misses: Sessions about "auth", "login", "sign-in"
- Misses: Context about why you chose JWT vs sessions
- Misses: The error → fix → success chain

**Human memory approach:**
- "I remember working on that last month"
- "It was for the e-commerce project"
- "I tried OAuth first, then switched to JWT"
- "The issue was with token refresh"

Humans search with **reasoning**, not **similarity**.

## Agentic Search

Agentic search combines:
1. **Semantic understanding** — What does the query mean?
2. **Temporal navigation** — When did this happen?
3. **Pattern recognition** — What type of solution?
4. **Causal reasoning** — What led to success?

```typescript
const response = await searchEngine.search({
  userId: 'user_123',
  query: "How did I handle user authentication?",
  strategy: 'hybrid',  // temporal + semantic + pattern
  depth: 3,
  limit: 10,
});

// Returns:
response.insights.summary
// "Found 3 authentication implementations across 2 projects"

response.insights.patterns
// ["jwt-auth", "oauth-integration", "session-management"]

response.insights.suggestions
// ["Consider reusing the JWT pattern from Project A"]

response.results[0].reasoning
// "Session from March 2025 implemented JWT authentication 
//    with refresh tokens for the e-commerce project"
```

## Four Search Strategies

### 1. Temporal Search

*"What did I do last week?"*

```typescript
const response = await searchEngine.search({
  userId: 'user_123',
  query: "Show me recent authentication work",
  strategy: 'temporal',
});
```

How it works:
1. Parse temporal markers ("recent", "last week", "Tuesday")
2. Weight by recency (exponential decay)
3. Boost matches from requested time period

```typescript
// Relevance scoring
const daysAgo = (Date.now() - session.createdAt) / (1000 * 60 * 60 * 24);
const recencyBoost = Math.max(0.1, 1 - daysAgo / 30);
```

### 2. Semantic Search

*"How did I handle user roles?"*

```typescript
const response = await searchEngine.search({
  userId: 'user_123',
  query: "Find my role-based access control implementation",
  strategy: 'semantic',
});
```

How it works:
1. Extract semantic concepts ("roles", "access", "permissions")
2. Match against preferences and project context
3. Cross-reference with session content

```typescript
const concepts = extractConcepts(query);
// { entities: ['Role', 'User'], patterns: ['guard'], actions: ['authorize'] }

// Match against sessions
const matches = sessions.filter(s => 
  s.entities.some(e => concepts.entities.includes(e)) ||
  s.patterns.some(p => concepts.patterns.includes(p))
);
```

### 3. Pattern Search

*"Show me all list views I've built"*

```typescript
const response = await searchEngine.search({
  userId: 'user_123',
  query: "Find all my list views",
  strategy: 'pattern',
});
```

How it works:
1. Extract pattern terms ("list", "table", "grid", "cards")
2. Search pattern affinity records
3. Return sessions using those patterns

```typescript
const patternTerms = ['list', 'table', 'grid', 'cards'];
const userPatterns = await memoryManager.getUserPatterns(userId);

// Find high-success patterns
const goodPatterns = userPatterns.filter(p => 
  p.successCount / p.usageCount > 0.8
);
```

### 4. Hybrid Search

*"What worked well for forms?"* (combines all strategies)

```typescript
const response = await searchEngine.search({
  userId: 'user_123',
  query: "What worked well for forms?",
  strategy: 'hybrid',
  depth: 3,
});
```

Combines temporal, semantic, and pattern results with deduplication.

## The Reasoning Engine

Agentic search doesn't just return matches — it **explains why they match**:

```typescript
interface SearchResult {
  type: 'preference' | 'session' | 'project' | 'pattern';
  data: unknown;
  relevance: number;  // 0-1
  reasoning: string;  // Human-readable explanation
  source: string;     // Where it came from
}

// Example result
{
  type: 'session',
  data: { /* session record */ },
  relevance: 0.87,
  reasoning: "Session from March 2025 contains 'User' entity with 
             'role' field and uses 'guard-clause' pattern. 
             User previously marked this pattern as successful.",
  source: 'generation_history'
}
```

## Generating Insights

Beyond individual results, agentic search generates **insights**:

```typescript
interface Insights {
  summary: string;           // What was found
  patterns: string[];        // Common patterns
  trends: string[];          // Temporal trends
  suggestions: string[];     // Actionable next steps
}

// Example
{
  summary: "Found 12 sessions involving forms across 3 projects",
  patterns: ["form-section", "validation-rules", "wizard-flow"],
  trends: [
    "High success rate (92%) with form-section pattern",
    "Validation errors decreased after adopting std/validate"
  ],
  suggestions: [
    "Consider reusing the wizard-flow pattern for complex forms",
    "Add entity-form to your preferred patterns"
  ]
}
```

## Real-World Example

**User query:** *"How did I build the checkout flow?"*

**Agentic search process:**

1. **Concept Extraction**
   ```typescript
   concepts = {
     entities: ['Order', 'Payment', 'Cart'],
     patterns: ['wizard', 'form', 'validation'],
     actions: ['checkout', 'purchase', 'pay']
   }
   ```

2. **Temporal Search**
   - Found 5 sessions from last 3 months
   - Weighted by recency

3. **Semantic Search**
   - Matched "checkout" in prompts
   - Found related entities (Order, Cart)

4. **Pattern Search**
   - Found `wizard-flow` pattern usage
   - 90% success rate

5. **Insight Generation**
   ```typescript
   {
     summary: "Found checkout implementation using 3-step wizard",
     patterns: ["wizard-flow", "form-section", "validation-rules"],
     trends: [
       "Most successful: 3-step wizard (92% completion)",
       "Less successful: single-page checkout (67%)"
     ],
     suggestions: [
       "Reuse wizard-flow for future checkout flows",
       "Consider adding progress indicator pattern"
     ]
   }
   ```

## Code Example: Using Agentic Search

```typescript
// Internal: Almadar's agentic search engine
// (This is how it works under the hood — not a public API)
const searchEngine = createSearchEngine(memoryManager);

// Search for authentication patterns
const response = await searchEngine.search({
  userId: 'user_123',
  query: "How did I handle authentication in the e-commerce project?",
  strategy: 'hybrid',
  depth: 3,
  limit: 10,
});

// Display summary
console.log(response.insights.summary);
// "Found 4 authentication implementations across 2 projects"

// Display patterns used
response.insights.patterns.forEach(pattern => {
  console.log(`- ${pattern}`);
});
// - jwt-auth
// - oauth-integration
// - session-management

// Display top results with reasoning
response.results.slice(0, 3).forEach(result => {
  console.log(`${result.type}: ${result.reasoning} (${result.relevance})`);
});

// session: Session from March 2025 implemented JWT authentication 
//   with refresh tokens for the e-commerce project (0.92)
//
// pattern: Pattern 'jwt-auth' has 95% success rate across 12 uses (0.88)
//
// preference: User prefers JWT over session-based auth (0.85)

// Take action on suggestions
if (response.insights.suggestions.length > 0) {
  console.log("\nSuggested actions:");
  response.insights.suggestions.forEach(s => console.log(`- ${s}`));
}
// - Consider reusing the JWT pattern from E-Commerce project
// - Add 'jwt-auth' to your preferred patterns
```

## Comparison: Vector vs Agentic

| Aspect | Vector Search | Agentic Search |
|--------|--------------|----------------|
| Query | "authentication" | "How did I handle auth?" |
| Method | Embedding similarity | Reasoning + traversal |
| Results | Similar text | Relevant context |
| Temporal | Timestamp only | State transitions |
| Causal | None | Error → fix chains |
| Explanation | Similarity score | Human-readable reasoning |
| Insights | None | Patterns, trends, suggestions |

## Real-World Analogy: Librarian vs Research Assistant

**Vector search** = Librarian:
- You: "Books about space"
- Librarian: "Here's everything with 'space' in the title"
- Result: 500 books, most irrelevant

**Agentic search** = Research Assistant:
- You: "What did we conclude about Mars missions?"
- Assistant: "You read 'Red Mars' in 2023, concluded we need better radiation shielding. 
             Related: Your 2024 notes on SpaceX Starship life support systems.
             Suggestion: Check the new NASA report on radiation mitigation."
- Result: Precisely relevant, with context and suggestions

## The Takeaway

Vector search answers: *"What's similar to this text?"*

Agentic search answers: *"What do I need to know right now?"*

The difference is **reasoning**:
- Understanding the query's intent
- Navigating temporal context
- Recognizing patterns
- Drawing connections
- Suggesting next steps

That's how humans remember. That's how our AI remembers too.

Learn more about [Orbital Memory](./ai-orbital-memory).
