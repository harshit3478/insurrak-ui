/**
 * index.ts defines the core domain models and shared UI constants 
 * for the application. It establishes the central vocabulary for 
 * authentication, organizational structures, and insurance-specific entities.
 */
export const BREADCRUMB_MAP: Record<string, string> = {
  "/": "Home",
  "/dashboard": "Dashboard",
  "/users": "Users",
  "/users/create": "Add User",
  "/policies": "Policies",
  "/claims": "Claims",
  "/renewals": "Renewals",
  "/repository": "Repository",
  "/profile": "Profile",
  "/company-profile": "Company Profile",
  "/settings": "Settings",
  "/auth/login": "Login",
  "/auth/signup": "Sign Up",
};


export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  companyId: string | null;
  designation?: string | null;
  reportsTo?: string | null;
};

export interface Company {
  id: number;
  name: string;
  companyId: string;
  admin: string;
  adminEmail: string;
  branches: string;
  activePolicies: string;
  status: 'Active' | 'Inactive';
  email: string;
  mobile_number: string;
  address: string;
  gst_number: string;
}


export type Role = "SUPER_ADMIN" | "COMPANY_ADMIN" | "BRANCH_ADMIN" | "COMPANY_USER";

export const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 3,
  COMPANY_ADMIN: 2,
  BRANCH_ADMIN: 2,
  COMPANY_USER: 1,
} as const;

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  rememberMe: boolean;
}

export const AUTH_STORAGE_KEY = "insurrack_auth";

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (formData: FormData) => void;
  isLoginPending: boolean;
  loginState: {
    success?: boolean;
    error?: string;
  };
  signup: (formData: FormData) => void;
  isSignupPending: boolean;
  signupState: {
    success?: boolean;
    error?: string;
  };
  logout: () => void;
  hasPermission: (requiredRole: Role) => boolean;
  isBypassActive: () => boolean;
}

export type ActionState = {
  error?: string;
  success?: boolean;
  data?: Record<string, any>;
};

/** @deprecated use ActionState */
export const initialState: ActionState = {};

export type UsersContextType = {
  createUserAction: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  updateUserAction: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

export type CompaniesContextType = {
  createCompany: (formData: FormData) => Promise<void>;
  updateCompany: (companyId: number) => (formData: FormData) => Promise<void>;

  createState: ActionState;
  updateState: ActionState;

  isCreating: boolean;
  isUpdating: boolean;
};

export type PoliciesContextType = {
  createPolicyAction: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  updatePolicyAction: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

export type BranchesContextType = {
  createBranchAction: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  updateBranchAction: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

export type ClaimsContextType = {
  createClaimAction: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  updateClaimAction: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

// ─── Insurance Domain Types ───────────────────────────────────────────────────

export type PolicyType =
  | 'Fire'
  | 'Marine'
  | 'Motor'
  | 'Health'
  | 'Liability'
  | 'Engineering'
  | 'Miscellaneous';

export type PolicyStatus = 'Active' | 'Expiring Soon' | 'Expired' | 'Pending Renewal';

export interface Policy {
  id: string;
  policyNumber: string;
  companyId: string;
  companyName: string;
  insurer: string;
  type: PolicyType;
  sumInsured: number;
  premium: number;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  status: PolicyStatus;
  broker?: string;
  documents?: string[];
}

export type ClaimStatus = 'Open' | 'Under Review' | 'Approved' | 'Rejected' | 'Settled';

export interface Claim {
  id: string;
  claimNumber: string;
  policyId: string;
  policyNumber: string;
  companyId: string;
  companyName: string;
  type: PolicyType;
  dateOfLoss: string;
  dateReported: string;
  claimAmount: number;
  settledAmount?: number;
  status: ClaimStatus;
  description: string;
  slaDeadline: string;
  assignedTo?: string;
}

export type RenewalStatus = 'Due' | 'In Progress' | 'Renewed' | 'Lapsed';

export interface Renewal {
  id: string;
  policyId: string;
  policyNumber: string;
  companyName: string;
  type: PolicyType;
  currentPremium: number;
  renewalDueDate: string;
  status: RenewalStatus;
  daysUntilExpiry: number;
}

export interface DashboardStats {
  totalPolicies: number;
  activePolicies: number;
  claimsThisMonth: number;
  renewalsDue: number;
  totalPremium: number;
  slaCompliance: number; // 0-100
}

export interface RepositoryDocument {
  id: string;
  name: string;
  fileType: 'PDF' | 'XLS' | 'XLSX' | 'JPG' | 'PNG' | 'DOCX';
  policyId: string;
  policyNumber: string;
  companyName: string;
  uploadedOn: string;
  uploadedBy: string;
  sizeKb: number;
  url?: string;
}
