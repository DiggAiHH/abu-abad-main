/**
 * @page ProjectTracking
 * @description Projekt-Tracking Dashboard für Arbeitspakete, Meilensteine und Compliance-Status.
 * Für interne Nutzung und Partner-/Investoren-Transparenz.
 * @audit Keine personenbezogenen Daten — rein projektbezogene Informationen.
 * @version 1.0.0
 */
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Euro,
  FileCheck,
  Shield,
  Target,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateProjectSummary, regulatoryStatus, workPackages } from '../data/projectData';
import type { WorkPackage, WorkPackageStatus } from '../types/projectTypes';

type FilterStatus = 'all' | WorkPackageStatus;

const statusConfig: Record<
  WorkPackageStatus,
  { label: string; color: string; bg: string; icon: typeof CheckCircle2 }
> = {
  completed: {
    label: 'Abgeschlossen',
    color: 'text-green-700',
    bg: 'bg-green-100',
    icon: CheckCircle2,
  },
  'in-progress': {
    label: 'In Bearbeitung',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    icon: Clock,
  },
  planned: { label: 'Geplant', color: 'text-gray-600', bg: 'bg-gray-100', icon: Calendar },
  blocked: { label: 'Blockiert', color: 'text-red-700', bg: 'bg-red-100', icon: AlertTriangle },
};

function StatusBadge({ status }: { status: WorkPackageStatus }): JSX.Element {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}
    >
      <Icon className='h-3.5 w-3.5' />
      {cfg.label}
    </span>
  );
}

