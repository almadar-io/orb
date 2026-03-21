---
slug: state-sync-browser-tabs
image: /img/blog/state-sync-browser-tabs.png
title: "State Sync Across Browser Tabs: The Hardest Problem We Solved (That You Didn't Know You Needed)"
authors: [osamah]
tags: [architecture]
---

![State Synchronization Across Browser Tabs: The Orbital Approach](/img/blog/state-sync-browser-tabs.png)

How we keep state perfectly synchronized across multiple tabs without WebSockets or complex backend logic.

Ever had two tabs of the same app open and they got out of sync? We fixed that at the framework level.

<!-- truncate -->

## The Multi-Tab Problem

You're using an app. You open a second tab. You make changes in the first tab. The second tab doesn't update.

**Common scenarios:**
- Tab 1: Editing a document
- Tab 2: Same document, old version
- Result: Conflict when you save

Or:
- Tab 1: Completed a task
- Tab 2: Task still shows as pending
- Result: Confusion, duplicate actions

Most apps ignore this. Almadar solves it.

## Why This Is Hard

Synchronizing state across tabs requires:

1. **Change Detection** — Know when state changes
2. **Transport** — Send changes between tabs
3. **Conflict Resolution** — Handle simultaneous edits
4. **Versioning** — Track which state is newest
5. **Performance** — Don't overwhelm with updates

## How Almadar Does It

### Architecture Overview

```
Tab 1 (Client A)          Transport           Tab 2 (Client B)
     │                          │                    │
     │ notifyStateChange()      │                    │
     │──────────┐               │                    │
     │          ▼               │                    │
     │  StateSyncManager        │  WebSocket/SSE     │
     │          │               │◄──────────────────►│
     │          │ stateChange   │                    │
     │          └──────────────►│                    │
     │                          │   broadcast        │
     │                          │────────────────────►│
     │                          │                    │
     │                          │    receiveRemoteChange()
     │                          │                    │
     │                          │◄───────────────────┘
     │                          │                    │
     │         conflict?        │                    │
     │◄─────────────────────────┤                    │
```

### The StateSyncManager

```typescript
// Internal: Almadar's state synchronization system
const syncManager = new StateSyncManager({
  clientId: 'browser-tab-1',
  conflictStrategy: 'last_write_wins',
  throttleInterval: 100, // ms
  maxRetries: 3,
});
```

### Step 1: Notify Local Changes

When state changes in Tab 1:

```typescript
// User creates a checkpoint
syncManager.notifyStateChange('checkpoint_created', threadId, {
  checkpointId: 'chk_123',
  step: 5,
  timestamp: Date.now(),
});
```

This creates a **StateChangeEvent**:

```typescript
interface StateChangeEvent {
  type: StateChangeType;
  threadId: string;
  userId?: string;
  timestamp: number;
  payload: Record<string, unknown>;
  version: VersionVector;
  sourceClientId: string;
}
```

### Step 2: Version Vectors

Every change has a **version vector** for conflict detection:

```typescript
interface VersionVector {
  timestamp: number;  // Logical time
  sequence: number;   // Monotonic counter
  nodeId: string;     // Client identifier
}
```

Example:
```typescript
{
  timestamp: 1709312400000,
  sequence: 42,
  nodeId: 'browser-tab-1'
}
```

### Step 3: Transport Layer

The server handles transport via WebSocket:

```typescript
// Server-side WebSocket setup
io.on('connection', (socket) => {
  const userId = socket.data.user.uid;
  const clientId = socket.handshake.auth.clientId;
  
  // Join user's room for targeted updates
  socket.join(`user:${userId}`);
  
  // Forward state changes to other tabs
  socket.on('stateChange', (event) => {
    socket.to(`user:${userId}`).emit('remoteChange', event);
  });
});
```

### Step 4: Receive Remote Changes

Tab 2 receives the change:

```typescript
syncManager.on('remoteChange', (event) => {
  // Apply the change to local state
  updateLocalState(event.type, event.payload);
  
  // Update UI
  refreshUI();
});
```

### Step 5: Conflict Resolution

If both tabs edit simultaneously:

```typescript
// Tab 1 changes status at T1
syncManager.notifyStateChange('status_changed', threadId, {
  status: 'approved'
});

// Tab 2 changes status at T2 (slightly later)
syncManager.notifyStateChange('status_changed', threadId, {
  status: 'rejected'
});
```

Strategies:

| Strategy | How It Works | Best For |
|----------|--------------|----------|
| **last_write_wins** | Latest timestamp wins | Most cases |
| **merge** | Combine changes if possible | Collaborative editing |
| **manual** | Alert user to resolve | Critical data |

```typescript
const syncManager = new StateSyncManager({
  conflictStrategy: 'last_write_wins',
});

// Handle conflicts
syncManager.on('conflictDetected', (conflicts, incoming) => {
  // Show conflict resolution UI
  showConflictDialog(conflicts);
});
```

## Complete Example

### Client-Side Setup

