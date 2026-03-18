/**
 * lib/mockData/mockApi.ts
 * 
 * A drop-in replacement for apiClient that uses local mock data.
 * Mirrors the exact same function signatures so pages can swap
 * between mock and real API by changing a single env variable.
 * 
 * Usage: set NEXT_PUBLIC_USE_MOCK=true in .env.local
 */

import { Company, User, Policy, Claim, Renewal, Role } from '@/types';
import { MOCK_COMPANIES } from './companies';
import { MOCK_POLICIES } from './policies';
import { MOCK_CLAIMS } from './claims';
import { MOCK_RENEWALS } from './renewals';
import { MOCK_USERS } from '@/lib/features/user/userMockData';

const delay = (ms = 400) => new Promise<void>(resolve => setTimeout(resolve, ms));

// In-memory mutable state (reset on page refresh — same as real dev env)
let _companies = [...MOCK_COMPANIES];
let _users = [...MOCK_USERS];
let _policies = [...MOCK_POLICIES];
let _claims = [...MOCK_CLAIMS];
let _renewals = [...MOCK_RENEWALS];

export const mockApi = {
  // ─── Auth ────────────────────────────────────────────────────────────────────
  login: async (_credentials: { username: string; password: string }) => {
    await delay(600);
    // Accept any credentials in mock mode
    return { access_token: 'mock-jwt-token-insurrack' };
  },

  signup: async (_data: { name: string; email: string; password: string }) => {
    await delay(600);
    return { success: true };
  },

  logout: async () => {
    await delay(200);
    return { success: true };
  },

  getCurrentUser: async (): Promise<User> => {
    await delay(200);
    // Return the first user (SUPER_ADMIN) as the logged-in user in mock mode
    return _users[0];
  },

  // ─── Companies ───────────────────────────────────────────────────────────────
  getAllCompanies: async (): Promise<Company[]> => {
    await delay();
    return _companies;
  },

  getCompanyById: async (companyId: number): Promise<Company | undefined> => {
    await delay(200);
    return _companies.find(c => c.id === companyId);
  },

  createCompany: async (data: Omit<Company, 'id' | 'status'>): Promise<Company> => {
    await delay();
    const newCompany: Company = {
      ...data,
      id: Math.max(..._companies.map(c => c.id)) + 1,
      status: 'Active',
    };
    _companies = [newCompany, ..._companies];
    return newCompany;
  },

  updateCompany: async (companyId: number, data: Partial<Omit<Company, 'id'>>): Promise<Company> => {
    await delay();
    const idx = _companies.findIndex(c => c.id === companyId);
    if (idx === -1) throw new Error('Company not found');
    _companies[idx] = { ..._companies[idx], ...data };
    return _companies[idx];
  },

  deleteCompany: async (_id: number): Promise<{ success: boolean }> => {
    await delay();
    _companies = _companies.filter(c => c.id !== _id);
    return { success: true };
  },

  // ─── Users ───────────────────────────────────────────────────────────────────
  getAll: async (): Promise<User[]> => {
    await delay();
    return _users;
  },

  getById: async (id: string): Promise<User | undefined> => {
    await delay(200);
    return _users.find(u => u.id === id);
  },

  createUser: async (data: { name: string; email: string; password: string; role: Role }): Promise<User> => {
    await delay();
    const newUser: User = {
      id: `u${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      active: true,
      companyId: null,
    };
    _users = [newUser, ..._users];
    return newUser;
  },

  updateProfile: async (userId: string, data: Partial<User>): Promise<User> => {
    await delay();
    const idx = _users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    _users[idx] = { ..._users[idx], ...data };
    return _users[idx];
  },

  deleteUser: async (id: string): Promise<{ success: boolean }> => {
    await delay();
    _users = _users.filter(u => u.id !== id);
    return { success: true };
  },

  updateUserRole: async (userId: string, role: string): Promise<{ id: string; role: string }> => {
    await delay();
    const user = _users.find(u => u.id === userId);
    if (user) user.role = role as Role;
    return { id: userId, role };
  },

  // ─── Policies ────────────────────────────────────────────────────────────────
  getAllPolicies: async (): Promise<Policy[]> => {
    await delay();
    return _policies;
  },

  getPolicyById: async (id: string): Promise<Policy | undefined> => {
    await delay(200);
    return _policies.find(p => p.id === id);
  },

  createPolicy: async (data: Omit<Policy, 'id'>): Promise<Policy> => {
    await delay();
    const newPolicy: Policy = { ...data, id: `POL-${Date.now()}` };
    _policies = [newPolicy, ..._policies];
    return newPolicy;
  },

  updatePolicy: async (id: string, data: Partial<Policy>): Promise<Policy> => {
    await delay();
    const idx = _policies.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Policy not found');
    _policies[idx] = { ..._policies[idx], ...data };
    return _policies[idx];
  },

  deletePolicy: async (id: string): Promise<{ success: boolean }> => {
    await delay();
    _policies = _policies.filter(p => p.id !== id);
    return { success: true };
  },

  // ─── Claims ──────────────────────────────────────────────────────────────────
  getAllClaims: async (): Promise<Claim[]> => {
    await delay();
    return _claims;
  },

  getClaimById: async (id: string): Promise<Claim | undefined> => {
    await delay(200);
    return _claims.find(c => c.id === id);
  },

  updateClaimStatus: async (id: string, status: Claim['status']): Promise<Claim> => {
    await delay();
    const idx = _claims.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Claim not found');
    _claims[idx] = { ..._claims[idx], status };
    return _claims[idx];
  },

  // ─── Renewals ────────────────────────────────────────────────────────────────
  getAllRenewals: async (): Promise<Renewal[]> => {
    await delay();
    return _renewals;
  },

  updateRenewalStatus: async (id: string, status: Renewal['status']): Promise<Renewal> => {
    await delay();
    const idx = _renewals.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Renewal not found');
    _renewals[idx] = { ..._renewals[idx], status };
    return _renewals[idx];
  },
};
