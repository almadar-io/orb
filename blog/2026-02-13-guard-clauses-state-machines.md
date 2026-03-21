---
slug: guard-clauses-state-machines
title: "Guard Clauses in State Machines: Permission Systems That Actually Work"
authors: [osamah]
tags: [architecture, state-machines]
image: /img/blog/guard-clauses-state-machines.png
---

![Guard Clauses in State Machines: Permission Systems That Actually Work](/img/blog/guard-clauses-state-machines.png)

Authorization logic scattered across your app? What if it was just... part of the state definition?

<!-- truncate -->

<OrbitalDiagram />

## The Authorization Mess

Most apps handle permissions like this:

```typescript
// In the component
function ApproveButton({ order }) {
  const { user } = useAuth();
  
  const canApprove = 
    user.roleLevel >= 5 && 
    !order.isFlagged && 
    order.amount > 0;
  
  return (
    <button disabled={!canApprove} onClick={handleApprove}>
      Approve
    </button>
  );
}

// In the API route
app.post('/api/orders/:id/approve', async (req, res) => {
  const { user } = req;
  const order = await Order.findById(req.params.id);
  
  // Same logic, duplicated!
  if (user.roleLevel < 5) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  if (order.isFlagged) {
    return res.status(400).json({ error: 'Order is flagged' });
  }
  if (order.amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  
  // ... actual approval logic
});
```

**Problems:**
- ❌ Logic duplicated in frontend and backend
- ❌ Hard to keep in sync
- ❌ Scattered across files
- ❌ No single source of truth

## Guards: Declarative Authorization

In Almadar, guards are part of the state machine:

```json
{
  "from": "pending",
  "to": "approved",
  "event": "APPROVE",
  "guard": ["and",
    [">=", "@user.roleLevel", 5],
    ["not", "@entity.isFlagged"],
    [">", "@entity.amount", 0]
  ],
  "effects": [
    ["set", "@entity.status", "approved"],
    ["set", "@entity.approvedAt", "@now"],
    ["persist", "update", "Order", "@entity.id", "@entity"]
  ]
}
```

The guard is **declarative**, **serializable**, and **enforced everywhere**.

## How Guards Work

### 1. Define the Guard

```json
{
  "guard": ["operator", "operand1", "operand2", ...]
}
```

### 2. Evaluated at Transition Time

When the `APPROVE` event is received:
1. The guard expression is evaluated
2. If `true`: transition executes
3. If `false`: transition blocked, optional error message

### 3. Applied Everywhere

The same guard applies to:
- ✅ UI (button disabled if guard fails)
- ✅ State machine (transition blocked)
- ✅ Generated API (request rejected)
- ✅ Audit logs (authorization decision recorded)

## Guard Examples

### Simple Comparison

```json
{
  "guard": ["=", "@entity.ownerId", "@user.id"]
}
// Only the owner can perform this action
```

### Role-Based

```json
{
  "guard": [">=", "@user.roleLevel", 5]
}
// Admin level (5+) required
```

### Multi-Factor

```json
{
  "guard": ["and",
    ["or",
      [">=", "@user.roleLevel", 5],
      ["=", "@user.department", "finance"]
    ],
    ["not", "@entity.isLocked"],
    ["<", "@entity.amount", 10000]
  ]
}
// (Admin OR Finance) AND Not Locked AND Amount < 10k
```

### Time-Based

```json
{
  "guard": ["<", 
    ["-", "@now", "@entity.createdAt"], 
    86400000
  ]
}
// Action only allowed within 24 hours of creation
```

### Array Membership

```json
{
  "guard": ["contains", "@user.permissions", "orders:approve"]
}
// User must have explicit permission
```

## Complex Example: Approval Workflow

```json
{
  "traits": [{
    "name": "OrderApproval",
    "linkedEntity": "Order",
    "stateMachine": {
      "states": [
        { "name": "draft", "isInitial": true },
        { "name": "pending_review" },
        { "name": "approved" },
        { "name": "rejected" },
        { "name": "escalated" }
      ],
      "events": ["SUBMIT", "APPROVE", "REJECT", "ESCALATE", "RETURN"],
      "transitions": [
        {
          "from": "draft",
          "to": "pending_review",
          "event": "SUBMIT",
          "guard": ["and",
            [">", "@entity.amount", 0],
            ["not", ["is-empty", "@entity.description"]]
          ]
        },
        {
          "from": "pending_review",
          "to": "approved",
          "event": "APPROVE",
          "guard": ["and",
            [">=", "@user.roleLevel", 5],
            ["not", "@entity.isFlagged"],
            ["or",
              ["<", "@entity.amount", 5000],
              ["and",
                [">=", "@user.roleLevel", 7],
                ["<", "@entity.amount", 50000]
              ]
            ]
          ]
        },
        {
          "from": "pending_review",
          "to": "escalated",
          "event": "ESCALATE",
          "guard": [">=", "@user.roleLevel", 5]
        },
        {
          "from": "pending_review",
          "to": "rejected",
          "event": "REJECT",
          "guard": [">=", "@user.roleLevel", 5]
        },
        {
          "from": "escalated",
          "to": "approved",
          "event": "APPROVE",
          "guard": [">=", "@user.roleLevel", 9]
        }
      ]
    }
  }]
}
```

