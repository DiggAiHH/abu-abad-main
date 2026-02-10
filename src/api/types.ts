/**
 * Type-safe API Response Types
 * Zod-Schemas für Runtime-Validation
 */

import { z } from 'zod';
import { User } from '../types';

// Base API Response Schema
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    status: z.string().optional(),
    message: z.string().optional(),
    data: dataSchema.optional(),
  });

// Auth Response Schemas
export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  token: z.string().optional(), // Legacy fallback
  user: z.custom<User>(),
});

export const UserResponseSchema = z.object({
  user: z.custom<User>().optional(),
  data: z.custom<User>().optional(), // Legacy fallback
});

// Error Response Schema
export const ErrorResponseSchema = z.object({
  error: z.union([z.string(), z.object({ message: z.string() })]),
  message: z.string().optional(),
  detail: z.string().optional(),
  title: z.string().optional(),
  status: z.number().optional(),
});

// Type exports
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

function unwrapAxiosResponse(maybeResponse: unknown): unknown {
  if (!maybeResponse || typeof maybeResponse !== 'object') return maybeResponse;
  const obj = maybeResponse as Record<string, unknown>;

  // AxiosResponse-like: { data, status, headers, config }
  if ('data' in obj && ('status' in obj || 'headers' in obj || 'config' in obj)) {
    return obj.data;
  }

  return maybeResponse;
}

/**
 * Safe response parser with fallback
 */
export function parseApiResponse<T>(response: unknown, schema: z.ZodType<T>): T | null {
  try {
    return schema.parse(response);
  } catch (error) {
    if (import.meta.env.DEV) console.warn('API Response parsing failed:', error);
    return null;
  }
}

/**
 * Extract user from various response formats
 */
export function extractUser(response: unknown): User | null {
  const payload = unwrapAxiosResponse(response);
  if (!payload || typeof payload !== 'object') return null;

  const obj = payload as Record<string, unknown>;

  // Format 1: { user: {...} }
  if (obj.user && typeof obj.user === 'object') {
    return obj.user as User;
  }

  // Format 2: { data: {...} } (legacy)
  if (obj.data && typeof obj.data === 'object') {
    return obj.data as User;
  }

  // Format 3: /api/auth/me returns top-level user fields
  if (typeof obj.id === 'string' && typeof obj.email === 'string' && typeof obj.role === 'string') {
    return obj as unknown as User;
  }

  return null;
}

/**
 * Extract token from various response formats
 */
export function extractToken(response: unknown): string | null {
  const payload = unwrapAxiosResponse(response);
  if (!payload || typeof payload !== 'object') return null;

  const obj = payload as Record<string, unknown>;
  const token = (obj.accessToken as unknown) ?? (obj.token as unknown);
  return typeof token === 'string' && token.length > 0 ? token : null;
}
