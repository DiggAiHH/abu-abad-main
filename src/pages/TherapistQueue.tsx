import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  Moon,
  Pill,
  RefreshCw,
  Users,
  Video,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

interface QueueItem {
  appointmentId: string;
  patientName: string;
  startTime: string;
  joinedAt: string;
  preSessionCompleted: boolean;
  preSessionData: unknown;
  waitingMinutes: number;
}

interface PreSessionDetails {
  patientName: string;
  joinedAt: string;
  data: {
    currentMood: number;
    moodLabel: string;
    anxietyLevel: number;
    sleepQuality: number;
    sleepLabel: string;
    mainConcerns: string;
    questionsForTherapist: string;
    medicationTaken: boolean;
    significantEvents: string;
  } | null;
}

export default function TherapistQueue() {
  const { t } = useTranslation(['video', 'common', 'appointments']);
  const navigate = useNavigate();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setSelectedPatient] = useState<string | null>(null);
  const [preSessionDetails, setPreSessionDetails] = useState<PreSessionDetails | null>(null);
  const [admitting, setAdmitting] = useState<string | null>(null);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000); // Alle 10 Sekunden
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await api.get('/waiting-room/queue');
      setQueue(res.data?.queue || []);
    } catch (error) {
      // Fehlerhandling (Toast/Redirect) übernimmt i.d.R. der Axios-Interceptor
    } finally {
      setLoading(false);
    }
  };

  const viewPreSession = async (appointmentId: string) => {
    try {
      const res = await api.get(`/waiting-room/pre-session/${appointmentId}`);
      setPreSessionDetails(res.data);
      setSelectedPatient(appointmentId);
    } catch (error) {
      toast.error(t('video:errorLoadingQueueData'));
    }
  };

  const admitPatient = async (appointmentId: string) => {
    setAdmitting(appointmentId);
    try {
      const res = await api.post('/waiting-room/admit', { appointmentId });
      toast.success(t('video:patientCalledUp', { name: '' }));
      setTimeout(() => {
        navigate(`/call/${res.data?.roomId}`);
      }, 1000);
    } catch (error) {
      toast.error(t('common:networkError'));
    } finally {
      setAdmitting(null);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMoodColor = (mood: number) => {
    if (mood <= 3) return 'text-red-600';
    if (mood <= 5) return 'text-orange-500';
    if (mood <= 7) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <button onClick={() => navigate(-1)} className='text-gray-600 hover:text-gray-900'>
              <ArrowLeft className='w-5 h-5 rtl:flip' />
            </button>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>👥 {t('video:queueTitle')}</h1>
              <p className='text-sm text-gray-500'>
                {t('video:patientsWaiting', { count: queue.length })}
              </p>
            </div>
          </div>
          <button
            onClick={fetchQueue}
            className='p-2 text-gray-600 hover:bg-gray-100 rounded-lg'
            title={t('common:refresh')}
          >
            <RefreshCw className='w-5 h-5' />
          </button>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 py-6'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Warteschlange */}
          <div className='lg:col-span-2'>
            {queue.length === 0 ? (
              <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
                <Users className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  {t('video:noPatientsWaiting')}
                </h3>
                <p className='text-gray-500'>{t('video:patientsAppearHere')}</p>
              </div>
            ) : (
              <div className='space-y-4'>
                {queue.map(patient => (
                  <div
                    key={patient.appointmentId}
                    className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${
                      patient.preSessionCompleted ? 'border-green-500' : 'border-yellow-500'
                    }`}
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-4'>
                        <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                          <Users className='w-6 h-6 text-blue-600' />
                        </div>
                        <div>
                          <h3 className='font-semibold text-gray-900'>{patient.patientName}</h3>
                          <div className='flex items-center gap-4 text-sm text-gray-500'>
                            <span className='flex items-center gap-1'>
                              <Clock className='w-4 h-4' />
                              {t('video:appointment')} {formatTime(patient.startTime)}
                            </span>
                            <span className='flex items-center gap-1'>
                              <Clock className='w-4 h-4 text-orange-500' />
                              {t('video:waitingTime', { min: patient.waitingMinutes })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center gap-2'>
                        {patient.preSessionCompleted && (
                          <button
                            onClick={() => viewPreSession(patient.appointmentId)}
                            className='px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2'
                          >
                            <Eye className='w-4 h-4' />
                            {t('video:viewQuestionnaire')}
                          </button>
                        )}
                        <button
                          onClick={() => admitPatient(patient.appointmentId)}
                          disabled={admitting === patient.appointmentId}
                          className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50'
                        >
                          {admitting === patient.appointmentId ? (
                            <RefreshCw className='w-4 h-4 animate-spin' />
                          ) : (
                            <Video className='w-4 h-4' />
                          )}
                          {t('video:admitPatient')}
                        </button>
                      </div>
                    </div>

                    {/* Status-Badges */}
                    <div className='mt-4 flex gap-2'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          patient.preSessionCompleted
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {patient.preSessionCompleted ? (
                          <>
                            <CheckCircle className='w-3 h-3 inline mr-1' />
                            {t('video:questionnaireFilled')}
                          </>
                        ) : (
                          <>
                            <AlertCircle className='w-3 h-3 inline mr-1' />
                            {t('video:questionnairePending')}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pre-Session Details */}
          <div className='lg:col-span-1'>
            {preSessionDetails ? (
              <div className='bg-white rounded-xl shadow-sm p-6 sticky top-6'>
                <h3 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <MessageSquare className='w-5 h-5 text-blue-600' />
                  {t('video:preSessionData')}
                </h3>
                <p className='text-sm text-gray-500 mb-4'>{preSessionDetails.patientName}</p>

                {preSessionDetails.data ? (
                  <div className='space-y-4'>
                    {/* Stimmung */}
                    <div className='p-3 bg-gray-50 rounded-lg'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600 flex items-center gap-2'>
                          <Heart className='w-4 h-4 text-red-500' />
                          {t('video:moodLabel')}
                        </span>
                        <span
                          className={`font-semibold ${getMoodColor(preSessionDetails.data.currentMood)}`}
                        >
                          {preSessionDetails.data.currentMood}/10
                        </span>
                      </div>
                      <p className='text-xs text-gray-500 mt-1'>
                        {preSessionDetails.data.moodLabel}
                      </p>
                    </div>

                    {/* Angst */}
                    {preSessionDetails.data.anxietyLevel !== undefined && (
                      <div className='p-3 bg-gray-50 rounded-lg'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-gray-600 flex items-center gap-2'>
                            <AlertCircle className='w-4 h-4 text-orange-500' />
                            {t('video:anxietyLabel')}
                          </span>
                          <span className='font-semibold'>
                            {preSessionDetails.data.anxietyLevel}/10
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Schlaf */}
                    {preSessionDetails.data.sleepQuality && (
                      <div className='p-3 bg-gray-50 rounded-lg'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-gray-600 flex items-center gap-2'>
                            <Moon className='w-4 h-4 text-indigo-500' />
                            {t('video:sleepLabel')}
                          </span>
                          <span className='font-semibold'>
                            {'⭐'.repeat(preSessionDetails.data.sleepQuality)}
                          </span>
                        </div>
                        <p className='text-xs text-gray-500 mt-1'>
                          {preSessionDetails.data.sleepLabel}
                        </p>
                      </div>
                    )}

                    {/* Medikamente */}
                    <div className='p-3 bg-gray-50 rounded-lg'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600 flex items-center gap-2'>
                          <Pill className='w-4 h-4 text-green-500' />
                          {t('video:medicationTakenLabel')}
                        </span>
                        <span
                          className={`font-semibold ${
                            preSessionDetails.data.medicationTaken
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {preSessionDetails.data.medicationTaken
                            ? t('common:yes')
                            : t('common:no')}
                        </span>
                      </div>
                    </div>

                    {/* Hauptanliegen */}
                    {preSessionDetails.data.mainConcerns && (
                      <div>
                        <h4 className='text-sm font-medium text-gray-700 mb-2'>
                          {t('video:mainConcerns')}
                        </h4>
                        <p className='text-sm text-gray-600 bg-gray-50 p-3 rounded-lg'>
                          {preSessionDetails.data.mainConcerns}
                        </p>
                      </div>
                    )}

                    {/* Fragen */}
                    {preSessionDetails.data.questionsForTherapist && (
                      <div>
                        <h4 className='text-sm font-medium text-gray-700 mb-2'>
                          {t('video:questionsForYou')}
                        </h4>
                        <p className='text-sm text-gray-600 bg-blue-50 p-3 rounded-lg'>
                          {preSessionDetails.data.questionsForTherapist}
                        </p>
                      </div>
                    )}

                    {/* Ereignisse */}
                    {preSessionDetails.data.significantEvents && (
                      <div>
                        <h4 className='text-sm font-medium text-gray-700 mb-2'>
                          {t('video:significantEvents')}
                        </h4>
                        <p className='text-sm text-gray-600 bg-gray-50 p-3 rounded-lg'>
                          {preSessionDetails.data.significantEvents}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className='text-sm text-gray-500 italic'>
                    {t('video:questionnaireNotFilled')}
                  </p>
                )}

                <button
                  onClick={() => {
                    setSelectedPatient(null);
                    setPreSessionDetails(null);
                  }}
                  className='w-full mt-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg'
                >
                  {t('common:close')}
                </button>
              </div>
            ) : (
              <div className='bg-white rounded-xl shadow-sm p-6'>
                <div className='text-center py-8'>
                  <Eye className='w-12 h-12 text-gray-300 mx-auto mb-4' />
                  <h3 className='font-medium text-gray-900 mb-2'>{t('video:preSessionData')}</h3>
                  <p className='text-sm text-gray-500'>{t('video:selectPatientToView')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}