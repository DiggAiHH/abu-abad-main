import { useToggleMenu } from '../hooks/useToggleMenu';
import { useTranslation } from 'react-i18next';
import {
  LANGUAGE_FLAGS,
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '../i18n';

type LanguageSwitcherProps = {
  // Optional: Aktuelle Sprache als Prop überschreiben, standardmäßig aus i18n
  currentLang?: SupportedLanguage;
};

/**
 * Language Switcher Dropdown – zeigt Flagge + Sprachname
 * Unterstützt alle 9 Sprachen inkl. RTL (ar, fa)
 */
const LanguageSwitcher = React.memo(function LanguageSwitcher({ currentLang: propCurrentLang }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation(['common']);
  const { isOpen: open, toggle, ref } = useToggleMenu(false);

  const currentLang = useMemo(() => {
    return (propCurrentLang || i18n.language?.substring(0, 2) || 'de') as SupportedLanguage;
  }, [propCurrentLang, i18n.language]);

  const changeLanguage = useCallback((lang: SupportedLanguage) => {
    i18n.changeLanguage(lang);
    toggle();
  }, [i18n, toggle]);

  return (
    <div ref={ref} className='relative inline-block text-left'>
      <button
        type='button'
        onClick={toggle}
        className='inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition'
        aria-label={t('common:selectLanguage', 'Select language')}
        aria-expanded={open}
        aria-haspopup='listbox'
      >
        <span className='text-base'>{LANGUAGE_FLAGS[currentLang] || '🌐'}</span>
        <span className='hidden sm:inline'>{LANGUAGE_LABELS[currentLang] || currentLang}</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
        </svg>
      </button>

      {open && (
        <div
          className='absolute end-0 z-50 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-80 overflow-y-auto'
          role='listbox'
          aria-label={t('common:availableLanguages', 'Available Languages')}
        >
          {SUPPORTED_LANGUAGES.map(lang => (
            <button
              key={lang}
              type='button'
              role='option'
              aria-selected={lang === currentLang}
              onClick={() => changeLanguage(lang)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${
                lang === currentLang ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
              }`}
            >
              <span className='text-base'>{LANGUAGE_FLAGS[lang]}</span>
              <span>{LANGUAGE_LABELS[lang]}</span>
              {lang === currentLang && (
                <svg
                  className='w-4 h-4 ms-auto text-blue-600'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

export default LanguageSwitcher;