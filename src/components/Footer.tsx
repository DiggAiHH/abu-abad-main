/**
 * @component Footer
 * @description Globaler Footer mit rechtlichen Hinweisen, Links und Compliance-Informationen.
 * Wird auf allen Seiten angezeigt (außer Video-Call).
 * @audit Pflichtangaben gemäß TMG § 5, DSGVO Art. 13
 * @version 1.0.0
 */
import { Heart, Shield } from 'lucide-react';
import { LegalDisclaimer } from './LegalDisclaimer';

interface FooterProps {
  /** Kompakter Modus (z.B. für Dashboards) */
  compact?: boolean;
  /** Zusätzliche CSS-Klassen */
  className?: string;
}

export default function Footer({ compact = false, className = '' }: FooterProps): JSX.Element {
  const year = new Date().getFullYear();

  if (compact) {
    return (
      <footer className={`py-4 text-center text-xs text-gray-400 ${className}`}>
        <p>
          © {year} Abu-Abad Teletherapie ·{' '}
          <a href='/privacy' className='hover:text-blue-500 transition-colors'>
            Datenschutz
          </a>
          {' · '}
          <span>Kein Medizinprodukt</span>
        </p>
      </footer>
    );
  }

  return (
    <footer className={`bg-gray-50 border-t border-gray-200 ${className}`}>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Legal Disclaimer */}
        <LegalDisclaimer className='mb-6' />

        <div className='flex flex-col sm:flex-row justify-between items-start gap-6'>
          {/* Branding */}
          <div className='flex items-start gap-3'>
            <div className='bg-blue-600 p-1.5 rounded-lg'>
              <Shield className='h-4 w-4 text-white' />
            </div>
            <div>
              <p className='text-sm font-semibold text-gray-700'>Abu-Abad Teletherapie</p>
              <p className='text-xs text-gray-400 mt-0.5'>DSGVO-konforme Kommunikationsplattform</p>
            </div>
          </div>

          {/* Links */}
          <nav
            className='flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500'
            aria-label='Footer-Navigation'
          >
            <a href='/privacy' className='hover:text-blue-600 transition-colors'>
              Datenschutzerklärung
            </a>
            <a href='/partner-view' className='hover:text-blue-600 transition-colors'>
              Partner-Dashboard
            </a>
            <a
              href='mailto:datenschutz@abu-abad.de'
              className='hover:text-blue-600 transition-colors'
            >
              Datenschutzbeauftragter
            </a>
            <a href='mailto:info@abu-abad.de' className='hover:text-blue-600 transition-colors'>
              Kontakt
            </a>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className='mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between gap-2 text-xs text-gray-400'>
          <p>© {year} Abu-Abad Teletherapie GmbH i.G. Alle Rechte vorbehalten.</p>
          <p className='flex items-center gap-1'>
            Made with <Heart className='h-3 w-3 text-red-400 fill-red-400' /> in Berlin · Kein
            Medizinprodukt gemäß MDR
          </p>
        </div>
      </div>
    </footer>
  );
}
