import { loadStripe } from '@stripe/stripe-js';
import { format } from 'date-fns';
import { Calendar, Clock, CreditCard, LogOut, MessageSquare, User, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI, messageAPI, paymentAPI } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { Appointment, Message } from '../types';
import { getDateLocale } from '../utils/dateLocale';
import { logger } from '../utils/logger';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_PUBLISHABLE_KEY
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : Promise.resolve(null);

export default function PatientDashboard() {
  const { t } = useTranslation(['dashboard', 'nav', 'common', 'appointments', 'auth']);
  const { user, logout } = useAuthStore();
  const isDemo = useAuthStore(state => state.isDemo);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my-appointments' | 'book' | 'messages'>(
    'my-appointments'
  );

  useEffect(() => {
    // Guard clause: User muss existieren
    if (!user?.id) {
      logger.warn('PatientDashboard: no user found, redirecting to login');
      navigate('/login');
      return;
    }

    if (isDemo) {
      // Demo-Daten ohne API-Call
      const now = new Date();
      const tomorrow10 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0);
      const tomorrow11 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 0);
      const nextWeek14 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 14, 0);
      const nextWeek15 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 15, 0);
      const avail1Start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 9, 0);
      const avail1End = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 10, 0);
      const avail2Start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 15, 0);
      const avail2End = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 16, 0);
      setAppointments([
        {
          id: 'demo-apt-1',
          therapistId: 't1',
          patientId: user.id,
          startTime: tomorrow10.toISOString(),
          endTime: tomorrow11.toISOString(),
          status: 'booked',
          price: 120,
          paymentStatus: 'completed',
          meetingRoomId: 'room-demo-1',
          therapist: { firstName: 'Sarah', lastName: 'Müller' },
        },
        {
          id: 'demo-apt-2',
          therapistId: 't1',
          patientId: user.id,
          startTime: nextWeek14.toISOString(),
          endTime: nextWeek15.toISOString(),
          status: 'booked',
          price: 120,
          paymentStatus: 'pending',
          meetingRoomId: 'room-demo-2',
          therapist: { firstName: 'Sarah', lastName: 'Müller' },
        },
      ]);
      setAvailableSlots([
        {
          id: 'demo-avail-1',
          therapistId: 't1',
          startTime: avail1Start.toISOString(),
          endTime: avail1End.toISOString(),
          status: 'available',
          price: 120,
          paymentStatus: 'pending',
          therapist: { firstName: 'Sarah', lastName: 'Müller' },
        },
        {
          id: 'demo-avail-2',
          therapistId: 't2',
          startTime: avail2Start.toISOString(),
          endTime: avail2End.toISOString(),
          status: 'available',
          price: 150,
          paymentStatus: 'pending',
          therapist: { firstName: 'Thomas', lastName: 'Weber' },
        },
      ]);
      setMessages([
        {
          id: 'msg-d1',
          senderId: 't1',
          receiverId: user.id,
          content: 'Bitte bringen Sie zum nächsten Termin Ihre Medikamentenliste mit.',
          read: false,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          sender: { firstName: 'Dr. Sarah', lastName: 'Müller' },
        },
        {
          id: 'msg-d2',
          senderId: 't1',
          receiverId: user.id,
          content: 'Ihre Übungsblätter sind bereit zum Download.',
          read: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          sender: { firstName: 'Dr. Sarah', lastName: 'Müller' },
        },
      ]);
      setLoading(false);
      return;
    }

    loadData();
  }, [user?.id, isDemo]);

  const loadData = async () => {
    setLoading(true);

    try {
      // Guard clause: User muss existieren
      if (!user?.id) {
        throw new Error(t('common:userNotAuthenticated'));
      }

      const [apptRes, availRes, msgRes] = await Promise.all([
        appointmentAPI.getAll({ status: 'booked' }),
        appointmentAPI.getAll({ status: 'available' }),
        messageAPI.getAll(),
      ]);

      // Defensive checks - sicherstellen dass Arrays zurückkommen
      const allAppointments = Array.isArray(apptRes.data)
        ? apptRes.data
        : Array.isArray((apptRes.data as any)?.appointments)
          ? (apptRes.data as any).appointments
          : [];
      const available = Array.isArray(availRes.data)
        ? availRes.data
        : Array.isArray((availRes.data as any)?.appointments)
          ? (availRes.data as any).appointments
          : [];
      const msgs = Array.isArray(msgRes.data) ? msgRes.data : [];

      setAppointments(allAppointments.filter((a: Appointment) => a.patientId === user.id));
      setAvailableSlots(available);
      setMessages(msgs);
    } catch (error: any) {
      logger.error('PatientDashboard: Fehler beim Laden', error);

      if (error.response?.status === 401) {
        toast.error(t('common:sessionExpired'));
        void logout();
        navigate('/login');
      } else if (!error.response) {
        toast.error(t('common:noConnectionServerUpdate'));
      } else {
        toast.error(t('common:errorLoadingData'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    void logout();
    navigate('/login');
    toast.success(t('auth:logoutSuccess'));
  };

  const bookAppointment = async (appointmentId: string) => {
    if (!appointmentId) {
      toast.error(t('common:invalidId'));
      return;
    }

    if (!user?.id) {
      toast.error(t('common:mustBeLoggedIn'));
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      await appointmentAPI.book(appointmentId);
      toast.success(t('appointments:bookedSuccess'));

      // Stripe Checkout
      const { data } = await paymentAPI.createCheckout(appointmentId);
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error(t('appointments:stripeLoadError'));
      }

      if (!data?.sessionId) {
        throw new Error(t('appointments:noStripeSession'));
      }

      const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      logger.error('PatientDashboard: Buchungsfehler', error);
      toast.error(error.message || t('appointments:bookingFailed'));
      await loadData(); // Daten neu laden nach Fehler
    } finally {
      setLoading(false);
    }
  };

  const startVideoCall = (roomId: string) => {
    navigate(`/call/${roomId}`);
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='spinner'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                {t('dashboard:patientDashboard')}
              </h1>
              <p className='text-sm text-gray-600'>
                {t('dashboard:welcomeUser', { name: `${user?.firstName} ${user?.lastName}` })}
              </p>
            </div>
            <button
              onClick={handleLogout}
              aria-label={t('auth:logout')}
              className='flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition'
            >
              <LogOut size={20} />
              {t('auth:logout')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id='main-content' className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center gap-4'>
              <div className='bg-blue-100 p-3 rounded-lg'>
                <Calendar className='text-blue-600' size={24} />
              </div>
              <div>
                <p className='text-sm text-gray-600'>{t('dashboard:myAppointments')}</p>
                <p className='text-2xl font-bold'>{appointments.length}</p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center gap-4'>
              <div className='bg-green-100 p-3 rounded-lg'>
                <Clock className='text-green-600' size={24} />
              </div>
              <div>
                <p className='text-sm text-gray-600'>{t('dashboard:availableSlots')}</p>
                <p className='text-2xl font-bold'>{availableSlots.length}</p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center gap-4'>
              <div className='bg-purple-100 p-3 rounded-lg'>
                <MessageSquare className='text-purple-600' size={24} />
              </div>
              <div>
                <p className='text-sm text-gray-600'>{t('dashboard:newMessages')}</p>
                <p className='text-2xl font-bold'>{messages.filter(m => !m.read).length}</p>
              </div>
            </div>
          </div>

          <button
            type='button'
            onClick={() => navigate('/materials')}
            aria-label={t('dashboard:materialsLink')}
            className='bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition text-left w-full border-0'
          >
            <div className='flex items-center gap-4'>
              <div className='bg-orange-100 p-3 rounded-lg'>
                <User className='text-orange-600' size={24} />
              </div>
              <div>
                <p className='text-sm text-gray-600'>{t('dashboard:preparation')}</p>
                <p className='text-lg font-bold'>{t('dashboard:materialsLink')}</p>
              </div>
            </div>
          </button>
        </div>

        {/* Quick Actions */}
        <div className='grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8'>
          <button
            onClick={() => navigate('/diary')}
            className='bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg shadow-lg p-5 hover:shadow-xl transition text-left'
          >
            <h3 className='text-lg font-bold mb-1'>📔 {t('nav:diary')}</h3>
            <p className='text-indigo-100 text-sm'>{t('nav:diarySubtitle')}</p>
          </button>

          <button
            onClick={() => navigate('/screenings')}
            className='bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-lg shadow-lg p-5 hover:shadow-xl transition text-left'
          >
            <h3 className='text-lg font-bold mb-1'>📊 {t('nav:screenings')}</h3>
            <p className='text-teal-100 text-sm'>{t('nav:screeningsSubtitle')}</p>
          </button>

          <button
            onClick={() => navigate('/crisis-plan')}
            className='bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow-lg p-5 hover:shadow-xl transition text-left'
          >
            <h3 className='text-lg font-bold mb-1'>🆘 {t('nav:crisisPlan')}</h3>
            <p className='text-red-100 text-sm'>{t('nav:crisisPlanSubtitle')}</p>
          </button>

          <button
            onClick={() => navigate('/medications')}
            className='bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg shadow-lg p-5 hover:shadow-xl transition text-left'
          >
            <h3 className='text-lg font-bold mb-1'>💊 {t('nav:medications')}</h3>
            <p className='text-emerald-100 text-sm'>{t('nav:medicationsSubtitle')}</p>
          </button>

          <button
            onClick={() => navigate('/exercises')}
            className='bg-gradient-to-br from-violet-500 to-violet-600 text-white rounded-lg shadow-lg p-5 hover:shadow-xl transition text-left'
          >
            <h3 className='text-lg font-bold mb-1'>📚 {t('nav:exercises')}</h3>
            <p className='text-violet-100 text-sm'>{t('nav:exercisesSubtitle')}</p>
          </button>

          <button
            onClick={() => navigate('/materials')}
            className='bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-5 hover:shadow-xl transition text-left'
          >
            <h3 className='text-lg font-bold mb-1'>📝 {t('nav:materials')}</h3>
            <p className='text-blue-100 text-sm'>{t('nav:materialsSubtitle')}</p>
          </button>

          <button
            onClick={() => navigate('/questionnaires')}
            className='bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-5 hover:shadow-xl transition text-left'
          >
            <h3 className='text-lg font-bold mb-1'>📋 {t('nav:questionnaires')}</h3>
            <p className='text-green-100 text-sm'>{t('nav:questionnairesSubtitle')}</p>
          </button>

          <button
            onClick={() => navigate('/documents')}
            className='bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-5 hover:shadow-xl transition text-left'
          >
            <h3 className='text-lg font-bold mb-1'>📄 {t('nav:documents')}</h3>
            <p className='text-purple-100 text-sm'>{t('nav:documentsSubtitle')}</p>
          </button>
        </div>

        {/* Tabs */}
        <div className='bg-white rounded-lg shadow'>
          <div className='border-b border-gray-200'>
            <nav className='flex -mb-px' role='tablist' aria-label={t('common:mainNavigation')}>
              <button
                onClick={() => setActiveTab('my-appointments')}
                aria-label={t('dashboard:myAppointments')}
                aria-selected={activeTab === 'my-appointments'}
                role='tab'
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'my-appointments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('dashboard:myAppointments')}
              </button>
              <button
                onClick={() => setActiveTab('book')}
                aria-label={t('dashboard:bookAppointment')}
                aria-selected={activeTab === 'book'}
                role='tab'
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'book'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('dashboard:bookAppointment')}
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                aria-label={t('dashboard:messagesTab')}
                aria-selected={activeTab === 'messages'}
                role='tab'
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'messages'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('dashboard:messagesTab')}
                {messages.filter(m => !m.read).length > 0 && (
                  <span className='ms-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full'>
                    {messages.filter(m => !m.read).length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          <div className='p-6'>
            {activeTab === 'my-appointments' && (
              <div>
                <h2 className='text-xl font-semibold mb-6'>
                  {t('dashboard:myBookedAppointments')}
                </h2>
                <div className='space-y-4'>
                  {appointments.length === 0 ? (
                    <p className='text-center text-gray-500 py-8'>
                      {t('dashboard:noAppointmentsBooked')}
                    </p>
                  ) : (
                    appointments.map(apt => (
                      <div
                        key={apt.id}
                        className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition'
                      >
                        <div className='flex justify-between items-start'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-2'>
                              <Clock size={16} className='text-gray-400' />
                              <span className='font-medium'>
                                {format(new Date(apt.startTime), 'dd.MM.yyyy HH:mm', {
                                  locale: getDateLocale(),
                                })}{' '}
                                -{format(new Date(apt.endTime), 'HH:mm')}
                              </span>
                            </div>
                            {apt.therapist && (
                              <div className='flex items-center gap-2 text-sm text-gray-600'>
                                <User size={14} />
                                <span>
                                  Dr. {apt.therapist.firstName} {apt.therapist.lastName}
                                </span>
                              </div>
                            )}
                            <div className='mt-3 flex items-center gap-2'>
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                  apt.status === 'booked'
                                    ? 'bg-blue-100 text-blue-800'
                                    : apt.status === 'completed'
                                      ? 'bg-gray-100 text-gray-800'
                                      : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {apt.status === 'booked' && t('appointments:statusBooked')}
                                {apt.status === 'completed' && t('appointments:statusCompleted')}
                                {apt.status === 'cancelled' && t('appointments:statusCancelled')}
                              </span>
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                  apt.paymentStatus === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {apt.paymentStatus === 'completed'
                                  ? t('appointments:paymentCompleted')
                                  : t('appointments:paymentPending')}
                              </span>
                            </div>
                          </div>
                          <div className='flex gap-2'>
                            {apt.status === 'booked' && apt.meetingRoomId && (
                              <button
                                onClick={() => startVideoCall(apt.meetingRoomId!)}
                                className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2'
                              >
                                <Video size={16} />
                                {t('appointments:joinCall')}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'book' && (
              <div>
                <h2 className='text-xl font-semibold mb-6'>
                  {t('dashboard:availableAppointments')}
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {availableSlots.length === 0 ? (
                    <p className='col-span-2 text-center text-gray-500 py-8'>
                      {t('dashboard:noSlotsAvailable')}
                    </p>
                  ) : (
                    availableSlots.map(slot => (
                      <div
                        key={slot.id}
                        className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition'
                      >
                        <div className='flex items-center gap-2 mb-3'>
                          <Calendar size={18} className='text-blue-600' />
                          <span className='font-medium'>
                            {format(new Date(slot.startTime), 'EEEE, dd.MM.yyyy', {
                              locale: getDateLocale(),
                            })}
                          </span>
                        </div>
                        <div className='flex items-center gap-2 mb-3 text-sm text-gray-600'>
                          <Clock size={16} />
                          <span>
                            {format(new Date(slot.startTime), 'HH:mm')} -
                            {format(new Date(slot.endTime), 'HH:mm')} {t('common:timeOClock')}
                          </span>
                        </div>
                        {slot.therapist && (
                          <div className='flex items-center gap-2 mb-3 text-sm text-gray-600'>
                            <User size={16} />
                            <span>
                              Dr. {slot.therapist.firstName} {slot.therapist.lastName}
                            </span>
                          </div>
                        )}
                        <div className='flex items-center justify-between mt-4'>
                          <span className='text-lg font-bold text-gray-900'>
                            {slot.price.toFixed(2)} €
                          </span>
                          <button
                            onClick={() => bookAppointment(slot.id)}
                            className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2'
                          >
                            <CreditCard size={16} />
                            {t('appointments:bookNow')}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div>
                <h2 className='text-xl font-semibold mb-6'>{t('dashboard:messagesTab')}</h2>
                <div className='space-y-3'>
                  {messages.length === 0 ? (
                    <p className='text-center text-gray-500 py-8'>{t('dashboard:noMessages')}</p>
                  ) : (
                    messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`border rounded-lg p-4 ${
                          !msg.read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className='flex justify-between items-start'>
                          <div>
                            <p className='font-medium'>
                              {msg.sender?.firstName} {msg.sender?.lastName}
                            </p>
                            <p className='text-sm text-gray-600 mt-1'>{msg.content}</p>
                            <p className='text-xs text-gray-400 mt-2'>
                              {format(new Date(msg.createdAt), 'dd.MM.yyyy HH:mm')}
                            </p>
                          </div>
                          {!msg.read && (
                            <span className='bg-blue-600 text-white text-xs px-2 py-1 rounded-full'>
                              {t('dashboard:newBadge')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
