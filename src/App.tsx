import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import DemoBadge from './components/DemoBadge';
import ErrorBoundary from './components/ErrorBoundary';
import LanguageSwitcher from './components/LanguageSwitcher';
import Billing from './pages/Billing';
import CrisisPlan from './pages/CrisisPlan';
import DocumentRequests from './pages/DocumentRequests';
import Exercises from './pages/Exercises';
import Login from './pages/Login';
import MedicationTracker from './pages/MedicationTracker';
import NotFound from './pages/NotFound';
import PartnerTransparency from './pages/PartnerTransparency';
import PatientDashboard from './pages/PatientDashboard';
import PatientMaterials from './pages/PatientMaterials';
import PatientQuestionnaires from './pages/PatientQuestionnaires';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ProjectTracking from './pages/ProjectTracking';
import PsychScreenings from './pages/PsychScreenings';
import QuestionnaireBuilder from './pages/QuestionnaireBuilder';
import Register from './pages/Register';
import ReminderSettings from './pages/ReminderSettings';
import Reports from './pages/Reports';
import SymptomDiary from './pages/SymptomDiary';
import TherapistDashboard from './pages/TherapistDashboard';
import TherapistQueue from './pages/TherapistQueue';
import TherapyNotes from './pages/TherapyNotes';
import TwoFASetup from './pages/TwoFASetup';
import TwoFAVerify from './pages/TwoFAVerify';
import VideoCall from './pages/VideoCall';
import WaitingRoom from './pages/WaitingRoom';
import { useAuthStore } from './store/authStore';

