/**
 * lib/api.ts
 *
 * Single import point for all API calls.
 * Toggle between mock and real API via NEXT_PUBLIC_USE_MOCK env variable.
 *
 * Usage in pages/providers:
 *   import { api } from '@/lib/api';
 *   const companies = await api.getAllCompanies();
 *
 * To use mock data: set NEXT_PUBLIC_USE_MOCK=true in .env.local
 * To use real API:  set NEXT_PUBLIC_USE_MOCK=false (or remove the variable)
 */

import { apiClient } from './apiClient';
import { mockApi } from './mockData/mockApi';

export const api =
  (process.env.NEXT_PUBLIC_USE_MOCK === 'true' ? mockApi : apiClient) as unknown as typeof apiClient;
