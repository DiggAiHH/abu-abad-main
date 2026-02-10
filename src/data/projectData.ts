/**
 * @module ProjectData
 * @description Arbeitspakete und Projektdaten für Abu-Abad Teletherapie-Plattform
 * @version 1.0.0
 * @since 2026-02-09
 * @audit Keine sensiblen/personenbezogenen Daten — rein projektbezogen
 */

import type { ProjectSummary, RegulatoryStatus, WorkPackage } from '../types/projectTypes';

export const workPackages: readonly WorkPackage[] = [
  {
    id: 'wp-001',
    wpNumber: 'WP-001',
    title: 'Plattform-Architektur & Infrastruktur',
    description:
      'Aufbau der technischen Grundarchitektur inkl. CI/CD, Monorepo-Setup mit Turborepo, Docker-Compose für lokale Entwicklung und Deployment-Pipelines.',
    status: 'completed',
    progress: 100,
    priority: 'critical',
    startDate: '2025-09-01',
    endDate: '2025-11-15',
    budget: 45000,
    spent: 42300,
    responsible: 'Tech Lead',
    tasks: [
      { id: 'wp001-t1', title: 'Turborepo Monorepo Setup', status: 'completed' },
      { id: 'wp001-t2', title: 'Docker-Compose Konfiguration', status: 'completed' },
      { id: 'wp001-t3', title: 'CI/CD Pipeline (GitHub Actions)', status: 'completed' },
      { id: 'wp001-t4', title: 'PostgreSQL Schema Design', status: 'completed' },
      { id: 'wp001-t5', title: 'Vite + React 18 Frontend Setup', status: 'completed' },
      { id: 'wp001-t6', title: 'Express.js Backend Scaffold', status: 'completed' },
    ],
    milestones: [
      {
        id: 'wp001-m1',
        title: 'Infrastruktur lauffähig',
        date: '2025-10-01',
        status: 'completed',
        description: 'Lokale Entwicklungsumgebung vollständig einsatzbereit',
      },
      {
        id: 'wp001-m2',
        title: 'Deployment Pipeline aktiv',
        date: '2025-11-15',
        status: 'completed',
        description: 'Automatisierte Deployments auf Netlify + Railway',
      },
    ],
    risks: [],
    dependencies: [],
    tags: ['infrastructure', 'devops', 'foundation'],
  },
  {
    id: 'wp-002',
    wpNumber: 'WP-002',
    title: 'Authentifizierung & Autorisierung (DSGVO)',
    description:
      'DSGVO-konformes Auth-System mit JWT, bcrypt, 2FA (TOTP), Rollen-Management und Audit-Logging.',
    status: 'completed',
    progress: 100,
    priority: 'critical',
    startDate: '2025-10-01',
    endDate: '2025-12-15',
    budget: 35000,
    spent: 33800,
    responsible: 'Security Engineer',
    tasks: [
      { id: 'wp002-t1', title: 'JWT Token Service', status: 'completed' },
      { id: 'wp002-t2', title: 'bcrypt Password Hashing (12 Rounds)', status: 'completed' },
      { id: 'wp002-t3', title: 'Role-Based Access Control (RBAC)', status: 'completed' },
      { id: 'wp002-t4', title: 'Login/Register API Endpoints', status: 'completed' },
      { id: 'wp002-t5', title: 'Audit-Logging für Auth-Events', status: 'completed' },
      { id: 'wp002-t6', title: 'Rate Limiting (Express)', status: 'completed' },
      { id: 'wp002-t7', title: 'CORS & Helmet Security Headers', status: 'completed' },
      { id: 'wp002-t8', title: '2FA/TOTP Integration', status: 'completed' },
    ],
    milestones: [
      {
        id: 'wp002-m1',
        title: 'Auth-System produktionsreif',
        date: '2025-12-15',
        status: 'completed',
        description: 'Vollständiges Auth mit RBAC, 2FA und Audit-Trail',
      },
    ],
    risks: [
      {
        id: 'wp002-r1',
        title: 'Token-Theft bei unsicherer Speicherung',
        level: 'medium',
        mitigation: 'HttpOnly Cookies + Secure Flag + SameSite=Strict',
        status: 'mitigated',
      },
    ],
    dependencies: ['wp-001'],
    tags: ['security', 'auth', 'dsgvo', 'critical'],
  },
  {
    id: 'wp-003',
    wpNumber: 'WP-003',
    title: 'Patientenverwaltung & Verschlüsselung',
    description:
      'CRUD-Operationen für Patienten mit AES-256 Verschlüsselung sensibler Gesundheitsdaten, Einwilligungsmanagement und Recht auf Löschung.',
    status: 'completed',
    progress: 100,
    priority: 'critical',
    startDate: '2025-11-01',
    endDate: '2026-01-15',
    budget: 40000,
    spent: 38500,
    responsible: 'Backend Lead',
    tasks: [
      { id: 'wp003-t1', title: 'AES-256-GCM Encryption Service', status: 'completed' },
      { id: 'wp003-t2', title: 'KMS Key Management Service', status: 'completed' },
      { id: 'wp003-t3', title: 'Einwilligungsverwaltung (Consent)', status: 'completed' },
      { id: 'wp003-t4', title: 'Recht auf Löschung (Art. 17 DSGVO)', status: 'completed' },
      { id: 'wp003-t5', title: 'Datenexport (Art. 20 DSGVO)', status: 'completed' },
      { id: 'wp003-t6', title: 'Parametrisierte SQL-Queries', status: 'completed' },
    ],
    milestones: [
      {
        id: 'wp003-m1',
        title: 'Verschlüsselung DSGVO-konform',
        date: '2026-01-15',
        status: 'completed',
        description: 'AES-256 + KMS + Envelope Encryption aktiv',
      },
    ],
    risks: [
      {
        id: 'wp003-r1',
        title: 'Key-Management Komplexität',
        level: 'high',
        mitigation: 'Dedizierter KMS Service mit Key-Rotation',
        status: 'mitigated',
      },
    ],
    dependencies: ['wp-001', 'wp-002'],
    tags: ['patients', 'encryption', 'dsgvo', 'critical'],
  },
  {
    id: 'wp-004',
    wpNumber: 'WP-004',
    title: 'Terminverwaltung & Video-Calls',
    description:
      'Terminplanung mit Überlappungserkennung, Kalenderansicht, WebRTC Video-Calls mit PeerJS.',
    status: 'completed',
    progress: 100,
    priority: 'high',
    startDate: '2025-12-01',
    endDate: '2026-01-31',
    budget: 35000,
    spent: 33700,
    responsible: 'Frontend Lead',
    tasks: [
      { id: 'wp004-t1', title: 'Termin CRUD API', status: 'completed' },
      { id: 'wp004-t2', title: 'Überlappungserkennung', status: 'completed' },
      { id: 'wp004-t3', title: 'Kalender-UI (React)', status: 'completed' },
      { id: 'wp004-t4', title: 'WebRTC Video-Calls (PeerJS)', status: 'completed' },
      { id: 'wp004-t5', title: 'Wartezimmer-System', status: 'completed' },
      { id: 'wp004-t6', title: 'Stornierungslogik', status: 'completed' },
    ],
    milestones: [
      {
        id: 'wp004-m1',
        title: 'Video-Calls funktionsfähig',
        date: '2026-01-31',
        status: 'completed',
        description: 'WebRTC Video + Audio zwischen Therapeut und Patient',
      },
    ],
    risks: [
      {
        id: 'wp004-r1',
        title: 'WebRTC Browser-Kompatibilität',
        level: 'medium',
        mitigation: 'PeerJS Abstraktionsschicht + Fallback',
        status: 'mitigated',
      },
    ],
    dependencies: ['wp-002', 'wp-003'],
    tags: ['appointments', 'video', 'webrtc'],
  },
  {
    id: 'wp-005',
    wpNumber: 'WP-005',
    title: 'Behandlungsnotizen & Klinische Features',
    description:
      'Verschlüsselte SOAP-Notizen, Symptomtagebuch, Krisenplan, Medikamenten-Tracker, psychologische Screenings.',
    status: 'completed',
    progress: 100,
    priority: 'high',
    startDate: '2026-01-01',
    endDate: '2026-02-01',
    budget: 30000,
    spent: 28200,
    responsible: 'Backend Lead',
    tasks: [
      { id: 'wp005-t1', title: 'SOAP-Notizen (verschlüsselt)', status: 'completed' },
      { id: 'wp005-t2', title: 'Symptomtagebuch (Patient)', status: 'completed' },
      { id: 'wp005-t3', title: 'Krisenplan', status: 'completed' },
      { id: 'wp005-t4', title: 'Medikamenten-Tracker', status: 'completed' },
      { id: 'wp005-t5', title: 'Psychologische Screenings (PHQ-9, GAD-7)', status: 'completed' },
      { id: 'wp005-t6', title: 'Fragebögen-System', status: 'completed' },
    ],
    milestones: [
      {
        id: 'wp005-m1',
        title: 'Klinische Features live',
        date: '2026-02-01',
        status: 'completed',
        description: 'Vollständiges klinisches Toolset für Therapeuten',
      },
    ],
    risks: [],
    dependencies: ['wp-003'],
    tags: ['treatment-notes', 'clinical', 'encryption'],
  },
  {
    id: 'wp-006',
    wpNumber: 'WP-006',
    title: 'Zahlungssystem (Stripe)',
    description: 'Stripe-Integration für Therapiesitzungs-Bezahlung mit PCI-DSS Compliance.',
    status: 'completed',
    progress: 100,
    priority: 'high',
    startDate: '2026-01-01',
    endDate: '2026-02-01',
    budget: 20000,
    spent: 18500,
    responsible: 'Backend Lead',
    tasks: [
      { id: 'wp006-t1', title: 'Stripe Payment Intent API', status: 'completed' },
      { id: 'wp006-t2', title: 'Billing Dashboard (Therapeut)', status: 'completed' },
      { id: 'wp006-t3', title: 'Rückerstattungslogik', status: 'completed' },
      { id: 'wp006-t4', title: 'Abrechnungsübersicht', status: 'completed' },
    ],
    milestones: [
      {
        id: 'wp006-m1',
        title: 'Zahlungen aktiv',
        date: '2026-02-01',
        status: 'completed',
        description: 'Stripe-Zahlungen funktionsfähig',
      },
    ],
    risks: [
      {
        id: 'wp006-r1',
        title: 'PCI-DSS Compliance',
        level: 'medium',
        mitigation: 'Stripe Elements — keine Kartendaten auf unseren Servern',
        status: 'mitigated',
      },
    ],
    dependencies: ['wp-004'],
    tags: ['payments', 'stripe', 'billing'],
  },
  {
    id: 'wp-007',
    wpNumber: 'WP-007',
    title: 'Partner-Transparenz Dashboard',
    description:
      'Transparenz-Dashboard für Neurologen und Investoren mit Projektfortschritt, Meilensteinen und Compliance-Status.',
    status: 'in-progress',
    progress: 80,
    priority: 'medium',
    startDate: '2026-01-20',
    endDate: '2026-03-01',
    budget: 20000,
    spent: 16000,
    responsible: 'Frontend Lead',
    tasks: [
      { id: 'wp007-t1', title: 'Projekt-Tracking UI', status: 'completed' },
      { id: 'wp007-t2', title: 'Work-Package Visualisierung', status: 'completed' },
      { id: 'wp007-t3', title: 'Partner-View (Read-Only)', status: 'completed' },
      { id: 'wp007-t4', title: 'Integration in Hauptapp', status: 'in-progress' },
      { id: 'wp007-t5', title: 'Echtzeit-Updates', status: 'planned' },
    ],
    milestones: [
      {
        id: 'wp007-m1',
        title: 'Dashboard MVP',
        date: '2026-02-08',
        status: 'completed',
        description: 'Standalone Dashboard deployed',
      },
      {
        id: 'wp007-m2',
        title: 'Integration in Abu-Abad',
        date: '2026-02-15',
        status: 'in-progress',
        description: 'Dashboard als Seite in der Hauptapplikation',
      },
    ],
    risks: [],
    dependencies: ['wp-001'],
    tags: ['transparency', 'partner', 'dashboard'],
  },
  {
    id: 'wp-008',
    wpNumber: 'WP-008',
    title: 'Regulatorische Compliance (DiGA-Vorbereitung)',
    description:
      'Vorbereitung auf DiGA-Zulassung: QMS, Risikomanagement ISO 14971, Software-Lebenszyklus IEC 62304.',
    status: 'in-progress',
    progress: 40,
    priority: 'high',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    budget: 60000,
    spent: 18000,
    responsible: 'Regulatory Affairs',
    tasks: [
      { id: 'wp008-t1', title: 'Risikoklassifizierung', status: 'completed' },
      { id: 'wp008-t2', title: 'Zweckbestimmung formulieren', status: 'completed' },
      { id: 'wp008-t3', title: 'QMS-Grundstruktur', status: 'in-progress' },
      { id: 'wp008-t4', title: 'ISO 14971 Risikomanagement', status: 'in-progress' },
      { id: 'wp008-t5', title: 'IEC 62304 Software-Lebenszyklus', status: 'planned' },
      { id: 'wp008-t6', title: 'BfArM Fast-Track Antrag', status: 'planned' },
    ],
    milestones: [
      {
        id: 'wp008-m1',
        title: 'Regulatorische Strategie',
        date: '2026-02-01',
        status: 'completed',
        description: 'Start als Nicht-Medizinprodukt, dann DiGA',
      },
      {
        id: 'wp008-m2',
        title: 'QMS einsatzbereit',
        date: '2026-04-01',
        status: 'planned',
        description: 'Qualitätsmanagementsystem ISO 13485',
      },
    ],
    risks: [
      {
        id: 'wp008-r1',
        title: 'Fehlklassifizierung als Medizinprodukt',
        level: 'high',
        mitigation: 'Rechtliche Beratung, klare Zweckbestimmung',
        status: 'active',
      },
      {
        id: 'wp008-r2',
        title: 'DiGA-Anforderungen ändern sich',
        level: 'medium',
        mitigation: 'Regelmäßiges DiGAV-Monitoring',
        status: 'active',
      },
    ],
    dependencies: [],
    tags: ['regulatory', 'diga', 'compliance', 'iso'],
  },
  {
    id: 'wp-009',
    wpNumber: 'WP-009',
    title: 'Testing & Qualitätssicherung',
    description: 'Unit-Tests (Vitest), E2E-Tests (Playwright), Security-Audits, Performance-Tests.',
    status: 'in-progress',
    progress: 60,
    priority: 'high',
    startDate: '2025-11-01',
    endDate: '2026-03-31',
    budget: 25000,
    spent: 15000,
    responsible: 'QA Engineer',
    tasks: [
      { id: 'wp009-t1', title: 'Vitest Unit-Test Framework', status: 'completed' },
      { id: 'wp009-t2', title: 'Playwright E2E Setup', status: 'completed' },
      { id: 'wp009-t3', title: 'Auth-Flow Tests', status: 'completed' },
      { id: 'wp009-t4', title: 'CRUD-Operation Tests', status: 'in-progress' },
      { id: 'wp009-t5', title: 'Security Audit (OWASP Top 10)', status: 'in-progress' },
      { id: 'wp009-t6', title: 'Accessibility Tests (WCAG 2.1)', status: 'planned' },
    ],
    milestones: [
      {
        id: 'wp009-m1',
        title: 'Test-Framework aktiv',
        date: '2025-12-01',
        status: 'completed',
        description: 'Vitest + Playwright konfiguriert',
      },
      {
        id: 'wp009-m2',
        title: '80% Code Coverage',
        date: '2026-03-31',
        status: 'planned',
        description: 'Mindestens 80% Testabdeckung',
      },
    ],
    risks: [],
    dependencies: ['wp-001'],
    tags: ['testing', 'quality', 'playwright', 'vitest'],
  },
];

