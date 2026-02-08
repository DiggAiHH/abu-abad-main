/**
 * Demo-Modus API Interceptor
 *
 * Fängt alle API-Requests ab wenn isDemo === true im AuthStore
 * und gibt realistische Mock-Daten zurück.
 *
 * So müssen nicht alle 20+ Seiten individuell gepatcht werden.
 */

import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Hilfsfunktion: Erstellt eine Fake-AxiosResponse
function mockResponse<T>(data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  };
}

// ─── Demo-Daten ──────────────────────────────────────────────

function demoAppointments(userId: string): unknown[] {
  const now = new Date();
  const d = (offsetDays: number, hour: number): string => {
    const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays, hour, 0);
    return dt.toISOString();
  };

  return [
    { id: 'demo-a1', therapistId: 't1', patientId: userId, startTime: d(1, 10), endTime: d(1, 11), status: 'booked', price: 120, paymentStatus: 'completed', meetingRoomId: 'room-1', appointmentType: 'video', therapist: { firstName: 'Sarah', lastName: 'Müller' }, patient: { firstName: 'Max', lastName: 'Mustermann' } },
    { id: 'demo-a2', therapistId: 't1', patientId: userId, startTime: d(7, 14), endTime: d(7, 15), status: 'booked', price: 120, paymentStatus: 'pending', meetingRoomId: 'room-2', appointmentType: 'video', therapist: { firstName: 'Sarah', lastName: 'Müller' }, patient: { firstName: 'Max', lastName: 'Mustermann' } },
    { id: 'demo-a3', therapistId: 't1', startTime: d(2, 9), endTime: d(2, 10), status: 'available', price: 120, paymentStatus: 'pending', appointmentType: 'video', therapist: { firstName: 'Sarah', lastName: 'Müller' } },
    { id: 'demo-a4', therapistId: 't2', startTime: d(3, 15), endTime: d(3, 16), status: 'available', price: 150, paymentStatus: 'pending', appointmentType: 'video', therapist: { firstName: 'Thomas', lastName: 'Weber' } },
    { id: 'demo-a5', therapistId: 't1', patientId: 'p-old', startTime: d(-3, 10), endTime: d(-3, 11), status: 'completed', price: 120, paymentStatus: 'completed', appointmentType: 'video', therapist: { firstName: 'Sarah', lastName: 'Müller' }, patient: { firstName: 'Anna', lastName: 'Schmidt' }, therapistNotes: 'Guter Fortschritt bei der Angstbewältigung.' },
  ];
}

function demoMessages(userId: string): unknown[] {
  return [
    { id: 'msg-1', senderId: 't1', receiverId: userId, content: 'Bitte bringen Sie zum nächsten Termin Ihre Medikamentenliste mit.', read: false, createdAt: new Date(Date.now() - 7200000).toISOString(), sender: { firstName: 'Dr. Sarah', lastName: 'Müller' } },
    { id: 'msg-2', senderId: 't1', receiverId: userId, content: 'Ihre Übungsblätter sind bereit zum Download.', read: true, createdAt: new Date(Date.now() - 172800000).toISOString(), sender: { firstName: 'Dr. Sarah', lastName: 'Müller' } },
    { id: 'msg-3', senderId: userId, receiverId: 't1', content: 'Vielen Dank, ich bringe alles mit!', read: true, createdAt: new Date(Date.now() - 3600000).toISOString(), sender: { firstName: 'Max', lastName: 'Mustermann' } },
  ];
}

const demoQuestionnaires = [
  { id: 'q1', title: 'PHQ-9 Depressions-Screening', description: 'Standardisierter Fragebogen zur Erfassung von Depressionen', status: 'pending', createdAt: new Date(Date.now() - 86400000).toISOString(), questions: [{ id: 'q1-1', text: 'Wie oft hatten Sie wenig Interesse oder Freude an Tätigkeiten?', type: 'scale', required: true }] },
  { id: 'q2', title: 'GAD-7 Angst-Screening', description: 'Fragebogen zur Angst-Erfassung', status: 'completed', createdAt: new Date(Date.now() - 604800000).toISOString(), completedAt: new Date(Date.now() - 500000000).toISOString(), questions: [] },
];

const demoDocumentRequests = [
  { id: 'dr1', title: 'Laborergebnisse', description: 'Bitte laden Sie Ihre aktuellen Blutwerte hoch.', status: 'pending', createdAt: new Date(Date.now() - 172800000).toISOString(), therapist: { firstName: 'Sarah', lastName: 'Müller' } },
  { id: 'dr2', title: 'Überweisung', description: 'Überweisungsschein vom Hausarzt', status: 'completed', createdAt: new Date(Date.now() - 604800000).toISOString(), therapist: { firstName: 'Sarah', lastName: 'Müller' } },
];

