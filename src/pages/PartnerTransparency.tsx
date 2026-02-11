/**
 * @page PartnerTransparency
 * @description Read-Only Transparenz-Dashboard für Neurologen-Partner und Investoren.
 * Kein Login erforderlich — öffentlich zugänglich, keine sensiblen Daten.
 * @audit Keine personenbezogenen Daten. Nur aggregierte Projektdaten.
 * @version 1.0.0
 */
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Euro,
  ExternalLink,
  FileCheck,
  Shield,
} from 'lucide-react';
import { useMemo } from 'react';
import { calculateProjectSummary, regulatoryStatus, workPackages } from '../data/projectData';
import type { WorkPackage } from '../types/projectTypes';

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
}

function ProgressRing({ value, size = 120, strokeWidth = 10 }: ProgressRingProps): JSX.Element {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color =
    value === 100 ? '#22c55e' : value >= 60 ? '#3b82f6' : value >= 30 ? '#eab308' : '#ef4444';

  return (
    <svg
      width={size}
      height={size}
      className='transform -rotate-90'
      role='img'
      aria-label={`${value}% Fortschritt`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill='none'
        stroke='#e5e7eb'
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill='none'
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap='round'
        className='transition-all duration-1000'
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor='middle'
        dominantBaseline='central'
        className='transform rotate-90 origin-center'
        fill='#1f2937'
        fontSize={size * 0.22}
        fontWeight='bold'
      >
        {value}%
      </text>
    </svg>
  );
}

interface MilestoneTimelineProps {
  packages: readonly WorkPackage[];
}

function MilestoneTimeline({ packages }: MilestoneTimelineProps): JSX.Element {
  const allMilestones = useMemo(() => {
    return packages
      .flatMap(wp => wp.milestones.map(ms => ({ ...ms, wpNumber: wp.wpNumber, wpTitle: wp.title })))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [packages]);

  return (
    <div className='relative'>
      <div className='absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200' />
      <div className='space-y-6'>
        {allMilestones.map((ms, i) => (
          <div key={`${ms.id}-${i}`} className='relative flex items-start gap-4 pl-10'>
            <div
              className={`absolute left-2.5 w-3 h-3 rounded-full ring-2 ring-white ${
                ms.status === 'completed'
                  ? 'bg-green-500'
                  : ms.status === 'in-progress'
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
              }`}
            />
            <div className='flex-1 min-w-0'>
              <div className='flex items-baseline gap-2 flex-wrap'>
                <span className='text-xs font-mono text-gray-400'>{ms.wpNumber}</span>
                <span className='font-medium text-sm text-gray-900'>{ms.title}</span>
                <span className='text-xs text-gray-400'>{ms.date}</span>
              </div>
              {ms.description && <p className='text-xs text-gray-500 mt-0.5'>{ms.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface BudgetOverviewProps {
  packages: readonly WorkPackage[];
}

function BudgetOverview({ packages }: BudgetOverviewProps): JSX.Element {
  const summary = useMemo(() => calculateProjectSummary(packages), [packages]);
  const percent =
    summary.totalBudget > 0 ? Math.round((summary.totalSpent / summary.totalBudget) * 100) : 0;

  return (
    <div className='space-y-4'>
      <div className='flex items-end gap-3'>
        <span className='text-3xl font-bold text-gray-900'>
          {summary.totalSpent.toLocaleString('de-DE')} €
        </span>
        <span className='text-sm text-gray-500 pb-1'>
          von {summary.totalBudget.toLocaleString('de-DE')} € ({percent}%)
        </span>
      </div>
      <div className='w-full bg-gray-200 rounded-full h-3'>
        <div
          className={`h-3 rounded-full transition-all duration-700 ${percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
        {packages
          .filter(wp => wp.budget !== null && wp.budget !== undefined)
          .map(wp => {
            const wpPct = wp.budget && wp.spent ? Math.round((wp.spent / wp.budget) * 100) : 0;
            return (
              <div key={wp.id} className='text-xs'>
                <div className='flex justify-between mb-1'>
                  <span className='text-gray-600 truncate mr-2'>{wp.wpNumber}</span>
                  <span className='text-gray-400 whitespace-nowrap'>{wpPct}%</span>
                </div>
                <div className='w-full bg-gray-100 rounded-full h-1.5'>
                  <div
                    className='bg-blue-400 h-1.5 rounded-full'
                    style={{ width: `${Math.min(wpPct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

interface RiskMatrixProps {
  packages: readonly WorkPackage[];
}

function RiskMatrix({ packages }: RiskMatrixProps): JSX.Element {
  const allRisks = useMemo(
    () => packages.flatMap(wp => wp.risks.map(r => ({ ...r, wpNumber: wp.wpNumber }))),
    [packages]
  );
  const active = allRisks.filter(r => r.status === 'active');
  const mitigated = allRisks.filter(r => r.status === 'mitigated');

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-4 text-sm'>
        <span className='flex items-center gap-1 text-red-600'>
          <AlertTriangle className='h-4 w-4' /> {active.length} aktiv
        </span>
        <span className='flex items-center gap-1 text-green-600'>
          <CheckCircle2 className='h-4 w-4' /> {mitigated.length} mitigiert
        </span>
      </div>
      {allRisks.map(risk => (
        <div
          key={risk.id}
          className={`p-3 rounded-lg border text-sm ${
            risk.status === 'active'
              ? risk.level === 'high'
                ? 'border-red-200 bg-red-50'
                : 'border-yellow-200 bg-yellow-50'
              : 'border-green-200 bg-green-50'
          }`}
        >
          <div className='flex items-center gap-2'>
            <span className='font-mono text-xs text-gray-400'>{risk.wpNumber}</span>
            <span className='font-medium text-gray-800'>{risk.title}</span>
            <span
              className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                risk.level === 'high'
                  ? 'bg-red-100 text-red-700'
                  : risk.level === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600'
              }`}
            >
              {risk.level === 'high' ? 'Hoch' : risk.level === 'medium' ? 'Mittel' : 'Niedrig'}
            </span>
          </div>
          {risk.mitigation && <p className='text-gray-500 text-xs mt-1'>{risk.mitigation}</p>}
        </div>
      ))}
      {allRisks.length === 0 && (
        <p className='text-gray-400 text-sm'>Keine Risiken dokumentiert.</p>
      )}
    </div>
  );
}

export default function PartnerTransparency(): JSX.Element {
  // Hauptkomponente hat keine Props, daher ist hier kein Interface erforderlich
  const summary = useMemo(() => calculateProjectSummary(workPackages), []);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50'>
      {/* Hero Header */}
      <header className='bg-white border-b border-gray-200'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='bg-blue-600 p-2 rounded-lg'>
              <Shield className='h-6 w-6 text-white' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Abu-Abad Teletherapie</h1>
              <p className='text-sm text-gray-500'>
                Partner-Transparenz Dashboard — Projektstand & Compliance
              </p>
            </div>
          </div>
          <p className='text-sm text-gray-400 mt-3'>
            Dieses Dashboard bietet einen transparenten Überblick über den Entwicklungsstand der
            Plattform. Alle Angaben werden regelmäßig aktualisiert. Letzte Aktualisierung:{' '}
            {new Date().toLocaleDateString('de-DE')}.
          </p>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8'>
        {/* Progress Overview */}
        <section className='bg-white rounded-2xl border border-gray-200 p-6 shadow-sm'>
          <h2 className='text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2'>
            <BarChart3 className='h-5 w-5 text-blue-600' /> Projektfortschritt
          </h2>
          <div className='flex flex-col md:flex-row items-center gap-8'>
            <ProgressRing value={summary.overallProgress} size={160} strokeWidth={14} />
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-6 flex-1'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-green-600'>{summary.completedWorkPackages}</p>
                <p className='text-xs text-gray-500'>Abgeschlossen</p>
              </div>
              <div className='text-center'>
                <p className='text-2xl font-bold text-blue-600'>{summary.inProgressWorkPackages}</p>
                <p className='text-xs text-gray-500'>In Bearbeitung</p>
              </div>
              <div className='text-center'>
                <p className='text-2xl font-bold text-gray-400'>{summary.plannedWorkPackages}</p>
                <p className='text-xs text-gray-500'>Geplant</p>
              </div>
              <div className='text-center'>
                <p className='text-2xl font-bold text-purple-600'>
                  {summary.completedMilestones}/{summary.totalMilestones}
                </p>
                <p className='text-xs text-gray-500'>Meilensteine</p>
              </div>
            </div>
          </div>
          {/* Work Package List (compact) */}
          <div className='mt-6 space-y-2'>
            {workPackages.map(wp => (
              <div
                key={wp.id}
                className='flex items-center gap-3 py-2 border-b border-gray-100 last:border-0'
              >
                {wp.status === 'completed' ? (
                  <CheckCircle2 className='h-4 w-4 text-green-500 flex-shrink-0' />
                ) : wp.status === 'in-progress' ? (
                  <Clock className='h-4 w-4 text-blue-500 flex-shrink-0' />
                ) : (
                  <div className='h-4 w-4 rounded-full border-2 border-gray-300 flex-shrink-0' />
                )}
                <span className='text-xs font-mono text-gray-400 w-14'>{wp.wpNumber}</span>
                <span className='text-sm text-gray-800 flex-1 truncate'>{wp.title}</span>
                <div className='w-24 bg-gray-200 rounded-full h-1.5'>
                  <div
                    className={`h-1.5 rounded-full ${wp.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${wp.progress}%` }}
                  />
                </div>
                <span className='text-xs text-gray-500 w-10 text-right'>{wp.progress}%</span>
              </div>
            ))}
          </div>
        </section>

        <div className='grid md:grid-cols-2 gap-8'>
          {/* Milestones */}
          <section className='bg-white rounded-2xl border border-gray-200 p-6 shadow-sm'>
            <h2 className='text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2'>
              <FileCheck className='h-5 w-5 text-purple-600' /> Meilenstein-Timeline
            </h2>
            <MilestoneTimeline packages={workPackages} />
          </section>

          {/* Budget */}
          <section className='bg-white rounded-2xl border border-gray-200 p-6 shadow-sm'>
            <h2 className='text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2'>
              <Euro className='h-5 w-5 text-amber-600' /> Budgetübersicht
            </h2>
            <BudgetOverview packages={workPackages} />
          </section>
        </div>

        {/* Risk Matrix */}
        <section className='bg-white rounded-2xl border border-gray-200 p-6 shadow-sm'>
          <h2 className='text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5 text-red-500' /> Risikomatrix
          </h2>
          <RiskMatrix packages={workPackages} />
        </section>

        {/* Compliance */}
        <section className='bg-white rounded-2xl border border-gray-200 p-6 shadow-sm'>
          <h2 className='text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2'>
            <Shield className='h-5 w-5 text-teal-600' /> Compliance & Regulatorik
          </h2>
          <div className='grid sm:grid-cols-2 gap-4 text-sm mb-4'>
            <div className='p-4 bg-teal-50 rounded-lg'>
              <p className='text-teal-800 font-medium'>Klassifizierung</p>
              <p className='text-teal-600 mt-1'>{regulatoryStatus.classification}</p>
            </div>
            <div className='p-4 bg-blue-50 rounded-lg'>
              <p className='text-blue-800 font-medium'>Compliance-Level</p>
              <p className='text-blue-600 mt-1'>{regulatoryStatus.complianceLevel}</p>
            </div>
          </div>
          <div className='flex flex-wrap gap-2 mt-4'>
            {regulatoryStatus.certifications.map(cert => (
              <span
                key={cert}
                className='inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200'
              >
                <CheckCircle2 className='h-3 w-3' /> {cert}
              </span>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-xs text-gray-400 border-t border-gray-200 mt-8'>
        <div className='flex flex-col sm:flex-row justify-between gap-4'>
          <div>
            <p className='font-medium text-gray-500 mb-1'>Abu-Abad Teletherapie GmbH i.G.</p>
            <p>DSGVO-konforme Kommunikationsplattform für Therapeuten und Patienten.</p>
            <p className='mt-1'>
              Dieses Dashboard dient der transparenten Kommunikation mit Partnern und Investoren.
              Keine personenbezogenen Patientendaten werden hier angezeigt.
            </p>
          </div>
          <div className='flex flex-col gap-1 sm:text-right'>
            <a
              href='/privacy'
              className='text-blue-500 hover:text-blue-700 inline-flex items-center gap-1'
            >
              Datenschutzerklärung <ExternalLink className='h-3 w-3' />
            </a>
            <span>Letztes Audit: {regulatoryStatus.lastAudit}</span>
            <span>Nächstes Audit: {regulatoryStatus.nextAudit}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
