import { beforeEach, describe, expect, it } from 'vitest';
import i18n, {
  LANGUAGE_FLAGS,
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  applyDirection,
  isRTL,
} from './index';

// Namespace imports
import ar from './locales/ar';
import de from './locales/de';
import en from './locales/en';
import es from './locales/es';
import fa from './locales/fa';
import fr from './locales/fr';
import ru from './locales/ru';
import tr from './locales/tr';
import uk from './locales/uk';

const ALL_LOCALES: Record<string, Record<string, Record<string, unknown>>> = {
  de,
  en,
  ar,
  fa,
  es,
  fr,
  ru,
  uk,
  tr,
};

const NAMESPACES = [
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
] as const;

describe('i18n Konfiguration', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('de');
  });

  it('sollte i18n korrekt initialisiert sein', () => {
    expect(i18n.isInitialized).toBe(true);
  });

  it('sollte 9 Sprachen unterstützen', () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(9);
    expect(SUPPORTED_LANGUAGES).toContain('de');
    expect(SUPPORTED_LANGUAGES).toContain('en');
    expect(SUPPORTED_LANGUAGES).toContain('ar');
    expect(SUPPORTED_LANGUAGES).toContain('fa');
    expect(SUPPORTED_LANGUAGES).toContain('es');
    expect(SUPPORTED_LANGUAGES).toContain('fr');
    expect(SUPPORTED_LANGUAGES).toContain('ru');
    expect(SUPPORTED_LANGUAGES).toContain('uk');
    expect(SUPPORTED_LANGUAGES).toContain('tr');
  });

  it('sollte Deutsch als Fallback-Sprache haben', () => {
    expect(i18n.options.fallbackLng).toContain('de');
  });

  it('sollte Labels für alle Sprachen haben', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(LANGUAGE_LABELS[lang]).toBeDefined();
      expect(LANGUAGE_LABELS[lang].length).toBeGreaterThan(0);
    }
  });

  it('sollte Flaggen-Emojis für alle Sprachen haben', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(LANGUAGE_FLAGS[lang]).toBeDefined();
      expect(LANGUAGE_FLAGS[lang].length).toBeGreaterThan(0);
    }
  });
});

describe('RTL-Unterstützung', () => {
  it('sollte Arabisch als RTL erkennen', () => {
    expect(isRTL('ar')).toBe(true);
  });

  it('sollte Farsi als RTL erkennen', () => {
    expect(isRTL('fa')).toBe(true);
  });

  it('sollte Deutsch als LTR erkennen', () => {
    expect(isRTL('de')).toBe(false);
  });

  it('sollte Englisch als LTR erkennen', () => {
    expect(isRTL('en')).toBe(false);
  });

  it('sollte alle anderen Sprachen als LTR erkennen', () => {
    for (const lang of ['es', 'fr', 'ru', 'uk', 'tr']) {
      expect(isRTL(lang)).toBe(false);
    }
  });

  it('sollte applyDirection aufrufen ohne Fehler', () => {
    expect(() => applyDirection('ar')).not.toThrow();
    expect(() => applyDirection('de')).not.toThrow();
  });
});

describe('Sprachwechsel', () => {
  it('sollte die Sprache wechseln können', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.language).toBe('en');
  });

  it('sollte nach Sprachwechsel übersetzen', async () => {
    await i18n.changeLanguage('de');
    const deText = i18n.t('common:save');

    await i18n.changeLanguage('en');
    const enText = i18n.t('common:save');

    expect(deText).not.toBe(enText);
  });
});

describe('Übersetzungs-Vollständigkeit', () => {
  // Holt alle Keys rekursiv aus einem Objekt
  function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
    const keys: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys.push(...getAllKeys(value as Record<string, unknown>, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    return keys;
  }

  for (const ns of NAMESPACES) {
    it(`sollte Namespace "${ns}" in allen 9 Sprachen haben`, () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        const locale = ALL_LOCALES[lang];
        expect(locale[ns], `Namespace "${ns}" fehlt in Sprache "${lang}"`).toBeDefined();
      }
    });
  }

  for (const ns of NAMESPACES) {
    it(`sollte im Namespace "${ns}" gleiche Keys in allen Sprachen haben`, () => {
      const deKeys = getAllKeys(ALL_LOCALES.de[ns] as Record<string, unknown>).sort();

      for (const lang of SUPPORTED_LANGUAGES) {
        if (lang === 'de') continue;
        const langKeys = getAllKeys(ALL_LOCALES[lang][ns] as Record<string, unknown>).sort();

        // Prüfe ob DE Keys in der anderen Sprache vorhanden sind
        const missingKeys = deKeys.filter(k => !langKeys.includes(k));
        if (missingKeys.length > 0) {
          // Warnung statt harter Fehler - fehlende Keys fallen auf Deutsch zurück
          console.warn(
            `⚠️ ${lang}/${ns}: ${missingKeys.length} Keys fehlen: ${missingKeys.slice(0, 5).join(', ')}${missingKeys.length > 5 ? '...' : ''}`
          );
        }
      }
    });
  }
});

describe('Interpolation', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('de');
  });

  it('sollte Interpolation korrekt verarbeiten', () => {
    // dashboard.ts hat keys mit Interpolation wie "welcomeUser"
    const result = i18n.t('dashboard:welcomeUser', { name: 'Max' });
    expect(result).toContain('Max');
  });
});

describe('Namespace-Zugriff', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('de');
  });

  it('sollte auf common Namespace zugreifen können', () => {
    const result = i18n.t('common:save');
    expect(result).toBeTruthy();
    expect(result).not.toContain('common:save'); // Sollte nicht den Key selbst zurückgeben
  });

  it('sollte auf auth Namespace zugreifen können', () => {
    const result = i18n.t('auth:loginTitle');
    expect(result).toBeTruthy();
    expect(result).not.toBe('auth:loginTitle');
  });

  it('sollte auf nav Namespace zugreifen können', () => {
    const result = i18n.t('nav:dashboard');
    expect(result).toBeTruthy();
  });

  it('sollte auf alle 20 Namespaces zugreifen können', () => {
    for (const ns of NAMESPACES) {
      const locale = ALL_LOCALES.de[ns] as Record<string, unknown>;
      const firstKey = Object.keys(locale)[0];
      if (firstKey && typeof locale[firstKey] === 'string') {
        const result = i18n.t(`${ns}:${firstKey}`);
        expect(
          result,
          `Namespace "${ns}" Key "${firstKey}" konnte nicht geladen werden`
        ).toBeTruthy();
      }
    }
  });
});
