import { format, parseISO } from 'date-fns';
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Edit2,
  FileText,
  Plus,
  Save,
  Trash2,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { getDateLocale } from '../utils/dateLocale';
import { logger } from '../utils/logger';

// ===== TYPES =====
interface TherapyNote {
  id: string;
  patient_id: string;
  first_name: string;
  last_name: string;
  session_date: string;
  sessionDate?: string; // Demo-Modus Kompatibilität
  session_number?: number;
  session_duration?: number;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  diagnosis: string[];
  interventions: string[];
  homework?: string;
  risk_assessment: 'none' | 'low' | 'moderate' | 'high' | 'acute';
  suicidal_ideation: boolean;
  mental_status: MentalStatus;
  progress_rating?: number;
  goals_addressed: string[];
  next_session_planned?: string;
  follow_up_required: boolean;
}

interface MentalStatus {
  appearance?: string;
  behavior?: string;
  speech?: string;
  mood?: string;
  affect?: string;
  thought?: string;
  perception?: string;
  cognition?: string;
  insight?: string;
  judgment?: string;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

// ===== CONSTANTS =====
const RISK_COLORS = {
  none: 'bg-gray-100 text-gray-700',
  low: 'bg-green-100 text-green-700',
  moderate: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  acute: 'bg-red-100 text-red-700',
};

const RISK_LABEL_KEYS = {
  none: 'notes:riskNone',
  low: 'notes:riskLow',
  moderate: 'notes:riskModerate',
  high: 'notes:riskHigh',
  acute: 'notes:riskAcute',
};

const COMMON_INTERVENTION_KEYS = [
  'notes:interventionCognitiveRestructuring',
  'notes:interventionBehavioralExperiments',
  'notes:interventionExposure',
  'notes:interventionMindfulness',
  'notes:interventionRelaxation',
  'notes:interventionPsychoEducation',
  'notes:interventionBehavioralActivation',
  'notes:interventionProblemSolving',
  'notes:interventionSocialSkills',
  'notes:interventionChairDialog',
  'notes:interventionEMDR',
  'notes:interventionImaginative',
];

// ===== MAIN COMPONENT =====
export default function TherapyNotes() {
  const { t } = useTranslation(['notes', 'common']);
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId?: string }>();

