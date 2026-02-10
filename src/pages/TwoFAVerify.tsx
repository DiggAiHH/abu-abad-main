import { Lock, Shield } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function TwoFAVerify() {
  const { t } = useTranslation(['auth', 'common']);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const complete2FALogin = useAuthStore(state => state.complete2FALogin);

  // TempToken aus Navigation State oder localStorage
  const tempToken = (location.state as any)?.tempToken || localStorage.getItem('2fa_temp_token');

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(code)) {
      toast.error(t('auth:twoFAInvalidCode'));
      return;
    }

    if (!tempToken) {
      toast.error(t('common:sessionExpiredLogin'));
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      await complete2FALogin(tempToken, code);

      toast.success(t('auth:loginSuccess'));
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || t('auth:twoFAInvalidCodeGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-xl p-8'>
        <div className='text-center mb-8'>
          <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <Shield className='w-8 h-8 text-blue-600' />
          </div>
          <h1 className='text-2xl font-bold text-gray-900'>{t('auth:twoFATitle')}</h1>
          <p className='text-gray-600 mt-2'>{t('auth:twoFAEnterCodeFromApp')}</p>
        </div>

        <form onSubmit={verify} className='space-y-6'>
          <div>
            <label htmlFor='2fa-code' className='block text-sm font-medium text-gray-700 mb-2'>
              {t('auth:twoFACodeLabel')}
            </label>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
              <input
                id='2fa-code'
                type='text'
                inputMode='numeric'
                pattern='\d{6}'
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder='123456'
                className='w-full pl-10 pr-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                data-testid='2fa-login-code'
                autoFocus
              />
            </div>
            <p className='text-sm text-gray-500 mt-2'>{t('auth:twoFACodeChanges')}</p>
          </div>

          <button
            type='submit'
            disabled={loading || code.length !== 6}
            className='w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? t('auth:twoFAVerifying') : t('auth:twoFAVerify')}
          </button>
        </form>

        <div className='mt-6 text-center'>
          <button
            onClick={() => navigate('/login')}
            className='text-sm text-blue-600 hover:text-blue-700'
          >
            ← {t('auth:twoFABackToLogin')}
          </button>
        </div>
      </div>
    </div>
  );
}
