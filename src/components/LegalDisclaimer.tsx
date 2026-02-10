/**
 * @component LegalDisclaimer
 * @description Rechtlicher Hinweis gemäß TMG, DSGVO, und MDR.
 * Wird im Footer oder als eigenständiger Block angezeigt.
 * @audit Pflichtangabe für jede kommerzielle Webanwendung in Deutschland.
 * @legal TMG § 5, DSGVO Art. 13, MDR (falls zutreffend)
 */
import { AlertCircle, ChevronDown, ChevronUp, Scale, Shield } from 'lucide-react';
import { useState } from 'react';

interface LegalDisclaimerProps {
  /** Kompakte Darstellung (nur ein Satz) */
  compact?: boolean;
  /** Zusätzliche CSS-Klassen */
  className?: string;
}

export function LegalDisclaimer({
  compact = false,
  className = '',
}: LegalDisclaimerProps): JSX.Element {
  const [expanded, setExpanded] = useState(false);

  if (compact) {
    return (
      <p className={`text-xs text-gray-400 ${className}`}>
        <Shield className='inline h-3 w-3 mr-1' />
        Abu-Abad ist eine DSGVO-konforme Kommunikationsplattform. Kein Medizinprodukt.{' '}
        <a href='/privacy' className='text-blue-400 hover:underline'>
          Datenschutz
        </a>
      </p>
    );
  }

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg text-sm ${className}`}>
      <button
        onClick={() => setExpanded(prev => !prev)}
        className='w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 transition-colors rounded-lg'
        aria-expanded={expanded}
        aria-label='Rechtliche Hinweise ein-/ausblenden'
      >
        <span className='flex items-center gap-2 text-gray-600 font-medium'>
          <Scale className='h-4 w-4 text-gray-400' />
          Rechtliche Hinweise
        </span>
        {expanded ? (
          <ChevronUp className='h-4 w-4 text-gray-400' />
        ) : (
          <ChevronDown className='h-4 w-4 text-gray-400' />
        )}
      </button>

      {expanded && (
        <div className='px-4 pb-4 space-y-3 text-gray-500 text-xs leading-relaxed'>
          <div>
            <h4 className='font-semibold text-gray-700 mb-1'>1. Plattformbetreiber</h4>
            <p>Abu-Abad Teletherapie GmbH i.G., Musterstraße 1, 10115 Berlin</p>
          </div>
          <div>
            <h4 className='font-semibold text-gray-700 mb-1'>2. Zweckbestimmung</h4>
            <p>
              Abu-Abad ist eine Kommunikationsplattform zur Vermittlung von Video-Sitzungen zwischen
              Therapeuten und Patienten. Die Plattform stellt <strong>keine Diagnosen</strong>, gibt{' '}
              <strong>keine Therapieempfehlungen</strong> und ersetzt{' '}
              <strong>keinen Arztbesuch</strong>.
            </p>
          </div>
          <div>
            <h4 className='font-semibold text-gray-700 mb-1'>3. Medizinprodukt-Hinweis</h4>
            <p>
              Abu-Abad ist derzeit <strong>kein Medizinprodukt</strong> im Sinne der Verordnung (EU)
              2017/745 (MDR). Die Plattform befindet sich in der DiGA-Vorbereitung gemäß DiGAV.
            </p>
          </div>
          <div>
            <h4 className='font-semibold text-gray-700 mb-1'>4. Datenschutz</h4>
            <p>
              Alle personenbezogenen Daten werden gemäß DSGVO verarbeitet. Gesundheitsdaten sind
              AES-256 verschlüsselt. Details finden Sie in unserer{' '}
              <a href='/privacy' className='text-blue-500 underline'>
                Datenschutzerklärung
              </a>
              .
            </p>
          </div>
          <div>
            <h4 className='font-semibold text-gray-700 mb-1'>5. Haftungsausschluss</h4>
            <p>
              Die Inhalte dieser Plattform werden mit größtmöglicher Sorgfalt erstellt. Der
              Betreiber übernimmt keine Gewähr für Richtigkeit, Vollständigkeit und Aktualität. Die
              Nutzung erfolgt auf eigene Verantwortung.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface MedicalDeviceDisclaimerProps {
  /** Zusätzliche CSS-Klassen */
  className?: string;
}

export function MedicalDeviceDisclaimer({ className = '' }: MedicalDeviceDisclaimerProps): JSX.Element {
  return (
    <div
      className={`flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm ${className}`}
    >
      <AlertCircle className='h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5' />
      <div>
        <p className='font-medium text-amber-800'>Kein Medizinprodukt</p>
        <p className='text-amber-700 text-xs mt-1'>
          Abu-Abad ist eine Kommunikationsplattform und kein Medizinprodukt gemäß EU-Verordnung
          2017/745 (MDR). Die Plattform ersetzt keine ärztliche Diagnose oder Behandlung. Bei
          medizinischen Notfällen rufen Sie bitte 112 an oder kontaktieren Sie den ärztlichen
          Bereitschaftsdienst unter 116 117.
        </p>
      </div>
    </div>
  );
}
