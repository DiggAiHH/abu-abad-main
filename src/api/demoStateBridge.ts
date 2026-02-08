/**
 * Demo-State-Bridge
 *
 * Löst die zirkuläre Abhängigkeit zwischen api/client.ts und store/authStore.ts.
 * Der AuthStore registriert sich hier, der API-Client liest den Demo-Status.
 */

export interface DemoState {
  isDemo: boolean;
  userId: string;
}

let getDemoStateFn: (() => DemoState) | null = null;

/** Wird vom AuthStore aufgerufen um sich zu registrieren */
export function registerDemoStateProvider(fn: () => DemoState): void {
  getDemoStateFn = fn;
}

/** Wird vom API-Client aufgerufen um den Demo-Status abzufragen */
export function getDemoState(): DemoState | null {
  if (!getDemoStateFn) return null;
  return getDemoStateFn();
}
