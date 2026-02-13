/**
 * Type-safe event bus for decoupled communication between modules.
 */

type EventCallback<T = undefined> = T extends undefined ? () => void : (data: T) => void;

/** Map of event names to their payload types */
export type EventMap = {
  "code:run": undefined;
  "code:stop": undefined;
  "code:stateChange": { running: boolean };
  "theme:change": { isDark: boolean };
  "console:log": { message: string };
  "console:clear": undefined;
  "console:toggle": undefined;
  "error:show": { message: string };
  "error:hide": undefined;
  "view:change": { mode: "code" | "split" | "output" };
  "font:change": { size: number };
};

class EventBus {
  private listeners = new Map<keyof EventMap, Set<EventCallback<EventMap[keyof EventMap]>>>();

  /**
   * Subscribe to an event. Returns an unsubscribe function.
   */
  on<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback as EventCallback<EventMap[keyof EventMap]>);
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event.
   */
  off<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): void {
    this.listeners.get(event)?.delete(callback as EventCallback<EventMap[keyof EventMap]>);
  }

  /**
   * Emit an event with optional payload.
   */
  emit<K extends keyof EventMap>(
    event: K,
    ...args: EventMap[K] extends void ? [] : [EventMap[K]]
  ): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      for (const cb of callbacks) {
        // Type assertion needed due to union type complexity
        (cb as (data?: unknown) => void)(args[0]);
      }
    }
  }
}

/** Singleton event bus instance */
export const events = new EventBus();
