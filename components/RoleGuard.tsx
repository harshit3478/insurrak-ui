"use client";

import { useAuth } from "@/context-provider/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loading } from "@/components/ui/Loading";

type RoleGuardProps = {
  allowedRoles: string[];
  children: React.ReactNode;
};

/**
 * Wraps a page and redirects users who don't have the required role.
 * The redirect destination is determined by the user's actual role.
 */
export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, isAuthenticated, isBypassActive } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user) return; // still hydrating

    if (isBypassActive()) {
      // Dev Bypass: Skip role-based redirection to allow testing across roles
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      const dest =
        user.role === "SUPER_ADMIN"
          ? "/dashboard/admin"
          : (user.role === "COMPANY_ADMIN" || user.role === "BRANCH_ADMIN")
          ? "/dashboard/manager"
          : "/dashboard/user";
      router.replace(dest);
    }
  }, [user, isAuthenticated, allowedRoles, router, isBypassActive]);

  // While not authenticated or role check is pending, show nothing (redirect will fire)
  if (!isAuthenticated || !user) return <Loading />;
  
  if (isBypassActive()) {
    // Dev Bypass: Allow access to protected children regardless of current role
    return <>{children}</>;
  }

  if (!allowedRoles.includes(user.role)) return <Loading />; // redirect in progress

  return <>{children}</>;
}
