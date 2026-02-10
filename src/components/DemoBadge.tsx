import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';

interface DemoBadgeProps {}

/**
 * Demo-Modus Badge – wird angezeigt wenn isDemo === true.
 * Zeigt dem Benutzer klar an, dass er im Demo-Modus ist.
 */
export default function DemoBadge(_: DemoBadgeProps): JSX.Element | null {
  const { t } = useTranslation(['errors']);
  const isDemo = useAuthStore(s => s.isDemo);
  const logout = useAuthStore(s => s.logout);

  if (!isDemo) return null;

  return (
    <div className='fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium'>
      <span className='inline-block w-2 h-2 bg-white rounded-full animate-pulse' />
      {t('errors:demoMode')}
      <button
        onClick={() => void logout()}
        className='ms-2 bg-amber-600 hover:bg-amber-700 px-2 py-0.5 rounded text-xs transition-colors'
      >
        {t('errors:endDemo')}
      </button>
    </div>
  );
}