const demoMaterials = [
  { id: 'mat1', title: 'Notizen für nächste Sitzung', content: 'Themen: Schlafprobleme, Stressbewältigung', type: 'note', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'mat2', title: 'Atemübung.pdf', content: '', type: 'file', fileUrl: '#', createdAt: new Date(Date.now() - 604800000).toISOString() },
];

const demoDiaryEntries = [
  { id: 'de1', date: new Date(Date.now() - 86400000).toISOString(), mood: 7, energy: 6, sleep: 7, anxiety: 3, notes: 'Heute war ein guter Tag. Atemübungen haben geholfen.', symptoms: ['leichte Kopfschmerzen'] },
  { id: 'de2', date: new Date(Date.now() - 172800000).toISOString(), mood: 5, energy: 4, sleep: 5, anxiety: 6, notes: 'Stressiger Tag auf der Arbeit.', symptoms: ['Schlafprobleme', 'Anspannung'] },
  { id: 'de3', date: new Date(Date.now() - 259200000).toISOString(), mood: 8, energy: 7, sleep: 8, anxiety: 2, notes: 'Ausflug in die Natur — sehr erholsam.', symptoms: [] },
];

const demoCrisisPlan = {
  id: 'cp1',
  warningSignals: ['Schlaflosigkeit > 3 Tage', 'Rückzug von sozialen Aktivitäten', 'Verstärkte Angst'],
  copingStrategies: ['Atemübungen (4-7-8)', 'Spaziergang an frischer Luft', 'Vertrauensperson anrufen'],
  emergencyContacts: [
    { name: 'Telefonseelsorge', phone: '0800 111 0 111', available: '24/7' },
    { name: 'Dr. Sarah Müller (Therapeutin)', phone: '+49 170 1234567', available: 'Mo-Fr 9-17' },
    { name: 'Anna (Schwester)', phone: '+49 160 9876543', available: 'jederzeit' },
  ],
  safePlace: 'Mein Zimmer, Lieblingsmusik hören',
  professionalHelp: 'Nächste Notaufnahme: Klinikum München, Tel: 089 12345',
  updatedAt: new Date(Date.now() - 604800000).toISOString(),
};

const demoMedications = [
  { id: 'med1', name: 'Sertralin', dosage: '50mg', frequency: 'Täglich morgens', startDate: '2025-11-01', prescribedBy: 'Dr. Müller', notes: 'Antidepressivum (SSRI)', active: true },
  { id: 'med2', name: 'Lorazepam', dosage: '0.5mg', frequency: 'Bei Bedarf (max 2x/Woche)', startDate: '2025-12-15', prescribedBy: 'Dr. Müller', notes: 'Nur bei akuter Angst', active: true },
];

const demoExercises = [
  { id: 'ex1', title: 'Progressive Muskelentspannung', description: 'Anleitung nach Jacobson: Systematisches Anspannen und Entspannen der Muskelgruppen', status: 'in_progress', dueDate: new Date(Date.now() + 172800000).toISOString(), assignedBy: 'Dr. Müller' },
  { id: 'ex2', title: 'Gedankenprotokoll', description: 'Notieren Sie negative Gedanken und formulieren Sie alternative Gedanken', status: 'completed', dueDate: new Date(Date.now() - 86400000).toISOString(), assignedBy: 'Dr. Müller', completedAt: new Date(Date.now() - 43200000).toISOString() },
  { id: 'ex3', title: 'Achtsamkeitsmeditation', description: '10 Minuten tägliche Meditation mit Fokus auf den Atem', status: 'pending', dueDate: new Date(Date.now() + 604800000).toISOString(), assignedBy: 'Dr. Müller' },
];

const demoScreenings = [
  { id: 'scr1', type: 'PHQ-9', title: 'Depressions-Screening', score: 8, maxScore: 27, severity: 'mild', date: new Date(Date.now() - 604800000).toISOString(), status: 'completed' },
  { id: 'scr2', type: 'GAD-7', title: 'Angst-Screening', score: 12, maxScore: 21, severity: 'moderate', date: new Date(Date.now() - 1209600000).toISOString(), status: 'completed' },
  { id: 'scr3', type: 'PHQ-9', title: 'Depressions-Screening', score: null, maxScore: 27, severity: null, date: new Date().toISOString(), status: 'pending' },
];

