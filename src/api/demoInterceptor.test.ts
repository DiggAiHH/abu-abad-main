import { describe, expect, it } from 'vitest';
import { getDemoResponse } from './demoInterceptor';

describe('demoInterceptor', () => {
  const userId = 'demo-patient-001';

  it('gibt Mock-Appointments für GET /appointments zurück', () => {
    const resp = getDemoResponse('GET', '/appointments', userId);
    expect(resp).not.toBeNull();
    expect(resp!.status).toBe(200);
    expect(Array.isArray(resp!.data)).toBe(true);
    expect((resp!.data as unknown[]).length).toBeGreaterThan(0);
  });

  it('gibt Mock-Messages für GET /messages zurück', () => {
    const resp = getDemoResponse('GET', '/messages', userId);
    expect(resp).not.toBeNull();
    expect(resp!.status).toBe(200);
    expect(Array.isArray(resp!.data)).toBe(true);
  });

  it('gibt Mock-Profil für GET /users/profile zurück', () => {
    const resp = getDemoResponse('GET', '/users/profile', userId);
    expect(resp).not.toBeNull();
    expect((resp!.data as Record<string, unknown>).role).toBe('patient');
  });

  it('gibt Therapeut-Rolle für therapist-userId zurück', () => {
    const resp = getDemoResponse('GET', '/users/profile', 'demo-therapist-001');
    expect(resp).not.toBeNull();
    expect((resp!.data as Record<string, unknown>).role).toBe('therapist');
  });

  it('gibt Mock-Questionnaires zurück', () => {
    const resp = getDemoResponse('GET', '/questionnaires', userId);
    expect(resp).not.toBeNull();
    expect(Array.isArray(resp!.data)).toBe(true);
  });

  it('gibt Mock-Krisenplan zurück', () => {
    const resp = getDemoResponse('GET', '/crisis-plan', userId);
    expect(resp).not.toBeNull();
    expect((resp!.data as Record<string, unknown>).warningSignals).toBeDefined();
  });

  it('gibt Mock-Medikamente zurück', () => {
    const resp = getDemoResponse('GET', '/medications', userId);
    expect(resp).not.toBeNull();
    expect(Array.isArray(resp!.data)).toBe(true);
  });

  it('gibt Mock-Screenings zurück', () => {
    const resp = getDemoResponse('GET', '/screenings', userId);
    expect(resp).not.toBeNull();
  });

  it('gibt Mock-Billing zurück', () => {
    const resp = getDemoResponse('GET', '/billing', userId);
    expect(resp).not.toBeNull();
    expect(Array.isArray(resp!.data)).toBe(true);
  });

  it('gibt null für unbekannte Endpoints zurück', () => {
    const resp = getDemoResponse('GET', '/unknown-endpoint', userId);
    expect(resp).toBeNull();
  });

  it('behandelt POST-Requests', () => {
    const resp = getDemoResponse('POST', '/appointments', userId);
    expect(resp).not.toBeNull();
    expect(resp!.status).toBe(201);
  });

  it('gibt Health-Response zurück', () => {
    const resp = getDemoResponse('GET', '/health', userId);
    expect(resp).not.toBeNull();
    expect((resp!.data as Record<string, unknown>).demo).toBe(true);
  });
});