export function calculateProjectSummary(packages: readonly WorkPackage[]): ProjectSummary {
  const completed = packages.filter(wp => wp.status === 'completed').length;
  const inProgress = packages.filter(wp => wp.status === 'in-progress').length;
  const planned = packages.filter(wp => wp.status === 'planned').length;
  const blocked = packages.filter(wp => wp.status === 'blocked').length;
  const totalBudget = packages.reduce((sum, wp) => sum + (wp.budget ?? 0), 0);
  const totalSpent = packages.reduce((sum, wp) => sum + (wp.spent ?? 0), 0);
  const allMilestones = packages.flatMap(wp => wp.milestones);
  const completedMilestones = allMilestones.filter(m => m.status === 'completed').length;
  const activeRisks = packages.flatMap(wp => wp.risks).filter(r => r.status === 'active').length;
  const overallProgress =
    packages.length > 0
      ? Math.round(packages.reduce((sum, wp) => sum + wp.progress, 0) / packages.length)
      : 0;

  return {
    totalWorkPackages: packages.length,
    completedWorkPackages: completed,
    inProgressWorkPackages: inProgress,
    plannedWorkPackages: planned,
    blockedWorkPackages: blocked,
    overallProgress,
    totalBudget,
    totalSpent,
    totalMilestones: allMilestones.length,
    completedMilestones,
    activeRisks,
  };
}

export const regulatoryStatus: RegulatoryStatus = {
  classification: 'Nicht-Medizinprodukt (Kommunikationsplattform)',
  complianceLevel: 'DSGVO-konform, DiGA-Vorbereitung',
  lastAudit: '2026-02-01',
  nextAudit: '2026-05-01',
  openFindings: 3,
  certifications: [
    'DSGVO Art. 25 (Privacy by Design)',
    'DSGVO Art. 32 (Technische Maßnahmen)',
    'AES-256-GCM Verschlüsselung',
    'bcrypt (12 Rounds) Passwort-Hashing',
    'ISO 27001 (in Vorbereitung)',
  ],
};