  const [notes, setNotes] = useState<TherapyNote[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>(patientId || '');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<TherapyNote | null>(null);
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    sessionDate: string;
    sessionDuration: number;
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    diagnosis: string[];
    interventions: string[];
    homework: string;
    riskAssessment: 'none' | 'low' | 'moderate' | 'high' | 'acute';
    suicidalIdeation: boolean;
    mentalStatus: MentalStatus;
    progressRating: number;
    goalsAddressed: string[];
    followUpRequired: boolean;
  }>({
    sessionDate: new Date().toISOString().split('T')[0],
    sessionDuration: 50,
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    diagnosis: [] as string[],
    interventions: [] as string[],
    homework: '',
    riskAssessment: 'none',
    suicidalIdeation: false,
    mentalStatus: {} as MentalStatus,
    progressRating: 3,
    goalsAddressed: [] as string[],
    followUpRequired: false,
  });

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      loadNotes(selectedPatient);
    }
  }, [selectedPatient]);

  const loadPatients = async () => {
    try {
      // Lade Patienten mit aktiven Terminen
      const res = await api.get('/appointments?status=booked');
      const appointments = Array.isArray(res.data)
        ? res.data
        : Array.isArray((res.data as any)?.appointments)
          ? (res.data as any).appointments
          : [];

      // Unique Patienten extrahieren
      const patientMap = new Map<string, Patient>();
      appointments.forEach((apt: any) => {
        if (apt.patientId && apt.patient) {
          patientMap.set(apt.patientId, {
            id: apt.patientId,
            first_name: apt.patient.firstName,
            last_name: apt.patient.lastName,
          });
        }
      });

      setPatients(Array.from(patientMap.values()));
    } catch (error) {
      logger.error('TherapyNotes: Fehler beim Laden der Patienten', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async (patientId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/therapy-notes/patient/${patientId}`);
      setNotes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      logger.error('TherapyNotes: Fehler beim Laden der Notizen', error);
      toast.error(t('common:errorLoadingData'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      sessionDate: format(new Date(), 'yyyy-MM-dd'),
      sessionDuration: 50,
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
      diagnosis: [],
      interventions: [],
      homework: '',
      riskAssessment: 'none',
      suicidalIdeation: false,
      mentalStatus: {},
      progressRating: 3,
      goalsAddressed: [],
      followUpRequired: false,
    });
    setEditingNote(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      toast.error(t('notes:selectPatient'));
      return;
    }

    try {
      if (editingNote) {
        await api.put(`/therapy-notes/${editingNote.id}`, formData);
        toast.success(t('notes:noteUpdated'));
      } else {
        await api.post('/therapy-notes', {
          ...formData,
          patientId: selectedPatient,
        });
        toast.success(t('notes:noteSaved'));
      }

      setShowForm(false);
      resetForm();
      loadNotes(selectedPatient);
    } catch (error) {
      toast.error(t('common:errorSaving'));
    }
  };

  const handleEdit = (note: TherapyNote) => {
    setFormData({
      sessionDate:
        (note.session_date || note.sessionDate || '').split('T')[0] ||
        format(new Date(), 'yyyy-MM-dd'),
      sessionDuration: note.session_duration || 50,
      subjective: note.subjective || '',
      objective: note.objective || '',
      assessment: note.assessment || '',
      plan: note.plan || '',
      diagnosis: note.diagnosis || [],
      interventions: note.interventions || [],
      homework: note.homework || '',
      riskAssessment: note.risk_assessment,
      suicidalIdeation: note.suicidal_ideation,
      mentalStatus: note.mental_status || {},
      progressRating: note.progress_rating || 3,
      goalsAddressed: note.goals_addressed || [],
      followUpRequired: note.follow_up_required,
    });
    setEditingNote(note);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common:confirmDelete'))) return;

    try {
      await api.delete(`/therapy-notes/${id}`);
      toast.success(t('notes:noteDeleted'));
      loadNotes(selectedPatient);
    } catch (error) {
      toast.error(t('common:errorDeleting'));
    }
  };

  const toggleIntervention = (intervention: string) => {
    setFormData(prev => ({
      ...prev,
      interventions: prev.interventions.includes(intervention)
        ? prev.interventions.filter(i => i !== intervention)
        : [...prev.interventions, intervention],
    }));
  };

  if (loading && !selectedPatient) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='spinner' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => navigate('/dashboard')}
                className='p-2 hover:bg-gray-100 rounded-lg'
              >
                <ArrowLeft size={24} className='rtl:flip' />
              </button>
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>{t('notes:title')}</h1>
                <p className='text-sm text-gray-600'>{t('notes:subtitle')}</p>
              </div>
            </div>
            {selectedPatient && (
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'
              >
                <Plus size={20} />
                {t('notes:newNote')}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Patient Selection */}
        <div className='bg-white rounded-lg shadow p-4 mb-6'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            <User className='inline me-2' size={16} />
            {t('common:patient')} {t('common:select').toLowerCase()}
          </label>
          <select
            value={selectedPatient}
            onChange={e => setSelectedPatient(e.target.value)}
            className='w-full md:w-1/2 border rounded-lg px-3 py-2'
          >
            <option value=''>{t('notes:selectPatient')}</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.first_name} {p.last_name}
              </option>
            ))}
          </select>
        </div>

        {/* Notes Form Modal */}
        {showForm && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
              <div className='sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center'>
                <h2 className='text-xl font-bold'>
                  {editingNote ? t('notes:editNote') : t('notes:newNote')}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className='text-gray-500 hover:text-gray-700'
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className='p-6 space-y-6'>
                {/* Session Metadata */}
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      {t('notes:sessionDate')}
                    </label>
                    <input
                      type='date'
                      value={formData.sessionDate}
                      onChange={e => setFormData({ ...formData, sessionDate: e.target.value })}
                      className='w-full border rounded-lg px-3 py-2'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      {t('notes:sessionDuration')}
                    </label>
                    <input
                      type='number'
                      min='5'
                      max='180'
                      value={formData.sessionDuration}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          sessionDuration: parseInt(e.target.value),
                        })
                      }
                      className='w-full border rounded-lg px-3 py-2'
                    />
                  </div>
                </div>

                {/* SOAP Format */}
                <div className='space-y-4'>
                  <h3 className='font-bold text-lg border-b pb-2'>📋 {t('notes:subtitle')}</h3>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      <span className='text-blue-600 font-bold'>S</span>
                      {t('notes:soapSubjective').slice(1)}
                    </label>
                    <textarea
                      value={formData.subjective}
                      onChange={e => setFormData({ ...formData, subjective: e.target.value })}
                      rows={4}
                      placeholder={t('notes:soapSubjectivePlaceholder')}
                      className='w-full border rounded-lg px-3 py-2'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      <span className='text-green-600 font-bold'>O</span>
                      {t('notes:soapObjective').slice(1)}
                    </label>
                    <textarea
                      value={formData.objective}
                      onChange={e => setFormData({ ...formData, objective: e.target.value })}
                      rows={4}
                      placeholder={t('notes:soapObjectivePlaceholder')}
                      className='w-full border rounded-lg px-3 py-2'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      <span className='text-purple-600 font-bold'>A</span>
                      {t('notes:soapAssessment').slice(1)}
                    </label>
                    <textarea
                      value={formData.assessment}
                      onChange={e => setFormData({ ...formData, assessment: e.target.value })}
                      rows={4}
                      placeholder={t('notes:soapAssessmentPlaceholder')}
                      className='w-full border rounded-lg px-3 py-2'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      <span className='text-orange-600 font-bold'>P</span>
                      {t('notes:soapPlan').slice(1)}
                    </label>
                    <textarea
                      value={formData.plan}
                      onChange={e => setFormData({ ...formData, plan: e.target.value })}
                      rows={4}
                      placeholder={t('notes:soapPlanPlaceholder')}
                      className='w-full border rounded-lg px-3 py-2'
                    />
                  </div>
                </div>

                {/* Interventions */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    {t('notes:interventions')}
                  </label>
                  <div className='flex flex-wrap gap-2'>
                    {COMMON_INTERVENTION_KEYS.map(key => (
                      <button
                        key={key}
                        type='button'
                        onClick={() => toggleIntervention(t(key))}
                        className={`px-3 py-1 rounded-full text-sm transition ${
                          formData.interventions.includes(t(key))
                            ? 'bg-blue-100 text-blue-700 border-blue-300 border'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {t(key)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Homework */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    {t('notes:homework')}
                  </label>
                  <textarea
                    value={formData.homework}
                    onChange={e => setFormData({ ...formData, homework: e.target.value })}
                    rows={2}
                    placeholder={t('notes:homework')}
                    className='w-full border rounded-lg px-3 py-2'
                  />
                </div>

                {/* Risk Assessment */}
                <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                  <h4 className='font-bold text-red-700 mb-3 flex items-center gap-2'>
                    <AlertTriangle size={20} />
                    {t('notes:riskAssessment')}
                  </h4>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        {t('notes:riskAssessment')}
                      </label>
                      <select
                        value={formData.riskAssessment}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            riskAssessment: e.target.value as any,
                          })
                        }
                        className='w-full border rounded-lg px-3 py-2'
                      >
                        <option value='none'>{t('notes:riskNone')}</option>
                        <option value='low'>{t('notes:riskLow')}</option>
                        <option value='moderate'>{t('notes:riskModerate')}</option>
                        <option value='high'>{t('notes:riskHigh')}</option>
                        <option value='acute'>{t('notes:riskAcute')}</option>
                      </select>
                    </div>
                    <div className='flex items-center'>
                      <label className='flex items-center gap-2 cursor-pointer'>
                        <input
                          type='checkbox'
                          checked={formData.suicidalIdeation}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              suicidalIdeation: e.target.checked,
                            })
                          }
                          className='rounded'
                        />
                        <span className='text-sm font-medium text-red-700'>
                          {t('notes:suicidalIdeation')}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    {t('notes:progressRating')}: {formData.progressRating}/5
                  </label>
                  <input
                    type='range'
                    min='1'
                    max='5'
                    value={formData.progressRating}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        progressRating: parseInt(e.target.value),
                      })
                    }
                    className='w-full'
                  />
                  <div className='flex justify-between text-xs text-gray-500'>
                    <span>1</span>
                    <span>3</span>
                    <span>5</span>
                  </div>
                </div>

                {/* Follow Up */}
                <div className='flex items-center'>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={formData.followUpRequired}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          followUpRequired: e.target.checked,
                        })
                      }
                      className='rounded'
                    />
                    <span className='text-sm font-medium'>{t('notes:followUpRequired')}</span>
                  </label>
                </div>

                {/* Submit */}
                <div className='flex gap-4 pt-4'>
                  <button
                    type='button'
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className='flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50'
                  >
                    {t('common:cancel')}
                  </button>
                  <button
                    type='submit'
                    className='flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                  >
                    <Save size={20} />
                    {t('common:save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Notes List */}
        {!selectedPatient ? (
          <div className='bg-white rounded-lg shadow p-8 text-center'>
            <User size={48} className='mx-auto text-gray-400 mb-4' />
            <h3 className='text-lg font-semibold text-gray-700 mb-2'>{t('notes:selectPatient')}</h3>
            <p className='text-gray-500'>{t('notes:selectPatient')}</p>
          </div>
        ) : loading ? (
          <div className='flex justify-center py-12'>
            <div className='spinner' />
          </div>
        ) : notes.length === 0 ? (
          <div className='bg-white rounded-lg shadow p-8 text-center'>
            <FileText size={48} className='mx-auto text-gray-400 mb-4' />
            <h3 className='text-lg font-semibold text-gray-700 mb-2'>{t('notes:noNotes')}</h3>
            <p className='text-gray-500 mb-4'>{t('notes:noNotes')}</p>
            <button
              onClick={() => setShowForm(true)}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
            >
              {t('notes:newNote')}
            </button>
          </div>
        ) : (
          <div className='space-y-4'>
            {notes.map(note => (
              <div key={note.id} className='bg-white rounded-lg shadow overflow-hidden'>
                {/* Note Header */}
                <div
                  className='p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50'
                  onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
                >
                  <div className='flex items-center gap-4'>
                    <div className='text-center'>
                      <p className='text-2xl font-bold text-blue-600'>
                        {note.session_date || note.sessionDate
                          ? format(parseISO(note.session_date || note.sessionDate!), 'dd', {
                              locale: getDateLocale(),
                            })
                          : '–'}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {note.session_date || note.sessionDate
                          ? format(parseISO(note.session_date || note.sessionDate!), 'MMM yy', {
                              locale: getDateLocale(),
                            })
                          : '–'}
                      </p>
                    </div>
                    <div>
                      <p className='font-semibold'>
                        {note.first_name} {note.last_name}
                      </p>
                      <p className='text-sm text-gray-600'>
                        {note.session_duration} {t('common:min')} | {t('notes:progressRating')}:{' '}
                        {note.progress_rating || '-'}/5
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        RISK_COLORS[note.risk_assessment] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {t(RISK_LABEL_KEYS[note.risk_assessment] || 'notes:riskNone')}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleEdit(note);
                      }}
                      className='p-2 text-blue-600 hover:bg-blue-50 rounded'
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(note.id);
                      }}
                      className='p-2 text-red-600 hover:bg-red-50 rounded'
                    >
                      <Trash2 size={16} />
                    </button>
                    {expandedNote === note.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedNote === note.id && (
                  <div className='border-t p-4 space-y-4'>
                    {/* SOAP Sections */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {note.subjective && (
                        <div className='bg-blue-50 rounded p-3'>
                          <h4 className='font-bold text-blue-700 text-sm mb-1'>
                            {t('notes:soapSubjective')}
                          </h4>
                          <p className='text-sm'>{note.subjective}</p>
                        </div>
                      )}
                      {note.objective && (
                        <div className='bg-green-50 rounded p-3'>
                          <h4 className='font-bold text-green-700 text-sm mb-1'>
                            {t('notes:soapObjective')}
                          </h4>
                          <p className='text-sm'>{note.objective}</p>
                        </div>
                      )}
                      {note.assessment && (
                        <div className='bg-purple-50 rounded p-3'>
                          <h4 className='font-bold text-purple-700 text-sm mb-1'>
                            {t('notes:soapAssessment')}
                          </h4>
                          <p className='text-sm'>{note.assessment}</p>
                        </div>
                      )}
                      {note.plan && (
                        <div className='bg-orange-50 rounded p-3'>
                          <h4 className='font-bold text-orange-700 text-sm mb-1'>
                            {t('notes:soapPlan')}
                          </h4>
                          <p className='text-sm'>{note.plan}</p>
                        </div>
                      )}
                    </div>

                    {/* Interventions */}
                    {note.interventions?.length > 0 && (
                      <div>
                        <h4 className='font-medium text-sm text-gray-700 mb-1'>
                          {t('notes:interventions')}:
                        </h4>
                        <div className='flex flex-wrap gap-1'>
                          {note.interventions.map((int, i) => (
                            <span
                              key={i}
                              className='px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full'
                            >
                              {int}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Homework */}
                    {note.homework && (
                      <div className='bg-yellow-50 border border-yellow-200 rounded p-3'>
                        <h4 className='font-bold text-yellow-700 text-sm mb-1'>
                          📝 {t('notes:homework')}
                        </h4>
                        <p className='text-sm'>{note.homework}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
