import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { logger } from '../utils/logger';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const demoLogin = useAuthStore((state) => state.demoLogin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!email || !password) {
      toast.error('Bitte füllen Sie alle Felder aus');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Bitte geben Sie eine gültige E-Mail-Adresse ein');
      return;
    }
    
    setLoading(true);

    try {
      const result = await login(email, password);

      if ((result as any)?.twoFactorRequired) {
        const tempToken = (result as any)?.tempToken as string | undefined;
        if (tempToken) {
          try {
            localStorage.setItem('2fa_temp_token', tempToken);
          } catch {
            // ignore
          }
        }
        toast.success('2FA-Code erforderlich');
        navigate('/2fa-verify', { state: { tempToken } });
        return;
      }

      toast.success('Erfolgreich angemeldet!');
      navigate('/dashboard');
    } catch (error: any) {
      logger.error('Login: error', error);
      
      // Spezifische Error-Messages basierend auf Status
      if (error?.response?.status === 401) {
        toast.error('Ungültige E-Mail oder Passwort');
      } else if (error?.response?.status === 403) {
        toast.error('Account deaktiviert. Bitte kontaktieren Sie den Support.');
      } else if (!error?.response) {
        toast.error('Keine Verbindung zum Server möglich. Bitte prüfen Sie Ihre Internetverbindung.');
      } else if (error?.code === 'ECONNABORTED') {
        toast.error('Zeitüberschreitung. Bitte versuchen Sie es erneut.');
      }
      // Andere Fehler werden vom Axios Interceptor behandelt
    } finally {
      setLoading(false); // Wichtig: Immer zurücksetzen!
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Abu-Abbad Login</h1>
          <p className="text-gray-600 mt-2">Melden Sie sich an, um fortzufahren</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="ihre@email.de"
              data-testid="login-email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Passwort
            </label>
            <input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="••••••••"
              data-testid="login-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            data-testid="login-submit"
          >
            {loading ? 'Wird angemeldet...' : 'Anmelden'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Noch kein Konto?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
            Jetzt registrieren
          </Link>
        </p>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">🧪 Test-Zugangsdaten:</p>
            <div className="space-y-1 text-xs text-blue-800 font-mono">
              <p><strong>Patient:</strong> patient@test.de / Test123!</p>
              <p><strong>Therapeut:</strong> therapeut@test.de / Test123!</p>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <p className="text-xs font-semibold text-blue-900 mb-1">🚀 Demo-Zugang (kein Backend nötig):</p>
              <button
                type="button"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-3 rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                onClick={() => {
                  demoLogin('patient');
                  toast.success('Demo: Als Patient angemeldet');
                  navigate('/dashboard');
                }}
              >
                ▶ Demo: Patient-Dashboard
              </button>

              <button
                type="button"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 px-3 rounded-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                onClick={() => {
                  demoLogin('therapist');
                  toast.success('Demo: Als Therapeut angemeldet');
                  navigate('/dashboard');
                }}
              >
                ▶ Demo: Therapeuten-Dashboard
              </button>

              <p className="text-[11px] text-blue-900/80 mt-1">
                Demo-Modus: Voller Zugriff auf alle UI-Features mit Beispieldaten.
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Diese Anwendung ist DSGVO-konform und verschlüsselt alle Daten.
          </p>
        </div>
      </div>
    </div>
  );
}