This encodes a complete approval matrix:
- Anyone can submit (if valid)
- Level 5+ can approve up to $5K
- Level 7+ can approve up to $50K
- Level 9+ can approve anything
- Escalated orders need Level 9+

## Real-World Analogy: Airport Security

Airport security is a state machine with guards:

```
Check-in ──(has ticket?)──► Bag Drop ──(weight < 23kg?)──► Security
                                                    
Security ──(no liquids?)──► Scan ──(no weapons?)──► Gate
                                              
Gate ──(boarding pass valid?)──► Boarding ──(seat available?)──► Seated
```

Each transition has a guard. If you fail:
- No ticket? → Can't check in
- Overweight bag? → Pay extra or repack
- Liquids in bag? → Throw them away

The guards are **explicit**, **unambiguous**, and **applied consistently**.

## Guards vs Traditional Auth

| Aspect | Traditional | Almadar Guards |
|--------|-------------|----------------|
| Location | Scattered across files | Centralized in schema |
| Frontend | Duplicated logic | Auto-generated checks |
| Backend | Middleware + route handlers | Auto-generated validation |
| Audit | Manual logging | Automatic decision recording |
| Testing | Integration tests | Unit test the guard expression |
| Documentation | Separate docs | Self-documenting schema |

## Try It: Build a Permission System

Create `approval-workflow.orb`:

```json
{
  "name": "ApprovalWorkflow",
  "orbitals": [{
    "name": "DocumentApproval",
    "entity": {
      "name": "Document",
      "fields": [
        { "name": "title", "type": "string", "required": true },
        { "name": "content", "type": "string", "required": true },
        { "name": "status", "type": "enum", "values": ["draft", "pending", "approved", "rejected"] },
        { "name": "authorId", "type": "string", "required": true },
        { "name": "isConfidential", "type": "boolean", "default": false }
      ]
    },
    "traits": [{
      "name": "DocumentWorkflow",
      "linkedEntity": "Document",
      "stateMachine": {
        "states": [
          { "name": "draft", "isInitial": true },
          { "name": "pending" },
          { "name": "approved" },
          { "name": "rejected" }
        ],
        "events": ["SUBMIT", "APPROVE", "REJECT", "EDIT"],
        "transitions": [
          {
            "from": "draft",
            "to": "pending",
            "event": "SUBMIT",
            "guard": ["=", "@entity.authorId", "@user.id"]
          },
          {
            "from": "pending",
            "to": "approved",
            "event": "APPROVE",
            "guard": ["and",
              [">=", "@user.roleLevel", 5],
              ["or",
                ["not", "@entity.isConfidential"],
                [">=", "@user.roleLevel", 7]
              ]
            ]
          },
          {
            "from": "pending",
            "to": "rejected",
            "event": "REJECT",
            "guard": [">=", "@user.roleLevel", 5]
          },
          {
            "from": "rejected",
            "to": "draft",
            "event": "EDIT",
            "guard": ["=", "@entity.authorId", "@user.id"]
          }
        ]
      }
    }],
    "pages": [{ "name": "DocumentsPage", "path": "/documents" }]
  }]
}
```

This creates:
- Only authors can submit their documents
- Level 5+ can approve/reject
- Confidential documents need Level 7+
- Authors can edit rejected documents

## Advanced: Dynamic Guards

Guards can reference external data:

```json
{
  "guard": ["and",
    [">=", "@user.creditScore", 700],
    ["<", "@entity.loanAmount", ["*", "@user.annualIncome", 0.3]],
    ["not", ["contains", "@user.blacklist", "@entity.merchantId"]]
  ]
}
```

The guard references:
- User's credit score
- User's annual income (for loan limit)
- User's blacklist

All resolved at evaluation time.

## The Takeaway

Guards bring **declarative authorization** to state machines:

- ✅ Logic centralized in schema
- ✅ Automatically applied frontend and backend
- ✅ Self-documenting permission rules
- ✅ Composable boolean expressions
- ✅ Type-safe binding references

Stop scattering authorization logic across your app. Define it once, enforce it everywhere.

Learn more about [guards and effects](https://orb.almadar.io/docs/traits).
