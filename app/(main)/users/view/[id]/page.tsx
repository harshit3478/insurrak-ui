"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { Loading } from "@/components/ui/Loading";
import { PermissionRead, RoleRead } from "@/types/api";
import { User } from "@/types";

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  COMPANY_SUPER_ADMIN: "Company Super Admin",
  COMPANY_ADMIN: "Company Admin",
  BRANCH_ADMIN: "Branch Admin",
  COMPANY_USER: "Company User",
  ADMIN: "Admin",
  MANAGER: "Manager",
  CLAIM_MANAGER: "Claim Manager",
  SALES_MANAGER: "Sales Manager",
};

const PERMISSION_TEXT: Record<string, { label: string; short: string }> = {
  IAM_MAN_ROL: { label: "Manage Roles", short: "Create and manage roles" },
  IAM_ASG_PER: {
    label: "Assign Permissions",
    short: "Assign permissions to roles and users",
  },
  POLICY_PROC: {
    label: "Process Policies",
    short: "Create and edit policy requests",
  },
  POLICY_APPR: {
    label: "Approve Policies",
    short: "Approve and reject policy decisions",
  },
  POLICY_DELETE: { label: "Delete Policies", short: "Delete policy records" },
  CLAIM_INIT: { label: "Initiate Claims", short: "Raise new claims" },
  CLAIM_CLOSE: { label: "Close Claims", short: "Close finalized claims" },
  PAY_POST_UTR: {
    label: "Post UTR Payment",
    short: "Record payment and UTR details",
  },
  USR_ASSIGN_ROLES: {
    label: "Assign User Roles",
    short: "Assign roles to users",
  },
  USR_DEACTIVATE: {
    label: "Deactivate Users",
    short: "Deactivate user accounts",
  },
};

const toTitle = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getRoleLabel = (roleName: string) =>
  ROLE_LABELS[roleName] || toTitle(roleName);

const getPermissionLabel = (perm: PermissionRead) =>
  PERMISSION_TEXT[perm.name]?.label || toTitle(perm.name);

const getPermissionShort = (perm: PermissionRead) =>
  PERMISSION_TEXT[perm.name]?.short || perm.description || "Permission access";

export default function ViewUserPage() {
  const params = useParams();
  const router = useRouter();

  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<RoleRead[]>([]);
  const [permissions, setPermissions] = useState<PermissionRead[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);

        const [userData, metadata] = await Promise.all([
          apiClient.getById(userId),
          apiClient.getRolesAndPermissions(),
        ]);

        setUser(userData);
        setRoles(metadata.roles || []);
        setPermissions(metadata.permissions || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load user details",
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  const roleName = useMemo(() => {
    if (!user?.roleId) return user?.role || "-";
    const role = roles.find((r) => r.id === user.roleId);
    return role?.name || user.role;
  }, [roles, user]);

  const assignedPermissions = useMemo(() => {
    if (!user?.permissionIds?.length) return [];
    return permissions.filter((perm) => user.permissionIds?.includes(perm.id));
  }, [permissions, user?.permissionIds]);

  if (loading) {
    return <Loading />;
  }

  if (error || !user) {
    return (
      <div className="p-8 bg-[#F4F7FE] dark:bg-gray-dark min-h-screen font-sans">
        <div className="bg-white dark:bg-gray-dark p-8 rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            User Details
          </h1>
          <p className="mt-3 text-sm text-red-500">
            {error || "User not found"}
          </p>
          <button
            onClick={() => router.push("/company/users")}
            className="mt-6 px-6 py-2.5 bg-[#0B1727] text-white rounded-lg font-medium hover:bg-[#1a2639] transition-colors"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#F4F7FE] dark:bg-gray-dark min-h-screen font-sans">
      <div className="space-y-6 bg-white dark:bg-gray-dark p-10 rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              User Details
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Complete user profile and assigned permissions.
            </p>
          </div>
          <button
            onClick={() => router.push("/company/users")}
            className="px-6 py-2.5 bg-[#0B1727] text-white rounded-lg font-medium hover:bg-[#1a2639] transition-colors"
          >
            Back to Users
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-gray-200 dark:border-dark-3 p-5 bg-gray-50/70 dark:bg-dark-2/30">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              Full Name
            </p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              {user.name}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-dark-3 p-5 bg-gray-50/70 dark:bg-dark-2/30">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              Email
            </p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              {user.email || "-"}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-dark-3 p-5 bg-gray-50/70 dark:bg-dark-2/30">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              Mobile
            </p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              {user.mobile || "-"}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-dark-3 p-5 bg-gray-50/70 dark:bg-dark-2/30">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              Designation
            </p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              {user.designation || "-"}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-dark-3 p-5 bg-gray-50/70 dark:bg-dark-2/30">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              Role
            </p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              {getRoleLabel(roleName)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-dark-3 p-5 bg-gray-50/70 dark:bg-dark-2/30">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              Status
            </p>
            <p
              className={`text-base font-semibold ${user.active ? "text-green-600" : "text-gray-500"}`}
            >
              {user.active ? "Active" : "Inactive"}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-dark-3 p-5 bg-gray-50/70 dark:bg-dark-2/30">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              Reports To
            </p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              {user.reportsTo || "-"}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-dark-3 p-5 bg-gray-50/70 dark:bg-dark-2/30">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              User ID
            </p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              {user.id}
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-gray-200 dark:border-dark-3 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Assigned Permissions
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {assignedPermissions.length} permission
            {assignedPermissions.length === 1 ? "" : "s"} assigned
          </p>

          {assignedPermissions.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-gray-300 dark:border-dark-3 p-6 text-sm text-gray-500">
              No permissions are assigned to this user.
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              {assignedPermissions.map((perm) => (
                <div
                  key={perm.id}
                  className="rounded-lg border border-gray-200 dark:border-dark-3 p-4 bg-white dark:bg-dark-2"
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {getPermissionLabel(perm)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getPermissionShort(perm)}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-2">
                    Code: {perm.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
