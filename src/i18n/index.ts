/**
 * i18n Konfiguration – react-i18next
 *
 * Unterstützte Sprachen: de, en, ar, fa, es, fr, ru, uk, tr
 * RTL-Sprachen: ar, fa (automatisch erkannt)
 */

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// ─── Übersetzungen ───────────────────────────────
import ar from './locales/ar';
import de from './locales/de';
import en from './locales/en';
import es from './locales/es';
import fa from './locales/fa';
import fr from './locales/fr';
import ru from './locales/ru';
import tr from './locales/tr';
import uk from './locales/uk';

export const RTL_LANGUAGES = ['ar', 'fa'] as const;
export const SUPPORTED_LANGUAGES = ['de', 'en', 'ar', 'fa', 'es', 'fr', 'ru', 'uk', 'tr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  de: 'Deutsch',
  en: 'English',
  ar: 'العربية',
  fa: 'فارسی',
  es: 'Español',
  fr: 'Français',
  ru: 'Русский',
  uk: 'Українська',
  tr: 'Türkçe',
};

export const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  de: '🇩🇪',
  en: '🇬🇧',
  ar: '🇸🇦',
  fa: '🇮🇷',
  es: '🇪🇸',
  fr: '🇫🇷',
  ru: '🇷🇺',
  uk: '🇺🇦',
  tr: '🇹🇷',
};

/** Prüft ob die aktuelle Sprache RTL ist */
export function isRTL(lang?: string): boolean {
  const current = lang || i18n.language || 'de';
  return RTL_LANGUAGES.includes(current as (typeof RTL_LANGUAGES)[number]);
}

/** Setzt dir-Attribut auf <html> */
export function applyDirection(lang?: string): void {
  const dir = isRTL(lang) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lang || i18n.language || 'de';
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { de, en, ar, fa, es, fr, ru, uk, tr },
    fallbackLng: 'de',
    defaultNS: 'common',
    ns: [
      'common',
      'auth',
      'nav',
      'dashboard',
      'appointments',
      'medications',
      'diary',
      'exercises',
      'screenings',
      'materials',
      'messages',
      'notes',
      'crisis',
      'billing',
      'reports',
      'documents',
      'questionnaires',
      'settings',
      'video',
      'errors',
    ],
    interpolation: {
      escapeValue: false, // React macht XSS-Schutz
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

// Initiales dir setzen
applyDirection(i18n.language);

// Bei Sprachwechsel dir aktualisieren
i18n.on('languageChanged', (lng: string) => {
  applyDirection(lng);
});

export default i18n;
