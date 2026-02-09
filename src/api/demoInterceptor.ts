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
  const isTherapist = userId.includes('therapist');
  const patientId = 'demo-patient-001';
  const therapistId = 'demo-therapist-001';
  return [
    { id: 'msg-1', senderId: therapistId, receiverId: patientId, content: 'Guten Tag Herr Mustermann, bitte bringen Sie zum nächsten Termin Ihre aktuelle Medikamentenliste mit.', read: !isTherapist, createdAt: new Date(Date.now() - 7200000).toISOString(), sender: { firstName: 'Dr. Sarah', lastName: 'Müller' }, receiver: { firstName: 'Max', lastName: 'Mustermann' } },
    { id: 'msg-2', senderId: patientId, receiverId: therapistId, content: 'Vielen Dank, Frau Dr. Müller! Ich bringe alles mit. Darf ich vorab noch eine Frage stellen?', read: true, createdAt: new Date(Date.now() - 3600000).toISOString(), sender: { firstName: 'Max', lastName: 'Mustermann' }, receiver: { firstName: 'Dr. Sarah', lastName: 'Müller' } },
    { id: 'msg-3', senderId: therapistId, receiverId: patientId, content: 'Natürlich, fragen Sie gerne!', read: !isTherapist, createdAt: new Date(Date.now() - 3000000).toISOString(), sender: { firstName: 'Dr. Sarah', lastName: 'Müller' }, receiver: { firstName: 'Max', lastName: 'Mustermann' } },
    { id: 'msg-4', senderId: patientId, receiverId: therapistId, content: 'Ich habe seit 2 Tagen leichte Kopfschmerzen nach dem Sertralin. Ist das normal?', read: true, createdAt: new Date(Date.now() - 2400000).toISOString(), sender: { firstName: 'Max', lastName: 'Mustermann' }, receiver: { firstName: 'Dr. Sarah', lastName: 'Müller' } },
    { id: 'msg-5', senderId: therapistId, receiverId: patientId, content: 'Das kann in den ersten Wochen vorkommen. Trinken Sie ausreichend Wasser und melden Sie sich, wenn es stärker wird. Wir besprechen das beim nächsten Termin.', read: false, createdAt: new Date(Date.now() - 1800000).toISOString(), sender: { firstName: 'Dr. Sarah', lastName: 'Müller' }, receiver: { firstName: 'Max', lastName: 'Mustermann' } },
    { id: 'msg-6', senderId: therapistId, receiverId: patientId, content: 'Ihre Übungsblätter zur progressiven Muskelentspannung sind jetzt im Materialbereich verfügbar.', read: true, createdAt: new Date(Date.now() - 172800000).toISOString(), sender: { firstName: 'Dr. Sarah', lastName: 'Müller' }, receiver: { firstName: 'Max', lastName: 'Mustermann' } },
    { id: 'msg-7', senderId: patientId, receiverId: therapistId, content: 'Super, danke! Die Übungen helfen mir wirklich gut beim Einschlafen.', read: true, createdAt: new Date(Date.now() - 86400000).toISOString(), sender: { firstName: 'Max', lastName: 'Mustermann' }, receiver: { firstName: 'Dr. Sarah', lastName: 'Müller' } },
  ];
}

const demoQuestionnaires = [
  { id: 'q1', title: 'PHQ-9 Depressions-Screening', description: 'Standardisierter Fragebogen zur Erfassung von Depressionen', status: 'pending', createdAt: new Date(Date.now() - 86400000).toISOString(), questions: [{ id: 'q1-1', text: 'Wie oft hatten Sie wenig Interesse oder Freude an Tätigkeiten?', type: 'scale', required: true }] },
  { id: 'q2', title: 'GAD-7 Angst-Screening', description: 'Fragebogen zur Angst-Erfassung', status: 'completed', createdAt: new Date(Date.now() - 604800000).toISOString(), completedAt: new Date(Date.now() - 500000000).toISOString(), questions: [] },
];

const demoDocumentRequests = [
  { id: 'dr1', documentType: 'lab_results' as const, description: 'Bitte laden Sie Ihre aktuellen Blutwerte hoch.', priority: 'normal' as const, status: 'pending' as const, createdAt: new Date(Date.now() - 172800000).toISOString(), patientId: 'demo-patient-001', patientName: 'Max Mustermann' },
  { id: 'dr2', documentType: 'referral' as const, description: 'Überweisungsschein vom Hausarzt', priority: 'high' as const, status: 'uploaded' as const, createdAt: new Date(Date.now() - 604800000).toISOString(), patientId: 'demo-patient-001', patientName: 'Max Mustermann' },
  { id: 'dr3', documentType: 'medical_scan' as const, description: 'MRT-Aufnahmen vom Kopf', priority: 'urgent' as const, status: 'reviewed' as const, createdAt: new Date(Date.now() - 1209600000).toISOString(), patientId: 'demo-patient-002', patientName: 'Anna Schmidt' },
];

const demoMaterials = [
  { id: 'mat1', title: 'Notizen für nächste Sitzung', content: 'Themen: Schlafprobleme, Stressbewältigung', type: 'note', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'mat2', title: 'Atemübung.pdf', content: '', type: 'file', fileUrl: '#', createdAt: new Date(Date.now() - 604800000).toISOString() },
];

