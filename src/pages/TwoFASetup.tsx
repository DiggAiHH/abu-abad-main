import { Check, Copy, QrCode, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function TwoFASetup() {
  const { t } = useTranslation(['auth', 'common']);
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchSetupData();
  }, [user, navigate]);

  const fetchSetupData = async () => {
    try {
      setLoading(true);
      const response = await authAPI.setup2FA();
      setSecret(response.data.secret);
      setQrCodeUrl(response.data.qrCodeUrl);
      setStep('setup');
    } catch (error: any) {
      toast.error(t('auth:twoFAErrorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(t('auth:twoFASecretCopied'));
    } catch {
      toast.error(t('auth:twoFACopyFailed'));
    }
  };

  const verifyAndEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!/^\d{6}$/.test(verificationCode)) {
      toast.error(t('auth:twoFAInvalidCode'));
      return;
    }

    try {
      setLoading(true);
      await authAPI.verify2FA(verificationCode);
      toast.success(t('auth:twoFAActivated'));
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || t('auth:twoFAInvalidCodeGeneric'));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !secret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('auth:twoFATitle')}</h1>
          <p className="text-gray-600 mt-2">
            {step === 'setup' 
              ? t('auth:twoFAScanQR') 
              : t('auth:twoFAEnterCode')}
          </p>
        </div>

        {step === 'setup' && (
          <div className="space-y-6">
            {/* QR Code */}
            {qrCodeUrl && (
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <img 
                    src={qrCodeUrl} 
                    alt="2FA QR Code" 
                    className="w-48 h-48"
                    data-testid="2fa-qr-code"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                  <QrCode className="w-4 h-4" />
                  {t('auth:twoFAScanWithApp')}
                </p>
              </div>
            )}

            {/* Manual Secret */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">{t('auth:twoFAManualEntry')}</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono break-all">
                  {secret}
                </code>
                <button
                  onClick={copySecret}
                  className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  title={t('auth:twoFACopySecret')}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep('verify')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              {t('auth:twoFAContinueVerification')}
            </button>
          </div>
        )}

        {step === 'verify' && (
          <form onSubmit={verifyAndEnable} className="space-y-6">
            <div>
              <label htmlFor="2fa-code" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth:twoFACodeLabel')}
              </label>
              <input
                id="2fa-code"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid="2fa-verify-code"
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-2">
                {t('auth:twoFAOpenApp')}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('setup')}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                {t('common:back')}
              </button>
              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('auth:twoFAActivating') : t('auth:twoFAActivate')}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            {t('auth:twoFAImportantNotice')}
          </p>
        </div>
      </div>
    </div>
  );
}
