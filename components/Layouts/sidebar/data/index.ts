import {
  Building2,
  Bell,
  ShieldCheck,
  ClipboardList,
  ClipboardCheck,
  UserRound,
  LogOut,
  GitBranch,
  Briefcase,
  Building,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
export function getNavData(
  isAuthenticated: boolean,
  role?: string,
): NavSection[] {
  const isSystemSuperAdmin = role === "SUPER_ADMIN";

  if (isSystemSuperAdmin) {
    return [
      {
        label: "SYSTEM",
        items: [
          {
            title: "Companies",
            icon: Building2,
            url: "/system",
          },
          {
            title: "Registration Requests",
            icon: ClipboardList,
            url: "/system/registration-requests",
          },
        ],
      },
      {
        label: "ACCOUNT",
        items: [
          {
            title: "Notifications",
            icon: Bell,
            url: "/notifications",
          },
          {
            title: "Logout",
            icon: LogOut,
            url: "/auth/logout",
          },
        ],
      },
    ];
  }

  const canAccess = (allowedRoles?: string[]) =>
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
      label: "COMPANY",
      items: [
        {
          title: "Dashboard",
          icon: ShieldCheck,
          url: "/company/policies",
          allowedRoles: ["COMPANY_ADMIN", "BRANCH_ADMIN", "COMPANY_USER"],
        },
        {
          title: "Policy Approvals",
          icon: ClipboardCheck,
          url: "/approvals",
          allowedRoles: ["COMPANY_ADMIN"],
        },
        {
          title: "Units / Branches",
          icon: GitBranch,
          url: "/branches",
          allowedRoles: ["COMPANY_ADMIN"],
        },
        {
          title: "Brokers",
          icon: Briefcase,
          url: "/brokers",
          allowedRoles: ["COMPANY_ADMIN"],
        },
        {
          title: "Insurers",
          icon: Building,
          url: "/insurers",
          allowedRoles: ["COMPANY_ADMIN"],
        },
        {
          title: "Claim Management",
          icon: ClipboardList,
          url: "/company/claims",
          allowedRoles: ["COMPANY_ADMIN", "BRANCH_ADMIN", "COMPANY_USER"],
        },
        {
          title: "View Profile",
          icon: UserRound,
          url: "/company/profile",
          allowedRoles: ["COMPANY_ADMIN", "BRANCH_ADMIN", "COMPANY_USER"],
        },
      ],
    },
    {
      label: "ACCOUNT",
      items: [
        {
          title: "Notifications",
          icon: Bell,
          url: "/notifications",
          allowedRoles: ["COMPANY_ADMIN"],
        },
        {
          title: "Logout",
          icon: LogOut,
          url: "/auth/logout",
        },
      ],
    },
  ];

  return sections
    .filter((section) => canAccess(section.allowedRoles))
    .map((section) => ({ ...section, items: filterItems(section.items) }))
    .filter((section) => section.items.length > 0);
}