const demoTherapyNotes = [
  { id: 'tn1', patientId: 'demo-patient-001', sessionDate: new Date(Date.now() - 604800000).toISOString(), subjective: 'Patient berichtet über verbesserten Schlaf, aber anhaltende Konzentrationsschwierigkeiten.', objective: 'Wacher und aufmerksamer als in letzter Sitzung. Blickkontakt gut.', assessment: 'Leichte Verbesserung der depressiven Symptomatik. GAD-7 Score von 12 → 9.', plan: 'Weiterführung der Sertralin-Medikation. Achtsamkeitsübungen intensivieren.', patient: { firstName: 'Max', lastName: 'Mustermann' } },
  { id: 'tn2', patientId: 'demo-patient-002', sessionDate: new Date(Date.now() - 1209600000).toISOString(), subjective: 'Patientin beschreibt erhöhte Angstzustände im beruflichen Umfeld.', objective: 'Sichtbar angespannt, häufiges Spielen mit den Händen.', assessment: 'Generalisierte Angststörung mit situativer Verstärkung.', plan: 'Expositionsübungen planen. Kognitive Umstrukturierung vertiefen.', patient: { firstName: 'Anna', lastName: 'Schmidt' } },
];

const demoPatients = [
  { id: 'demo-patient-001', email: 'patient@demo.de', firstName: 'Max', lastName: 'Mustermann', role: 'patient' },
  { id: 'demo-patient-002', email: 'anna@demo.de', firstName: 'Anna', lastName: 'Schmidt', role: 'patient' },
];

const demoReminders = {
  appointmentReminder: true,
  medicationReminder: true,
  diaryReminder: true,
  exerciseReminder: true,
  reminderTime: '09:00',
  channels: ['email', 'push'],
};

const demoBilling = [
  { id: 'bill1', patientId: 'demo-patient-001', patientName: 'Max Mustermann', amount: 120, status: 'paid', date: new Date(Date.now() - 604800000).toISOString(), description: 'Einzelsitzung 50min (Video)', invoiceNumber: 'INV-2026-001' },
  { id: 'bill2', patientId: 'demo-patient-002', patientName: 'Anna Schmidt', amount: 150, status: 'pending', date: new Date(Date.now() - 86400000).toISOString(), description: 'Erstgespräch 90min (Video)', invoiceNumber: 'INV-2026-002' },
  { id: 'bill3', patientId: 'demo-patient-001', patientName: 'Max Mustermann', amount: 120, status: 'paid', date: new Date(Date.now() - 1209600000).toISOString(), description: 'Einzelsitzung 50min (Video)', invoiceNumber: 'INV-2026-003' },
];

const demoReports = [
  { id: 'rep1', title: 'Behandlungsbericht Q4/2025', patientId: 'demo-patient-001', patientName: 'Max Mustermann', createdAt: new Date(Date.now() - 2592000000).toISOString(), status: 'final', type: 'treatment_report' },
  { id: 'rep2', title: 'Verlaufsbericht Januar 2026', patientId: 'demo-patient-002', patientName: 'Anna Schmidt', createdAt: new Date(Date.now() - 604800000).toISOString(), status: 'draft', type: 'progress_report' },
];

const demoWaitingRoom = {
  position: 2,
  estimatedWait: 15,
  therapist: { firstName: 'Sarah', lastName: 'Müller' },
  appointmentTime: new Date(Date.now() + 900000).toISOString(),
};

const demoTherapistQueue = [
  { id: 'wq1', patientId: 'demo-patient-001', patientName: 'Max Mustermann', status: 'waiting', joinedAt: new Date(Date.now() - 300000).toISOString(), appointmentId: 'demo-a1' },
  { id: 'wq2', patientId: 'demo-patient-002', patientName: 'Anna Schmidt', status: 'waiting', joinedAt: new Date(Date.now() - 60000).toISOString(), appointmentId: 'demo-a5' },
];

// ─── Route-Matching und Mock-Responses ───────────────────────

/**
 * Versucht eine URL einem Demo-Response zuzuordnen.
 * Gibt null zurück wenn kein Match → dann geht der Call normal raus.
 */
