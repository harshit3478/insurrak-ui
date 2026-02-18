import { Building2 } from "lucide-react";
import * as Icons from "../icons";
import type { ComponentType, SVGProps } from "react";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type SubItem = {
  title: string;
  url: string;
};

export type NavItem =
  | {
      title: string;
      icon: IconType;
      url: string;
      items?: never;
    }
  | {
      title: string;
      icon: IconType;
      items: SubItem[];
      url?: never;
    };

type NavSection = {
  label: string;
  items: NavItem[];
};

export function getNavData(isAuthenticated: boolean): NavSection[] {
  return [
    {
      label: "MAIN MENU",
      items: [
        {
          title: "Dashboard",
          icon: Icons.HomeIcon,
          url: "/dashboard",
        },
        {
          title: "Policies",
          icon: Icons.FourCircle,
          url: "/policies",
        },
        {
          title: "Claims",
          icon: Icons.FourCircle,
          url: "/claims",
        },
        {
          title: "Renewals",
          icon: Icons.FourCircle,
          url: "/renewals",
        },
        {
          title: "Profile",
          icon: Icons.User,
          url: "/profile",
        },
      ],
    },
    // COMPLIANCE & REPORTS SECTION
        {
          label: "COMPLIANCE & REPORTS",
          items: [
            {
              title: "Compliance",
              icon: Icons.Table,
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
              icon: Icons.PieChart,
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
              icon: Icons.Table,
              url: "/analytics",
            },
          ],
        },
    {
      label: "User Management",
      items: [
        {
          title: "Users",
          icon: Icons.User,
          url: "/users",
        },
        {
          title: "Companies",
          icon: Building2,
          url: "/company",
        },
        {
          title: "Authentication",
          icon: Icons.Authentication,
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
}