function ProgressBar({
  value,
  className = '',
}: {
  value: number;
  className?: string;
}): JSX.Element {
  const clamp = Math.max(0, Math.min(100, value));
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
      <div
        className={`h-2.5 rounded-full transition-all duration-500 ${
          clamp === 100
            ? 'bg-green-500'
            : clamp >= 60
              ? 'bg-blue-500'
              : clamp >= 30
                ? 'bg-yellow-500'
                : 'bg-red-500'
        }`}
        style={{ width: `${clamp}%` }}
        role='progressbar'
        aria-valuenow={clamp}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${clamp}% abgeschlossen`}
      />
    </div>
  );
}

function SummaryCards(): JSX.Element {
  const summary = useMemo(() => calculateProjectSummary(workPackages), []);
  const budgetPercent =
    summary.totalBudget > 0 ? Math.round((summary.totalSpent / summary.totalBudget) * 100) : 0;
  const cards = [
    {
      title: 'Gesamtfortschritt',
      value: `${summary.overallProgress}%`,
      icon: BarChart3,
      color: 'text-blue-600',
      bgIcon: 'bg-blue-50',
    },
    {
      title: 'Arbeitspakete',
      value: `${summary.completedWorkPackages}/${summary.totalWorkPackages}`,
      icon: Target,
      color: 'text-green-600',
      bgIcon: 'bg-green-50',
    },
    {
      title: 'Meilensteine',
      value: `${summary.completedMilestones}/${summary.totalMilestones}`,
      icon: FileCheck,
      color: 'text-purple-600',
      bgIcon: 'bg-purple-50',
    },
    {
      title: 'Budgetauslastung',
      value: `${budgetPercent}%`,
      icon: Euro,
      color: 'text-amber-600',
      bgIcon: 'bg-amber-50',
    },
    {
      title: 'Offene Risiken',
      value: `${summary.activeRisks}`,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgIcon: 'bg-red-50',
    },
    {
      title: 'Compliance-Status',
      value: regulatoryStatus.openFindings > 0 ? `${regulatoryStatus.openFindings} offen` : 'OK',
      icon: Shield,
      color: 'text-teal-600',
      bgIcon: 'bg-teal-50',
    },
  ];

  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8'>
      {cards.map(c => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            className='bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow'
          >
            <div className={`inline-flex p-2 rounded-lg ${c.bgIcon} mb-3`}>
              <Icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <p className='text-xs text-gray-500 font-medium'>{c.title}</p>
            <p className='text-xl font-bold text-gray-900 mt-1'>{c.value}</p>
          </div>
        );
      })}
    </div>
  );
}

function WorkPackageCard({ wp }: { wp: WorkPackage }): JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const completedTasks = wp.tasks.filter(t => t.status === 'completed').length;
  const budgetPercent = wp.budget && wp.spent ? Math.round((wp.spent / wp.budget) * 100) : 0;

  return (
    <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow'>
      {/* Header */}
      <button
        onClick={() => setExpanded(prev => !prev)}
        className='w-full flex items-start gap-4 p-5 text-left hover:bg-gray-50 transition-colors'
        aria-expanded={expanded}
        aria-label={`Arbeitspaket ${wp.wpNumber}: ${wp.title}`}
      >
        <span className='mt-1 text-gray-400'>
          {expanded ? <ChevronDown className='h-5 w-5' /> : <ChevronRight className='h-5 w-5' />}
        </span>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-3 flex-wrap mb-1'>
            <span className='text-xs font-mono font-bold text-gray-400'>{wp.wpNumber}</span>
            <StatusBadge status={wp.status} />
            {wp.priority === 'critical' && (
              <span className='text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded font-medium'>
                Kritisch
              </span>
            )}
          </div>
          <h3 className='text-base font-semibold text-gray-900 truncate'>{wp.title}</h3>
          <p className='text-sm text-gray-500 mt-1 line-clamp-2'>{wp.description}</p>
          <div className='flex items-center gap-4 mt-3'>
            <ProgressBar value={wp.progress} className='flex-1 max-w-xs' />
            <span className='text-sm font-medium text-gray-700'>{wp.progress}%</span>
          </div>
        </div>
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className='border-t border-gray-100 p-5 bg-gray-50/50 space-y-5'>
          {/* Aufgaben */}
          <div>
            <h4 className='text-sm font-semibold text-gray-700 mb-2'>
              Aufgaben ({completedTasks}/{wp.tasks.length})
            </h4>
            <div className='grid gap-1.5'>
              {wp.tasks.map(task => (
                <div key={task.id} className='flex items-center gap-2 text-sm'>
                  {task.status === 'completed' ? (
                    <CheckCircle2 className='h-4 w-4 text-green-500 flex-shrink-0' />
                  ) : task.status === 'in-progress' ? (
                    <Clock className='h-4 w-4 text-blue-500 flex-shrink-0' />
                  ) : (
                    <div className='h-4 w-4 rounded-full border-2 border-gray-300 flex-shrink-0' />
                  )}
                  <span
                    className={
                      task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-700'
                    }
                  >
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Meilensteine */}
          {wp.milestones.length > 0 && (
            <div>
              <h4 className='text-sm font-semibold text-gray-700 mb-2'>Meilensteine</h4>
              <div className='space-y-2'>
                {wp.milestones.map(ms => (
                  <div key={ms.id} className='flex items-start gap-3 text-sm'>
                    <FileCheck
                      className={`h-4 w-4 mt-0.5 flex-shrink-0 ${ms.status === 'completed' ? 'text-green-500' : ms.status === 'in-progress' ? 'text-blue-500' : 'text-gray-400'}`}
                    />
                    <div>
                      <span className='font-medium text-gray-800'>{ms.title}</span>
                      <span className='text-gray-400 mx-1.5'>·</span>
                      <span className='text-gray-500'>{ms.date}</span>
                      {ms.description && (
                        <p className='text-gray-400 text-xs mt-0.5'>{ms.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Budget */}
          {wp.budget !== null && wp.budget !== undefined && (
            <div>
              <h4 className='text-sm font-semibold text-gray-700 mb-2'>Budget</h4>
              <div className='flex items-center gap-4'>
                <ProgressBar value={budgetPercent} className='flex-1 max-w-xs' />
                <span className='text-sm text-gray-600'>
                  {wp.spent?.toLocaleString('de-DE')} € / {wp.budget.toLocaleString('de-DE')} € (
                  {budgetPercent}%)
                </span>
              </div>
            </div>
          )}

          {/* Risiken */}
          {wp.risks.length > 0 && (
            <div>
              <h4 className='text-sm font-semibold text-gray-700 mb-2'>Risiken</h4>
              <div className='space-y-2'>
                {wp.risks.map(risk => (
                  <div
                    key={risk.id}
                    className={`p-3 rounded-lg border text-sm ${
                      risk.level === 'high'
                        ? 'border-red-200 bg-red-50'
                        : risk.level === 'medium'
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className='flex items-center gap-2'>
                      <AlertTriangle
                        className={`h-4 w-4 ${risk.level === 'high' ? 'text-red-500' : 'text-yellow-500'}`}
                      />
                      <span className='font-medium text-gray-800'>{risk.title}</span>
                      <span
                        className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                          risk.status === 'mitigated'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {risk.status === 'mitigated' ? 'Mitigiert' : 'Aktiv'}
                      </span>
                    </div>
                    {risk.mitigation && (
                      <p className='text-gray-500 mt-1 ml-6'>Maßnahme: {risk.mitigation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className='flex flex-wrap gap-4 text-xs text-gray-400 pt-2 border-t border-gray-200'>
            <span>Verantwortlich: {wp.responsible}</span>
            <span>Start: {wp.startDate}</span>
            <span>Ende: {wp.endDate}</span>
            {wp.tags.length > 0 && (
              <span className='flex gap-1 flex-wrap'>
                {wp.tags.map(tag => (
                  <span key={tag} className='bg-gray-100 px-1.5 py-0.5 rounded text-gray-500'>
                    #{tag}
                  </span>
                ))}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectTracking(): JSX.Element {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterStatus>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return [...workPackages];
    return workPackages.filter(wp => wp.status === filter);
  }, [filter]);

  const filterTabs: { value: FilterStatus; label: string; count: number }[] = [
    { value: 'all', label: 'Alle', count: workPackages.length },
    {
      value: 'completed',
      label: 'Abgeschlossen',
      count: workPackages.filter(wp => wp.status === 'completed').length,
    },
    {
      value: 'in-progress',
      label: 'In Bearbeitung',
      count: workPackages.filter(wp => wp.status === 'in-progress').length,
    },
    {
      value: 'planned',
      label: 'Geplant',
      count: workPackages.filter(wp => wp.status === 'planned').length,
    },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white border-b border-gray-200 sticky top-0 z-30'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4'>
          <button
            onClick={() => navigate('/dashboard')}
            className='text-gray-400 hover:text-gray-600 transition-colors'
            aria-label='Zurück zum Dashboard'
          >
            <ArrowLeft className='h-5 w-5' />
          </button>
          <div>
            <h1 className='text-xl font-bold text-gray-900'>Projekt-Tracking</h1>
            <p className='text-sm text-gray-500'>
              Abu-Abad Teletherapie-Plattform — Arbeitspakete & Compliance
            </p>
          </div>
        </div>
      </header>

      <main id='main-content' className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Summary */}
        <SummaryCards />

        {/* Regulatory Status */}
        <div className='bg-white rounded-xl border border-gray-200 p-5 mb-8 shadow-sm'>
          <div className='flex items-center gap-3 mb-3'>
            <Shield className='h-5 w-5 text-teal-600' />
            <h2 className='text-base font-semibold text-gray-900'>Regulatorischer Status</h2>
          </div>
          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm'>
            <div>
              <span className='text-gray-500'>Klassifizierung:</span>
              <br />
              <span className='font-medium'>{regulatoryStatus.classification}</span>
            </div>
            <div>
              <span className='text-gray-500'>Compliance-Level:</span>
              <br />
              <span className='font-medium'>{regulatoryStatus.complianceLevel}</span>
            </div>
            <div>
              <span className='text-gray-500'>Letztes Audit:</span>
              <br />
              <span className='font-medium'>{regulatoryStatus.lastAudit}</span>
            </div>
            <div>
              <span className='text-gray-500'>Nächstes Audit:</span>
              <br />
              <span className='font-medium'>{regulatoryStatus.nextAudit}</span>
            </div>
          </div>
          <div className='mt-3 flex flex-wrap gap-2'>
            {regulatoryStatus.certifications.map(cert => (
              <span key={cert} className='text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full'>
                ✓ {cert}
              </span>
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className='flex gap-2 mb-6 overflow-x-auto pb-1'>
          {filterTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === tab.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Work Packages */}
        <div className='space-y-4'>
          {filtered.map(wp => (
            <WorkPackageCard key={wp.id} wp={wp} />
          ))}
          {filtered.length === 0 && (
            <div className='text-center py-12 text-gray-400'>
              <Target className='h-12 w-12 mx-auto mb-3' />
              <p className='text-lg font-medium'>Keine Arbeitspakete gefunden</p>
              <p className='text-sm'>Für den ausgewählten Filter gibt es keine Ergebnisse.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-xs text-gray-400 border-t border-gray-100 mt-8'>
        <p>
          © {new Date().getFullYear()} Abu-Abad Teletherapie. Alle Angaben ohne Gewähr. Diese
          Projektdaten dienen der internen Transparenz und der Vorbereitung auf behördliche Audits
          gemäß DSGVO Art. 5 Abs. 2 (Rechenschaftspflicht).
        </p>
      </footer>
    </div>
  );
}
