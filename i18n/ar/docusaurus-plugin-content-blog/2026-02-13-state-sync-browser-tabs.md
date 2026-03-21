---
slug: state-sync-browser-tabs
image: /img/blog/state-sync-browser-tabs.png
title: "مزامنة الحالة عبر علامات تبويب المتصفح: أصعب مشكلة قمنا بحلها (ولم تكن تعلم أنك بحاجة لحلها)"
authors: [osamah]
tags: [architecture]
---

![مزامنة الحالة عبر علامات تبويب المتصفح: نهج Almadar](/img/blog/state-sync-browser-tabs.png)

كيف نحافظ على مزامنة مثالية للحالة عبر علامات تبويب متعددة من دون WebSockets أو منطق خلفي معقد.

هل سبق أن فتحت علامتي تبويب لنفس التطبيق وفقدتا التزامن؟ لقد حللنا هذه المشكلة على مستوى إطار العمل.

<!-- truncate -->

## مشكلة تعدد علامات التبويب

لنفترض أنك تستخدم تطبيقاً. تفتح علامة تبويب ثانية. تجري تغييرات في علامة التبويب الأولى، لكن علامة التبويب الثانية لا تتحدث.

**سيناريوهات شائعة:**
- علامة التبويب 1: تحرير مستند
- علامة التبويب 2: نفس المستند، نسخة قديمة
- النتيجة: تعارض عند الحفظ

أو:
- علامة التبويب 1: أكملت مهمة
- علامة التبويب 2: المهمة لا تزال تظهر كمعلقة
- النتيجة: ارتباك، إجراءات مكررة

تتجاهل معظم التطبيقات هذا الأمر، بينما يقوم Almadar بحله.

## لماذا يعد هذا صعباً

مزامنة الحالة عبر علامات التبويب تتطلب:

1. **اكتشاف التغييرات** — معرفة متى تتغير الحالة
2. **النقل** — إرسال التغييرات بين علامات التبويب
3. **حل التعارضات** — التعامل مع التعديلات المتزامنة
4. **تتبع الإصدارات** — معرفة أي حالة هي الأحدث
5. **الأداء** — عدم إغراق النظام بالتحديثات

## كيف يقوم Almadar بذلك

### نظرة عامة على البنية

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

### مدير مزامنة الحالة (StateSyncManager)

```typescript
// Internal: Almadar's state synchronization system
const syncManager = new StateSyncManager({
  clientId: 'browser-tab-1',
  conflictStrategy: 'last_write_wins',
  throttleInterval: 100, // ms
  maxRetries: 3,
});
```

### الخطوة 1: الإشعار بالتغييرات المحلية

عندما تتغير الحالة في علامة التبويب 1:

```typescript
// User creates a checkpoint
syncManager.notifyStateChange('checkpoint_created', threadId, {
  checkpointId: 'chk_123',
  step: 5,
  timestamp: Date.now(),
});
```

هذا يُنشئ **StateChangeEvent (حدث تغيير الحالة)**:

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

### الخطوة 2: متجهات الإصدارات

كل تغيير يحتوي على **version vector (متجه إصدار)** لاكتشاف التعارضات:

```typescript
interface VersionVector {
  timestamp: number;  // Logical time
  sequence: number;   // Monotonic counter
  nodeId: string;     // Client identifier
}
```

مثال:
```typescript
{
  timestamp: 1709312400000,
  sequence: 42,
  nodeId: 'browser-tab-1'
}
```

### الخطوة 3: طبقة النقل

الخادم يتعامل مع النقل عبر WebSocket:

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

### الخطوة 4: استقبال التغييرات البعيدة

علامة التبويب 2 تستقبل التغيير:

```typescript
syncManager.on('remoteChange', (event) => {
  // Apply the change to local state
  updateLocalState(event.type, event.payload);

  // Update UI
  refreshUI();
});
```

### الخطوة 5: حل التعارضات

إذا عدّلت كلتا علامتي التبويب في نفس الوقت:

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

الاستراتيجيات:

