---
slug: ai-orbital-memory
title: "Modeling Memory with .orb"
authors: [osamah]
tags: [architecture, ai]
image: /img/blog/ai-orbital-memory.png
---
import { AvlOrbitalUnit } from '@almadar/ui/illustrations';

An AI agent needs memory. Most approaches reach for vector databases and similarity search. In .orb, memory is just another Orbital Unit with entities, traits, and state machines.

<!-- truncate -->

## Memory as an Orbital Unit

In .orb, everything is an Orbital Unit: an entity (data shape), traits (state machine behaviors), and pages (routes). Memory fits this model naturally. A memory system has structured data (what to remember), state transitions (when to record and retrieve), and UI (how to surface context).

Here is the Orbital Unit for an agent memory system:

<div style={{margin: '2rem 0'}}>
<AvlOrbitalUnit
  entityName="AgentMemory"
  fields={8}
  traits={[{name: "RecallTrait"}, {name: "RecordTrait"}]}
  pages={[{name: "MemoryInspector"}]}
  animated
/>
</div>

## The Entity: What Gets Remembered

The `AgentMemory` entity captures structured fields rather than raw text chunks:

```json
{
  "name": "AgentMemory",
  "fields": [
    { "name": "sessionId", "type": "string", "required": true },
    { "name": "prompt", "type": "string", "required": true },
    { "name": "patterns", "type": "array", "items": { "type": "string" } },
    { "name": "entities", "type": "array", "items": { "type": "string" } },
    { "name": "success", "type": "boolean" },
    { "name": "errorType", "type": "string" },
    { "name": "confidence", "type": "number", "default": 0.5 },
    { "name": "createdAt", "type": "timestamp" }
  ]
}
```

Each memory record is a typed row with queryable fields, not a vector embedding. You can ask "which patterns failed last week?" with a field filter instead of cosine similarity.

## The Trait: Recording and Recalling

The `RecordTrait` manages the lifecycle of a memory entry through a state machine:

```json
{
  "name": "RecordTrait",
  "linkedEntity": "AgentMemory",
  "stateMachine": {
    "states": [
      { "name": "idle", "isInitial": true },
      { "name": "recording" },
      { "name": "stored" },
      { "name": "failed" }
    ],
    "transitions": [
      {
        "from": "idle",
        "to": "recording",
        "event": "SESSION_START",
        "effects": [
          ["set", "@entity.sessionId", "@payload.sessionId"],
          ["set", "@entity.prompt", "@payload.prompt"]
        ]
      },
      {
        "from": "recording",
        "to": "stored",
        "event": "SESSION_COMPLETE",
        "effects": [
          ["set", "@entity.success", true],
          ["set", "@entity.patterns", "@payload.patterns"],
          ["persist", "create", "AgentMemory", "@entity"]
        ]
      },
      {
        "from": "recording",
        "to": "failed",
        "event": "SESSION_ERROR",
        "effects": [
          ["set", "@entity.success", false],
          ["set", "@entity.errorType", "@payload.errorType"],
          ["persist", "create", "AgentMemory", "@entity"]
        ]
      }
    ]
  }
}
```

Every session moves through `idle` to `recording` to either `stored` or `failed`. The state machine enforces that you cannot mark a session complete without first starting it, and every outcome gets persisted.

## The Recall Trait: Querying Memory

The `RecallTrait` handles retrieval. When the agent starts a new session, it queries past memories by structured fields:

```json
{
  "name": "RecallTrait",
  "linkedEntity": "AgentMemory",
  "listens": [
    { "event": "SESSION_START", "triggers": "LOAD_CONTEXT" }
  ],
  "stateMachine": {
    "states": [
      { "name": "waiting", "isInitial": true },
      { "name": "loaded" }
    ],
    "transitions": [
      {
        "from": "waiting",
        "to": "loaded",
        "event": "LOAD_CONTEXT",
        "effects": [
          ["call-service", "queryMemory", {
            "filter": { "success": true },
            "sort": { "createdAt": "desc" },
            "limit": 10
          }]
        ]
      }
    ]
  }
}
```

No embeddings, no similarity thresholds. The recall trait listens for `SESSION_START` (emitted by `RecordTrait`) and loads the 10 most recent successful sessions. The compiler validates that the `emits`/`listens` wiring is complete.

## Why This Beats Vector Search

Vector similarity finds text that looks alike. Structured .orb memory finds records by exact field queries: "all sessions where `success` is false and `patterns` contains `entity-table`." The difference matters when an agent needs to answer questions like "what errors did I hit when building list views?" A vector search would return documents about lists and errors. A field query returns the exact sessions.

The state machine also gives you something vectors cannot: a transition history. You can trace the path from `idle` to `recording` to `failed`, see what error occurred, and correlate it with the patterns used. Temporal reasoning becomes a graph traversal instead of a prompt engineering exercise.

## Composing Memory with Other Orbitals

Because memory is an Orbital Unit, it composes with the rest of your application through events. The `RecordTrait` emits `SESSION_COMPLETE`. A `PreferenceTrait` on a separate `UserPreference` entity can listen for it and update the user's preferred patterns. A `ProjectContextTrait` can listen and add newly created entities to the project registry.

Each unit stays independent. The compiler verifies all event wiring at compile time. No message goes unhandled, no listener references a nonexistent event.

Memory in .orb is not a special subsystem. It follows the same entity-trait-page formula as every other part of your application.
