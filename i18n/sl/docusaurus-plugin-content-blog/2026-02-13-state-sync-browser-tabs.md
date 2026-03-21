---
slug: state-sync-browser-tabs
image: /img/blog/state-sync-browser-tabs.png
title: "Sinhronizacija stanja med browser tabi: Najtežji problem, ki smo ga rešili (ki ga niste vedeli, da potrebujete)"
authors: [osamah]
tags: [architecture]
---

![Sinhronizacija stanja med browser tabi: Orbitalni pristop](/img/blog/state-sync-browser-tabs.png)

Kako ohranjamo stanje popolnoma sinhronizirano med več tabi brez WebSocketov ali kompleksne backend logike.

Ste imeli kdaj dva taba iste aplikacije odprta in sta izgubila sinhronizacijo? Mi smo to popravili na nivoju frameworka.

<!-- truncate -->

## Problem več tabov

Uporabljate aplikacijo. Odprete drugi tab. Naredite spremembe v prvem tabu. Drugi tab se ne posodobi.

**Pogosti scenariji:**
- Tab 1: Urejanje dokumenta
- Tab 2: Isti dokument, stara različica
- Rezultat: Konflikt ob shranjevanju

Ali:
- Tab 1: Opravilo zaključeno
- Tab 2: Opravilo še vedno prikazano kot nedokončano
- Rezultat: Zmeda, podvojene akcije

Večina aplikacij to ignorira. Almadar to reši.

## Zakaj je to težko

Sinhronizacija stanja med tabi zahteva:

1. **Detekcijo sprememb** — Vedeti, kdaj se stanje spremeni
2. **Transport** — Pošiljati spremembe med tabi
3. **Reševanje konfliktov** — Obravnavati sočasna urejanja
4. **Verzioniranje** — Slediti, katero stanje je najnovejše
5. **Performanco** — Ne preobremeniti z posodobitvami

## Kako to deluje v Almadarju

### Arhitekturni pregled

```
Tab 1 (Klient A)          Transport           Tab 2 (Klient B)
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

### StateSyncManager

```typescript
// Internal: Almadar's state synchronization system
const syncManager = new StateSyncManager({
  clientId: 'browser-tab-1',
  conflictStrategy: 'last_write_wins',
  throttleInterval: 100, // ms
  maxRetries: 3,
});
```

### Korak 1: Obvesti o lokalnih spremembah

Ko se stanje spremeni v Tabu 1:

```typescript
// Uporabnik ustvari checkpoint
syncManager.notifyStateChange('checkpoint_created', threadId, {
  checkpointId: 'chk_123',
  step: 5,
  timestamp: Date.now(),
});
```

To ustvari **StateChangeEvent**:

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

### Korak 2: Verzijski vektorji

Vsaka sprememba ima **verzijski vektor** za detekcijo konfliktov:

```typescript
interface VersionVector {
  timestamp: number;  // Logični čas
  sequence: number;   // Monotoni števec
  nodeId: string;     // Identifikator klienta
}
```

Primer:
```typescript
{
  timestamp: 1709312400000,
  sequence: 42,
  nodeId: 'browser-tab-1'
}
```

### Korak 3: Transportni nivo

Server obravnava transport preko WebSocket:

```typescript
// Server-side WebSocket setup
io.on('connection', (socket) => {
  const userId = socket.data.user.uid;
  const clientId = socket.handshake.auth.clientId;
  
  // Pridruži se sobi uporabnika za ciljane posodobitve
  socket.join(`user:${userId}`);
  
  // Posreduj spremembe stanja drugim tabom
  socket.on('stateChange', (event) => {
    socket.to(`user:${userId}`).emit('remoteChange', event);
  });
});
```

### Korak 4: Prejmi oddaljene spremembe

Tab 2 prejme spremembo:

```typescript
syncManager.on('remoteChange', (event) => {
  // Uporabi spremembo na lokalno stanje
  updateLocalState(event.type, event.payload);
  
  // Posodobi UI
  refreshUI();
});
```

### Korak 5: Reševanje konfliktov

Če oba taba urejata hkrati:

```typescript
// Tab 1 spremeni status ob T1
syncManager.notifyStateChange('status_changed', threadId, {
  status: 'approved'
});

// Tab 2 spremeni status ob T2 (nekoliko kasneje)
syncManager.notifyStateChange('status_changed', threadId, {
  status: 'rejected'
});
```

Strategije:

| Strategija | Kako deluje | Najboljše za |
|----------|--------------|----------|
| **last_write_wins** | Zmaga najnovejši timestamp | Večina primerov |
| **merge** | Združi spremembe, če je mogoče | Sodelovalno urejanje |
| **manual** | Opozori uporabnika za rešitev | Kritični podatki |

```typescript
const syncManager = new StateSyncManager({
  conflictStrategy: 'last_write_wins',
});