const demoDiaryEntries = [
  { id: 'de1', entry_date: new Date(Date.now() - 86400000).toISOString(), mood_score: 7, energy_level: 6, sleep_quality: 7, sleep_hours: 7.5, anxiety_level: 3, stress_level: 4, notes: 'Heute war ein guter Tag. Atemübungen haben geholfen.', symptoms: ['leichte Kopfschmerzen'], triggers: ['Arbeitsstress'], activities: ['Atemübungen', 'Spaziergang'], medications: [{ name: 'Sertralin', dosage: '50mg', taken: true }] },
  { id: 'de2', entry_date: new Date(Date.now() - 172800000).toISOString(), mood_score: 5, energy_level: 4, sleep_quality: 5, sleep_hours: 5.5, anxiety_level: 6, stress_level: 7, notes: 'Stressiger Tag auf der Arbeit.', symptoms: ['Schlafprobleme', 'Anspannung'], triggers: ['Arbeit', 'Deadlines'], activities: ['Lesen'], medications: [{ name: 'Sertralin', dosage: '50mg', taken: true }, { name: 'Lorazepam', dosage: '0.5mg', taken: true }] },
  { id: 'de3', entry_date: new Date(Date.now() - 259200000).toISOString(), mood_score: 8, energy_level: 7, sleep_quality: 8, sleep_hours: 8.0, anxiety_level: 2, stress_level: 2, notes: 'Ausflug in die Natur — sehr erholsam.', symptoms: [], triggers: [], activities: ['Wandern', 'Meditation', 'Kochen'], medications: [{ name: 'Sertralin', dosage: '50mg', taken: true }] },
  { id: 'de4', entry_date: new Date(Date.now() - 345600000).toISOString(), mood_score: 6, energy_level: 5, sleep_quality: 6, sleep_hours: 6.5, anxiety_level: 4, stress_level: 5, notes: 'Durchschnittlicher Tag. Therapieübungen gemacht.', symptoms: ['leichte Müdigkeit'], triggers: ['schlechter Schlaf'], activities: ['Progressive Muskelentspannung'], medications: [{ name: 'Sertralin', dosage: '50mg', taken: true }] },
  { id: 'de5', entry_date: new Date(Date.now() - 432000000).toISOString(), mood_score: 4, energy_level: 3, sleep_quality: 4, sleep_hours: 4.5, anxiety_level: 7, stress_level: 8, notes: 'Schwieriger Tag. Panikattacke am Morgen.', symptoms: ['Herzrasen', 'Atemnot', 'Schwindel'], triggers: ['Menschenmenge', 'enge Räume'], activities: ['Atemübungen'], medications: [{ name: 'Sertralin', dosage: '50mg', taken: true }, { name: 'Lorazepam', dosage: '0.5mg', taken: true }] },
];

const demoCrisisPlan = {
  id: 'cp1',
  warningSignals: ['Schlaflosigkeit > 3 Tage', 'Rückzug von sozialen Aktivitäten', 'Verstärkte Angst'],
  warningSignsThoughts: ['Ich schaffe das nicht mehr', 'Niemandem fällt auf, wenn ich weg bin'],
  warningSignsBehaviors: ['Rückzug von sozialen Aktivitäten', 'Vernachlässigung der Hygiene'],
  warningSignsPhysical: ['Schlaflosigkeit > 3 Tage', 'Appetitlosigkeit'],
  warningSignsEmotional: ['Verstärkte Angst', 'Hoffnungslosigkeit'],
  copingStrategies: [
    { strategy: 'Atemübungen (4-7-8)', category: 'relaxation', effectiveness: 8 },
    { strategy: 'Spaziergang an frischer Luft', category: 'activity', effectiveness: 7 },
    { strategy: 'Vertrauensperson anrufen', category: 'social', effectiveness: 9 },
  ],
  safeEnvironmentSteps: ['Medikamente wegschließen', 'Scharfe Gegenstände entfernen'],
  itemsToRemove: ['Unbenutzte Medikamente', 'Alkohol'],
  emergencyContacts: [
    { name: 'Anna (Schwester)', relationship: 'Schwester', phone: '+49 160 9876543', availableWhen: 'jederzeit' },
  ],
  professionalContacts: [
    { name: 'Dr. Sarah Müller', role: 'Therapeutin', phone: '+49 170 1234567', organization: 'Praxis Dr. Müller' },
  ],
  reasonsToLive: ['Familie', 'Haustier Max', 'Reisepläne'],
  crisisHotlines: [
    { name: 'Telefonseelsorge', phone: '0800 111 0 111', available: '24/7' },
    { name: 'Krisendienst', phone: '0800 111 0 222', available: '24/7' },
  ],
  safePlace: 'Mein Zimmer, Lieblingsmusik hören',
  additionalNotes: 'Nächste Notaufnahme: Klinikum München, Tel: 089 12345',
  updatedAt: new Date(Date.now() - 604800000).toISOString(),
};

const demoMedications = [
  { id: 'med1', name: 'Sertralin', genericName: 'Sertraline', dosage: '50mg', frequency: 'once_daily', frequencyDetails: '', timing: ['08:00'], prescribedBy: 'Dr. Müller', startDate: '2025-11-01', reason: 'Depression', category: 'antidepressant', notes: 'Antidepressivum (SSRI)', isActive: true },
  { id: 'med2', name: 'Lorazepam', genericName: 'Lorazepam', dosage: '0.5mg', frequency: 'as_needed', frequencyDetails: 'max 2x/Woche', timing: [], prescribedBy: 'Dr. Müller', startDate: '2025-12-15', reason: 'Akute Angst', category: 'anxiolytic', notes: 'Nur bei akuter Angst', isActive: true },
];

