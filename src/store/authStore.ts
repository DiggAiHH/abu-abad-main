import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, setLogoutInProgress } from '../api/client';
import { registerDemoStateProvider } from '../api/demoStateBridge';
import { extractToken, extractUser } from '../api/types';
import { clearAccessToken, getAccessToken, setAccessToken } from '../auth/token';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  twoFactorRequired: boolean;
  twoFactorTempToken: string | null;
  loading: boolean;
  error: string | null;
  isDemo: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ twoFactorRequired?: boolean; tempToken?: string } | void>;
  complete2FALogin: (tempToken: string, twoFactorCode: string) => Promise<void>;
  clearTwoFactor: () => void;
  devBypassLogin: (role: 'therapist' | 'patient') => Promise<void>;
  demoLogin: (role: 'therapist' | 'patient') => void;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'therapist' | 'patient';
    phone?: string;
    gdprConsent: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      token: getAccessToken(),
      twoFactorRequired: false,
      twoFactorTempToken: null,
      loading: false,
      error: null,
      isDemo: false,

      clearTwoFactor: () => {
        try {
          sessionStorage.removeItem('2fa_temp_token');
        } catch (e) {
          if (import.meta.env.DEV) console.warn('[Auth] sessionStorage cleanup failed', e);
        }
        set({ twoFactorRequired: false, twoFactorTempToken: null });
      },

      checkAuth: async () => {
        // Im Demo-Modus keinen API-Call machen
        const currentState = useAuthStore.getState();
        if (currentState.isDemo && currentState.user) {
          set({ loading: false });
          return;
        }

        set({ loading: true, error: null });
        try {
          const response = await authAPI.getMe();
          const user = extractUser(response);
          const token = getAccessToken();

          if (!user) {
            throw new Error('Keine Benutzerdaten erhalten');
          }

          set({ user, token, loading: false, error: null });
        } catch {
          clearAccessToken();
          set({ user: null, token: null, loading: false, error: null, isDemo: false });
        }
      },

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          // SECURITY: Stale token entfernen bevor neue Session beginnt
          clearAccessToken();
          set({ token: null, user: null, twoFactorRequired: false, twoFactorTempToken: null });

          if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            set({ error: 'Ungültige E-Mail-Adresse', loading: false });
            throw new Error('Ungültige E-Mail-Adresse');
          }
          if (!password || password.length < 8) {
            set({ error: 'Passwort zu kurz', loading: false });
            throw new Error('Passwort zu kurz');
          }

          const response = await authAPI.login(email, password);

          const responseData = (
            response as { data?: { twoFactorRequired?: boolean; tempToken?: string } }
          )?.data;
          const twoFactorRequired = Boolean(responseData?.twoFactorRequired);
          const tempToken = responseData?.tempToken;
          if (twoFactorRequired) {
            if (!tempToken || typeof tempToken !== 'string') {
              set({ error: 'Ungültige Server-Antwort', loading: false });
              throw new Error('Ungültige Server-Antwort');
            }

            try {
              sessionStorage.setItem('2fa_temp_token', tempToken);
            } catch (e) {
              if (import.meta.env.DEV) console.warn('[Auth] sessionStorage write failed', e);
            }

            set({
              twoFactorRequired: true,
              twoFactorTempToken: tempToken,
              loading: false,
              error: null,
            });

            return { twoFactorRequired: true, tempToken };
          }

          const token = extractToken(response);
          const user = extractUser(response);

          if (!token || !user) {
            set({ error: 'Ungültige Server-Antwort', loading: false });
            throw new Error('Ungültige Server-Antwort');
          }

          setAccessToken(token);
          set({
            user,
            token,
            error: null,
            loading: false,
            twoFactorRequired: false,
            twoFactorTempToken: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login fehlgeschlagen';
          set({ error: errorMessage, loading: false });
          // Log to error tracking service if available
          if (typeof window !== 'undefined' && 'logError' in window) {
            (window as Window & { logError?: (err: unknown, context: string) => void }).logError?.(
              error,
              'authStore.login'
            );
          }
          throw error;
        }
      },

      complete2FALogin: async (tempToken, twoFactorCode) => {
        set({ loading: true, error: null });
        try {
          const response = await authAPI.verify2FALogin(tempToken, twoFactorCode);
          const token = extractToken(response);
          const user = extractUser(response);

          if (!token || !user) {
            set({ error: 'Ungültige Server-Antwort', loading: false });
            throw new Error('Ungültige Server-Antwort');
          }

          setAccessToken(token);

          try {
            sessionStorage.removeItem('2fa_temp_token');
          } catch (e) {
            if (import.meta.env.DEV) console.warn('[Auth] sessionStorage cleanup failed', e);
          }

          set({
            user,
            token,
            twoFactorRequired: false,
            twoFactorTempToken: null,
            error: null,
            loading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : '2FA-Verifizierung fehlgeschlagen';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      devBypassLogin: async role => {
        set({ loading: true, error: null });
        try {
          const response = await authAPI.devBypass(role);
          const token = extractToken(response);
          const user = extractUser(response);

          if (!token || !user) {
            set({ error: 'Ungültige Server-Antwort', loading: false });
            throw new Error('Ungültige Server-Antwort');
          }

          setAccessToken(token);
          set({
            user,
            token,
            error: null,
            loading: false,
            twoFactorRequired: false,
            twoFactorTempToken: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Dev-Bypass Login fehlgeschlagen';
          set({ error: errorMessage, loading: false });
          if (typeof window !== 'undefined' && 'logError' in window) {
            (window as Window & { logError?: (err: unknown, context: string) => void }).logError?.(
              error,
              'authStore.devBypassLogin'
            );
          }
          throw error;
        }
      },

      demoLogin: role => {
        const demoUser: User = {
          id: role === 'therapist' ? 'demo-therapist-001' : 'demo-patient-001',
          email: role === 'therapist' ? 'therapeut@demo.de' : 'patient@demo.de',
          role,
          firstName: role === 'therapist' ? 'Dr. Sarah' : 'Max',
          lastName: role === 'therapist' ? 'Müller' : 'Mustermann',
          phone: '+49 170 1234567',
        };
        const demoToken = 'demo-token-' + Date.now();
        setAccessToken(demoToken);
        set({
          user: demoUser,
          token: demoToken,
          isDemo: true,
          loading: false,
          error: null,
          twoFactorRequired: false,
          twoFactorTempToken: null,
        });
      },

      register: async data => {
        set({ loading: true, error: null });

        if (!data.email || !data.password || !data.firstName || !data.lastName) {
          set({ loading: false });
          throw new Error('Alle Pflichtfelder müssen ausgefüllt sein');
        }

        if (!data.gdprConsent) {
          set({ loading: false });
          throw new Error('DSGVO-Einwilligung erforderlich');
        }

        const response = await authAPI.register(data);
        const token = extractToken(response);
        const user = extractUser(response);

        if (!token || !user) {
          throw new Error('Ungültige Server-Antwort');
        }

        setAccessToken(token);
        set({
          user,
          token,
          error: null,
          loading: false,
          twoFactorRequired: false,
          twoFactorTempToken: null,
        });
      },

      logout: async () => {
        setLogoutInProgress(true);
        try {
          // WICHTIG: Backend muss das Refresh-Cookie immer löschen können.
          await authAPI.logout();
        } catch {
          // ignore (lokaler State wird trotzdem gelöscht)
        } finally {
          clearAccessToken();
          try {
            sessionStorage.removeItem('2fa_temp_token');
          } catch (e) {
            if (import.meta.env.DEV) console.warn('[Auth] sessionStorage cleanup failed', e);
          }
          set({
            user: null,
            token: null,
            twoFactorRequired: false,
            twoFactorTempToken: null,
            error: null,
            loading: false,
            isDemo: false,
          });
          setLogoutInProgress(false);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: () => ({}),
    }
  )
);

// Demo-State-Bridge registrieren (löst zirkuläre Abhängigkeit api↔store)
registerDemoStateProvider(() => {
  const state = useAuthStore.getState();
  return {
    isDemo: state.isDemo,
    userId: state.user?.id || '',
  };
});
