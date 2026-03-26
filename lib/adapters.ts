import {
  UserRead,
  CompanyRead,
  RoleRead,
  RolesAndPermissionsResponse,
} from "@/types/api";
import { User, Company, Role } from "@/types";

/**
 * Adapters normalize raw API responses from the backend into the application's
 * internal domain types. This layer ensures that UI components interact with
 * a consistent data structure regardless of schema variations on the wire.
 */

// Mapping between human-readable role names and internal system constants.
const ROLE_MAP: Record<string, Role> = {
  "Super Admin": "SUPER_ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
  "Company Admin": "COMPANY_ADMIN",
  COMPANY_ADMIN: "COMPANY_ADMIN",
  COMPANY_SUPER_ADMIN: "COMPANY_ADMIN",
  "Branch Admin": "BRANCH_ADMIN",
  BRANCH_ADMIN: "BRANCH_ADMIN",
  COMPANY_USER: "COMPANY_USER",
};

/**
 * Adapter specifically for User responses.
 * Normally, we'd look up the `role_id` dynamically. As a fallback,
 * if we don't have the context of the explicit role name, we guess or default.
 * In a real app we'd fetch the Role list and cache it to lookup role_id -> role string.
 */
export function adaptUser(apiUser: UserRead, userRoleName?: string): User {
  // Map based on explicit name if provided, otherwise fallback to role_id mapping
  let mappedRole: Role = "COMPANY_USER";

  if (userRoleName && ROLE_MAP[userRoleName]) {
    mappedRole = ROLE_MAP[userRoleName];
  } else {
    // Fallback to role_id mapping
    const idToRoleMap: Record<number, Role> = {
      1: "SUPER_ADMIN",
      2: "COMPANY_ADMIN",
      3: "COMPANY_USER",
      4: "BRANCH_ADMIN",
    };
    mappedRole = idToRoleMap[apiUser.role_id] || "COMPANY_USER";
  }

  return {
    id: String(apiUser.id),
    name: apiUser.username,
    email: apiUser.email,
    mobile: apiUser.mobile_number,
    role: mappedRole,
    roleId: apiUser.role_id,
    permissionIds: apiUser.permission_ids || [],
    active: apiUser.is_active,
    companyId: apiUser.company_id ? String(apiUser.company_id) : null,
    companyName: apiUser.company_name || null,
    designation: apiUser.designation,
    reportsTo: apiUser.reports_to ? String(apiUser.reports_to) : null,
  };
}

export function adaptCompany(apiCompany: CompanyRead): Company {
  return {
    id: apiCompany.id,
    name: apiCompany.name,
    companyId: String(apiCompany.id),
    admin: "", // placeholder for aggregated admin name
    adminEmail: apiCompany.email ?? "",
    branches: String(apiCompany.unit_count ?? 0),
    activePolicies: "0", // placeholder for aggregated policy count
    is_active: apiCompany.is_active,
    status: apiCompany.is_active ? "Active" : "Inactive",
    email: apiCompany.email ?? "",
    mobile_number: apiCompany.mobile_number ?? "",
    address: apiCompany.address ?? "",
    gst_number: apiCompany.gst_number ?? "",
  };
}

export function adaptPolicy(
  apiPolicy: import("@/types/api").PolicyRequestRead,
): import("@/types").Policy {
  return {
    id: String(apiPolicy.id),
    policyNumber: apiPolicy.policy_number || "TBD",
    companyId: String(apiPolicy.company_id),
    companyName: `Company ID: ${apiPolicy.company_id}`,
    insurer: "Pending Assignment", // fallback for unassigned procurement requests
    type:
      (apiPolicy.line_of_business as import("@/types").PolicyType) ||
      "Miscellaneous",
    sumInsured: 0,
    premium: 0,
    startDate: apiPolicy.created_at || new Date().toISOString(),
    endDate: apiPolicy.created_at || new Date().toISOString(),
    status:
      (apiPolicy.status as import("@/types").PolicyStatus) || "Pending Renewal",
    broker: String(apiPolicy.broker_id),
    documents: [],
  };
}
