# Generating Schemas with an LLM

Almadar schemas are structured JSON — and that structure makes them ideal targets for LLM generation. You describe your application in plain language; the LLM outputs a valid `.orb` schema.

This tutorial covers:
- Installing and using the Almadar skill
- Prompting an LLM to generate a complete schema
- Validating the output
- Fixing the most common mistakes LLMs make

<OrbitalDiagram />

---

## The Almadar Skill

The `@almadar/skills` package includes a Claude Code skill that teaches the LLM the full Almadar language specification — orbitals, entities, traits, state machines, patterns, S-expressions, and more.

### Install

```bash
npm install -g @almadar/skills
```

Then install the Claude Code skill:

```bash
almadar-skills install almadar-orbitals
```

Or use it directly in Claude Code by referencing the skill file in your session.

---

## The Generation Workflow

```
1. Describe your application in plain language
       ↓
2. LLM decomposes it into orbitals (one per entity domain)
       ↓
3. LLM generates: entity + traits + state machines + pages
       ↓
4. Validate: almadar validate schema.orb
       ↓
5. Fix any errors, iterate
       ↓
6. Run: almadar dev
```

---

## How to Prompt for a Schema

### The Decomposition Prompt

Start by asking the LLM to decompose your application into orbitals before writing JSON:

```
I want to build a project management app with:
- Projects (name, description, status: active/archived)
- Tasks (title, priority, assignee, due date, linked to a project)
- Users (name, email, role: admin/member)

Tasks can be created, edited, deleted, and moved through states:
todo → in progress → review → done.

When a task is completed, the project's completed task count should update.

Please decompose this into Almadar orbitals and generate a complete schema.
```

### What to Include in Your Prompt

A good generation prompt covers:

| Element | Example |
|---------|---------|
| **Entities** | "Tasks have title, priority (low/medium/high), due date, assignee" |
| **Persistence** | "Tasks are persistent (stored in DB), cart is runtime (session only)" |
| **Workflows** | "Tasks move from todo → in progress → review → done" |
| **UI behaviors** | "Users can list, create, edit, and delete tasks on a /tasks page" |
| **Business rules** | "Only the assignee can mark a task as done" |
| **Connections** | "When a task is completed, update the project's counter" |
| **Pages needed** | "I need /tasks, /projects, and /users routes" |

---

## What the LLM Should Produce

For each orbital, the LLM should output all four required parts:

```json
{
  "name": "AppName",
  "version": "1.0.0",
  "orbitals": [
    {
      "name": "OrbitalName",
      "entity": {
        "name": "EntityName",
        "persistence": "persistent",
        "collection": "collection_name",
        "fields": [...]
      },
      "traits": [
        {
          "name": "TraitName",
          "linkedEntity": "EntityName",
          "category": "interaction",
          "stateMachine": {
            "states": [...],
            "events": [...],
            "transitions": [...]
          }
        }
      ],
      "pages": [
        {
          "name": "PageName",
          "path": "/route",
          "traits": [{ "ref": "TraitName", "linkedEntity": "EntityName" }]
        }
      ]
    }
  ]
}
```

---

## The Most Common LLM Mistakes

LLMs that don't have the Almadar skill loaded will make predictable mistakes. Learn to spot them.

### 1. Missing `pages` (most common)

The LLM generates entity + traits but forgets the pages array entirely.

```json
// ❌ Incomplete — no pages
{
  "name": "TaskManager",
  "orbitals": [{
    "name": "Tasks",
    "entity": { ... },
    "traits": [ { "name": "TaskCRUD", ... } ]
  }]
}

// ✅ Add pages
{
  "name": "TaskManager",
  "orbitals": [{
    "name": "Tasks",
    "entity": { ... },
    "traits": [ { "name": "TaskCRUD", ... } ],
    "pages": [
      { "name": "TaskListPage", "path": "/tasks", "traits": [{ "ref": "TaskCRUD", "linkedEntity": "Task" }] }
    ]
  }]
}
```

**Fix prompt:** `"The schema is missing the pages array for each orbital. Please add pages with path and traits[].ref for every orbital."`

---

### 2. States as strings instead of objects

```json
// ❌ Wrong
"states": ["Pending", "InProgress", "Done"]

// ✅ Correct
"states": [
  { "name": "Pending", "isInitial": true },
  { "name": "InProgress" },
  { "name": "Done", "isTerminal": true }
]
```

**Fix prompt:** `"States must be objects with a 'name' property. The initial state needs 'isInitial': true. Terminal states need 'isTerminal': true."`