const demoExercises = [
  { id: 1, title: 'Progressive Muskelentspannung', description: 'Anleitung nach Jacobson: Systematisches Anspannen und Entspannen der Muskelgruppen', category: 'relaxation', categoryLabel: 'Entspannung', instructions: '1. Setzen Sie sich bequem hin\n2. Spannen Sie nacheinander jede Muskelgruppe für 5 Sekunden an\n3. Lassen Sie die Spannung los und spüren Sie die Entspannung', frequency: 'daily', dueDate: new Date(Date.now() + 172800000).toISOString(), estimatedMinutes: 20, status: 'in_progress', completionCount: 3, lastCompleted: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 604800000).toISOString(), assignedBy: 'Dr. Müller' },
  { id: 2, title: 'Gedankenprotokoll', description: 'Notieren Sie negative Gedanken und formulieren Sie alternative Gedanken', category: 'cognitive_restructuring', categoryLabel: 'Kognitive Umstrukturierung', instructions: '1. Schreiben Sie den negativen Gedanken auf\n2. Bewerten Sie die Intensität (0-10)\n3. Finden Sie Gegenargumente\n4. Formulieren Sie einen realistischen Gedanken', frequency: 'daily', dueDate: new Date(Date.now() - 86400000).toISOString(), estimatedMinutes: 15, status: 'completed', completionCount: 7, lastCompleted: new Date(Date.now() - 43200000).toISOString(), createdAt: new Date(Date.now() - 1209600000).toISOString(), assignedBy: 'Dr. Müller', completedAt: new Date(Date.now() - 43200000).toISOString() },
  { id: 3, title: 'Achtsamkeitsmeditation', description: '10 Minuten tägliche Meditation mit Fokus auf den Atem', category: 'mindfulness', categoryLabel: 'Achtsamkeit', instructions: '1. Finden Sie eine ruhige Position\n2. Schließen Sie die Augen\n3. Konzentrieren Sie sich auf Ihren Atem\n4. Wenn Gedanken kommen, lassen Sie sie vorüberziehen', frequency: 'daily', dueDate: new Date(Date.now() + 604800000).toISOString(), estimatedMinutes: 10, status: 'pending', completionCount: 0, createdAt: new Date(Date.now() - 172800000).toISOString(), assignedBy: 'Dr. Müller' },
  { id: 4, title: 'Expositionsübung: Supermarkt', description: 'Gezielter Besuch im Supermarkt zur Angstbewältigung', category: 'exposure', categoryLabel: 'Exposition', instructions: '1. Gehen Sie zu einer ruhigen Zeit einkaufen\n2. Bleiben Sie mindestens 15 Minuten\n3. Notieren Sie Ihre Angst-Level (0-10) alle 5 Minuten\n4. Üben Sie Atemtechniken wenn nötig', frequency: 'weekly', dueDate: new Date(Date.now() + 259200000).toISOString(), estimatedMinutes: 30, status: 'pending', completionCount: 1, lastCompleted: new Date(Date.now() - 604800000).toISOString(), createdAt: new Date(Date.now() - 1209600000).toISOString(), assignedBy: 'Dr. Müller' },
  { id: 5, title: 'Schlafhygiene-Protokoll', description: 'Regelmäßige Schlafenszeit einhalten und Bildschirmzeit vor dem Schlafen reduzieren', category: 'self_care', categoryLabel: 'Selbstfürsorge', instructions: '1. Gehen Sie jeden Tag zur gleichen Zeit ins Bett\n2. Kein Bildschirm 1 Stunde vor dem Schlafen\n3. Notieren Sie Einschlafzeit und Aufwachzeit', frequency: 'daily', dueDate: new Date(Date.now() + 1209600000).toISOString(), estimatedMinutes: 5, status: 'in_progress', completionCount: 10, lastCompleted: new Date(Date.now() - 43200000).toISOString(), createdAt: new Date(Date.now() - 2592000000).toISOString(), assignedBy: 'Dr. Müller' },
];

const demoScreenings = [
  { id: 'scr1', type: 'PHQ-9', title: 'Depressions-Screening', score: 8, maxScore: 27, severity: 'mild', date: new Date(Date.now() - 604800000).toISOString(), status: 'completed' },
  { id: 'scr2', type: 'GAD-7', title: 'Angst-Screening', score: 12, maxScore: 21, severity: 'moderate', date: new Date(Date.now() - 1209600000).toISOString(), status: 'completed' },
  { id: 'scr3', type: 'ISI', title: 'Schlaflosigkeits-Screening', score: 15, maxScore: 28, severity: 'moderate', date: new Date(Date.now() - 2592000000).toISOString(), status: 'completed' },
  { id: 'scr4', type: 'PHQ-9', title: 'Depressions-Screening', score: null, maxScore: 27, severity: null, date: new Date().toISOString(), status: 'pending' },
  { id: 'scr5', type: 'GAD-7', title: 'Angst-Screening', score: null, maxScore: 21, severity: null, date: new Date().toISOString(), status: 'pending' },
];

