import { Company, Role, User } from "@/types";
import { 
  UserRead, CompanyRead, RolesAndPermissionsResponse, 
  BranchRead, BranchCreate, BranchUpdate,
  UnitRead, UnitCreate, UnitUpdate,
  BrokerRead, InsurerRead, 
  PolicyRequestRead, PolicyRequestCreate, PolicyRequestUpdate,
  PolicyDocumentRead, QuotationRead, QuotationTermsCreate,
  ApprovalRead, InvoiceRead, DeviationRead, PaymentCreate
} from "@/types/api";
import { adaptUser, adaptCompany, adaptPolicy } from "@/lib/adapters";
import { API_ENDPOINTS } from "./apiClient";

const API_BASE_URL = "/api/v1";

/**
 * api-server is specifically designed to be called from Next.js Server Components.
 * It strictly uses `next/headers` to securely authenticate instead of `localStorage`.
 * IMPORTANT: Calling this module from a Client Component (`"use client"`) will cause
 * a Webpack compilation error because strictly server packages cannot bundle for the browser.
 */
const getHeaders = async () => {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
};

const apiServerFetcher = {
  get: async (endpoint: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          ...(await getHeaders()),
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`GET ${endpoint} failed: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('API Server Error:', error);
      throw error;
    }
  },

  post: async <T = unknown>(endpoint: string, data: T) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail ? JSON.stringify(err.detail) : `POST ${endpoint} failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Server Error:', error);
      throw error;
    }
  },
};

export const apiServer = {
  getCurrentUser: async (): Promise<User> => {
    const apiUser: UserRead = await apiServerFetcher.get(API_ENDPOINTS.ME);
    return adaptUser(apiUser);
  },
  
  getAllCompanies: async (): Promise<Company[]> => {
    const companies: CompanyRead[] = await apiServerFetcher.get(API_ENDPOINTS.COMPANIES);
    return companies.map(adaptCompany);
  },
  
  // NOTE: Add other server-specific fetchers here as needed by your Layouts
};
