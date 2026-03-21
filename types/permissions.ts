/**
 * permissions.ts establishes the Role-Based Access Control (RBAC) 
 * matrix for the platform. It maps system permissions to user roles 
 * and provides utility methods for authoritative access checks.
 */
import { Role, User } from "@/types";

export enum Permission {
  VIEW_DASHBOARD = "VIEW_DASHBOARD",
  MANAGE_COMPANIES = "MANAGE_COMPANIES",
  CREATE_COMPANY = "CREATE_COMPANY",
  EDIT_COMPANY = "EDIT_COMPANY",
  DELETE_COMPANY = "DELETE_COMPANY",
  MANAGE_USERS = "MANAGE_USERS",
  CREATE_USER = "CREATE_USER",
  EDIT_USER = "EDIT_USER",
  DELETE_USER = "DELETE_USER",
  TOGGLE_USER_STATUS = "TOGGLE_USER_STATUS",
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_COMPANIES,
    Permission.CREATE_COMPANY,
    Permission.EDIT_COMPANY,
    Permission.DELETE_COMPANY,
    Permission.MANAGE_USERS,
    Permission.CREATE_USER,
    Permission.EDIT_USER,
    Permission.DELETE_USER,
    Permission.TOGGLE_USER_STATUS,
  ],

  COMPANY_ADMIN: [
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_USERS,
    Permission.CREATE_USER,
    Permission.EDIT_USER,
    Permission.DELETE_USER,
    Permission.TOGGLE_USER_STATUS,
  ],

  BRANCH_ADMIN: [
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_USERS,
    Permission.CREATE_USER,
    Permission.EDIT_USER,
    Permission.TOGGLE_USER_STATUS,
  ],

  COMPANY_USER: [Permission.VIEW_DASHBOARD],
};

/**
 * isBypassActive determines if standard role-based access control (RBAC) should be 
 * suspended. This is primarily used in development to allow testers to navigate 
 * the entire UI without needing specific account roles.
 * 
 * Enabled by default in 'development' NODE_ENV or by setting 
 * NEXT_PUBLIC_BYPASS_PERMISSIONS=true in .env.local.
 */
export const isBypassActive = (): boolean => {
  // Respect explicit deactivation even in development environment
  if (process.env.NEXT_PUBLIC_BYPASS_PERMISSIONS === "false") return false;

  return (
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_BYPASS_PERMISSIONS === "true"
  );
};

export function hasPermission(
  user: User | null,
  permission: Permission,
): boolean {
  // Broadly grant permissions in development or if an explicit bypass is set to facilitate rapid testing.
  if (isBypassActive()) {
    return true;
  }
  if (!user) return false;
  return ROLE_PERMISSIONS[user.role].includes(permission);
}
