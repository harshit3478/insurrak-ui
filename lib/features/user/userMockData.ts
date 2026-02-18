import type { User } from "@/types";

export const MOCK_USERS: User[] = [
  {
    id: "u1",
    name: "Super Admin",
    email: "super@system.com",
    role: "SUPER_ADMIN",
    active: true,
    companyId: null,
  },
  {
    id: "u2",
    name: "Company Admin",
    email: "admin@acme.com",
    role: "COMPANY_ADMIN",
    active: true,
    companyId: "c1",
  },
  {
    id: "u3",
    name: "Staff One",
    email: "staff1@acme.com",
    role: "COMPANY_USER",
    active: true,
    companyId: "c1",
  },
  {
    id: "u4",
    name: "Staff Two (Inactive)",
    email: "staff2@acme.com",
    role: "COMPANY_USER",
    active: false,
    companyId: "c1",
  },
  {
    id: "u5",
    name: "Another Company Admin",
    email: "admin@beta.com",
    role: "COMPANY_ADMIN",
    active: true,
    companyId: "c2",
  },
];