const demoTherapyNotes = [
  { id: 'tn1', patient_id: 'demo-patient-001', patientId: 'demo-patient-001', session_date: new Date(Date.now() - 604800000).toISOString(), sessionDate: new Date(Date.now() - 604800000).toISOString(), session_number: 12, session_duration: 50, subjective: 'Patient berichtet über verbesserten Schlaf, aber anhaltende Konzentrationsschwierigkeiten.', objective: 'Wacher und aufmerksamer als in letzter Sitzung. Blickkontakt gut.', assessment: 'Leichte Verbesserung der depressiven Symptomatik. GAD-7 Score von 12 → 9.', plan: 'Weiterführung der Sertralin-Medikation. Achtsamkeitsübungen intensivieren.', risk_assessment: 'low', suicidal_ideation: false, mental_status: { appearance: 'gepflegt', behavior: 'kooperativ', speech: 'normal', mood: 'leicht gedrückt', affect: 'modulationsfähig', thought: 'geordnet', perception: 'unauffällig', cognition: 'orientiert', insight: 'gut', judgment: 'adäquat' }, progress_rating: 4, goals_addressed: ['Schlafverbesserung', 'Achtsamkeit'], follow_up_required: true, next_session_planned: new Date(Date.now() + 604800000).toISOString(), interventions: ['Kognitive Umstrukturierung', 'Achtsamkeitsübungen'], diagnosis: ['F32.1'], homework: 'Tägliche Achtsamkeitsmeditation 10min', first_name: 'Max', last_name: 'Mustermann', patient: { firstName: 'Max', lastName: 'Mustermann' } },
  { id: 'tn2', patient_id: 'demo-patient-002', patientId: 'demo-patient-002', session_date: new Date(Date.now() - 1209600000).toISOString(), sessionDate: new Date(Date.now() - 1209600000).toISOString(), session_number: 5, session_duration: 50, subjective: 'Patientin beschreibt erhöhte Angstzustände im beruflichen Umfeld.', objective: 'Sichtbar angespannt, häufiges Spielen mit den Händen.', assessment: 'Generalisierte Angststörung mit situativer Verstärkung.', plan: 'Expositionsübungen planen. Kognitive Umstrukturierung vertiefen.', risk_assessment: 'moderate', suicidal_ideation: false, mental_status: { appearance: 'gepflegt', behavior: 'angespannt', speech: 'leise', mood: 'ängstlich', affect: 'eingeschränkt', thought: 'grüblerisch', perception: 'unauffällig', cognition: 'orientiert', insight: 'gut', judgment: 'adäquat' }, progress_rating: 3, goals_addressed: ['Angstbewältigung', 'Exposition'], follow_up_required: true, next_session_planned: new Date(Date.now() + 604800000).toISOString(), interventions: ['Exposition', 'Psychoedukation'], diagnosis: ['F41.1'], homework: 'Gedankenprotokoll führen', first_name: 'Anna', last_name: 'Schmidt', patient: { firstName: 'Anna', lastName: 'Schmidt' } },
];

const demoPatients = [
  { id: 1, email: 'patient@demo.de', firstName: 'Max', lastName: 'Mustermann', name: 'Max Mustermann', role: 'patient' },
  { id: 2, email: 'anna@demo.de', firstName: 'Anna', lastName: 'Schmidt', name: 'Anna Schmidt', role: 'patient' },
  { id: 3, email: 'peter@demo.de', firstName: 'Peter', lastName: 'Wagner', name: 'Peter Wagner', role: 'patient' },
];

const demoReminders: Record<string, unknown> = {
  emailEnabled: true,
  smsEnabled: false,
  pushEnabled: true,
  reminderTimes: [1440, 60, 15],
  dailySummaryEnabled: false,
  dailySummaryTime: '08:00',
};

const demoBilling = [
  { id: 1, patientId: 1, patientName: 'Max Mustermann', invoiceNumber: 'INV-2026-001', date: new Date(Date.now() - 604800000).toISOString(), dueDate: new Date(Date.now() + 604800000).toISOString(), total: 120, status: 'paid' },
  { id: 2, patientId: 2, patientName: 'Anna Schmidt', invoiceNumber: 'INV-2026-002', date: new Date(Date.now() - 86400000).toISOString(), dueDate: new Date(Date.now() + 1209600000).toISOString(), total: 150, status: 'pending' },
  { id: 3, patientId: 1, patientName: 'Max Mustermann', invoiceNumber: 'INV-2026-003', date: new Date(Date.now() - 1209600000).toISOString(), dueDate: new Date(Date.now() - 604800000).toISOString(), total: 120, status: 'paid' },
  { id: 4, patientId: 2, patientName: 'Anna Schmidt', invoiceNumber: 'INV-2026-004', date: new Date(Date.now() - 2592000000).toISOString(), dueDate: new Date(Date.now() - 1987200000).toISOString(), total: 180, status: 'paid' },
];