---

### 3. Missing INIT transition

The page loads but renders nothing because there's no INIT self-loop with `render-ui`.

```json
// ❌ No INIT — page is blank
"transitions": [
  { "from": "Pending", "event": "COMPLETE", "to": "Done", "effects": [...] }
]

// ✅ Add INIT
"transitions": [
  {
    "from": "Pending", "event": "INIT", "to": "Pending",
    "effects": [
      ["fetch", "Task"],
      ["render-ui", "main", { "type": "entity-table", "entity": "Task" }]
    ]
  },
  { "from": "Pending", "event": "COMPLETE", "to": "Done", "effects": [...] }
]
```

**Fix prompt:** `"Every interaction trait needs an INIT transition (self-loop) that fires render-ui to render the initial UI. Without it the page will be blank."`

---

### 4. Using deprecated action props

```json
// ❌ Deprecated — these will fail validation
{ "type": "form-section", "onSubmit": "SAVE", "onCancel": "CANCEL" }

// ✅ Correct
{ "type": "form-section", "submitEvent": "SAVE", "cancelEvent": "CANCEL" }
```

```json
// ❌ Deprecated
{ "type": "page-header", "headerActions": [...] }

// ✅ Correct
{ "type": "page-header", "actions": [...] }
```

---

### 5. Schema-level traits array (wrong structure)

```json
// ❌ Wrong — traits at the root level (legacy format)
{
  "name": "App",
  "traits": [...],
  "pages": [...]
}

// ✅ Correct — traits live inside orbitals
{
  "name": "App",
  "orbitals": [{
    "name": "FeatureName",
    "entity": { ... },
    "traits": [...],
    "pages": [...]
  }]
}
```

---

### 6. Missing `linkedEntity` on trait

```json
// ❌ Missing linkedEntity
{ "name": "TaskCRUD", "category": "interaction", "stateMachine": { ... } }

// ✅ Correct
{ "name": "TaskCRUD", "linkedEntity": "Task", "category": "interaction", "stateMachine": { ... } }
```

---

## Iterative Generation for Large Apps

For applications with more than 3-4 orbitals, generate one orbital at a time:

```
Step 1: "Generate only the TaskManager orbital (entity + traits + pages)"
Step 2: "Now add the ProjectManager orbital that listens to TASK_COMPLETED from TaskManager"
Step 3: "Now add the UserManager orbital for browsing users"
Step 4: "Combine all three orbitals into a single schema"
```

This reduces errors and makes each piece reviewable before assembling.

---

## Validating the Output

Always validate before running:

```bash
almadar validate schema.orb
```

Common validation errors and what they mean:

| Error | Cause |
|-------|-------|
| `Missing initial state` | No state has `"isInitial": true` |
| `Unknown event in transition` | A transition references an event key not in the `events` array |
| `Missing pages` | An orbital has traits but no `pages` array |
| `Invalid pattern type` | The `type` in a `render-ui` effect is not a valid pattern name |
| `Deprecated prop` | Using `onSubmit` instead of `submitEvent`, etc. |
| `Circular dependency` | Two orbitals listen to each other (use a third mediator orbital) |

---

## A Reference Prompt (Copy & Use)

This prompt works well with the Almadar skill installed:

```
Using the Almadar language, generate a complete .orb schema for: [YOUR APP DESCRIPTION]

Requirements:
- Each feature domain becomes one orbital with: entity, traits, pages
- Every trait must have an INIT self-loop transition that renders the initial UI using render-ui
- States must be objects: { "name": "StateName", "isInitial": true }
- Pages must be present with path and traits[].ref wiring
- Use "submitEvent"/"cancelEvent" on form-section (not onSubmit/onCancel)
- Use "actions" on page-header (not headerActions)
- All traits belong inside orbitals — there is no schema-level traits array

Entities needed: [LIST ENTITIES]
Workflows: [DESCRIBE STATE TRANSITIONS]
Pages needed: [LIST ROUTES]
Business rules / permissions: [DESCRIBE GUARDS]
Cross-orbital connections: [DESCRIBE EMITS/LISTENS IF ANY]
```

---

## Next Steps

- [Anatomy of a Complete Orbital](../beginner/complete-orbital.md) — understand what a valid schema looks like
- [UI Patterns & render-ui](../intermediate/ui-patterns.md) — all available pattern types and props
- [Cross-Orbital Communication](../intermediate/cross-orbital.md) — how to describe emits/listens to the LLM
- [Building a Full App](./full-app.md) — a reference example to show the LLM