| الاستراتيجية | كيف تعمل | الأفضل لـ |
|----------|--------------|----------|
| **آخر كتابة تفوز** | أحدث طابع زمني يفوز | معظم الحالات |
| **الدمج** | دمج التغييرات إن أمكن | التحرير التعاوني |
| **يدوي** | تنبيه المستخدم للحل | البيانات الحرجة |

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

## مثال كامل

### إعداد جانب العميل

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

### استخدام مكون React

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

## أنواع تغييرات الحالة

Almadar يزامن أنواع الأحداث التالية:

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

كل نوع يُعيَّن لتحديث واجهة مستخدم محدد.

## مثال واقعي: البرمجة الزوجية مع الذكاء الاصطناعي

**السيناريو:** أنت تبرمج مع ذكاء اصطناعي عبر علامتي تبويب.

**علامة التبويب 1:** تشاهد الذكاء الاصطناعي يعمل
**علامة التبويب 2:** تراجع التوثيق

**بدون المزامنة:**
- علامة التبويب 1: الذكاء الاصطناعي يُنشئ نقطة حفظ
- علامة التبويب 2: لا تزال تعرض الحالة القديمة
- تنتقل إلى علامة التبويب 2، تجري تغييرات
- تعارض عند العودة إلى علامة التبويب 1

**مع مزامنة Almadar:**
- علامة التبويب 1: الذكاء الاصطناعي يُنشئ نقطة حفظ
- علامة التبويب 2: تتحدث تلقائيًا لعرض نقطة الحفظ الجديدة
- كلتا علامتي التبويب متزامنتان
- لا تعارضات

## تحسينات الأداء

### 1. الخنق (Throttling)

لا تزامن كل ضغطة مفتاح:

```typescript
const syncManager = new StateSyncManager({
  throttleInterval: 100, // Batch changes within 100ms
});
```

### 2. التأخير (Debouncing)

للتحديثات عالية التردد:

```typescript
// Internal: debounce utility for high-frequency sync events
const debouncedNotify = debounceSync(syncManager, 500);

// Called on every keystroke
debouncedNotify('document_edited', threadId, { content });
// Actually sends after 500ms of inactivity
```

### 3. المزامنة الانتقائية

زامن فقط ما يهم:

```typescript
// Sync this (important state)
syncManager.notifyStateChange('checkpoint_created', threadId, payload);

// Don't sync this (transient UI state)
// (just local React state)
```

## المقارنة: قبل وبعد

### قبل مزامنة الحالة

| الإجراء | علامة التبويب 1 | علامة التبويب 2 |
|--------|-------|-------|
| البداية | تعرض المهمة أ | تعرض المهمة أ |
| تعديل في علامة التبويب 1 | المهمة أ مُحدّثة | المهمة أ (قديمة) |
| تعديل في علامة التبويب 2 | - | المهمة أ (تعارض!) |
| النتيجة | تعارض | تعارض |

### بعد مزامنة الحالة

| الإجراء | علامة التبويب 1 | علامة التبويب 2 |
|--------|-------|-------|
| البداية | تعرض المهمة أ | تعرض المهمة أ |
| تعديل في علامة التبويب 1 | المهمة أ مُحدّثة | المهمة أ تتحدث تلقائيًا |
| تعديل في علامة التبويب 2 | تتحدث تلقائيًا | المهمة ب مُحدّثة |
| النتيجة | متزامنة | متزامنة |

## تشبيه واقعي: مستندات Google

حلّت مستندات Google هذه المشكلة للمستندات:
- عدة أشخاص يحررون
- التغييرات تظهر في الوقت الفعلي
- التعارضات تُحل تلقائيًا

Almadar يجلب ذلك إلى **أي حالة تطبيق**:
- نقاط الحفظ
- تقدم الجلسة
- تحديثات الذاكرة
- حالة واجهة المستخدم

## الخلاصة

مزامنة تعدد علامات التبويب صعبة. معظم التطبيقات تتجاهلها. المستخدمون يعانون.

الـ StateSyncManager في Almadar:
- يعمل على مستوى إطار العمل
- يتعامل مع التعارضات بذكاء
- مُحسّن للأداء
- شفاف للمطورين

لأن مستخدميك لا ينبغي أن يفكروا في أي علامة تبويب هم فيها.

تعرف على المزيد حول [مزامنة الحالة](./three-execution-models).