```typescript
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Internal: getStateSyncManager() returns the singleton sync manager

export function useStateSync(threadId: string | null) {
  const syncManagerRef = useRef(getStateSyncManager());
  
  useEffect(() => {
    if (!threadId) return;
    
    // Connect to sync server
    const socket = io('/state-sync', {
      auth: { 
        token: getAuthToken(),
        clientId: syncManagerRef.current.getConfig().clientId,
      },
    });
    
    // Receive changes from other tabs
    socket.on('remoteChange', (event) => {
      syncManagerRef.current.receiveRemoteChange(event);
    });
    
    // Handle conflicts
    syncManagerRef.current.on('conflictDetected', (conflicts) => {
      console.warn('State conflict:', conflicts);
      // Show UI for manual resolution
    });
    
    // Send local changes
    syncManagerRef.current.on('syncRequired', (changes) => {
      changes.forEach(change => {
        socket.emit('stateChange', change);
      });
    });
    
    return () => {
      socket.disconnect();
    };
  }, [threadId]);
  
  return syncManagerRef.current;
}
```

### React Component Usage

```tsx
function TaskBoard({ threadId }: { threadId: string }) {
  const syncManager = useStateSync(threadId);
  const [tasks, setTasks] = useState([]);
  
  const moveTask = (taskId: string, newStatus: string) => {
    // Update local state
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    ));
    
    // Notify other tabs
    syncManager.notifyStateChange('task_moved', threadId, {
      taskId,
      newStatus,
    });
  };
  
  // Listen for remote changes
  useEffect(() => {
    const handleRemoteChange = (event: StateChangeEvent) => {
      if (event.type === 'task_moved') {
        setTasks(prev => prev.map(t => 
          t.id === event.payload.taskId 
            ? { ...t, status: event.payload.newStatus }
            : t
        ));
      }
    };
    
    syncManager.on('remoteChange', handleRemoteChange);
    return () => {
      syncManager.off('remoteChange', handleRemoteChange);
    };
  }, [syncManager]);
  
  return (
    <div>
      {tasks.map(task => (
        <TaskCard 
          key={task.id} 
          task={task}
          onMove={moveTask}
        />
      ));
    }
    </div>
  );
}
```

## State Change Types

Almadar syncs these event types:

```typescript
type StateChangeType =
  | 'checkpoint_created'
  | 'checkpoint_updated'
  | 'session_started'
  | 'session_ended'
  | 'tool_executed'
  | 'memory_updated'
  | 'interrupt_triggered'
  | 'interrupt_resolved';
```

Each maps to a specific UI update.

## Real-World Example: AI Pair Programming

**Scenario:** You're pair programming with an AI across two tabs.

**Tab 1:** You watch the AI work
**Tab 2:** You review documentation

**Without sync:**
- Tab 1: AI creates a checkpoint
- Tab 2: Still shows old state
- You switch to Tab 2, make changes
- Conflict when you return to Tab 1

**With Almadar sync:**
- Tab 1: AI creates a checkpoint
- Tab 2: Automatically updates to show new checkpoint
- Both tabs in sync
- No conflicts

## Performance Optimizations

### 1. Throttling

Don't sync every keystroke:

```typescript
const syncManager = new StateSyncManager({
  throttleInterval: 100, // Batch changes within 100ms
});
```

### 2. Debouncing

For high-frequency updates:

```typescript
// Internal: debounce utility for high-frequency sync events
const debouncedNotify = debounceSync(syncManager, 500);

// Called on every keystroke
debouncedNotify('document_edited', threadId, { content });
// Actually sends after 500ms of inactivity
```

### 3. Selective Sync

Only sync what matters:

```typescript
// Sync this (important state)
syncManager.notifyStateChange('checkpoint_created', threadId, payload);

// Don't sync this (transient UI state)
// (just local React state)
```

## Comparison: Before vs After

### Before State Sync

| Action | Tab 1 | Tab 2 |
|--------|-------|-------|
| Initial | Shows Task A | Shows Task A |
| Edit in Tab 1 | Task A updated | Task A (old) |
| Edit in Tab 2 | - | Task A (conflict!) |
| Result | Conflict | Conflict |

### After State Sync

| Action | Tab 1 | Tab 2 |
|--------|-------|-------|
| Initial | Shows Task A | Shows Task A |
| Edit in Tab 1 | Task A updated | Task A auto-updates |
| Edit in Tab 2 | Auto-updates | Task B updated |
| Result | In sync | In sync |

## Real-World Analogy: Google Docs

Google Docs solved this for documents:
- Multiple people editing
- Changes appear in real-time
- Conflicts resolved automatically

Almadar brings that to **any application state**:
- Checkpoints
- Session progress
- Memory updates
- UI state

## The Takeaway

Multi-tab sync is hard. Most apps ignore it. Users suffer.

Almadar's StateSyncManager:
- ✅ Works at the framework level
- ✅ Handles conflicts intelligently
- ✅ Optimized for performance
- ✅ Transparent to developers

Because your users shouldn't have to think about which tab they're in.

Learn more about [State Synchronization](./three-execution-models).