function App() {
  const { user, loading, checkAuth } = useAuthStore();
  const { t } = useTranslation(['common']);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const spinner = (
    <div
      className='flex items-center justify-center min-h-screen'
      role='status'
      aria-label={t('common:loading')}
    >
      <div className='spinner'></div>
    </div>
  );

  return (
    <ErrorBoundary>
      <BrowserRouter>
        {/* A11y: Skip-to-Content Link */}
        <a href='#main-content' className='skip-to-content'>
          {t('common:skipToContent')}
        </a>
        <div aria-live='polite' aria-atomic='true'>
          <Toaster
            position='top-right'
            toastOptions={{ ariaProps: { role: 'status', 'aria-live': 'polite' } }}
          />
        </div>
        <DemoBadge />
        <div className='fixed top-2 end-2 z-50'>
          <LanguageSwitcher />
        </div>
        <Routes>
          <Route path='/login' element={!user ? <Login /> : <Navigate to='/dashboard' />} />
          <Route path='/register' element={!user ? <Register /> : <Navigate to='/dashboard' />} />

          <Route
            path='/2fa/setup'
            element={loading ? spinner : user ? <TwoFASetup /> : <Navigate to='/login' />}
          />
          <Route
            path='/2fa/verify'
            element={loading ? spinner : user ? <Navigate to='/dashboard' /> : <TwoFAVerify />}
          />

          <Route
            path='/dashboard'
            element={
              loading ? (
                spinner
              ) : user ? (
                user.role === 'therapist' ? (
                  <TherapistDashboard />
                ) : (
                  <PatientDashboard />
                )
              ) : (
                <Navigate to='/login' />
              )
            }
          />

          <Route
            path='/call/:roomId'
            element={loading ? spinner : user ? <VideoCall /> : <Navigate to='/login' />}
          />

          {/* Patient Pre-Session Materials */}
          <Route
            path='/materials'
            element={loading ? spinner : user ? <PatientMaterials /> : <Navigate to='/login' />}
          />

          {/* Questionnaire System */}
          <Route
            path='/questionnaires'
            element={
              loading ? (
                spinner
              ) : user ? (
                user.role === 'therapist' ? (
                  <QuestionnaireBuilder />
                ) : (
                  <PatientQuestionnaires />
                )
              ) : (
                <Navigate to='/login' />
              )
            }
          />

          {/* Document Requests */}
          <Route
            path='/documents'
            element={loading ? spinner : user ? <DocumentRequests /> : <Navigate to='/login' />}
          />

          {/* Symptom Diary - Patient Only */}
          <Route
            path='/diary'
            element={
              loading ? (
                spinner
              ) : user?.role === 'patient' ? (
                <SymptomDiary />
              ) : (
                <Navigate to='/dashboard' />
              )
            }
          />

          {/* Therapy Notes - Therapist Only */}
          <Route
            path='/therapy-notes'
            element={
              loading ? (
                spinner
              ) : user?.role === 'therapist' ? (
                <TherapyNotes />
              ) : (
                <Navigate to='/dashboard' />
              )
            }
          />
          <Route
            path='/therapy-notes/:patientId'
            element={
              loading ? (
                spinner
              ) : user?.role === 'therapist' ? (
                <TherapyNotes />
              ) : (
                <Navigate to='/dashboard' />
              )
            }
          />

          {/* Psychological Screenings - Patient Only */}
          <Route
            path='/screenings'
            element={
              loading ? (
                spinner
              ) : user?.role === 'patient' ? (
                <PsychScreenings />
              ) : (
                <Navigate to='/dashboard' />
              )
            }
          />

          {/* Crisis Plan - Patient Only */}
          <Route
            path='/crisis-plan'
            element={
              loading ? (
                spinner
              ) : user?.role === 'patient' ? (
                <CrisisPlan />
              ) : (
                <Navigate to='/dashboard' />
              )
            }
          />

          {/* Medication Tracker - Patient Only */}
          <Route
            path='/medications'
            element={
              loading ? (
                spinner
              ) : user?.role === 'patient' ? (
                <MedicationTracker />
              ) : (
                <Navigate to='/dashboard' />
              )
            }
          />

          {/* Exercises & Homework - Patient Only */}
          <Route
            path='/exercises'
            element={
              loading ? (
                spinner
              ) : user?.role === 'patient' ? (
                <Exercises />
              ) : (
                <Navigate to='/dashboard' />
              )
            }
          />

          {/* Reminder Settings - Both Roles */}
          <Route
            path='/reminders'
            element={loading ? spinner : user ? <ReminderSettings /> : <Navigate to='/login' />}
          />

          {/* Treatment Reports - Therapist Only */}
          <Route
            path='/reports'
            element={
              loading ? (
                spinner
              ) : user?.role === 'therapist' ? (
                <Reports />
              ) : (
                <Navigate to='/dashboard' />
              )
            }
          />

          {/* Waiting Room - Patient Only */}
          <Route
            path='/waiting-room'
            element={
              loading ? (
                spinner
              ) : user?.role === 'patient' ? (
                <WaitingRoom />
              ) : (
                <Navigate to='/dashboard' />
              )
            }
          />

          {/* Therapist Queue - Therapist Only */}
          <Route
            path='/queue'
            element={
              loading ? (
                spinner
              ) : user?.role === 'therapist' ? (
                <TherapistQueue />
              ) : (
                <Navigate to='/dashboard' />
              )
            }
          />

          {/* Billing - Therapist Only */}
          <Route
            path='/billing'
            element={
              loading ? (
                spinner
              ) : user?.role === 'therapist' ? (
                <Billing />
              ) : (
                <Navigate to='/dashboard' />
              )
            }
          />

          {/* 2FA Setup - Authenticated Users */}
          <Route
            path='/2fa-setup'
            element={loading ? spinner : user ? <TwoFASetup /> : <Navigate to='/login' />}
          />

          {/* 2FA Verify - Public (for login flow) */}
          <Route path='/2fa-verify' element={<TwoFAVerify />} />

          {/* Projekt-Tracking — nur für eingeloggte Benutzer */}
          <Route
            path='/project-tracking'
            element={loading ? spinner : user ? <ProjectTracking /> : <Navigate to='/login' />}
          />

          {/* Partner-Transparenz — öffentlich zugänglich (keine sensiblen Daten) */}
          <Route path='/partner-view' element={<PartnerTransparency />} />

          {/* Datenschutzerklärung — öffentlich zugänglich (DSGVO-Pflicht) */}
          <Route path='/privacy' element={<PrivacyPolicy />} />

          <Route path='/' element={<Navigate to='/dashboard' />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