const demoReports = [
  { id: 1, title: 'Behandlungsbericht Q4/2025', patientId: 1, patientName: 'Max Mustermann', reportType: 'treatment_summary', reportTypeName: 'Behandlungsbericht', dateFrom: '2025-10-01', dateTo: '2025-12-31', createdAt: new Date(Date.now() - 2592000000).toISOString(), status: 'finalized' },
  { id: 2, title: 'Verlaufsbericht Januar 2026', patientId: 2, patientName: 'Anna Schmidt', reportType: 'progress_report', reportTypeName: 'Verlaufsbericht', dateFrom: '2026-01-01', dateTo: '2026-01-31', createdAt: new Date(Date.now() - 604800000).toISOString(), status: 'draft' },
  { id: 3, title: 'Gutachten für Krankenkasse', patientId: 1, patientName: 'Max Mustermann', reportType: 'insurance_report', reportTypeName: 'Gutachten', dateFrom: '2025-06-01', dateTo: '2025-12-31', createdAt: new Date(Date.now() - 5184000000).toISOString(), status: 'sent' },
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
  // Sub-Pfade zuerst (spezifischer vor generisch)
  if (u.match(/\/questionnaires\/templates/) && m === 'GET') {
    return mockResponse({ templates: [
      { id: 'qt1', title: 'PHQ-9 Template', description: 'Depressions-Fragebogen', category: 'depression', questionCount: 9, formSchema: { fields: [{ id: 'q1', type: 'scale', label: 'Wie oft hatten Sie wenig Interesse?', required: true }] }, usageCount: 5, createdAt: new Date(Date.now() - 2592000000).toISOString() },
      { id: 'qt2', title: 'GAD-7 Template', description: 'Angst-Fragebogen', category: 'anxiety', questionCount: 7, formSchema: { fields: [{ id: 'q1', type: 'scale', label: 'Wie oft fühlten Sie sich nervös?', required: true }] }, usageCount: 3, createdAt: new Date(Date.now() - 1296000000).toISOString() },
    ] });
  }
  if (u.match(/\/questionnaires\/templates/) && (m === 'POST' || m === 'PUT' || m === 'DELETE')) {
    return mockResponse({ message: 'Template-Aktion ausgeführt (Demo)' });
  }
  if (u.match(/\/questionnaires\/requests/) && m === 'GET') {
    return mockResponse({ requests: [
      { id: 'qr1', questionnaireId: 'q1', templateTitle: 'PHQ-9 Depressions-Screening', instructions: 'Bitte beantworten Sie alle Fragen.', formSchema: { fields: [{ id: 'q1', type: 'scale', label: 'Wie oft hatten Sie wenig Interesse?', required: true }] }, deadline: new Date(Date.now() + 604800000).toISOString(), priority: 'normal', status: 'pending', patientId: userId, createdAt: new Date(Date.now() - 86400000).toISOString() },
    ] });
  }
  if (u.match(/\/questionnaires\/responses\//) && m === 'GET') {
    return mockResponse([{ id: 'resp1', answers: [{ questionId: 'q1-1', value: 3 }], completedAt: new Date().toISOString() }]);
  }
  if (u.match(/\/questionnaires\/\w+\/submit/) && m === 'POST') {
    return mockResponse({ message: 'Fragebogen eingereicht (Demo)' });
  }
  if (u.startsWith('/questionnaires') && m === 'GET') {
    return mockResponse(demoQuestionnaires);
  }
  if (u.startsWith('/questionnaires') && (m === 'POST' || m === 'PUT' || m === 'DELETE')) {
    return mockResponse({ id: 'q-new', message: 'Fragebogen gespeichert (Demo)' }, 201);
  }

  // ─── PATIENTS (standalone endpoint) ────────────
  if (u.startsWith('/patients') && m === 'GET') {
    return mockResponse(demoPatients);
  }

  // ─── DOCUMENT REQUESTS ────────────────────────
  if (u.startsWith('/document-requests') && m === 'GET') {
    return mockResponse({ requests: demoDocumentRequests });
  }
  if (u.startsWith('/document-requests') && (m === 'POST' || m === 'PATCH' || m === 'PUT')) {
    return mockResponse({ id: 'dr-new', message: 'Anfrage bearbeitet (Demo)' }, 201);
  }
  if (u.startsWith('/document-requests') && m === 'DELETE') {
    return mockResponse({ message: 'Anfrage gelöscht (Demo)' });
  }

  // ─── PATIENT MATERIALS ────────────────────────
  if (u.match(/\/patient-materials\/\w+\/download/)) {
    return mockResponse(new Blob(['Demo-Datei-Inhalt'], { type: 'application/pdf' }));
  }
  if (u.startsWith('/patient-materials') && m === 'GET') {
    return mockResponse({ materials: demoMaterials.map(m => ({ ...m, materialType: m.type, fileSizeBytes: 1024, fileMimeType: 'text/plain', sharedWithTherapist: false })) });
  }
  if (u.startsWith('/patient-materials') && (m === 'POST' || m === 'PATCH' || m === 'PUT')) {
    return mockResponse({ id: 'mat-new', message: 'Material gespeichert (Demo)' }, 201);
  }
  if (u.startsWith('/patient-materials') && m === 'DELETE') {
    return mockResponse({ message: 'Material gelöscht (Demo)' });
  }

  // ─── SYMPTOM DIARY ────────────────────────────
  if (u.match(/\/(diary|symptom-diary)\/stats/)) {
    return mockResponse({
      totalEntries: 3,
      averages: { mood: 6.7, sleepHours: 6.7, anxiety: 3.7, energy: 5.7, stress: 4.0, sleepQuality: 6.0 },
      moodTrend: 'improving',
      topSymptoms: [{ symptom: 'Kopfschmerzen', count: 2 }, { symptom: 'Anspannung', count: 1 }],
      topTriggers: [{ trigger: 'Arbeit', count: 2 }],
    });
  }
  if ((u.startsWith('/diary') || u.startsWith('/symptom-diary')) && m === 'GET') {
    return mockResponse(demoDiaryEntries);
  }
  if ((u.startsWith('/diary') || u.startsWith('/symptom-diary')) && (m === 'POST' || m === 'PUT')) {
    return mockResponse({ id: 'de-new', message: 'Eintrag gespeichert (Demo)' }, 201);
  }
  if ((u.startsWith('/diary') || u.startsWith('/symptom-diary')) && m === 'DELETE') {
    return mockResponse({ message: 'Eintrag gelöscht (Demo)' });
  }

  // ─── CRISIS PLAN ──────────────────────────────
  if (u.match(/\/crisis(-plan)?\/defaults/) && m === 'GET') {
    return mockResponse({
      defaultSignals: ['Schlaflosigkeit'],
      defaultStrategies: ['Atemübungen'],
      crisisHotlines: [
        { name: 'Telefonseelsorge', phone: '0800 111 0 111', available: '24/7' },
        { name: 'Krisendienst', phone: '0800 111 0 222', available: '24/7' },
      ],
    });
  }
  if ((u.startsWith('/crisis-plan') || u.startsWith('/crisis')) && m === 'GET') {
    return mockResponse(demoCrisisPlan);
  }
  if ((u.startsWith('/crisis-plan') || u.startsWith('/crisis')) && (m === 'POST' || m === 'PUT')) {
    return mockResponse({ ...demoCrisisPlan, message: 'Krisenplan aktualisiert (Demo)' });
  }

  // ─── MEDICATIONS ──────────────────────────────
  if (u.match(/\/medications?\/database/) && m === 'GET') {
    return mockResponse({
      medications: [
        { name: 'Sertralin', genericName: 'Sertraline', category: 'antidepressant', commonDosages: ['25mg', '50mg', '100mg'] },
        { name: 'Lorazepam', genericName: 'Lorazepam', category: 'anxiolytic', commonDosages: ['0.5mg', '1mg', '2mg'] },
        { name: 'Quetiapin', genericName: 'Quetiapine', category: 'antipsychotic', commonDosages: ['25mg', '50mg', '100mg'] },
      ],
      sideEffects: ['Übelkeit', 'Schwindel', 'Müdigkeit', 'Kopfschmerzen', 'Appetitveränderung', 'Schlafstörungen'],
    });
  }
  if (u.match(/\/medications?\/intake/) && m === 'GET') {
    return mockResponse([]);
  }
  if (u.match(/\/medications?\/intake/) && m === 'POST') {
    return mockResponse({ id: 'il-new', message: 'Einnahme protokolliert (Demo)' }, 201);
  }
  if (u.match(/\/medications?\/\w+\/intake-logs/) && m === 'GET') {
    return mockResponse([{ id: 'il1', medicationId: 'med1', takenAt: new Date().toISOString(), status: 'taken' }]);
  }
  if (u.match(/\/medications?\/\w+\/intake-logs/) && m === 'POST') {
    return mockResponse({ id: 'il-new', message: 'Einnahme protokolliert (Demo)' }, 201);
  }
  if (u.match(/\/medications?\/adherence/) && m === 'GET') {
    return mockResponse({
      overall: { adherenceRate: 0.85, taken: 25, total: 30, period: '30 Tage' },
      byMedication: [
        { id: 1, name: 'Sertralin', dosage: '50mg', adherenceRate: 0.9, taken: 27, total: 30 },
        { id: 2, name: 'Lorazepam', dosage: '0.5mg', adherenceRate: 0.75, taken: 6, total: 8 },
      ],
      sideEffects: [{ effect: 'Müdigkeit', count: 3 }, { effect: 'Übelkeit', count: 1 }],
    });
  }
  if ((u.startsWith('/medications') || u.startsWith('/medication')) && m === 'GET') {
    return mockResponse(demoMedications);
  }
  if ((u.startsWith('/medications') || u.startsWith('/medication')) && (m === 'POST' || m === 'PUT' || m === 'PATCH')) {
    return mockResponse({ id: 'med-new', message: 'Medikament gespeichert (Demo)' }, 201);
  }
  if ((u.startsWith('/medications') || u.startsWith('/medication')) && m === 'DELETE') {
    return mockResponse({ message: 'Medikament gelöscht (Demo)' });
  }

  // ─── EXERCISES ────────────────────────────────
  if (u.match(/\/exercises\/completions/) && m === 'GET') {
    return mockResponse([{ id: 1, exerciseId: 2, exerciseTitle: 'Gedankenprotokoll', category: 'cognitive_restructuring', completed: true, completedAt: new Date(Date.now() - 43200000).toISOString(), notes: 'Gut gelaufen', duration: 15, difficulty: 3, moodBefore: 4, moodAfter: 7 }]);
  }
  if (u.match(/\/exercises\/\w+\/completions/) && m === 'GET') {
    return mockResponse([{ id: 1, exerciseId: 2, exerciseTitle: 'Gedankenprotokoll', category: 'cognitive_restructuring', completed: true, completedAt: new Date(Date.now() - 43200000).toISOString(), notes: 'Gut gelaufen' }]);
  }
  if (u.match(/\/exercises\/stats/) && m === 'GET') {
    return mockResponse({
      totalAssigned: 3, completed: 1, inProgress: 1, pending: 1, completionRate: 0.33,
      avgMoodImprovement: 1.5,
      byCategory: [
        { category: 'relaxation', categoryLabel: 'Entspannung', completions: 3 },
        { category: 'cognitive', categoryLabel: 'Kognitiv', completions: 1 },
        { category: 'mindfulness', categoryLabel: 'Achtsamkeit', completions: 0 },
      ],
      weeklyActivity: [
        { week: 'KW 1', completions: 2 },
        { week: 'KW 2', completions: 1 },
        { week: 'KW 3', completions: 3 },
        { week: 'KW 4', completions: 0 },
      ],
    });
  }
  if (u.startsWith('/exercises') && m === 'GET') {
    return mockResponse(demoExercises);
  }
  if (u.startsWith('/exercises') && (m === 'POST' || m === 'PUT' || m === 'PATCH')) {
    return mockResponse({ id: 'ex-new', message: 'Übung gespeichert (Demo)' }, 201);
  }
  if (u.startsWith('/exercises') && m === 'DELETE') {
    return mockResponse({ message: 'Übung gelöscht (Demo)' });
  }

  // ─── SCREENINGS ───────────────────────────────
  if (u.match(/\/screenings\/templates/) && m === 'GET') {
    return mockResponse([
      { id: 'PHQ-9', name: 'PHQ-9 Depression', description: 'Standardisierter Fragebogen zur Erfassung depressiver Symptome', category: 'Depression', questionCount: 9, maxScore: 27 },
      { id: 'GAD-7', name: 'GAD-7 Angst', description: 'Fragebogen zur Erfassung generalisierter Angststörungen', category: 'Angst', questionCount: 7, maxScore: 21 },
      { id: 'ISI', name: 'ISI Schlaflosigkeit', description: 'Insomnia Severity Index', category: 'Schlaf', questionCount: 7, maxScore: 28 },
    ]);
  }
  if (u.match(/\/screenings\/(my-)?results/) && m === 'GET') {
    return mockResponse(demoScreenings.filter(s => s.status === 'completed').map(s => ({
      id: s.id,
      screening_type: s.type,
      total_score: s.score,
      severity: s.severity,
      result_data: {
        totalScore: s.score ?? 0,
        maxScore: s.maxScore,
        percentage: s.score != null ? Math.round((s.score / s.maxScore) * 100) : 0,
        severity: s.severity ?? 'none',
        severityLabel: s.severity === 'mild' ? 'Leicht' : s.severity === 'moderate' ? 'Mittel' : 'Keine',
      },
      created_at: s.date,
    })));
  }
  if (u.match(/\/screenings\/pending/) && m === 'GET') {
    return mockResponse(demoScreenings.filter(s => s.status === 'pending').map(s => ({
      id: s.id,
      screening_type: s.type,
      due_date: new Date(Date.now() + 604800000).toISOString(),
      message: 'Bitte füllen Sie diesen Fragebogen bis zum nächsten Termin aus.',
      therapist_first: 'Sarah',
      therapist_last: 'Müller',
    })));
  }
  if (u.match(/\/screenings\/\w+\/questions/) && m === 'GET') {
    return mockResponse([{ id: 'sq1', text: 'Wie oft fühlten Sie sich niedergeschlagen?', type: 'scale', min: 0, max: 3 }]);
  }
  if (u.startsWith('/screenings') && m === 'GET') {
    return mockResponse(demoScreenings);
  }
  if (u.startsWith('/screenings') && (m === 'POST' || m === 'PUT')) {
    return mockResponse({ id: 'scr-new', message: 'Screening gespeichert (Demo)' }, 201);
  }

  // ─── THERAPY NOTES ────────────────────────────
  if (u.match(/\/therapy-notes\/patient\//) && m === 'GET') {
    const patientIdMatch = u.match(/\/therapy-notes\/patient\/([^/?]+)/);
    const pid = patientIdMatch?.[1];
    const filtered = pid ? demoTherapyNotes.filter(n => n.patientId === pid) : demoTherapyNotes;
    return mockResponse(filtered);
  }
  if (u.match(/\/therapy-notes\/[^/]+$/) && m === 'GET') {
    return mockResponse(demoTherapyNotes[0]);
  }
  if (u.startsWith('/therapy-notes') && m === 'GET') {
    return mockResponse(demoTherapyNotes);
  }
  if (u.startsWith('/therapy-notes') && (m === 'POST' || m === 'PUT')) {
    return mockResponse({ id: 'tn-new', message: 'Notiz gespeichert (Demo)' }, 201);
  }
  if (u.startsWith('/therapy-notes') && m === 'DELETE') {
    return mockResponse({ message: 'Notiz gelöscht (Demo)' });
  }

  // ─── REMINDERS ────────────────────────────────
  if (u.match(/\/reminders\/upcoming/) && m === 'GET') {
    return mockResponse([{ id: 1, appointmentId: 1, type: 'email', scheduledFor: new Date(Date.now() + 82800000).toISOString(), message: 'Erinnerung: Termin morgen um 10:00', status: 'scheduled', appointmentTime: new Date(Date.now() + 86400000).toISOString(), otherPartyName: 'Dr. Sarah Müller' }]);
  }
  if (u.match(/\/reminders\/history/) && m === 'GET') {
    return mockResponse([{ id: 2, appointmentId: 2, type: 'email', scheduledFor: new Date(Date.now() - 90000000).toISOString(), status: 'sent', appointmentTime: new Date(Date.now() - 86400000).toISOString(), otherPartyName: 'Dr. Sarah Müller', sentAt: new Date(Date.now() - 90000000).toISOString() }]);
  }
  if (u.match(/\/reminders\/(times|available-times)/) && m === 'GET') {
    return mockResponse({ times: [
      { minutes: 1440, label: '1 Tag vorher' },
      { minutes: 120, label: '2 Stunden vorher' },
      { minutes: 60, label: '1 Stunde vorher' },
      { minutes: 30, label: '30 Minuten vorher' },
      { minutes: 15, label: '15 Minuten vorher' },
    ] });
  }
  if (u.match(/\/reminders\/preferences/) && m === 'GET') {
    return mockResponse(demoReminders);
  }
  if (u.startsWith('/reminders') && m === 'GET') {
    return mockResponse(demoReminders);
  }
  if (u.startsWith('/reminders') && (m === 'POST' || m === 'PUT' || m === 'PATCH')) {
    return mockResponse({ ...demoReminders, message: 'Einstellungen gespeichert (Demo)' });
  }
  if (u.startsWith('/reminders') && m === 'DELETE') {
    return mockResponse({ message: 'Erinnerung gelöscht (Demo)' });
  }

  // ─── BILLING ──────────────────────────────────
  if (u.match(/\/billing\/invoices/) && m === 'GET') {
    return mockResponse(demoBilling);
  }
  if (u.match(/\/billing\/invoices\/\w+\/generate/) && m === 'POST') {
    return mockResponse({ message: 'Rechnung generiert (Demo)', url: '#demo-invoice.pdf' });
  }
  if (u.match(/\/billing\/settings/) && m === 'GET') {
    return mockResponse({
      practiceName: 'Praxis Dr. Sarah Müller',
      addressLine1: 'Musterstraße 12',
      addressLine2: '',
      zipCode: '80333',
      city: 'München',
      taxId: 'DE123456789',
      bankName: 'Sparkasse München',
      iban: 'DE89 3704 0044 0532 0130 00',
      bic: 'COBADEFFXXX',
      invoiceFooter: 'Zahlbar innerhalb von 14 Tagen ohne Abzug.',
      nextInvoiceNumber: 1005,
    });
  }
  if (u.match(/\/billing\/settings/) && m === 'PUT') {
    return mockResponse({ message: 'Abrechnungseinstellungen gespeichert (Demo)' });
  }
  if (u.match(/\/billing\/stats/) && m === 'GET') {
    return mockResponse({ totalRevenue: 390, pendingPayments: 150, paidInvoices: 2, openInvoices: 1 });
  }
  if (u.startsWith('/billing') && m === 'GET') {
    return mockResponse(demoBilling);
  }
  if (u.startsWith('/billing') && (m === 'POST' || m === 'PUT')) {
    return mockResponse({ id: 'bill-new', message: 'Rechnung erstellt (Demo)' }, 201);
  }

  // ─── REPORTS ──────────────────────────────────
  if (u.match(/\/reports\/templates/) && m === 'GET') {
    return mockResponse({ templates: [
      { id: 'treatment_summary', name: 'Behandlungsbericht', description: 'Zusammenfassung der Behandlung', defaultSections: ['patientInfo', 'diagnoses', 'medications', 'recommendations'] },
      { id: 'progress_report', name: 'Verlaufsbericht', description: 'Fortschrittsbericht über den Therapieverlauf', defaultSections: ['patientInfo', 'therapyNotes', 'screeningResults'] },
      { id: 'insurance_report', name: 'Gutachten', description: 'Bericht für die Krankenkasse', defaultSections: ['patientInfo', 'diagnoses', 'medications', 'treatmentPlan', 'recommendations'] },
    ] });
  }
  if (u.match(/\/reports\/\w+\/download/) && m === 'GET') {
    return mockResponse({ url: '#demo-report.pdf', message: 'Report-Download (Demo)' });
  }
  if (u.startsWith('/reports') && m === 'GET') {
    return mockResponse(demoReports);
  }
  if (u.startsWith('/reports') && (m === 'POST' || m === 'PUT')) {
    return mockResponse({ id: 'rep-new', message: 'Bericht erstellt (Demo)' }, 201);
  }
  if (u.startsWith('/reports') && m === 'DELETE') {
    return mockResponse({ message: 'Bericht gelöscht (Demo)' });
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
  if (u.match(/\/waiting-room\/status/) && m === 'GET') {
    return mockResponse({ position: 1, estimatedWait: 5, isActive: true });
  }
  if (u.match(/\/waiting-room\/pre-session/) && m === 'GET') {
    return mockResponse({ appointmentId: 'demo-a1', therapistName: 'Dr. Sarah Müller', checklist: ['Kamera testen', 'Mikrofon testen', 'Ruhige Umgebung'], ready: false });
  }
  if (u.match(/\/queue\/\w+\/admit/) && m === 'POST') {
    return mockResponse({ message: 'Patient zugelassen (Demo)', roomUrl: '#demo-room' });
  }
  if ((u.startsWith('/waiting-room') || u.startsWith('/queue')) && m === 'GET') {
    if (userId.includes('therapist')) {
      return mockResponse(demoTherapistQueue);
    }
    return mockResponse(demoWaitingRoom);
  }
  if ((u.startsWith('/waiting-room') || u.startsWith('/queue')) && (m === 'POST' || m === 'PUT')) {
    return mockResponse({ message: 'Aktion ausgeführt (Demo)' });
  }

  // ─── VIDEO SESSION ────────────────────────────
  if (u.match(/\/video-sessions?\/\w+\/token/) && m === 'GET') {
    return mockResponse({ token: 'demo-video-token', peerId: 'demo-peer-id', roomId: 'demo-room' });
  }
  if (u.startsWith('/video-session') && m === 'GET') {
    return mockResponse({ id: 'vs1', appointmentId: 'demo-a1', status: 'waiting', peerId: 'demo-peer-id' });
  }
  if (u.startsWith('/video-session') && (m === 'POST' || m === 'PUT' || m === 'PATCH')) {
    return mockResponse({ message: 'Video-Sitzung aktualisiert (Demo)' });
  }

  // ─── CONSENT / EINWILLIGUNG ───────────────────
  if (u.match(/\/consent\/status/) && m === 'GET') {
    return mockResponse({ dataProcessing: true, healthData: true, videoRecording: false, updatedAt: new Date(Date.now() - 2592000000).toISOString() });
  }
  if (u.startsWith('/consent') && m === 'GET') {
    return mockResponse([
      { id: 'c1', type: 'dataProcessing', granted: true, grantedAt: new Date(Date.now() - 2592000000).toISOString() },
      { id: 'c2', type: 'healthData', granted: true, grantedAt: new Date(Date.now() - 2592000000).toISOString() },
      { id: 'c3', type: 'videoRecording', granted: false, grantedAt: null },
    ]);
  }
  if (u.startsWith('/consent') && (m === 'POST' || m === 'PUT')) {
    return mockResponse({ message: 'Einwilligung gespeichert (Demo)' });
  }

  // ─── ANALYTICS / DASHBOARD ────────────────────
  if (u.match(/\/analytics\/dashboard/) && m === 'GET') {
    return mockResponse({ totalPatients: 3, activeAppointments: 2, completedToday: 1, revenue: 390, avgRating: 4.8 });
  }
  if (u.startsWith('/analytics') && m === 'GET') {
    return mockResponse({ period: 'month', sessions: 12, newPatients: 2, cancellations: 1 });
  }

  // ─── NOTIFICATIONS ────────────────────────────
  if (u.match(/\/notifications\/unread/) && m === 'GET') {
    return mockResponse({ count: 2 });
  }
  if (u.startsWith('/notifications') && m === 'GET') {
    return mockResponse([
      { id: 'n1', type: 'appointment', message: 'Termin morgen um 10:00', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: 'n2', type: 'message', message: 'Neue Nachricht von Dr. Müller', read: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
    ]);
  }
  if (u.startsWith('/notifications') && (m === 'PUT' || m === 'PATCH')) {
    return mockResponse({ message: 'Benachrichtigung aktualisiert (Demo)' });
  }

  // ─── PAYMENTS ─────────────────────────────────
  if (u.match(/\/payments\/\w+\/receipt/) && m === 'GET') {
    return mockResponse({ url: '#demo-receipt.pdf', message: 'Quittung (Demo)' });
  }
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
