/**
 * Live-push SSE channel — placeholder
 *
 * Compiler generates the real SSE module here (connection registry +
 * cross-client broadcast; see orbital-shell-typescript backend/server/sse.rs).
 * This stub only lets the template build standalone; an emitted app
 * overwrites it wholesale.
 */

export interface BusBroadcastItem {
  type: 'bus';
  event: string;
  payload?: object;
  source: { orbital: string; trait: string };
  timestamp: number;
}

export function broadcastBusEvent(_originClientId: string | undefined, _item: BusBroadcastItem): void {
  // {{GENERATED_SSE_BROADCAST}}
}
