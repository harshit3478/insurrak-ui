export const BREADCRUMB_MAP: Record<string, string> = {
  "/": "Home",
  "/dashboard": "Dashboard",
  "/users": "Users",
  "/users/create": "Add User",
  "/profile": "Profile",
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
}


export type Role = "SUPER_ADMIN" | "COMPANY_ADMIN" | "COMPANY_USER";

export const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 3,
  COMPANY_ADMIN: 2,
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
}

type UsersActionState = {
  error?: string;
  success?: boolean;
};

export type UsersContextType = {
  createUser: (formData: FormData) => Promise<void>;
  updateUser: (userId: string) => (formData: FormData) => Promise<void>;

  createState: UsersActionState;
  updateState: UsersActionState;

  isCreating: boolean;
  isUpdating: boolean;
};

export type CompaniesContextType = {
  createCompany: (formData: FormData) => Promise<void>;
  updateCompany: (companyId: number) => (formData: FormData) => Promise<void>;

  createState: UsersActionState;
  updateState: UsersActionState;

  isCreating: boolean;
  isUpdating: boolean;
};
