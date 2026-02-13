/**
 * Error boundary utilities for wrapping functions to catch and log errors.
 */

/**
 * Wrap a synchronous function to catch and log errors, returning a fallback value.
 */
export function safeCall<T>(fn: () => T, fallback: T, context?: string): T {
  try {
    return fn();
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: intentional error logging
    console.error(context ? `[${context}]` : "[safeCall]", error);
    return fallback;
  }
}

/**
 * Wrap an async function to catch and log errors, returning a fallback value.
 */
export async function safeCallAsync<T>(
  fn: () => Promise<T>,
  fallback: T,
  context?: string,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: intentional error logging
    console.error(context ? `[${context}]` : "[safeCallAsync]", error);
    return fallback;
  }
}

/**
 * Create a wrapped version of a callback that won't throw.
 */
export function safeFn<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context?: string,
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  return (...args: Parameters<T>) => {
    try {
      return fn(...args) as ReturnType<T>;
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: intentional error logging
      console.error(context ? `[${context}]` : "[safeFn]", error);
      return undefined;
    }
  };
}
