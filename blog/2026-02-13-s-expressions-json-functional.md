---
slug: s-expressions-json-functional
title: "S-Expressions: The JSON of Functional Programming (That Actually Makes Sense)"
image: /img/blog/s-expressions-json-functional.png
authors: [osamah]
tags: [architecture]
---

![S-Expressions, JSON, and the Functional Renaissance](/img/blog/s-expressions-json-functional.png)

Why we chose Lisp-style S-expressions over JSON for logic definition, and why you might too.

Everyone loves JSON, but when you need logic, you end up with string templates or JavaScript. What if your data format *was* your logic format?

<!-- truncate -->

<OrbitalDiagram />

## The JSON Limitation

JSON is great for data:

```json
{
  "name": "John",
  "age": 30,
  "hobbies": ["coding", "reading"]
}
```

But what about logic? You have a few options:

### Option 1: String Templates
```json
{
  "condition": "user.age >= 18 && user.verified"
}
```
- ❌ Error-prone (typos in strings)
- ❌ No validation
- ❌ Injection risk

### Option 2: Custom DSL
```json
{
  "condition": {
    "and": [
      { "gte": ["user.age", 18] },
      { "eq": ["user.verified", true] }
    ]
  }
}
```
- ✅ Structured
- ❌ Verbose
- ❌ Hard to read

### Option 3: JavaScript Functions
```javascript
const condition = (user) => user.age >= 18 && user.verified;
```
- ✅ Readable
- ❌ Not serializable
- ❌ Security risk (eval)

## Enter S-Expressions

S-expressions (symbolic expressions) have been around since 1958 with Lisp. They're simple:

```
(operator operand1 operand2 ...)
```

In JSON-friendly form:

```json
["operator", "operand1", "operand2", ...]
```

## S-Expressions in Almadar

Almadar uses S-expressions for guards and effects:

### Guards: Conditional Logic

```json
{
  "from": "pending",
  "to": "approved",
  "event": "APPROVE",
  "guard": ["and",
    [">=", "@user.roleLevel", 5],
    ["not", "@entity.isFlagged"],
    [">", "@entity.amount", 0]
  ]
}
```

This is equivalent to:
```javascript
if (user.roleLevel >= 5 && !entity.isFlagged && entity.amount > 0) {
  // Allow transition
}
```

But it's:
- ✅ Serializable
- ✅ Validatable
- ✅ Secure (no eval)
- ✅ Cross-platform

### Effects: State Changes

```json
{
  "effects": [
    ["set", "@entity.status", "approved"],
    ["set", "@entity.approvedAt", "@now"],
    ["set", "@entity.approvedBy", "@user.id"],
    ["persist", "update", "Order", "@entity.id", "@entity"]
  ]
}
```

Each effect is an S-expression:
- `["set", target, value]` — Set a value
- `["persist", operation, entity, id, data]` — Save to database
- `["emit", event, payload]` — Emit an event

## Why This Matters

### 1. Homoiconicity (Code as Data)

S-expressions are data that looks like code. This means:

```json
["+", "@entity.count", 1]
```

Is both:
- A data structure (array of strings)
- Executable code (add 1 to count)

### 2. Composability

You can nest S-expressions arbitrarily:

```json
["if",
  ["and",
    [">", "@entity.score", 100],
    ["=", "@entity.status", "active"]
  ],
  ["emit", "ACHIEVEMENT_UNLOCKED", { "level": "gold" }],
  ["emit", "ACHIEVEMENT_PROGRESS", { "needed": ["-", 100, "@entity.score"] }]
]
```

### 3. Serialization

Because S-expressions are just arrays, they serialize perfectly:

```javascript
// JavaScript
const guard = [">=", "@user.age", 18];
JSON.stringify(guard); // '[">=","@user.age",18]'
```

```python
# Python
guard = [">=", "@user.age", 18]
json.dumps(guard)  # '[">=","@user.age",18]'
```

```rust
// Rust
let guard = json!( [">=", "@user.age", 18] );
serde_json::to_string(&guard).unwrap();
```

## The Binding Context

S-expressions in Almadar use special prefixes for context:

| Prefix | Meaning | Example |
|--------|---------|---------|
| `@entity.field` | Current entity field | `"@entity.status"` |
| `@payload.field` | Event payload | `"@payload.userId"` |
| `@state` | Current state machine state name | `"@state"` (e.g. `"Browsing"`) |
| `@user.field` | Current user | `"@user.id"` |
| `@now` | Current timestamp | `"@now"` |

This creates a **declarative binding system**:

```json
{
  "guard": ["=", "@entity.ownerId", "@user.id"],
  "effects": [
    ["set", "@entity.updatedAt", "@now"],
    ["set", "@entity.updatedBy", "@user.id"]
  ]
}
```

## Real-World Analogy: Excel Formulas

If you've used Excel, you've used S-expressions:

```excel
=IF(AND(A1>100, B1="active"), "Gold", "Silver")
```

In Almadar:
```json
["if",
  ["and", [">", "@entity.score", 100], ["=", "@entity.status", "active"]],
  "Gold",
  "Silver"
]
```

Excel formulas are S-expressions. They're:
- Declarative (you say what, not how)
- Composable (functions call functions)
- Safe (no arbitrary code execution)

## Standard Operators

Almadar's standard library includes:

### Comparison
```json
["=", "a", "b"]        // equality
["!=", "a", "b"]       // not equal
[">", "a", "b"]        // greater than
[">=", "a", "b"]       // greater or equal
```

### Logic
```json
["and", "a", "b", "c"] // all must be true
["or", "a", "b", "c"]  // at least one true
["not", "a"]           // negation
```

### Math
```json
["+", "a", "b", "c"]   // sum
["-", "a", "b"]        // difference
["*", "a", "b"]        // product
["/", "a", "b"]        // quotient
```

### Array
```json
["count", "@array"]    // array length
["contains", "@array", "item"]  // membership
["filter", "@array", ["predicate"]]
```

### String
```json
["concat", "a", "b"]   // concatenate
["length", "str"]      // string length
["matches", "str", "regex"]
```

## Try It: Build a Guard

Let's create a guard for an approval workflow:

```json
{
  "from": "pending",
  "to": "approved",
  "event": "APPROVE",
  "guard": ["and",
    ["or",
      [">=", "@user.roleLevel", 5],
      ["=", "@user.id", "@entity.ownerId"]
    ],
    ["not", "@entity.isLocked"],
    [">", "@entity.amount", 0],
    ["<", "@entity.amount", 10000]
  ]
}
```

This translates to:
```javascript
if (
  (user.roleLevel >= 5 || user.id === entity.ownerId) &&
  !entity.isLocked &&
  entity.amount > 0 &&
  entity.amount < 10000
) {
  // Allow approval
}
```

But with:
- ✅ Declarative syntax
- ✅ Automatic validation
- ✅ No code injection risk
- ✅ Serializable for audit logs

## The Takeaway

S-expressions aren't just a Lisp curiosity — they're a practical solution to "how do we put logic in JSON?"

They give you:
- **The power of code** (composability, expressiveness)
- **The safety of data** (serialization, validation, no eval)
- **The clarity of Excel** (declarative, readable)

Next time you're tempted to use `eval()` or string templates for dynamic logic, remember: there's a 60-year-old solution that actually works.

Want to explore more? Check out the [standard library operators](https://orb.almadar.io/docs/stdlib).
