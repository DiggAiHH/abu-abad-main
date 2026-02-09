import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { logger } from '../utils/logger';

export default function Login() {
  const { t } = useTranslation(['auth', 'common']);
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
      toast.error(t('auth:fillAllFields'));
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t('auth:enterValidEmail'));
      return;
    }
    
    setLoading(true);

    try {
      const result = await login(email, password);

      const loginResult = result as { twoFactorRequired?: boolean; tempToken?: string } | void;
      if (loginResult?.twoFactorRequired) {
        const tempToken = loginResult?.tempToken;
        if (tempToken) {
          try {
            sessionStorage.setItem('2fa_temp_token', tempToken);
          } catch (e) {
            if (import.meta.env.DEV) console.warn('[Auth] sessionStorage write failed', e);
          }
        }
        toast.success(t('auth:twoFARequired'));
        navigate('/2fa-verify', { state: { tempToken } });
        return;
      }

      toast.success(t('auth:loginSuccess'));
      navigate('/dashboard');
    } catch (error: any) {
      logger.error('Login: error', error);
      
      // Spezifische Error-Messages basierend auf Status
      if (error?.response?.status === 401) {
        toast.error(t('auth:invalidCredentials'));
      } else if (error?.response?.status === 403) {
        toast.error(t('auth:accountDeactivated'));
      } else if (!error?.response) {
        toast.error(t('auth:noConnectionLogin'));
      } else if (error?.code === 'ECONNABORTED') {
        toast.error(t('common:timeout'));
      }
      // Andere Fehler werden vom Axios Interceptor behandelt
    } finally {
      setLoading(false); // Wichtig: Immer zurücksetzen!
    }
  };

  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('auth:loginTitle')}</h1>
          <p className="text-gray-600 mt-2">{t('auth:loginSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" aria-label={t('auth:loginTitle')}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth:emailLabel')}
            </label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={t('auth:emailPlaceholder')}
              data-testid="login-email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth:passwordLabel')}
            </label>
            <input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-required="true"
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
            {loading ? t('auth:loggingIn') : t('auth:loginButton')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {t('auth:noAccountYet')}{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
            {t('auth:registerNow')}
          </Link>
        </p>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">{t('auth:testCredentials')}</p>
            <div className="space-y-1 text-xs text-blue-800 font-mono">
              <p>{t('auth:testPatient')}</p>
              <p>{t('auth:testTherapist')}</p>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <p className="text-xs font-semibold text-blue-900 mb-1">{t('auth:demoAccessTitle')}</p>
              <button
                type="button"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-3 rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                onClick={() => {
                  demoLogin('patient');
                  toast.success(t('auth:demoPatientLogin'));
                  navigate('/dashboard');
                }}
              >
                {t('auth:demoPatientButton')}
              </button>

              <button
                type="button"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 px-3 rounded-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                onClick={() => {
                  demoLogin('therapist');
                  toast.success(t('auth:demoTherapistLogin'));
                  navigate('/dashboard');
                }}
              >
                {t('auth:demoTherapistButton')}
              </button>

              <p className="text-[11px] text-blue-900/80 mt-1">
                {t('auth:demoModeDescription')}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center">
            {t('auth:gdprNotice')}
          </p>
        </div>
      </div>
    </main>
  );
}
