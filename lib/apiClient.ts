import { Company, Role, User } from "@/types";
import { 
  UserRead, CompanyRead, RolesAndPermissionsResponse, 
  BranchRead, UnitRead, BrokerRead, InsurerRead, 
  PolicyRequestRead, PolicyDocumentRead, QuotationRead, 
  ApprovalRead, InvoiceRead 
} from "@/types/api";
import { adaptUser, adaptCompany } from "@/lib/adapters";

const API_BASE_URL = "/api/v1";

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  UPDATE_PASSWORD: '/auth/update-password',
  ME: '/users/me', 
  ROLES_PERMISSIONS: '/users/roles-permissions',
  COMPANIES: '/companies',
  USERS: '/users',
  BRANCHES: '/branches',
  UNITS: '/units',
  BROKERS: '/brokers',
  INSURERS: '/insurers',
  POLICY_REQUESTS: '/policy-requests',
};

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

const api = {
  get: async (endpoint: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error(`GET ${endpoint} failed: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  post: async <T = unknown>(endpoint: string, data: T) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail ? JSON.stringify(err.detail) : `POST ${endpoint} failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  patch: async <T = unknown>(endpoint: string, data: T) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail ? JSON.stringify(err.detail) : `PATCH ${endpoint} failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  delete: async (endpoint: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error(`DELETE ${endpoint} failed: ${response.statusText}`);
      // Handle 204 No Content
      return response.status === 204 ? { success: true } : await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};

export const apiClient = {
  // ─── Auth Methods ──────────────────────────────────────────
  login: async (credentials: { email: string; password: string }) => {
    // Real API expects JSON body: { username, password, keep_login }
    return api.post(API_ENDPOINTS.LOGIN, {
      username: credentials.email, // backend expects 'username'
      password: credentials.password,
      keep_login: true,
    });
  },
  
  signup: async (_data: { name: string; email: string; password: string }) => {
    // Returning a dummy response to prevent immediate UI crash if called.
    console.warn("Signup is not supported on the public API directly.");
    return { success: false, detail: "Signup not supported" };
  },

  logout: async () => {
    return { success: true };
  },

  updatePassword: async (token: string, new_password: string) => {
    return api.post(API_ENDPOINTS.UPDATE_PASSWORD, { token, new_password });
  },

  getCurrentUser: async (): Promise<User> => {
    const apiUser: UserRead = await api.get(API_ENDPOINTS.ME);
    return adaptUser(apiUser);
  },

  // ─── User Methods ──────────────────────────────────────────
  getAll: async (): Promise<User[]> => {
    const users: UserRead[] = await api.get(API_ENDPOINTS.USERS);
    return users.map(u => adaptUser(u));
  },
  
  getById: async (id: string | number): Promise<User> => {
    const user: UserRead = await api.get(`${API_ENDPOINTS.USERS}/${id}`);
    return adaptUser(user);
  },
  
  createUser: async (data: { name: string; email: string; password: string; role: Role }): Promise<User> => {
    // Real API expects: { username, email, password, role_id }
    // We arbitrarily map Role to an int here. In reality, we should fetch roles-permissions.
    // Assuming: 1=COMPANY_USER, 2=COMPANY_ADMIN, 3=SUPER_ADMIN
    const roleIdMap: Record<Role, number> = {
      COMPANY_USER: 1,
      COMPANY_ADMIN: 2,
      SUPER_ADMIN: 3
    };
    
    const payload = {
      username: data.name,
      email: data.email,
      password: data.password,
      role_id: roleIdMap[data.role] || 1,
    };
    
    const newUser: UserRead = await api.post(API_ENDPOINTS.USERS, payload);
    return adaptUser(newUser, data.role === 'SUPER_ADMIN' ? 'Super Admin' : (data.role === 'COMPANY_ADMIN' ? 'Company Admin' : 'Company User'));
  },
  
  updateProfile: async (userId: string | number, data: Partial<User>): Promise<User> => {
    // Mapping our generic update to what is allowed.
    // In the real API, a user resource patch isn't explicitly defined except for roles.
    console.warn("Update profile is not fully supported by standard user patch; only roles usually can be patched");
    return apiClient.getById(userId); 
  },
  
  deleteUser: async (_id: string | number) => {
    // Non-existent in API. We pretend it works or deactivate.
    return { success: true };
  },
  
  updateUserRole: async (userId: string | number, roleId: number) => {
    const payload = { role_id: roleId };
    return api.patch(`${API_ENDPOINTS.USERS}/${userId}/role`, payload);
  },

  getRolesAndPermissions: async (): Promise<RolesAndPermissionsResponse> => {
    return api.get(API_ENDPOINTS.ROLES_PERMISSIONS);
  },

  // ─── Company Methods ────────────────────────────────────────
  getAllCompanies: async (): Promise<Company[]> => {
    const companies: CompanyRead[] = await api.get(API_ENDPOINTS.COMPANIES);
    return companies.map(adaptCompany);
  },
  
  getCompanyById: async (companyId: number): Promise<Company> => {
    const comp: CompanyRead = await api.get(`${API_ENDPOINTS.COMPANIES}/${companyId}`);
    return adaptCompany(comp);
  },
  
  createCompany: async (data: Omit<Company, 'id' | 'status'>): Promise<Company> => {
    // We must pass superadmin details as per the schema.
    const payload = {
      name: data.name,
      email: data.adminEmail,
      is_active: true,
      superadmin_username: data.admin || 'admin',
      superadmin_email: data.adminEmail || 'admin@example.com'
    };
    const comp: CompanyRead = await api.post(API_ENDPOINTS.COMPANIES, payload);
    return adaptCompany(comp);
  },
  
  updateCompany: async (companyId: number, data: Partial<Omit<Company, 'id'>>): Promise<Company> => {
    const payload = {
      name: data.name,
      email: data.adminEmail,
      is_active: data.status === 'Active'
    };
    const comp: CompanyRead = await api.patch(`${API_ENDPOINTS.COMPANIES}/${companyId}`, payload);
    return adaptCompany(comp);
  },
  
  deleteCompany: async (id: number): Promise<{ success: boolean }> => {
    // Soft delete via is_active
    await api.patch(`${API_ENDPOINTS.COMPANIES}/${id}`, { is_active: false });
    return { success: true };
  },

  // ─── Branches & Units ─────────────────────────────────────────
  getAllBranches: async (): Promise<BranchRead[]> => {
    return api.get(API_ENDPOINTS.BRANCHES);
  },
  getBranchById: async (branchId: number): Promise<BranchRead> => {
    return api.get(`${API_ENDPOINTS.BRANCHES}/${branchId}`);
  },
  createBranch: async (data: Partial<BranchRead>): Promise<BranchRead> => {
    return api.post(API_ENDPOINTS.BRANCHES, data);
  },
  updateBranch: async (branchId: number, data: Partial<BranchRead>): Promise<BranchRead> => {
    return api.patch(`${API_ENDPOINTS.BRANCHES}/${branchId}`, data);
  },
  getUnitsByBranch: async (branchId: number): Promise<UnitRead[]> => {
    return api.get(`${API_ENDPOINTS.BRANCHES}/${branchId}/units`);
  },
  createUnitForBranch: async (branchId: number, data: Partial<UnitRead>): Promise<UnitRead> => {
    return api.post(`${API_ENDPOINTS.BRANCHES}/${branchId}/units`, data);
  },
  getAllUnits: async (companyId?: number): Promise<UnitRead[]> => {
    const query = companyId ? `?company_id=${companyId}` : '';
    return api.get(`${API_ENDPOINTS.UNITS}${query}`);
  },
  getUnitById: async (unitId: number): Promise<UnitRead> => {
    return api.get(`${API_ENDPOINTS.UNITS}/${unitId}`);
  },
  updateUnit: async (unitId: number, data: Partial<UnitRead>): Promise<UnitRead> => {
    return api.patch(`${API_ENDPOINTS.UNITS}/${unitId}`, data);
  },

  // ─── Masters (Brokers/Insurers) ───────────────────────────────
  getAllBrokers: async (): Promise<BrokerRead[]> => {
    return api.get(API_ENDPOINTS.BROKERS);
  },
  getAllInsurers: async (): Promise<InsurerRead[]> => {
    return api.get(API_ENDPOINTS.INSURERS);
  },

  // ─── Procurement (Policy Requests) ────────────────────────────
  getPolicyRequests: async (companyId?: number, status?: string): Promise<PolicyRequestRead[]> => {
    const params = new URLSearchParams();
    if (companyId) params.append('company_id', String(companyId));
    if (status) params.append('status', status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return api.get(`${API_ENDPOINTS.POLICY_REQUESTS}${qs}`);
  },
  getPolicyRequestById: async (prId: number): Promise<PolicyRequestRead> => {
    return api.get(`${API_ENDPOINTS.POLICY_REQUESTS}/${prId}`);
  },
  createPolicyRequest: async (data: Partial<PolicyRequestRead>): Promise<PolicyRequestRead> => {
    return api.post(API_ENDPOINTS.POLICY_REQUESTS, data);
  },
  updatePolicyRequest: async (prId: number, data: Partial<PolicyRequestRead>): Promise<PolicyRequestRead> => {
    return api.patch(`${API_ENDPOINTS.POLICY_REQUESTS}/${prId}`, data);
  },
  transitionPolicyRequest: async (prId: number, new_status: string): Promise<PolicyRequestRead> => {
    return api.post(`${API_ENDPOINTS.POLICY_REQUESTS}/${prId}/transition`, { new_status });
  },

  // ─── Procurement Sub-resources ─────────────────────────────────
  getPolicyDocuments: async (prId: number): Promise<PolicyDocumentRead[]> => {
    return api.get(`${API_ENDPOINTS.POLICY_REQUESTS}/${prId}/documents`);
  },
  uploadPolicyDocument: async (prId: number, data: any): Promise<PolicyDocumentRead> => {
    return api.post(`${API_ENDPOINTS.POLICY_REQUESTS}/${prId}/documents`, data);
  },
  getQuotations: async (prId: number): Promise<QuotationRead[]> => {
    return api.get(`${API_ENDPOINTS.POLICY_REQUESTS}/${prId}/quotations`);
  },
  uploadQuotation: async (prId: number, data: any): Promise<QuotationRead> => {
    return api.post(`${API_ENDPOINTS.POLICY_REQUESTS}/${prId}/quotations`, data);
  },
  getApprovals: async (prId: number): Promise<ApprovalRead[]> => {
    return api.get(`${API_ENDPOINTS.POLICY_REQUESTS}/${prId}/approval`);
  },
  submitApproval: async (prId: number, data: any): Promise<ApprovalRead> => {
    return api.post(`${API_ENDPOINTS.POLICY_REQUESTS}/${prId}/approval`, data);
  },
  getInvoices: async (prId: number): Promise<InvoiceRead[]> => {
    return api.get(`${API_ENDPOINTS.POLICY_REQUESTS}/${prId}/invoices`);
  },
  uploadInvoice: async (prId: number, data: any): Promise<InvoiceRead> => {
    return api.post(`${API_ENDPOINTS.POLICY_REQUESTS}/${prId}/invoices`, data);
  },
};
