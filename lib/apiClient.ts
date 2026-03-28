import { Company, Role, User } from "@/types";
import {
  Token,
  UserRead,
  CompanyRead,
  RolesAndPermissionsResponse,
  RoleRead,
  RoleCreateIn,
  RoleUpdateIn,
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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export const API_ENDPOINTS = {
  REQUEST_OTP: "/auth/request-otp",
  VERIFY_OTP: "/auth/verify-otp",
  COMPANY_REQUEST: "/auth/company-request",
  DEBUG_PEEK_OTP: "/auth/debug/peek-otp",
  LOGOUT: "/auth/logout",
  ME: "/users/me",
  ROLES_PERMISSIONS: "/users/roles-permissions",
  COMPANIES: "/companies",
  USERS: "/users",
  USER_STATUS: "/users",
  UNITS: "/units",
  BROKERS: "/brokers",
  INSURERS: "/insurers",
  POLICY_REQUESTS: "/policy-requests",
  COMPANY_SUPERADMIN: "/users/company-super-admin",
  CLAIMS: "/claims",
  COMPANY_REGISTRATION_REQUESTS: "/companies/registration-requests",
};

const getHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Redirect to login ONLY on 401 (token missing/expired/invalid).
 * 403 means "authenticated but not authorised for this resource" — that is a
 * business-logic error, NOT an auth failure, so we must NOT clear the session.
 */
const handleAuthError = (response: Response) => {
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("insurrack_auth");
      window.location.href = "/auth/login";
    }
  }
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
      if (!response.ok) {
        handleAuthError(response);
        throw new Error(`GET ${endpoint} failed: ${response.statusText}`);
      }
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
        handleAuthError(response);
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
        handleAuthError(response);
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
      if (!response.ok) {
        handleAuthError(response);
        throw new Error(`DELETE ${endpoint} failed: ${response.statusText}`);
      }
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
  requestOtp: async (email: string): Promise<{ message: string }> => {
    return api.post(API_ENDPOINTS.REQUEST_OTP, { email });
  },

  verifyOtp: async (credentials: {
    email: string;
    otp: string;
    keep_login?: boolean;
  }): Promise<Token> => {
    return api.post(API_ENDPOINTS.VERIFY_OTP, {
      email: credentials.email,
      otp: credentials.otp,
      keep_login: credentials.keep_login ?? true,
    });
  },

  peekOtp: async (email: string): Promise<{ otp: string | null }> => {
    return api.post(API_ENDPOINTS.DEBUG_PEEK_OTP, { email });
  },

  submitRegistrationRequest: async (
    data: import("@/types/api").CompanyRegistrationRequestCreate,
  ): Promise<import("@/types/api").CompanyRegistrationRequestRead> => {
    return api.post(API_ENDPOINTS.COMPANY_REQUEST, data);
  },

  logout: async () => {
    return { success: true };
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
    data: {
      name: string;
      adminEmail: string;
    },
  ): Promise<Company> => {
    const username = data.adminEmail.split("@")[0] || "admin";
    const payload = {
      name: data.name,
      email: data.adminEmail,
      mobile_number: null,
      address: null,
      gst_number: null,
      is_active: true,
      superadmin_username: username,
      superadmin_email: data.adminEmail,
      superadmin_designation: null,
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
    if (data.is_active !== undefined) payload.is_active = data.is_active;
    else if (data.status !== undefined) payload.is_active = data.status === "Active";
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
    await api.delete(`${API_ENDPOINTS.COMPANIES}/${id}`);
    return { success: true };
  },

  getRegistrationRequests: async (): Promise<
    import("@/types/api").CompanyRegistrationRequestRead[]
  > => {
    return api.get(API_ENDPOINTS.COMPANY_REGISTRATION_REQUESTS);
  },

  updateRegistrationRequest: async (
    id: number,
    status: "approved" | "rejected",
  ): Promise<import("@/types/api").CompanyRegistrationRequestRead> => {
    return api.patch(`${API_ENDPOINTS.COMPANY_REGISTRATION_REQUESTS}/${id}`, { status });
  },

  // ─── System admin: company units + unit detail ────────────────────
  getCompanyUnits: async (companyId: number): Promise<UnitRead[]> => {
    return api.get(`${API_ENDPOINTS.COMPANIES}/${companyId}/units`);
  },
  getUnitPolicies: async (unitId: number): Promise<import("@/types/api").PolicyRequestRead[]> => {
    return api.get(`${API_ENDPOINTS.UNITS}/${unitId}/policies`);
  },
  getUnitClaims: async (unitId: number): Promise<import("@/types/api").ClaimRead[]> => {
    return api.get(`${API_ENDPOINTS.UNITS}/${unitId}/claims`);
  },

  // ─── Units ────────────────────────────────────────────────────────
  getAllUnits: async (): Promise<UnitRead[]> => {
    return api.get(API_ENDPOINTS.UNITS);
  },
  getUnitById: async (unitId: number): Promise<UnitRead> => {
    return api.get(`${API_ENDPOINTS.UNITS}/${unitId}`);
  },
  createUnit: async (data: UnitCreate): Promise<UnitRead> => {
    return api.post(API_ENDPOINTS.UNITS, data);
  },
  updateUnit: async (unitId: number, data: UnitUpdate): Promise<UnitRead> => {
    return api.patch(`${API_ENDPOINTS.UNITS}/${unitId}`, data);
  },
  deleteUnit: async (unitId: number): Promise<{ success: boolean }> => {
    await api.delete(`${API_ENDPOINTS.UNITS}/${unitId}`);
    return { success: true };
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
    getCommunications: async (id: number): Promise<import("@/types/api").ClaimCommunicationRead[]> => {
      return api.get(`${API_ENDPOINTS.CLAIMS}/${id}/communications`);
    },
    addCommunication: async (
      id: number,
      data: import("@/types/api").ClaimCommunicationCreate,
    ): Promise<import("@/types/api").ClaimCommunicationRead> => {
      return api.post(`${API_ENDPOINTS.CLAIMS}/${id}/communications`, data);
    },
  },

  // ─── File Upload (Cloudflare R2) ─────────────────────────────────
  getPresignedUrl: async (data: {
    file_name: string;
    content_type: string;
    folder?: string;
  }): Promise<{ upload_url: string; public_url: string }> => {
    return api.post("/files/presign", data);
  },

  extractQuotationFromPdf: async (fileUrl: string): Promise<{
    premium: number | null;
    gst: number | null;
    total_premium: number | null;
    perils_included: string | null;
    perils_excluded: string | null;
    deductibles: string | null;
    exclusions: string | null;
    warranties: string | null;
    co_insurance: string | null;
    special_conditions: string | null;
  }> => {
    return api.post("/files/extract-quotation", { file_url: fileUrl });
  },
};
