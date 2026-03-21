import { 
  Building2, 
  ShieldCheck, 
  ClipboardList, 
  RotateCcw, 
  MapPin, 
  Home, 
  Table, 
  PieChart, 
  Users, 
  Lock 
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { isBypassActive } from "@/types/permissions";

/**
 * Metadata defining the sidebar navigation structure, including hierarchy, 
 * labels, icons, and role-based access control.
 */
type IconType = LucideIcon;

type SubItem = {
  title: string;
  url: string;
  allowedRoles?: string[];
};

export type NavItem =
  | {
      title: string;
      icon: IconType;
      url: string;
      items?: never;
      allowedRoles?: string[];
    }
  | {
      title: string;
      icon: IconType;
      items: SubItem[];
      url?: never;
      allowedRoles?: string[];
    };

type NavSection = {
  label: string;
  items: NavItem[];
  allowedRoles?: string[];
};

/**
 * Returns role-filtered navigation data based on the user's authentication status and role.
 * 
 * Logic:
 * 1. Items/sections without `allowedRoles` are visible to all authenticated users.
 * 2. If `allowedRoles` is present, the user's role must be included in that list.
 * 3. Sections are only returned if they contain at least one accessible item.
 * 
 * @param isAuthenticated - Whether the current user is signed in.
 * @param role - The current user's role string (e.g., "SUPER_ADMIN").
 * @returns An array of filtered navigation sections.
 */
export function getNavData(isAuthenticated: boolean, role?: string): NavSection[] {
  const canAccess = (allowedRoles?: string[]) =>
    isBypassActive() || // Unified Dev Bypass: Show all navigation links during testing
    !allowedRoles || 
    (!!role && allowedRoles.includes(role));

  const filterSubItems = (items: SubItem[]) =>
    items.filter((item) => canAccess(item.allowedRoles));

  const filterItems = (items: NavItem[]) =>
    items
      .filter((item) => canAccess(item.allowedRoles))
      .map((item) => {
        if (item.items) {
          const filteredSub = filterSubItems(item.items);
          return { ...item, items: filteredSub };
        }
        return item;
      })
      .filter((item) => !item.items || item.items.length > 0);

  const sections: NavSection[] = [
    {
      label: "MAIN MENU",
      items: [
        {
          title: "Dashboard",
          icon: Home,
          items: [
            {
              title: "Admin Dashboard",
              url: "/dashboard/admin",
              allowedRoles: ["SUPER_ADMIN"],
            },
            {
              title: "Company Dashboard",
              url: "/dashboard/manager",
              allowedRoles: ["COMPANY_ADMIN"],
            },
            {
              title: "User Dashboard",
              url: "/dashboard/user",
              allowedRoles: ["COMPANY_USER"],
            },
          ],
        },
        {
          title: "Company Profile",
          icon: Building2,
          url: "/company-profile",
          allowedRoles: ["COMPANY_ADMIN", "BRANCH_ADMIN", "COMPANY_USER"],
        },
        {
          title: "Branches",
          icon: MapPin,
          url: "/branches",
          allowedRoles: ["COMPANY_ADMIN", "BRANCH_ADMIN", "COMPANY_USER"],
        },
        {
          title: "Policies",
          icon: ShieldCheck,
          url: "/policies",
          allowedRoles: ["COMPANY_ADMIN", "BRANCH_ADMIN", "COMPANY_USER"],
        },
        {
          title: "Claims",
          icon: ClipboardList,
          url: "/claims",
          allowedRoles: ["COMPANY_ADMIN", "BRANCH_ADMIN", "COMPANY_USER"],
        },
        {
          title: "Renewals",
          icon: RotateCcw,
          url: "/renewals",
          allowedRoles: ["COMPANY_ADMIN", "BRANCH_ADMIN", "COMPANY_USER"],
        },
      ],
    },
    // COMPLIANCE & REPORTS — only company roles
    {
      label: "COMPLIANCE & REPORTS",
      allowedRoles: ["COMPANY_ADMIN", "BRANCH_ADMIN", "COMPANY_USER"],
      items: [
        {
          title: "Compliance",
          icon: Table,
          items: [
            { title: "Compliance Dashboard", url: "/compliance" },
            { title: "Missing Documents", url: "/compliance/missing-documents" },
            { title: "SLA Breaches", url: "/compliance/sla-breaches" },
            { title: "Review Status", url: "/compliance/review-status" },
            { title: "Audit Trail", url: "/compliance/audit-trail" },
          ],
        },
        {
          title: "Reports",
          icon: PieChart,
          items: [
            { title: "Policy Reports", url: "/reports/policies" },
            { title: "Claims Reports", url: "/reports/claims" },
            { title: "Renewal Reports", url: "/reports/renewals" },
            { title: "Premium Analysis", url: "/reports/premium" },
            { title: "GST Summary", url: "/reports/gst" },
            { title: "Broker Performance", url: "/reports/broker-performance" },
            { title: "Custom Reports", url: "/reports/custom" },
          ],
        },
        {
          title: "Analytics",
          icon: Table,
          url: "/analytics",
        },
      ],
    },
    {
      label: "User Management",
      items: [
        {
          title: "Users",
          icon: Users,
          url: "/users",
          allowedRoles: ["SUPER_ADMIN", "COMPANY_ADMIN", "BRANCH_ADMIN"],
        },
        {
          title: "Companies",
          icon: Building2,
          url: "/company",
          allowedRoles: ["SUPER_ADMIN"],
        },
        {
          title: "Authentication",
          icon: Lock,
          items: isAuthenticated
            ? [{ title: "Logout", url: "/auth/logout" }]
            : [
                { title: "Sign In", url: "/auth/login" },
                { title: "Sign Up", url: "/auth/signup" },
              ],
        },
      ],
    },
  ];

  return sections
    .filter((section) => canAccess(section.allowedRoles))
    .map((section) => ({ ...section, items: filterItems(section.items) }))
    .filter((section) => section.items.length > 0);
}