export function getDemoResponse(method: string, url: string, userId: string): AxiosResponse | null {
  const m = method.toUpperCase();
  const u = url.replace(/^\/api/, ''); // Normalisiere: entferne /api Prefix

  // ─── AUTH ──────────────────────────────────────
  if (u.startsWith('/auth/me') && m === 'GET') {
    const role = userId.includes('therapist') ? 'therapist' : 'patient';
    return mockResponse({
      id: userId,
      email: role === 'therapist' ? 'therapeut@demo.de' : 'patient@demo.de',
      role,
      firstName: role === 'therapist' ? 'Dr. Sarah' : 'Max',
      lastName: role === 'therapist' ? 'Müller' : 'Mustermann',
    });
  }
  if (u.startsWith('/auth/logout') && m === 'POST') {
    return mockResponse({ message: 'Abgemeldet' });
  }
  if (u.startsWith('/auth/refresh') && m === 'POST') {
    return mockResponse({ accessToken: 'demo-token-refreshed-' + Date.now() });
  }
  if (u.startsWith('/auth/2fa')) {
    return mockResponse({ message: '2FA Demo deaktiviert', enabled: false });
  }

  // ─── APPOINTMENTS ─────────────────────────────
  if (u.startsWith('/appointments') && m === 'GET') {
    return mockResponse(demoAppointments(userId));
  }
  if (u.startsWith('/appointments') && m === 'POST') {
    return mockResponse({ id: 'demo-new-' + Date.now(), status: 'created', message: 'Termin erstellt (Demo)' }, 201);
  }

  // ─── MESSAGES ─────────────────────────────────
  if (u.startsWith('/messages') && m === 'GET') {
    return mockResponse(demoMessages(userId));
  }
  if (u.startsWith('/messages') && m === 'POST') {
    return mockResponse({ id: 'msg-new-' + Date.now(), status: 'sent' }, 201);
  }
  if (u.startsWith('/messages') && m === 'PUT') {
    return mockResponse({ success: true });
  }

  // ─── QUESTIONNAIRES ───────────────────────────
  if (u.startsWith('/questionnaires') && m === 'GET') {
    return mockResponse(demoQuestionnaires);
  }
  if (u.startsWith('/questionnaires') && m === 'POST') {
    return mockResponse({ id: 'q-new', message: 'Fragebogen gespeichert (Demo)' }, 201);
  }

  // ─── DOCUMENT REQUESTS ────────────────────────
  if (u.startsWith('/document-requests') && m === 'GET') {
    return mockResponse(demoDocumentRequests);
  }
  if (u.startsWith('/document-requests') && m === 'POST') {
    return mockResponse({ id: 'dr-new', message: 'Anfrage erstellt (Demo)' }, 201);
  }

  // ─── PATIENT MATERIALS ────────────────────────
  if (u.startsWith('/patient-materials') && m === 'GET') {
    return mockResponse(demoMaterials);
  }
  if (u.startsWith('/patient-materials') && m === 'POST') {
    return mockResponse({ id: 'mat-new', message: 'Material gespeichert (Demo)' }, 201);
  }

  // ─── SYMPTOM DIARY ────────────────────────────
  if ((u.startsWith('/diary') || u.startsWith('/symptom-diary')) && m === 'GET') {
    return mockResponse(demoDiaryEntries);
  }
  if ((u.startsWith('/diary') || u.startsWith('/symptom-diary')) && m === 'POST') {
    return mockResponse({ id: 'de-new', message: 'Eintrag gespeichert (Demo)' }, 201);
  }

  // ─── CRISIS PLAN ──────────────────────────────
  if ((u.startsWith('/crisis-plan') || u.startsWith('/crisis')) && m === 'GET') {
    return mockResponse(demoCrisisPlan);
  }
  if ((u.startsWith('/crisis-plan') || u.startsWith('/crisis')) && (m === 'POST' || m === 'PUT')) {
    return mockResponse({ ...demoCrisisPlan, message: 'Krisenplan aktualisiert (Demo)' });
  }

  // ─── MEDICATIONS ──────────────────────────────
  if ((u.startsWith('/medications') || u.startsWith('/medication')) && m === 'GET') {
    return mockResponse(demoMedications);
  }
  if ((u.startsWith('/medications') || u.startsWith('/medication')) && (m === 'POST' || m === 'PUT')) {
    return mockResponse({ id: 'med-new', message: 'Medikament gespeichert (Demo)' }, 201);
  }

  // ─── EXERCISES ────────────────────────────────
  if (u.startsWith('/exercises') && m === 'GET') {
    return mockResponse(demoExercises);
  }
  if (u.startsWith('/exercises') && (m === 'POST' || m === 'PUT')) {
    return mockResponse({ id: 'ex-new', message: 'Übung gespeichert (Demo)' }, 201);
  }

  // ─── SCREENINGS ───────────────────────────────
  if (u.startsWith('/screenings') && m === 'GET') {
    return mockResponse(demoScreenings);
  }
  if (u.startsWith('/screenings') && m === 'POST') {
    return mockResponse({ id: 'scr-new', message: 'Screening gespeichert (Demo)' }, 201);
  }

  // ─── THERAPY NOTES ────────────────────────────
  if (u.startsWith('/therapy-notes') && m === 'GET') {
    return mockResponse(demoTherapyNotes);
  }
  if (u.startsWith('/therapy-notes') && (m === 'POST' || m === 'PUT')) {
    return mockResponse({ id: 'tn-new', message: 'Notiz gespeichert (Demo)' }, 201);
  }

  // ─── REMINDERS ────────────────────────────────
  if (u.startsWith('/reminders') && m === 'GET') {
    return mockResponse(demoReminders);
  }
  if (u.startsWith('/reminders') && (m === 'POST' || m === 'PUT')) {
    return mockResponse({ ...demoReminders, message: 'Einstellungen gespeichert (Demo)' });
  }

  // ─── BILLING ──────────────────────────────────
  if (u.startsWith('/billing') && m === 'GET') {
    return mockResponse(demoBilling);
  }
  if (u.startsWith('/billing') && m === 'POST') {
    return mockResponse({ id: 'bill-new', message: 'Rechnung erstellt (Demo)' }, 201);
  }

  // ─── REPORTS ──────────────────────────────────
  if (u.startsWith('/reports') && m === 'GET') {
    return mockResponse(demoReports);
  }
  if (u.startsWith('/reports') && m === 'POST') {
    return mockResponse({ id: 'rep-new', message: 'Bericht erstellt (Demo)' }, 201);
  }

  // ─── USERS / PROFILE ─────────────────────────
  if (u.startsWith('/users/therapists') && m === 'GET') {
    return mockResponse([
      { id: 't1', firstName: 'Sarah', lastName: 'Müller', email: 'sarah@demo.de', role: 'therapist', specialization: 'Neurologie' },
      { id: 't2', firstName: 'Thomas', lastName: 'Weber', email: 'thomas@demo.de', role: 'therapist', specialization: 'Psychologie' },
    ]);
  }
  if (u.startsWith('/users/patients') && m === 'GET') {
    return mockResponse(demoPatients);
  }
  if (u.startsWith('/users/profile') && m === 'GET') {
    const role = userId.includes('therapist') ? 'therapist' : 'patient';
    return mockResponse({
      id: userId,
      email: role === 'therapist' ? 'therapeut@demo.de' : 'patient@demo.de',
      role,
      firstName: role === 'therapist' ? 'Dr. Sarah' : 'Max',
      lastName: role === 'therapist' ? 'Müller' : 'Mustermann',
      phone: '+49 170 1234567',
    });
  }
  if (u.startsWith('/users/profile') && m === 'PUT') {
    return mockResponse({ message: 'Profil aktualisiert (Demo)' });
  }

  // ─── WAITING ROOM ─────────────────────────────
  if ((u.startsWith('/waiting-room') || u.startsWith('/queue')) && m === 'GET') {
    if (userId.includes('therapist')) {
      return mockResponse(demoTherapistQueue);
    }
    return mockResponse(demoWaitingRoom);
  }
  if ((u.startsWith('/waiting-room') || u.startsWith('/queue')) && (m === 'POST' || m === 'PUT')) {
    return mockResponse({ message: 'Aktion ausgeführt (Demo)' });
  }

  // ─── PAYMENTS ─────────────────────────────────
  if (u.startsWith('/payments') && m === 'GET') {
    return mockResponse([
      { id: 'pay1', appointmentId: 'demo-a1', amount: 120, currency: 'EUR', status: 'completed', createdAt: new Date(Date.now() - 604800000).toISOString() },
    ]);
  }
  if (u.startsWith('/payments') && m === 'POST') {
    return mockResponse({ sessionId: 'demo-stripe-session', message: 'Zahlung Demo-Modus' });
  }

  // ─── ERRORS ENDPOINT ─────────────────────────
  if (u.startsWith('/errors') && m === 'POST') {
    return mockResponse({ message: 'Fehler erfasst (Demo)' });
  }

  // ─── HEALTH ───────────────────────────────────
  if (u.startsWith('/health')) {
    return mockResponse({ status: 'OK', demo: true, timestamp: new Date().toISOString() });
  }

  // Kein Match → null = normaler API-Call
  return null;
}
