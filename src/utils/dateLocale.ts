/**
 * date-fns Locale Mapping
 *
 * Gibt die passende date-fns Locale basierend auf der aktuellen i18n-Sprache zurück.
 * Lazy-loaded über dynamisches Import wäre besser für Bundle-Size,
 * aber für 9 Sprachen ist statischer Import akzeptabel.
 */

import type { Locale } from 'date-fns/locale';
import { ar, de, enGB, es, faIR, fr, ru, tr, uk } from 'date-fns/locale';
import i18n from '../i18n';

const LOCALE_MAP: Record<string, Locale> = {
  de,
  en: enGB,
  ar,
  fa: faIR,
  es,
  fr,
  ru,
  uk,
  tr,
};

/**
 * Gibt die date-fns Locale für die aktuelle oder übergebene Sprache zurück
 */
export function getDateLocale(lang?: string): Locale {
  const current = lang || i18n.language?.substring(0, 2) || 'de';
  return LOCALE_MAP[current] || de;
}

/**
 * React Hook für date-fns Locale (reaktiv auf Sprachwechsel)
 */
export { getDateLocale as useDateLocale };