// Obravnavaj konflikte
syncManager.on('conflictDetected', (conflicts, incoming) => {
  // Pokaži UI za reševanje konfliktov
  showConflictDialog(conflicts);
});
```

## Popoln primer

### Client-Side Setup

```typescript
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Internal: getStateSyncManager() vrne singleton sync manager

export function useStateSync(threadId: string | null) {
  const syncManagerRef = useRef(getStateSyncManager());
  
  useEffect(() => {
    if (!threadId) return;
    
    // Poveži se s sync serverjem
    const socket = io('/state-sync', {
      auth: { 
        token: getAuthToken(),
        clientId: syncManagerRef.current.getConfig().clientId,
      },
    });
    
    // Prejmi spremembe iz drugih tabov
    socket.on('remoteChange', (event) => {
      syncManagerRef.current.receiveRemoteChange(event);
    });
    
    // Obravnavaj konflikte
    syncManagerRef.current.on('conflictDetected', (conflicts) => {
      console.warn('State conflict:', conflicts);
      // Pokaži UI za ročno reševanje
    });
    
    // Pošlji lokalne spremembe
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
    // Posodobi lokalno stanje
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    ));
    
    // Obvesti druge tabe
    syncManager.notifyStateChange('task_moved', threadId, {
      taskId,
      newStatus,
    });
  };
  
  // Poslušaj za oddaljene spremembe
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

## Tipi sprememb stanja

Almadar sinhronizira te tipe dogodkov:

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

Vsak se preslika v specifično UI posodobitev.

## Primer iz resničnega sveta: AI par programiranje

**Scenarij:** Programirate z AI-jem čez dva taba.

**Tab 1:** Gledate AI-ja pri delu
**Tab 2:** Pregledujete dokumentacijo

**Brez sinhronizacije:**
- Tab 1: AI ustvari checkpoint
- Tab 2: Še vedno prikazuje staro stanje
- Preklopite na Tab 2, naredite spremembe
- Konflikt ko se vrnete v Tab 1

**Z Almadar sinhronizacijo:**
- Tab 1: AI ustvari checkpoint
- Tab 2: Samodejno se posodobi za prikaz novega checkpointa
- Oba taba sta sinhronizirana
- Ni konfliktov

## Optimizacije performanse

### 1. Throttling

Ne sinhroniziraj vsakega pritiska tipke:

```typescript
const syncManager = new StateSyncManager({
  throttleInterval: 100, // Združi spremembe znotraj 100ms
});
```

### 2. Debouncing

Za visoko-frekvenčne posodobitve:

```typescript
// Internal: debounce utility for high-frequency sync events
const debouncedNotify = debounceSync(syncManager, 500);

// Klicano ob vsakem pritisku tipke
debouncedNotify('document_edited', threadId, { content });
// Dejansko pošlje po 500ms nedejavnosti
```

### 3. Selektivna sinhronizacija

Sinhroniziraj samo kar je pomembno:

```typescript
// Sinhroniziraj to (pomembno stanje)
syncManager.notifyStateChange('checkpoint_created', threadId, payload);

// Ne sinhroniziraj tega (prehodno UI stanje)
// (samo lokalni React state)
```

## Primerjava: Pred vs Po

### Pred sinhronizacijo stanja

| Akcija | Tab 1 | Tab 2 |
|--------|-------|-------|
| Začetno | Prikaže Nalogo A | Prikaže Nalogo A |
| Uredi v Tabu 1 | Naloga A posodobljena | Naloga A (stara) |
| Uredi v Tabu 2 | - | Naloga A (konflikt!) |
| Rezultat | Konflikt | Konflikt |

### Po sinhronizaciji stanja

| Akcija | Tab 1 | Tab 2 |
|--------|-------|-------|
| Začetno | Prikaže Nalogo A | Prikaže Nalogo A |
| Uredi v Tabu 1 | Naloga A posodobljena | Naloga A samodejno posodobljena |
| Uredi v Tabu 2 | Samodejno posodobljeno | Naloga B posodobljena |
| Rezultat | Sinhronizirano | Sinhronizirano |

## Primerjava iz resničnega sveta: Google Docs

Google Docs je rešil to za dokumente:
- Več ljudi ureja
- Spremembe se pojavijo v realnem času
- Konflikti se rešijo samodejno

Almadar prinaša to v **katero koli stanje aplikacije**:
- Checkpoints
- Napredek seje
- Posodobitve spomina
- UI stanje

## Spoznanje

Sinhronizacija več tabov je težka. Večina aplikacij to ignorira. Uporabniki trpijo.

Almadarjev StateSyncManager:
- ✅ Deluje na nivoju frameworka
- ✅ Pametno obravnava konflikte
- ✅ Optimiziran za performanco
- ✅ Transparenten za razvijalce

Ker vaši uporabniki ne bi smeli razmišljati o tem, v katerem tabu so.

Več o [Sinhronizaciji stanja](./three-execution-models).
