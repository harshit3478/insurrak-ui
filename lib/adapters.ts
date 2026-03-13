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
export function adaptUser(apiUser: UserRead, userRoleName: string = 'Company User'): User {
  const mappedRole = ROLE_MAP[userRoleName] || 'COMPANY_USER';

  return {
    id: String(apiUser.id),
    name: apiUser.username,
    email: apiUser.email,
    role: mappedRole as Role,
    active: apiUser.is_active,
    companyId: String(apiUser.company_id),
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
  };
}
