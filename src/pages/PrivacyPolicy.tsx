/**
 * @page PrivacyPolicy
 * @description Datenschutzerklärung gemäß DSGVO Art. 13 & 14.
 * Pflichtseite für jede DSGVO-konforme Anwendung.
 * @audit Dieses Dokument MUSS bei jedem Audit vorgelegt werden.
 * @legal DSGVO Art. 13, 14, 6, 9, 25, 28, 32, 35
 * @version 1.0.0
 */
import { ArrowLeft, FileText, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SectionProps {
  title: string;
  id: string;
  children: React.ReactNode;
}

function Section({ title, id, children }: SectionProps): JSX.Element {
  return (
    <section id={id} className='scroll-mt-20'>
      <h2 className='text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2'>
        <FileText className='h-4 w-4 text-blue-600' />
        {title}
      </h2>
      <div className='prose prose-sm prose-gray max-w-none text-gray-700 leading-relaxed'>
        {children}
      </div>
    </section>
  );
}

const LAST_UPDATED = '09. Februar 2026';
const COMPANY = 'Abu-Abad Teletherapie GmbH i.G.';
const EMAIL_DSB = 'datenschutz@abu-abad.de';
const ADDRESS = 'Musterstraße 1, 10115 Berlin, Deutschland';

export default function PrivacyPolicy(): JSX.Element {
  const navigate = useNavigate();

  const toc = [
    { id: 'verantwortlicher', label: '1. Verantwortlicher' },
    { id: 'dsb', label: '2. Datenschutzbeauftragter' },
    { id: 'datenarten', label: '3. Arten der verarbeiteten Daten' },
    { id: 'rechtsgrundlage', label: '4. Rechtsgrundlagen' },
    { id: 'zwecke', label: '5. Zwecke der Verarbeitung' },
    { id: 'gesundheitsdaten', label: '6. Gesundheitsdaten (Art. 9 DSGVO)' },
    { id: 'empfaenger', label: '7. Empfänger der Daten' },
    { id: 'drittland', label: '8. Drittlandtransfers' },
    { id: 'speicherdauer', label: '9. Speicherdauer & Löschung' },
    { id: 'rechte', label: '10. Ihre Rechte' },
    { id: 'technik', label: '11. Technische Maßnahmen' },
    { id: 'cookies', label: '12. Cookies & Tracking' },
    { id: 'videocalls', label: '13. Video-Calls (WebRTC)' },
    { id: 'aenderungen', label: '14. Änderungen' },
  ];

  return (
    <div className='min-h-screen bg-white'>
      {/* Header */}
      <header className='bg-gray-50 border-b border-gray-200 sticky top-0 z-30'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4'>
          <button
            onClick={() => navigate(-1)}
            className='text-gray-400 hover:text-gray-600 transition-colors'
            aria-label='Zurück'
          >
            <ArrowLeft className='h-5 w-5' />
          </button>
          <div>
            <h1 className='text-lg font-bold text-gray-900 flex items-center gap-2'>
              <Shield className='h-5 w-5 text-blue-600' />
              Datenschutzerklärung
            </h1>
            <p className='text-xs text-gray-500'>
              Gemäß DSGVO Art. 13 & 14 · Stand: {LAST_UPDATED}
            </p>
          </div>
        </div>
      </header>

      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8'>
        {/* Sidebar TOC (desktop) */}
        <nav
          className='hidden lg:block w-56 flex-shrink-0 sticky top-20 self-start'
          aria-label='Inhaltsverzeichnis'
        >
          <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3'>
            Inhalt
          </p>
          <ul className='space-y-1.5'>
            {toc.map(item => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className='text-sm text-gray-500 hover:text-blue-600 transition-colors block py-0.5'
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <main id='main-content' className='flex-1 space-y-8'>
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800'>
            <strong>Hinweis:</strong> Diese Datenschutzerklärung informiert Sie gemäß Art. 13 und 14
            DSGVO über die Verarbeitung Ihrer personenbezogenen Daten bei Nutzung der Abu-Abad
            Teletherapie-Plattform. Bei Fragen wenden Sie sich bitte an{' '}
            <a href={`mailto:${EMAIL_DSB}`} className='underline'>
              {EMAIL_DSB}
            </a>
            .
          </div>

          <Section title='1. Verantwortlicher' id='verantwortlicher'>
            <p>
              <strong>{COMPANY}</strong>
              <br />
              {ADDRESS}
            </p>
            <p>
              E-Mail:{' '}
              <a href='mailto:info@abu-abad.de' className='text-blue-600 underline'>
                info@abu-abad.de
              </a>
            </p>
          </Section>

          <Section title='2. Datenschutzbeauftragter' id='dsb'>
            <p>
              Unseren Datenschutzbeauftragten erreichen Sie unter:
              <br />
              E-Mail:{' '}
              <a href={`mailto:${EMAIL_DSB}`} className='text-blue-600 underline'>
                {EMAIL_DSB}
              </a>
            </p>
          </Section>

          <Section title='3. Arten der verarbeiteten Daten' id='datenarten'>
            <p>Wir verarbeiten folgende Kategorien personenbezogener Daten:</p>
            <ul className='list-disc pl-5 space-y-1'>
              <li>
                <strong>Bestandsdaten:</strong> Name, E-Mail-Adresse, Telefonnummer, Rolle
                (Therapeut/Patient)
              </li>
              <li>
                <strong>Authentifizierungsdaten:</strong> Passwort-Hash (bcrypt, 12 Runden),
                2FA-Secrets (TOTP)
              </li>
              <li>
                <strong>Gesundheitsdaten (Art. 9 DSGVO):</strong> Behandlungsnotizen,
                Symptomtagebuch, Krisenplan, Screening-Ergebnisse, Medikationsdaten —{' '}
                <em>alle AES-256-GCM verschlüsselt</em>
              </li>
              <li>
                <strong>Kommunikationsdaten:</strong> Nachrichten zwischen Therapeut und Patient
              </li>
              <li>
                <strong>Termindaten:</strong> Datum, Uhrzeit, Dauer, Status
              </li>
              <li>
                <strong>Zahlungsdaten:</strong> Abwicklung über Stripe — keine Kreditkartendaten auf
                unseren Servern
              </li>
              <li>
                <strong>Nutzungsdaten:</strong> Login-Zeitpunkte, IP-Adressen (anonymisiert),
                Audit-Logs
              </li>
            </ul>
          </Section>

          <Section title='4. Rechtsgrundlagen (Art. 6 & 9 DSGVO)' id='rechtsgrundlage'>
            <table className='w-full text-sm border border-gray-200 rounded-lg overflow-hidden'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='text-left p-3 font-medium'>Verarbeitung</th>
                  <th className='text-left p-3 font-medium'>Rechtsgrundlage</th>
                </tr>
              </thead>
              <tbody>
                <tr className='border-t'>
                  <td className='p-3'>Registrierung & Login</td>
                  <td className='p-3'>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</td>
                </tr>
                <tr className='border-t'>
                  <td className='p-3'>Gesundheitsdatenverarbeitung</td>
                  <td className='p-3'>Art. 9 Abs. 2 lit. a DSGVO (Ausdrückliche Einwilligung)</td>
                </tr>
                <tr className='border-t'>
                  <td className='p-3'>Terminbuchung</td>
                  <td className='p-3'>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</td>
                </tr>
                <tr className='border-t'>
                  <td className='p-3'>Abrechnung/Zahlung</td>
                  <td className='p-3'>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</td>
                </tr>
                <tr className='border-t'>
                  <td className='p-3'>Audit-Logging</td>
                  <td className='p-3'>Art. 6 Abs. 1 lit. c DSGVO (Rechtliche Verpflichtung)</td>
                </tr>
                <tr className='border-t'>
                  <td className='p-3'>Sicherheitsmaßnahmen</td>
                  <td className='p-3'>Art. 6 Abs. 1 lit. f DSGVO (Berechtigtes Interesse)</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section title='5. Zwecke der Verarbeitung' id='zwecke'>
            <ul className='list-disc pl-5 space-y-1'>
              <li>
                Bereitstellung der Teletherapie-Plattform (Video-Calls, Nachrichten, Terminbuchung)
              </li>
              <li>Dokumentation von Behandlungen gemäß berufsrechtlicher Pflichten</li>
              <li>Abrechnung von Therapiesitzungen über Stripe</li>
              <li>IT-Sicherheit und Missbrauchsprävention</li>
              <li>Erfüllung gesetzlicher Aufbewahrungspflichten</li>
            </ul>
          </Section>

          <Section
            title='6. Besondere Kategorien: Gesundheitsdaten (Art. 9 DSGVO)'
            id='gesundheitsdaten'
          >
            <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 mb-4'>
              <strong>Wichtig:</strong> Gesundheitsdaten unterliegen einem besonderen Schutz. Wir
              verarbeiten diese ausschließlich auf Grundlage Ihrer ausdrücklichen Einwilligung (Art.
              9 Abs. 2 lit. a DSGVO). Sie können Ihre Einwilligung jederzeit widerrufen.
            </div>
            <p>Folgende technische Maßnahmen schützen Ihre Gesundheitsdaten:</p>
            <ul className='list-disc pl-5 space-y-1'>
              <li>
                <strong>AES-256-GCM Verschlüsselung:</strong> Alle Gesundheitsdaten werden at-rest
                verschlüsselt
              </li>
              <li>
                <strong>Envelope Encryption mit KMS:</strong> Schlüsselhierarchie mit separatem Key
                Management
              </li>
              <li>
                <strong>Zugriffskontrolle (RBAC):</strong> Nur der behandelnde Therapeut kann
                Patientendaten einsehen
              </li>
              <li>
                <strong>Audit-Logging:</strong> Jeder Zugriff auf Gesundheitsdaten wird
                protokolliert
              </li>
              <li>
                <strong>Pseudonymisierung:</strong> Interne Verarbeitung erfolgt mit UUIDs, nicht
                mit Klarnamen
              </li>
            </ul>
          </Section>

          <Section title='7. Empfänger der Daten' id='empfaenger'>
            <ul className='list-disc pl-5 space-y-1'>
              <li>
                <strong>Stripe, Inc.:</strong> Zahlungsabwicklung (PCI-DSS zertifiziert) —{' '}
                <a
                  href='https://stripe.com/de/privacy'
                  className='text-blue-600 underline'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Datenschutzerklärung
                </a>
              </li>
              <li>
                <strong>Railway / Hosting-Provider:</strong> Serverinfrastruktur (EU-Region)
              </li>
              <li>
                <strong>Netlify:</strong> Frontend-Hosting (CDN)
              </li>
            </ul>
            <p className='mt-2'>
              Alle Auftragsverarbeiter haben einen Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28
              DSGVO abgeschlossen.
            </p>
          </Section>

          <Section title='8. Drittlandtransfers' id='drittland'>
            <p>
              Sofern Daten in Drittländer (außerhalb EU/EWR) übermittelt werden, geschieht dies nur
              auf Grundlage von Angemessenheitsbeschlüssen der EU-Kommission oder
              EU-Standardvertragsklauseln (SCC).
            </p>
            <p className='mt-2'>
              <strong>Stripe:</strong> EU-US Data Privacy Framework (Angemessenheitsbeschluss)
              <br />
              <strong>Hosting:</strong> EU-Region bevorzugt. Bei US-Fallback: SCC + TIA.
            </p>
          </Section>

          <Section title='9. Speicherdauer & Löschung' id='speicherdauer'>
            <table className='w-full text-sm border border-gray-200 rounded-lg overflow-hidden'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='text-left p-3 font-medium'>Datenkategorie</th>
                  <th className='text-left p-3 font-medium'>Speicherdauer</th>
                  <th className='text-left p-3 font-medium'>Grundlage</th>
                </tr>
              </thead>
              <tbody>
                <tr className='border-t'>
                  <td className='p-3'>Kontodaten</td>
                  <td className='p-3'>Bis zur Löschanfrage + 30 Tage</td>
                  <td className='p-3'>Art. 17 DSGVO</td>
                </tr>
                <tr className='border-t'>
                  <td className='p-3'>Behandlungsnotizen</td>
                  <td className='p-3'>10 Jahre nach letzter Behandlung</td>
                  <td className='p-3'>§ 630f BGB, Berufsrecht</td>
                </tr>
                <tr className='border-t'>
                  <td className='p-3'>Abrechnungsdaten</td>
                  <td className='p-3'>10 Jahre</td>
                  <td className='p-3'>§ 147 AO, HGB</td>
                </tr>
                <tr className='border-t'>
                  <td className='p-3'>Einwilligungen</td>
                  <td className='p-3'>3 Jahre nach Widerruf</td>
                  <td className='p-3'>Nachweispflicht</td>
                </tr>
                <tr className='border-t'>
                  <td className='p-3'>Audit-Logs</td>
                  <td className='p-3'>6 Jahre</td>
                  <td className='p-3'>DSGVO Art. 5 Abs. 2</td>
                </tr>
                <tr className='border-t'>
                  <td className='p-3'>Session-Daten</td>
                  <td className='p-3'>24 Stunden</td>
                  <td className='p-3'>Berechtigtes Interesse</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section title='10. Ihre Rechte (Art. 15–22 DSGVO)' id='rechte'>
            <p>Sie haben jederzeit folgende Rechte:</p>
            <ul className='list-disc pl-5 space-y-1'>
              <li>
                <strong>Auskunft (Art. 15):</strong> Welche Daten wir über Sie gespeichert haben
              </li>
              <li>
                <strong>Berichtigung (Art. 16):</strong> Korrektur unrichtiger Daten
              </li>
              <li>
                <strong>Löschung (Art. 17):</strong> „Recht auf Vergessenwerden" — sofern keine
                Aufbewahrungspflicht
              </li>
              <li>
                <strong>Einschränkung (Art. 18):</strong> Einschränkung der Verarbeitung
              </li>
              <li>
                <strong>Datenübertragbarkeit (Art. 20):</strong> Ihre Daten in maschinenlesbarem
                Format
              </li>
              <li>
                <strong>Widerspruch (Art. 21):</strong> Gegen Verarbeitung auf Basis berechtigter
                Interessen
              </li>
              <li>
                <strong>Widerruf der Einwilligung (Art. 7 Abs. 3):</strong> Jederzeit ohne Angabe
                von Gründen
              </li>
            </ul>
            <p className='mt-3'>
              Zur Ausübung Ihrer Rechte wenden Sie sich an:{' '}
              <a href={`mailto:${EMAIL_DSB}`} className='text-blue-600 underline'>
                {EMAIL_DSB}
              </a>
            </p>
            <p className='mt-2'>
              <strong>Beschwerderecht:</strong> Sie haben das Recht, sich bei einer Aufsichtsbehörde
              zu beschweren (z.B. Berliner Beauftragte für Datenschutz und Informationsfreiheit).
            </p>
          </Section>

          <Section
            title='11. Technische und organisatorische Maßnahmen (Art. 32 DSGVO)'
            id='technik'
          >
            <div className='grid sm:grid-cols-2 gap-3'>
              {[
                { title: 'Verschlüsselung', desc: 'AES-256-GCM at-rest, TLS 1.3 in-transit' },
                { title: 'Zugriffskontrolle', desc: 'RBAC mit JWT + 2FA (TOTP)' },
                {
                  title: 'Passwort-Sicherheit',
                  desc: 'bcrypt mit 12 Runden, Mindestanforderungen',
                },
                { title: 'Audit-Logging', desc: 'Lückenlose Protokollierung aller Datenzugriffe' },
                { title: 'Rate Limiting', desc: 'Schutz vor Brute-Force-Angriffen' },
                { title: 'Security Headers', desc: 'Helmet.js (CSP, HSTS, X-Frame-Options)' },
                {
                  title: 'Input Validation',
                  desc: 'Zod-Schema-Validierung, SQL Injection Prevention',
                },
                { title: 'Datensparsamkeit', desc: 'Nur notwendige Daten, Privacy by Design' },
              ].map(item => (
                <div key={item.title} className='p-3 bg-gray-50 rounded-lg border border-gray-200'>
                  <p className='font-medium text-gray-800 text-sm'>{item.title}</p>
                  <p className='text-xs text-gray-500 mt-0.5'>{item.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title='12. Cookies & Tracking' id='cookies'>
            <p>
              Wir verwenden <strong>keine Tracking-Cookies</strong> und{' '}
              <strong>keine Analytics-Dienste</strong> (kein Google Analytics, kein Meta Pixel, kein
              sonstiges Tracking).
            </p>
            <p className='mt-2'>Es werden ausschließlich technisch notwendige Cookies verwendet:</p>
            <table className='w-full text-sm border border-gray-200 rounded-lg overflow-hidden mt-2'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='text-left p-3 font-medium'>Cookie</th>
                  <th className='text-left p-3 font-medium'>Zweck</th>
                  <th className='text-left p-3 font-medium'>Dauer</th>
                </tr>
              </thead>
              <tbody>
                <tr className='border-t'>
                  <td className='p-3 font-mono text-xs'>auth_token</td>
                  <td className='p-3'>JWT-Authentifizierung</td>
                  <td className='p-3'>Session / 24h</td>
                </tr>
                <tr className='border-t'>
                  <td className='p-3 font-mono text-xs'>refresh_token</td>
                  <td className='p-3'>Token-Erneuerung</td>
                  <td className='p-3'>7 Tage</td>
                </tr>
                <tr className='border-t'>
                  <td className='p-3 font-mono text-xs'>i18next</td>
                  <td className='p-3'>Spracheinstellung</td>
                  <td className='p-3'>1 Jahr</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section title='13. Video-Calls (WebRTC)' id='videocalls'>
            <p>
              Video-Calls werden über <strong>WebRTC (Peer-to-Peer)</strong> mit PeerJS realisiert.
              Die Audio-/Video-Streams werden <strong>direkt zwischen den Teilnehmern</strong>{' '}
              übertragen und nicht über unsere Server geleitet.
            </p>
            <ul className='list-disc pl-5 space-y-1 mt-2'>
              <li>Kein Aufzeichnen oder Speichern von Video-/Audio-Daten auf unseren Servern</li>
              <li>Signaling über verschlüsselte WebSocket-Verbindung (WSS)</li>
              <li>DTLS/SRTP Verschlüsselung der Media-Streams</li>
              <li>TURN-Server nur als Fallback bei NAT-Traversal-Problemen</li>
            </ul>
          </Section>

          <Section title='14. Änderungen dieser Datenschutzerklärung' id='aenderungen'>
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie aktuellen
              rechtlichen Anforderungen anzupassen oder Änderungen unserer Leistungen umzusetzen.
              Die aktuelle Version gilt ab dem oben genannten Datum.
            </p>
          </Section>

          {/* Signature */}
          <div className='border-t border-gray-200 pt-6 mt-8 text-sm text-gray-500'>
            <p>Stand: {LAST_UPDATED}</p>
            <p>{COMPANY}</p>
            <p>{ADDRESS}</p>
          </div>
        </main>
      </div>
    </div>
  );
}
