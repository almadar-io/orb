/**
 * Builder API Client
 *
 * Talks to the standalone agent server at almadar/agent/.
 * SSE streaming for generation and editing, JSON for validation.
 */

// Agent server URL
const AGENT_BASE =
  typeof window !== 'undefined' &&
  (window as unknown as Record<string, unknown>).__ALMADAR_AGENT_URL__
    ? String((window as unknown as Record<string, unknown>).__ALMADAR_AGENT_URL__)
    : 'https://almadar-agent-server--kflow-b3a39.us-central1.hosted.app';

// ============================================================================
// Types
// ============================================================================

export type BuilderMode = 'neural' | 'llm' | 'auto';

export type BuilderPhase =
  | 'parsing'
  | 'generating'
  | 'validating'
  | 'fixing'
  | 'editing'
  | 'done';

export interface BuilderSSEEvent {
  type: string;
  data: Record<string, unknown>;
}

export interface BuilderStreamResponse {
  success: boolean;
  threadId?: string;
  schema?: string;
  error?: string;
}

export interface BuilderValidateResponse {
  success: boolean;
  errors: Array<{ code: string; message: string }>;
  warnings: Array<{ code: string; message: string }>;
}

// ============================================================================
// SSE Stream Helper
// ============================================================================

async function processSSEStream(
  response: Response,
  onEvent: (event: BuilderSSEEvent) => void,
  signal: AbortSignal,
): Promise<BuilderStreamResponse> {
  const reader = response.body?.getReader();
  if (!reader) return { success: false, error: 'No response body' };

  const decoder = new TextDecoder();
  let buffer = '';
  let threadId: string | undefined;
  let finalSchema: string | undefined;
  let success = false;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (signal.aborted) { reader.cancel(); return { success: false, error: 'Cancelled' }; }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const event: BuilderSSEEvent = JSON.parse(line.slice(6));
          onEvent(event);

          if (event.type === 'start') threadId = event.data.threadId as string | undefined;
          if (event.type === 'schema') finalSchema = event.data.orb as string | undefined;
          if (event.type === 'done') {
            success = (event.data.success as boolean) ?? false;
            if (event.data.schema) finalSchema = event.data.schema as string;
          }
          if (event.type === 'error') {
            return { success: false, threadId, error: event.data.error as string | undefined };
          }
        } catch { /* skip malformed lines */ }
      }
    }
    return { success, threadId, schema: finalSchema };
  } finally {
    reader.releaseLock();
  }
}

// ============================================================================
// API
// ============================================================================

export function generateSchema(
  prompt: string,
  mode: BuilderMode,
  onEvent: (event: BuilderSSEEvent) => void,
  options?: Record<string, unknown>,
): { cancel: () => void; promise: Promise<BuilderStreamResponse> } {
  const controller = new AbortController();
  const promise = (async () => {
    try {
      const res = await fetch(`${AGENT_BASE}/api/agent/builder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, mode, options }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        return { success: false, error: err.error || 'Request failed' } as BuilderStreamResponse;
      }
      return processSSEStream(res, onEvent, controller.signal);
    } catch (e) {
      if ((e as Error).name === 'AbortError') return { success: false, error: 'Cancelled' } as BuilderStreamResponse;
      return { success: false, error: (e as Error).message } as BuilderStreamResponse;
    }
  })();
  return { cancel: () => controller.abort(), promise };
}

export async function validateSchema(schema: string): Promise<BuilderValidateResponse> {
  try {
    const res = await fetch(`${AGENT_BASE}/api/agent/builder/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schema }),
    });
    if (!res.ok) return { success: false, errors: [{ code: 'HTTP', message: `HTTP ${res.status}` }], warnings: [] };
    return res.json();
  } catch (e) {
    return { success: false, errors: [{ code: 'NETWORK', message: (e as Error).message }], warnings: [] };
  }
}

export function editSchema(
  schema: string,
  instruction: string,
  onEvent: (event: BuilderSSEEvent) => void,
): { cancel: () => void; promise: Promise<BuilderStreamResponse> } {
  const controller = new AbortController();
  const promise = (async () => {
    try {
      const res = await fetch(`${AGENT_BASE}/api/agent/builder/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema, instruction }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        return { success: false, error: err.error || 'Request failed' } as BuilderStreamResponse;
      }
      return processSSEStream(res, onEvent, controller.signal);
    } catch (e) {
      if ((e as Error).name === 'AbortError') return { success: false, error: 'Cancelled' } as BuilderStreamResponse;
      return { success: false, error: (e as Error).message } as BuilderStreamResponse;
    }
  })();
  return { cancel: () => controller.abort(), promise };
}
