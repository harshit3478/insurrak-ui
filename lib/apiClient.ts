import { Company, Role, User } from "@/types";
import {
  Token,
  UserRead,
  CompanyRead,
  RolesAndPermissionsResponse,
  RoleRead,
  RoleCreateIn,
  RoleUpdateIn,
  BranchRead,
  BranchCreate,
  BranchUpdate,
  UnitRead,
  UnitCreate,
  UnitUpdate,
  BrokerRead,
  InsurerRead,
  PolicyRequestRead,
  PolicyRequestCreate,
  PolicyRequestUpdate,
  PolicyDocumentRead,
  QuotationRead,
  QuotationTermsCreate,
  ApprovalRead,
  InvoiceRead,
  DeviationRead,
  PaymentCreate,
} from "@/types/api";
import { adaptUser, adaptCompany, adaptPolicy } from "@/lib/adapters";

/**
 * apiClient is the core engine for all backend interactions.
 * it provides a type-safe wrapper around the FastAPI endpoints, handling
 * authentication headers, error orchestration, and data transformation
 * between the wire and the application's domain models.
 */
const API_BASE_URL = "/api/v1";

export const API_ENDPOINTS = {
  LOGIN: "/auth/login",
  SYSTEM_LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  UPDATE_PASSWORD: "/auth/update-password",
  ME: "/users/me",
  ROLES_PERMISSIONS: "/users/roles-permissions",
  COMPANIES: "/companies",
  USERS: "/users",
  USER_STATUS: "/users",
  BRANCHES: "/branches",
  UNITS: "/units",
  BROKERS: "/brokers",
  INSURERS: "/insurers",
  POLICY_REQUESTS: "/policy-requests",
  COMPANY_SUPERADMIN: "/users/company-super-admin",
  CLAIMS: "/claims",
};

const getHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const api = {
  get: async (endpoint: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers: {
          ...getHeaders(),
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        cache: "no-store",
      });
      if (!response.ok)
        throw new Error(`GET ${endpoint} failed: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  post: async <T = unknown>(endpoint: string, data: T) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          err.detail
            ? JSON.stringify(err.detail)
            : `POST ${endpoint} failed: ${response.statusText}`,
        );
      }
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  patch: async <T = unknown>(endpoint: string, data: T) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          err.detail
            ? JSON.stringify(err.detail)
            : `PATCH ${endpoint} failed: ${response.statusText}`,
        );
      }
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  delete: async (endpoint: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!response.ok)
        throw new Error(`DELETE ${endpoint} failed: ${response.statusText}`);
      // Handle 204 No Content
      return response.status === 204
        ? { success: true }
        : await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
};

export const apiClient = {
  // ─── Auth Methods ──────────────────────────────────────────
  login: async (credentials: {
    username: string;
    password: string;
  }): Promise<Token> => {
    // The FastAPI backend strictly expects a JSON dictionary, not URL-encoded Form Data.
    return api.post(API_ENDPOINTS.LOGIN, {
      username: credentials.username,
      password: credentials.password,
      keep_login: true,
      system_login: false,
    });
  },

  systemLogin: async (credentials: {
    username: string;
    password: string;
  }): Promise<Token> => {
    return api.post(API_ENDPOINTS.SYSTEM_LOGIN, {
      username: credentials.username,
      password: credentials.password,
      keep_login: true,
      system_login: true,
    });
  },

  signup: async (_data: { name: string; email: string; password: string }) => {
    // Note: Public registration is currently restricted at the API level.
    console.warn(
      "Direct signup is restricted. Users must be onboarded via administrative tools.",
    );
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
    return users.map((u) => adaptUser(u));
  },

  getById: async (id: string | number): Promise<User> => {
    const user: UserRead = await api.get(`${API_ENDPOINTS.USERS}/${id}`);
    return adaptUser(user);
  },

  createUser: async (data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    role_id?: number;
    mobile_number?: string | null;
    designation?: string | null;
    reports_to?: number | null;
    permission_ids?: number[];
  }): Promise<User> => {
    // Real API expects: { username, email, password, role_id, designation, reports_to }
    const roleIdMap: Record<Role, number> = {
      SUPER_ADMIN: 1,
      COMPANY_ADMIN: 2,
      COMPANY_USER: 3,
      BRANCH_ADMIN: 4,
    };

    const payload = {
      username: data.name,
      email: data.email,
      password: data.password,
      role_id: data.role_id ?? roleIdMap[data.role] ?? 3,
      mobile_number: data.mobile_number || null,
      designation: data.designation || null,
      reports_to: data.reports_to || null,
      permission_ids: data.permission_ids || null,
    };

    const newUser: UserRead = await api.post(API_ENDPOINTS.USERS, payload);
    return adaptUser(
      newUser,
      data.role === "SUPER_ADMIN"
        ? "Super Admin"
        : data.role === "COMPANY_ADMIN"
          ? "Company Admin"
          : "Company User",
    );
  },

  updateProfile: async (
    userId: string | number,
    data: Partial<User>,
  ): Promise<User> => {
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.username = data.name;
    if (data.email !== undefined) payload.email = data.email;
    if (data.mobile !== undefined) payload.mobile_number = data.mobile;
    if (data.designation !== undefined) payload.designation = data.designation;
    if (data.reportsTo !== undefined)
      payload.reports_to = data.reportsTo ? Number(data.reportsTo) : null;
    if (data.roleId !== undefined) payload.role_id = data.roleId;
    if (data.permissionIds !== undefined)
      payload.permission_ids = data.permissionIds;

    const updated: UserRead = await api.patch(
      `${API_ENDPOINTS.USERS}/${userId}`,
      payload,
    );
    return adaptUser(updated);
  },

  deleteUser: async (_id: string | number) => {
    await api.delete(`${API_ENDPOINTS.USERS}/${_id}`);
    return { success: true };
  },

  updateUserRole: async (userId: string | number, roleId: number) => {
    const payload = { role_id: roleId };
    return api.patch(`${API_ENDPOINTS.USERS}/${userId}/role`, payload);
  },

  updateUserStatus: async (
    userId: string | number,
    payload: { is_active: boolean; reassign_reports_to?: number | null },
  ): Promise<User> => {
    const updated: UserRead = await api.patch(
      `${API_ENDPOINTS.USER_STATUS}/${userId}/status`,
      payload,
    );
    return adaptUser(updated);
  },

  getRolesAndPermissions: async (): Promise<RolesAndPermissionsResponse> => {
    return api.get(API_ENDPOINTS.ROLES_PERMISSIONS);
  },

  createRole: async (payload: RoleCreateIn): Promise<RoleRead> => {
    return api.post(`${API_ENDPOINTS.USERS}/roles`, payload);
  },

  updateRole: async (
    roleId: number,
    payload: RoleUpdateIn,
  ): Promise<RoleRead> => {
    return api.patch(`${API_ENDPOINTS.USERS}/roles/${roleId}`, payload);
  },

  // ─── Company Methods ────────────────────────────────────────
  getAllCompanies: async (): Promise<Company[]> => {
    const companies: CompanyRead[] = await api.get(API_ENDPOINTS.COMPANIES);
    return companies.map(adaptCompany);
  },

  getCompanyById: async (companyId: number): Promise<Company> => {
    const comp: CompanyRead = await api.get(
      `${API_ENDPOINTS.COMPANIES}/${companyId}`,
    );
    return adaptCompany(comp);
  },

  onboardCompanySuperAdmin: async (
    data: import("@/types/api").CompanySuperAdminOnboard,
  ): Promise<UserRead> => {
    return api.post(API_ENDPOINTS.COMPANY_SUPERADMIN, data);
  },

  createCompany: async (
    data: Omit<Company, "id" | "status"> & {
      adminPassword: string;
      adminDesignation?: string;
    },
  ): Promise<Company> => {
    // We must pass superadmin details as per the schema.
    const payload = {
      name: data.name,
      email: data.email || data.adminEmail || null,
      mobile_number: data.mobile_number || null,
      address: data.address || null,
      gst_number: data.gst_number || null,
      is_active: true,
      superadmin_username: data.admin || "admin",
      superadmin_email: data.adminEmail || "admin@example.com",
      superadmin_password: data.adminPassword,
      superadmin_designation: data.adminDesignation || null,
    };
    const comp: CompanyRead = await api.post(API_ENDPOINTS.COMPANIES, payload);
    return adaptCompany(comp);
  },

  updateCompany: async (
    companyId: number,
    data: Partial<Omit<Company, "id">>,
  ): Promise<Company> => {
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.email !== undefined || data.adminEmail !== undefined)
      payload.email = data.email || data.adminEmail || null;
    if (data.status !== undefined) payload.is_active = data.status === "Active";
    if (data.mobile_number !== undefined)
      payload.mobile_number = data.mobile_number || null;
    if (data.address !== undefined) payload.address = data.address || null;
    if (data.gst_number !== undefined)
      payload.gst_number = data.gst_number || null;
    const comp: CompanyRead = await api.patch(
      `${API_ENDPOINTS.COMPANIES}/${companyId}`,
      payload,
    );
    return adaptCompany(comp);
  },

  deleteCompany: async (id: number): Promise<{ success: boolean }> => {
    // Soft delete via is_active
    await api.patch(`${API_ENDPOINTS.COMPANIES}/${id}`, { is_active: false });
    return { success: true };
  },

  // ─── Branches & Units ─────────────────────────────────────────────
  getAllBranches: async (companyId?: number): Promise<BranchRead[]> => {
    // NOTE: The backend /branches endpoint doesn't accept company_id as a query param.
    // It returns branches for the authenticated user's company. companyId param is kept
    // for compatibility but not sent to avoid unexpected behavior.
    return api.get(API_ENDPOINTS.BRANCHES);
  },
  getBranchById: async (branchId: number): Promise<BranchRead> => {
    return api.get(`${API_ENDPOINTS.BRANCHES}/${branchId}`);
  },
  createBranch: async (data: BranchCreate): Promise<BranchRead> => {
    return api.post(API_ENDPOINTS.BRANCHES, data);
  },
  updateBranch: async (
    branchId: number,
    data: BranchUpdate,
  ): Promise<BranchRead> => {
    return api.patch(`${API_ENDPOINTS.BRANCHES}/${branchId}`, data);
  },
  getUnitsByBranch: async (branchId: number): Promise<UnitRead[]> => {
    return api.get(`${API_ENDPOINTS.BRANCHES}/${branchId}/units`);
  },
  createUnitForBranch: async (
    branchId: number,
    data: Omit<UnitCreate, "branch_id">,
  ): Promise<UnitRead> => {
    return api.post(`${API_ENDPOINTS.BRANCHES}/${branchId}/units`, data);
  },
  // Standalone unit creation (POST /api/v1/units)
  createUnit: async (data: UnitCreate): Promise<UnitRead> => {
    return api.post(API_ENDPOINTS.UNITS, data);
  },
  getAllUnits: async (companyId?: number): Promise<UnitRead[]> => {
    const query = companyId ? `?company_id=${companyId}` : "";
    return api.get(`${API_ENDPOINTS.UNITS}${query}`);
  },
  getUnitById: async (unitId: number): Promise<UnitRead> => {
    return api.get(`${API_ENDPOINTS.UNITS}/${unitId}`);
  },
  updateUnit: async (unitId: number, data: UnitUpdate): Promise<UnitRead> => {
    return api.patch(`${API_ENDPOINTS.UNITS}/${unitId}`, data);
  },

  // ─── Masters (Brokers/Insurers) ────────────────────────────────────
  getAllBrokers: async (): Promise<BrokerRead[]> => {
    return api.get(API_ENDPOINTS.BROKERS);
  },
  getBrokerById: async (brokerId: number): Promise<BrokerRead> => {
    return api.get(`${API_ENDPOINTS.BROKERS}/${brokerId}`);
  },
  createBroker: async (
    data: Omit<BrokerRead, "id" | "created_at" | "updated_at">,
  ): Promise<BrokerRead> => {
    return api.post(API_ENDPOINTS.BROKERS, data);
  },
  updateBroker: async (
    brokerId: number,
    data: Partial<Omit<BrokerRead, "id" | "created_at" | "updated_at">>,
  ): Promise<BrokerRead> => {
    return api.patch(`${API_ENDPOINTS.BROKERS}/${brokerId}`, data);
  },
  getAllInsurers: async (): Promise<InsurerRead[]> => {
    return api.get(API_ENDPOINTS.INSURERS);
  },
  getInsurerById: async (insurerId: number): Promise<InsurerRead> => {
    return api.get(`${API_ENDPOINTS.INSURERS}/${insurerId}`);
  },
  createInsurer: async (
    data: Omit<InsurerRead, "id" | "created_at" | "updated_at">,
  ): Promise<InsurerRead> => {
    return api.post(API_ENDPOINTS.INSURERS, data);
  },
  updateInsurer: async (
    insurerId: number,
    data: Partial<Omit<InsurerRead, "id" | "created_at" | "updated_at">>,
  ): Promise<InsurerRead> => {
    return api.patch(`${API_ENDPOINTS.INSURERS}/${insurerId}`, data);
  },

  // ─── Procurement Workflow (Requisitions, Quotations, Approvals) ──
  getPolicyRequests: async (
    companyId?: number,
    status?: string,
  ): Promise<PolicyRequestRead[]> => {
    const params = new URLSearchParams();
    if (companyId) params.append("company_id", companyId.toString());
    if (status) params.append("status", status);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return api.get(`${API_ENDPOINTS.POLICY_REQUESTS}${qs}`);
  },

  getAllPolicies: async (): Promise<import("@/types").Policy[]> => {
    try {
      const requests = await apiClient.getPolicyRequests();
      return requests.map(adaptPolicy);
    } catch {
      return [];
    }
  },

  getAllClaims: async (): Promise<import("@/types").Claim[]> => {
    // Stub: backend doesn't support claims yet
    return [];
  },

  getAllRenewals: async (): Promise<import("@/types").Renewal[]> => {
    // Stub: backend doesn't support renewals yet
    return [];
  },
  getPolicyRequestById: async (prId: number): Promise<PolicyRequestRead> => {
    return api.get(`${API_ENDPOINTS.POLICY_REQUESTS}/${prId}`);
  },
  createPolicyRequest: async (
    data: PolicyRequestCreate,
  ): Promise<PolicyRequestRead> => {
    return api.post(API_ENDPOINTS.POLICY_REQUESTS, data);
  },
  updatePolicyRequest: async (
    prId: number,
    data: PolicyRequestUpdate,
  ): Promise<PolicyRequestRead> => {
    return api.patch(`${API_ENDPOINTS.POLICY_REQUESTS}/${prId}`, data);
  },
  transitionPolicyRequest: async (
    prId: number,
    new_status: string,
  ): Promise<PolicyRequestRead> => {
    return api.post(`${API_ENDPOINTS.POLICY_REQUESTS}/${prId}/transition`, {
      new_status,
    });
  },

  // ─── Procurement Sub-resources ───────────────────────────────────
  getPolicyDocuments: async (prId: number): Promise<PolicyDocumentRead[]> => {
    return api.get(`${API_ENDPOINTS.POLICY_REQUESTS}/${prId}/documents`);
  },
  uploadPolicyDocument: async (
    prId: number,
    data: { document_type: string; file_name: string; file_path: string },
  ): Promise<PolicyDocumentRead> => {
    return api.post(`${API_ENDPOINTS.POLICY_REQUESTS}/${prId}/documents`, data);
  },
  getQuotations: async (prId: number): Promise<QuotationRead[]> => {
    return api.get(`${API_ENDPOINTS.POLICY_REQUESTS}/${prId}/quotations`);
  },
  uploadQuotation: async (
    prId: number,
    data: {
      insurer_id: number;
      premium: number;
      gst: number;
      total_premium: number;
      file_name?: string;
      file_path?: string;
      terms?: QuotationTermsCreate;
    },
  ): Promise<QuotationRead> => {
    return api.post(
      `${API_ENDPOINTS.POLICY_REQUESTS}/${prId}/quotations`,
      data,
    );
  },
  getQuotationDeviations: async (
    prId: number,
    quotId: number,
    priorQuotationId?: number,
  ): Promise<DeviationRead[]> => {
    const qs = priorQuotationId
      ? `?prior_quotation_id=${priorQuotationId}`
      : "";
    return api.get(
      `${API_ENDPOINTS.POLICY_REQUESTS}/${prId}/quotations/${quotId}/deviations${qs}`,
    );
  },
  getApprovals: async (prId: number): Promise<ApprovalRead[]> => {
    return api.get(`${API_ENDPOINTS.POLICY_REQUESTS}/${prId}/approval`);
  },
  submitApproval: async (
    prId: number,
    data: {
      decision: string;
      comments?: string | null;
      quotation_id?: number | null;
    },
  ): Promise<ApprovalRead> => {
    return api.post(`${API_ENDPOINTS.POLICY_REQUESTS}/${prId}/approval`, data);
  },
  getInvoices: async (prId: number): Promise<InvoiceRead[]> => {
    return api.get(`${API_ENDPOINTS.POLICY_REQUESTS}/${prId}/invoices`);
  },
  uploadInvoice: async (
    prId: number,
    data: {
      invoice_type: string;
      amount: number;
      gst: number;
      total: number;
      bank_name?: string | null;
      bank_account_number?: string | null;
      bank_ifsc?: string | null;
      file_name?: string | null;
      file_path?: string | null;
    },
  ): Promise<InvoiceRead> => {
    return api.post(`${API_ENDPOINTS.POLICY_REQUESTS}/${prId}/invoices`, data);
  },
  recordPayment: async (
    prId: number,
    invoiceId: number,
    data: PaymentCreate,
  ): Promise<import("@/types/api").PaymentRead> => {
    return api.post(
      `${API_ENDPOINTS.POLICY_REQUESTS}/${prId}/invoices/${invoiceId}/payment`,
      data,
    );
  },
  uploadSoftCopy: async (
    prId: number,
    data: { file_name: string; file_path: string },
  ): Promise<PolicyRequestRead> => {
    return api.post(
      `${API_ENDPOINTS.POLICY_REQUESTS}/${prId}/policy/soft-copy`,
      data,
    );
  },
  uploadHardCopy: async (
    prId: number,
    data: { file_name: string; file_path: string },
  ): Promise<PolicyRequestRead> => {
    return api.post(
      `${API_ENDPOINTS.POLICY_REQUESTS}/${prId}/policy/hard-copy`,
      data,
    );
  },

  // ─── Claims Methods ──────────────────────────────────────────────
  claims: {
    create: async (
      data: import("@/types/api").ClaimCreate,
    ): Promise<import("@/types/api").ClaimRead> => {
      return api.post(API_ENDPOINTS.CLAIMS, data);
    },
    getAll: async (
      status?: string,
      policyRequestId?: number,
    ): Promise<import("@/types/api").ClaimRead[]> => {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (policyRequestId)
        params.append("policy_request_id", policyRequestId.toString());
      const qs = params.toString() ? `?${params.toString()}` : "";
      return api.get(`${API_ENDPOINTS.CLAIMS}${qs}`);
    },
    getById: async (id: number): Promise<import("@/types/api").ClaimRead> => {
      return api.get(`${API_ENDPOINTS.CLAIMS}/${id}`);
    },
    update: async (
      id: number,
      data: import("@/types/api").ClaimUpdate,
    ): Promise<import("@/types/api").ClaimRead> => {
      return api.patch(`${API_ENDPOINTS.CLAIMS}/${id}`, data);
    },
    transition: async (
      id: number,
      data: import("@/types/api").ClaimStatusTransitionRequest,
    ): Promise<import("@/types/api").ClaimRead> => {
      return api.post(`${API_ENDPOINTS.CLAIMS}/${id}/transition`, data);
    },
    uploadDocument: async (
      id: number,
      data: import("@/types/api").ClaimDocumentCreate,
    ): Promise<import("@/types/api").ClaimDocumentRead> => {
      return api.post(`${API_ENDPOINTS.CLAIMS}/${id}/documents`, data);
    },
    getDocuments: async (
      id: number,
    ): Promise<import("@/types/api").ClaimDocumentRead[]> => {
      return api.get(`${API_ENDPOINTS.CLAIMS}/${id}/documents`);
    },
    recordApproval: async (
      id: number,
      data: import("@/types/api").ClaimApprovalCreate,
    ): Promise<import("@/types/api").ClaimRead> => {
      return api.post(`${API_ENDPOINTS.CLAIMS}/${id}/approval`, data);
    },
    recordSettlement: async (
      id: number,
      data: import("@/types/api").ClaimSettlementCreate,
    ): Promise<import("@/types/api").ClaimRead> => {
      return api.post(`${API_ENDPOINTS.CLAIMS}/${id}/settlement`, data);
    },
    close: async (id: number): Promise<import("@/types/api").ClaimRead> => {
      return api.post(`${API_ENDPOINTS.CLAIMS}/${id}/close`, {});
    },
  },
};
