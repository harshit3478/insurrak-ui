import { Role, User } from "@/types";

export enum Permission {
  VIEW_DASHBOARD = "VIEW_DASHBOARD",
  MANAGE_COMPANIES = "MANAGE_COMPANIES",
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
    Permission.TOGGLE_USER_STATUS,
  ],

  COMPANY_USER: [Permission.VIEW_DASHBOARD],
};

export function hasPermission(
  user: User | null,
  permission: Permission,
): boolean {
  if (process.env.NODE_ENV === "development") {
    return true;
  }
  if (!user) return false;
  return ROLE_PERMISSIONS[user.role].includes(permission);
}
