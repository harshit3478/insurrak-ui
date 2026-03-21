/**
 * lib/api.ts
 *
 * Single import point for all real backend API calls.
 *
 * Usage in pages/providers:
 *   import { api } from '@/lib/api';
 *   const companies = await api.getAllCompanies();
 */

import { apiClient } from './apiClient';

export const api = apiClient;
