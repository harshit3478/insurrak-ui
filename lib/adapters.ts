import { UserRead, CompanyRead, RoleRead, RolesAndPermissionsResponse } from '@/types/api';
import { User, Company, Role } from '@/types';

// A mapping of our hardcoded UI roles vs what the backend provides.
// If the backend returns dynamic role names, we might map them to standard types,
// or fallback to "COMPANY_USER".
const ROLE_MAP: Record<string, Role> = {
  'Super Admin': 'SUPER_ADMIN',
  'Company Admin': 'COMPANY_ADMIN',
  // Assuming all other names map back to COMPANY_USER
};

/**
 * Adapter specifically for User responses.
 * Normally, we'd look up the `role_id` dynamically. As a fallback,
 * if we don't have the context of the explicit role name, we guess or default.
 * In a real app we'd fetch the Role list and cache it to lookup role_id -> role string.
 */
export function adaptUser(apiUser: UserRead, userRoleName?: string): User {
  // Map based on explicit name if provided, otherwise fallback to role_id mapping
  let mappedRole: Role = 'COMPANY_USER';
  
  if (userRoleName && ROLE_MAP[userRoleName]) {
    mappedRole = ROLE_MAP[userRoleName];
  } else {
    // Fallback to role_id mapping
    const idToRoleMap: Record<number, Role> = {
      1: 'COMPANY_USER',
      2: 'COMPANY_ADMIN',
      3: 'SUPER_ADMIN'
    };
    mappedRole = idToRoleMap[apiUser.role_id] || 'COMPANY_USER';
  }

  return {
    id: String(apiUser.id),
    name: apiUser.username,
    email: apiUser.email,
    role: mappedRole,
    active: apiUser.is_active,
    companyId: apiUser.company_id ? String(apiUser.company_id) : null,
    designation: apiUser.designation,
    reportsTo: apiUser.reports_to ? String(apiUser.reports_to) : null,
  };
}

export function adaptCompany(apiCompany: CompanyRead): Company {
  return {
    id: apiCompany.id,
    name: apiCompany.name,
    companyId: String(apiCompany.id),
    admin: '',                      // Not provided by this API directly
    adminEmail: apiCompany.email ?? '',
    branches: '0',                  // Would be fetched via branch endpoints manually later
    activePolicies: '0',            // Would be fetched via policy endpoints manually later
    status: apiCompany.is_active ? 'Active' : 'Inactive',
    email: apiCompany.email ?? '',
    mobile_number: apiCompany.mobile_number ?? '',
    address: apiCompany.address ?? '',
    gst_number: apiCompany.gst_number ?? '',
  };
}

export function adaptPolicy(apiPolicy: import('@/types/api').PolicyRequestRead): import('@/types').Policy {
  return {
    id: String(apiPolicy.id),
    policyNumber: apiPolicy.policy_number || 'TBD',
    companyId: String(apiPolicy.company_id),
    companyName: `Company ID: ${apiPolicy.company_id}`,
    insurer: 'Pending Assignment', // Not natively joined in backend fetch
    type: (apiPolicy.line_of_business as import('@/types').PolicyType) || 'Miscellaneous',
    sumInsured: 0,
    premium: 0,
    startDate: apiPolicy.created_at || new Date().toISOString(),
    endDate: apiPolicy.created_at || new Date().toISOString(),
    status: (apiPolicy.status as import('@/types').PolicyStatus) || 'Pending Renewal',
    broker: String(apiPolicy.broker_id),
    documents: [],
  };
}
