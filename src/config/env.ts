/**
 * Frontend Environment Validation
 * Validiert VITE_* Umgebungsvariablen beim App-Start.
 * Stellt sicher, dass kritische Werte korrekt gesetzt sind.
 */

interface EnvConfig {
  /** Backend-API URL (z.B. http://localhost:4000) */
  VITE_API_URL: string;
  /** Stripe Publishable Key */
  VITE_STRIPE_PUBLISHABLE_KEY: string;
  /** PeerJS Server Host */
  VITE_PEER_HOST: string;
  /** PeerJS Server Port */
  VITE_PEER_PORT: number;
  /** App ist im Produktionsmodus */
  IS_PRODUCTION: boolean;
}

function validateEnv(): EnvConfig {
  const raw = import.meta.env;

  const config: EnvConfig = {
    VITE_API_URL: (raw.VITE_API_URL as string) || '',
    VITE_STRIPE_PUBLISHABLE_KEY: (raw.VITE_STRIPE_PUBLISHABLE_KEY as string) || '',
    VITE_PEER_HOST: (raw.VITE_PEER_HOST as string) || 'localhost',
    VITE_PEER_PORT: Number(raw.VITE_PEER_PORT) || 3001,
    IS_PRODUCTION: raw.PROD === true,
  };

  // Warnungen in Development
  if (raw.DEV) {
    if (!config.VITE_API_URL) {
      console.warn('[Env] VITE_API_URL nicht gesetzt – API-Calls gehen an /api (relative URL)');
    }
    if (!config.VITE_STRIPE_PUBLISHABLE_KEY) {
      console.warn('[Env] VITE_STRIPE_PUBLISHABLE_KEY nicht gesetzt – Zahlungen deaktiviert');
    }
  }

  // Kritische Prüfung in Production
  if (config.IS_PRODUCTION) {
    if (config.VITE_STRIPE_PUBLISHABLE_KEY && config.VITE_STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_')) {
      console.error('[Env] ⚠️  Stripe Test-Key in Produktion erkannt!');
    }
  }

  return config;
}

export const env = validateEnv();
