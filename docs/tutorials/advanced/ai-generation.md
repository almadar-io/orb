import { AvlOrbitalUnit } from '@almadar/ui/illustrations';

# Generating Schemas with an LLM

The .orb language has a clear, regular structure that makes it an ideal target for LLM generation. You describe your application in plain language; the LLM outputs a valid `.lolo` program.

This tutorial covers:
- Installing and using the Orb skill
- Prompting an LLM to generate a complete schema
- Validating the output
- Fixing the most common mistakes LLMs make

<div style={{margin: '2rem 0'}}>
<AvlOrbitalUnit
  entityName="EntityName"
  fields={4}
  traits={[{ name: 'TraitName' }]}
  pages={[{ name: 'PageName' }]}
  animated
/>
</div>

---

## The Orb Skill

The `@almadar/skills` package includes a Claude Code skill that teaches the LLM the full Orb language specification: orbitals, entities, traits, state machines, patterns, S-expressions, and more.

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
4. Validate: orb validate schema.orb
       ↓
5. Fix any errors, iterate
       ↓
6. Run: orb dev
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

Please decompose this into Orb orbitals and generate a complete schema.
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

```lolo
orbital OrbitalName {
  entity EntityName [persistent: collection_name] {
    ;; fields...
  }
  trait TraitName -> EntityName [interaction] {
    initial: SomeState
    state SomeState {
      INIT -> SomeState
        (fetch EntityName)
        (render-ui main { type: "entity-table", entity: "EntityName" })
    }
  }
  page "/route" -> TraitName
}
```

---

## The Most Common LLM Mistakes

LLMs that don't have the Orb skill loaded will make predictable mistakes. Learn to spot them.

### 1. Missing `pages` (most common)

The LLM generates entity + traits but forgets the page declaration entirely.

```lolo
;; ❌ Incomplete — no page
orbital Tasks {
  entity Task [persistent: tasks] { ... }
  trait TaskCRUD -> Task [interaction] { ... }
}

;; ✅ Add a page declaration
orbital Tasks {
  entity Task [persistent: tasks] { ... }
  trait TaskCRUD -> Task [interaction] { ... }
  page "/tasks" -> TaskCRUD
}
```

**Fix prompt:** `"The schema is missing a page declaration for each orbital. Please add page \"/path\" -> TraitName for every orbital."`

---

### 2. States as strings instead of blocks

```lolo
;; ❌ Not valid lolo
;; states: ["Pending", "InProgress", "Done"]

;; ✅ Correct — each state is a named block; initial: marks the entry point
initial: Pending
state Pending { }
state InProgress { }
state Done { }
```

**Fix prompt:** `"In lolo, states are named blocks declared with the state keyword. Use initial: StateName to mark the entry point. There is no array of state names."`

---

### 3. Missing INIT transition

The page loads but renders nothing because there's no INIT self-loop with `render-ui`.

```lolo
;; ❌ No INIT — page is blank
state Pending {
  COMPLETE -> Done
    (persist update Task @entity)
}

;; ✅ Add INIT
state Pending {
  INIT -> Pending
    (fetch Task)
    (render-ui main { type: "entity-table", entity: "Task" })
  COMPLETE -> Done
    (persist update Task @entity)
}
```

**Fix prompt:** `"Every interaction trait needs an INIT transition (self-loop) that fires render-ui to render the initial UI. Without it the page will be blank."`

---

### 4. Using deprecated action props

```lolo
;; ❌ Deprecated — these will fail validation
(render-ui main { type: "form-section", onSubmit: "SAVE", onCancel: "CANCEL" })

;; ✅ Correct
(render-ui main { type: "form-section", submitEvent: "SAVE", cancelEvent: "CANCEL" })
```

```lolo
;; ❌ Deprecated
(render-ui main { type: "page-header", headerActions: [...] })

;; ✅ Correct
(render-ui main { type: "page-header", actions: [...] })
```

---

### 5. Traits outside orbitals (wrong structure)

```lolo
;; ❌ Wrong — traits must live inside an orbital block
trait TaskCRUD -> Task [interaction] { ... }
page "/tasks" -> TaskCRUD

;; ✅ Correct — traits and pages belong inside the orbital
orbital FeatureName {
  entity Task [persistent: tasks] { ... }
  trait TaskCRUD -> Task [interaction] { ... }
  page "/tasks" -> TaskCRUD
}
```

---

### 6. Missing entity binding on trait

In lolo, the entity a trait operates on is declared inline with `->`. Omitting it is a syntax error:

```lolo
;; ❌ Missing entity binding — not valid lolo
trait TaskCRUD [interaction] { ... }

;; ✅ Correct — entity name follows ->
trait TaskCRUD -> Task [interaction] { ... }
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
orb validate schema.orb
```

Common validation errors and what they mean:

| Error | Cause |
|-------|-------|
| `Missing initial state` | No `initial: StateName` declaration in the trait |
| `Unknown event in transition` | A transition event name is never used in a reachable state |
| `Missing pages` | An orbital has traits but no `page "/path" -> TraitName` line |
| `Invalid pattern type` | The `type` in a `render-ui` effect is not a valid pattern name |
| `Deprecated prop` | Using `onSubmit` instead of `submitEvent`, etc. |
| `Circular dependency` | Two orbitals listen to each other (use a third mediator orbital) |

---

## A Reference Prompt (Copy & Use)

This prompt works well with the Orb skill installed:

```
Using the lolo language, generate a complete .lolo program for: [YOUR APP DESCRIPTION]

Requirements:
- Each feature domain becomes one orbital block containing: entity, trait(s), page
- Every interaction trait must have an INIT self-loop transition that fires render-ui
- States are named blocks declared with the state keyword; use initial: StateName
- Every orbital must have a page "/path" -> TraitName declaration
- Traits are bound to their entity with ->: trait Name -> Entity [interaction]
- Use "submitEvent"/"cancelEvent" on form-section (not onSubmit/onCancel)
- Use "actions" on page-header (not headerActions)
- All traits and pages belong inside orbital blocks

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
