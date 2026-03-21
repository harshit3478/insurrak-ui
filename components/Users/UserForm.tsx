"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FormSection, FormInput, Stepper } from "@/components/ui/FormCommon";
import { User } from "@/types";
import { apiClient } from "@/lib/apiClient";
import { PermissionRead, RoleRead } from "@/types/api";

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
    short: "Assign permissions to roles/users",
  },
  POLICY_PROC: {
    label: "Process Policies",
    short: "Create and edit policy requests",
  },
  POLICY_APPR: {
    label: "Approve Policies",
    short: "Approve or reject policy decisions",
  },
  POLICY_DELETE: {
    label: "Delete Policies",
    short: "Delete policy records within scope",
  },
  POLICY_ASSIGN_OWNER: {
    label: "Assign Policy Owner",
    short: "Assign policy owner to another user",
  },
  QUOTATION_FINAL_APPROVAL: {
    label: "Final Quote Approval",
    short: "Provide final quotation approval",
  },
  CLAIM_INIT: { label: "Initiate Claims", short: "Raise new claims" },
  CLAIM_SUBMIT_BROKER: {
    label: "Submit Claim to Broker",
    short: "Send claim documents to broker",
  },
  CLAIM_RECORD_APPROVAL: {
    label: "Record Claim Approval",
    short: "Record insurer approval decision",
  },
  CLAIM_RECORD_SETTLEMENT: {
    label: "Record Claim Settlement",
    short: "Record settlement receipt",
  },
  CLAIM_CLOSE: { label: "Close Claims", short: "Close finalized claims" },
  PAY_POST_UTR: {
    label: "Post UTR Payment",
    short: "Record payment and UTR details",
  },
  FIN_VIEW_PREMIUM: { label: "View Premium", short: "View premium amounts" },
  FIN_VIEW_GST: { label: "View GST", short: "View GST values" },
  FIN_EDIT_FIELDS: {
    label: "Edit Financial Fields",
    short: "Edit premium and GST fields",
  },
  RENEWAL_START: { label: "Start Renewal", short: "Initiate policy renewal" },
  RENEWAL_ASSIGN_OWNER: {
    label: "Assign Renewal Owner",
    short: "Assign renewal owner",
  },
  RENEWAL_EDIT_STATUS: {
    label: "Edit Renewal Status",
    short: "Update renewal status",
  },
  RENEWAL_APPROVE: {
    label: "Approve Renewal",
    short: "Approve renewal workflows",
  },
  DOC_DELETE: {
    label: "Delete Documents",
    short: "Delete repository documents",
  },
  DOC_VERSION_OVERRIDE: {
    label: "Override Doc Version",
    short: "Override version control rules",
  },
  USR_CREATE_STATE_ADMIN: {
    label: "Create State Admin",
    short: "Create branch/state admins",
  },
  USR_CREATE_UNIT_ADMIN: {
    label: "Create Unit Admin",
    short: "Create unit-level admins",
  },
  USR_DEACTIVATE: {
    label: "Deactivate Users",
    short: "Deactivate user accounts",
  },
  USR_ASSIGN_ROLES: {
    label: "Assign User Roles",
    short: "Assign roles to users",
  },
  MASTER_MANAGE_COMPANY: {
    label: "Manage Company Master",
    short: "Manage company master data",
  },
  MASTER_MANAGE_STATE: {
    label: "Manage State Master",
    short: "Manage state/branch master data",
  },
  MASTER_MANAGE_UNIT: {
    label: "Manage Unit Master",
    short: "Manage unit master records",
  },
  MASTER_MANAGE_BROKER: {
    label: "Manage Broker Master",
    short: "Manage broker master records",
  },
  MASTER_MANAGE_INSURER: {
    label: "Manage Insurer Master",
    short: "Manage insurer master records",
  },
  MASTER_MANAGE_POLICY_TYPE: {
    label: "Manage Policy Types",
    short: "Manage policy type masters",
  },
  REPORT_ALL_INDIA: {
    label: "All India Reports",
    short: "View all-India reports",
  },
  REPORT_STATE: { label: "State Reports", short: "View state-wise reports" },
  REPORT_UNIT: { label: "Unit Reports", short: "View unit-level reports" },
  REPORT_EXPORT: { label: "Export Reports", short: "Export reports to files" },
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

type UserFormProps = {
  action: (formData: FormData) => void;
  pending: boolean;
  defaultValues?: Partial<User>;
  isEdit?: boolean;
  onSuccess?: () => void;
};

/**
 * UserForm manages the creation and modification of user accounts.
 * It handles basic identity details, role assignments (RBAC), and
 * organizational context such as reporting lines and company associations.
 */
export function UserForm({
  action,
  pending,
  defaultValues,
  isEdit = false,
}: UserFormProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [step, setStep] = useState(1);

  const [fullName, setFullName] = useState(defaultValues?.name || "");
  const [email, setEmail] = useState(defaultValues?.email || "");
  const [mobile, setMobile] = useState(defaultValues?.mobile || "");
  const [designation, setDesignation] = useState(
    defaultValues?.designation || "",
  );
  const [reportsTo, setReportsTo] = useState(defaultValues?.reportsTo || "");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  const [roles, setRoles] = useState<RoleRead[]>([]);
  const [permissions, setPermissions] = useState<PermissionRead[]>([]);
  const [rolePermissions, setRolePermissions] = useState<
    Record<number, number[]>
  >({});
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(
    defaultValues?.roleId ?? null,
  );
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>(
    [],
  );
  const [checkedAvailableIds, setCheckedAvailableIds] = useState<number[]>([]);

  const selectedRoleName = useMemo(() => {
    const role = roles.find((r) => r.id === selectedRoleId);
    return role?.name || defaultValues?.role || "COMPANY_USER";
  }, [roles, selectedRoleId, defaultValues?.role]);

  const roleRank = (roleName: string) => {
    if (roleName === "SUPER_ADMIN") return 4;
    if (roleName === "COMPANY_ADMIN") return 3;
    if (roleName === "BRANCH_ADMIN") return 2;
    return 1;
  };

  const selectedRoleRank = useMemo(
    () => roleRank(selectedRoleName),
    [selectedRoleName],
  );

  const higherRoleUsers = useMemo(() => {
    const roleById = new Map<number, string>(
      roles.map((role) => [role.id, role.name]),
    );
    return users.filter((user) => {
      const userRoleName = user.roleId
        ? roleById.get(user.roleId) || user.role
        : user.role;
      return roleRank(userRoleName) > selectedRoleRank;
    });
  }, [users, roles, selectedRoleRank]);

  const loadRolesAndPermissions = async () => {
    try {
      const data = await apiClient.getRolesAndPermissions();
      setRoles(data.roles);
      setPermissions(data.permissions);
      setRolePermissions(data.role_permissions || {});
      const allUsers = await apiClient.getAll();
      setUsers(allUsers);

      if (!selectedRoleId && data.roles.length > 0) {
        setSelectedRoleId(defaultValues?.roleId ?? data.roles[0].id);
      }
    } catch (error) {
      console.error("Failed to load roles and permissions", error);
      setFormError("Unable to load roles and permissions.");
    }
  };

  useEffect(() => {
    loadRolesAndPermissions();
  }, []);

  useEffect(() => {
    if (!selectedRoleId) {
      setSelectedPermissionIds([]);
      return;
    }
    if (
      isEdit &&
      defaultValues?.permissionIds &&
      defaultValues.permissionIds.length > 0
    ) {
      setSelectedPermissionIds(defaultValues.permissionIds);
    } else {
      setSelectedPermissionIds(rolePermissions[selectedRoleId] || []);
    }
  }, [selectedRoleId, rolePermissions, isEdit, defaultValues?.permissionIds]);

  const availablePermissions = useMemo(
    () =>
      permissions.filter((perm) => !selectedPermissionIds.includes(perm.id)),
    [permissions, selectedPermissionIds],
  );

  const selectedPermissions = useMemo(
    () => permissions.filter((perm) => selectedPermissionIds.includes(perm.id)),
    [permissions, selectedPermissionIds],
  );

  useEffect(() => {
    setCheckedAvailableIds((prev) =>
      prev.filter((id) => availablePermissions.some((perm) => perm.id === id)),
    );
  }, [availablePermissions]);

  const toggleAvailableCheck = (permissionId: number) => {
    setCheckedAvailableIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId],
    );
  };

  const addCheckedPermissions = () => {
    if (checkedAvailableIds.length === 0) return;
    setSelectedPermissionIds((prev) =>
      Array.from(new Set([...prev, ...checkedAvailableIds])),
    );
    setCheckedAvailableIds([]);
  };

  const addSinglePermission = (permissionId: number) => {
    setSelectedPermissionIds((prev) =>
      Array.from(new Set([...prev, permissionId])),
    );
    setCheckedAvailableIds((prev) => prev.filter((id) => id !== permissionId));
  };

  const removeSinglePermission = (permissionId: number) => {
    setSelectedPermissionIds((prev) =>
      prev.filter((id) => id !== permissionId),
    );
  };

  const selectAllAvailable = () => {
    setCheckedAvailableIds(availablePermissions.map((perm) => perm.id));
  };

  const clearChecked = () => {
    setCheckedAvailableIds([]);
  };

  const removeAllSelected = () => {
    setSelectedPermissionIds([]);
  };

  const goNext = () => {
    setFormError("");
    if (step === 1) {
      if (
        !fullName.trim() ||
        !email.trim() ||
        !mobile.trim() ||
        !selectedRoleId
      ) {
        setFormError("Please fill Full Name, Email, Mobile and Role.");
        return;
      }
      if (!isEdit && !password.trim()) {
        setFormError("Password is required for new user.");
        return;
      }
    }

    if (step === 2 && selectedPermissionIds.length === 0) {
      setFormError("Please select at least one permission.");
      return;
    }

    setStep((prev) => Math.min(prev + 1, 3));
  };

  const goBack = () => {
    setFormError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSave = () => {
    setFormError("");
    if (!selectedRoleId) {
      setFormError("Please select a role.");
      return;
    }

    const finalFormData = new FormData();
    if (isEdit && defaultValues?.id) {
      finalFormData.append("id", String(defaultValues.id));
    }
    finalFormData.append("name", fullName);
    finalFormData.append("username", fullName);
    finalFormData.append("email", email);
    finalFormData.append("mobile", mobile);
    finalFormData.append("role", selectedRoleName);
    finalFormData.append("role_id", String(selectedRoleId));
    finalFormData.append("designation", designation || "");
    finalFormData.append("reportsTo", reportsTo || "");
    if (!isEdit) {
      finalFormData.append("password", password);
    }
    selectedPermissionIds.forEach((id) => {
      finalFormData.append("permission_ids", String(id));
    });

    startTransition(() => {
      action(finalFormData);
    });
  };

  return (
    <div className="bg-white dark:bg-gray-dark p-8 rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm">
      <Stepper steps={3} currentStep={step} />

      {step === 1 && (
        <FormSection title="Step 1: Basic Details">
          <FormInput
            label="Full Name"
            name="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={isEdit}
          />
          <FormInput
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isEdit}
          />
          <FormInput
            label="Mobile"
            name="mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              Role
            </label>
            <select
              value={selectedRoleId ? String(selectedRoleId) : ""}
              onChange={(e) => setSelectedRoleId(Number(e.target.value))}
              className="w-full px-4 py-3 bg-white dark:bg-gray-dark border border-gray-200 dark:border-dark-3 rounded-lg text-gray-900 dark:text-white"
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {getRoleLabel(role.name)}
                </option>
              ))}
            </select>
          </div>
          {!isEdit && (
            <FormInput
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}
        </FormSection>
      )}

      {step === 2 && (
        <div className="space-y-8">
          <FormSection title="Step 2: Reporting and Permissions">
            <FormInput
              label="Designation"
              name="designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                Reports To (Higher Position)
              </label>
              <select
                value={reportsTo}
                onChange={(e) => setReportsTo(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-dark border border-gray-200 dark:border-dark-3 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="">No Manager</option>
                {higherRoleUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({getRoleLabel(user.role)})
                  </option>
                ))}
              </select>
            </div>
          </FormSection>

          <FormSection title="Permissions">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-3 dark:border-dark-3">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Available Permissions ({availablePermissions.length})
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllAvailable}
                      className="rounded border border-gray-200 px-2 py-1 text-xs font-medium hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark-2"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={clearChecked}
                      className="rounded border border-gray-200 px-2 py-1 text-xs font-medium hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark-2"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <button
                    type="button"
                    onClick={addCheckedPermissions}
                    disabled={checkedAvailableIds.length === 0}
                    className="rounded border border-gray-200 px-3 py-1 text-xs font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-3 dark:hover:bg-dark-2"
                  >
                    Add Selected ({checkedAvailableIds.length})
                  </button>
                </div>

                <div className="max-h-64 space-y-2 overflow-y-auto rounded border border-gray-100 p-2 dark:border-dark-3">
                  {availablePermissions.map((perm) => (
                    <div
                      key={perm.id}
                      className="flex items-start justify-between gap-2 rounded-md border border-gray-100 p-2 dark:border-dark-3"
                    >
                      <label className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={checkedAvailableIds.includes(perm.id)}
                          onChange={() => toggleAvailableCheck(perm.id)}
                          className="mt-1"
                        />
                        <span>
                          <span className="block font-medium text-gray-900 dark:text-white">
                            {getPermissionLabel(perm)}
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            {getPermissionShort(perm)}
                          </span>
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => addSinglePermission(perm.id)}
                        className="rounded border border-gray-200 px-2 py-1 text-xs font-medium hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark-2"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                  {availablePermissions.length === 0 && (
                    <p className="p-2 text-xs text-gray-500">
                      All permissions selected.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-3 dark:border-dark-3">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Assigned Permissions ({selectedPermissions.length})
                  </p>
                  <button
                    type="button"
                    onClick={removeAllSelected}
                    disabled={selectedPermissions.length === 0}
                    className="rounded border border-gray-200 px-2 py-1 text-xs font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-3 dark:hover:bg-dark-2"
                  >
                    Remove All
                  </button>
                </div>

                <div className="max-h-64 space-y-2 overflow-y-auto rounded border border-gray-100 p-2 dark:border-dark-3">
                  {selectedPermissions.map((perm) => (
                    <div
                      key={perm.id}
                      className="flex items-start justify-between gap-2 rounded-md border border-gray-100 p-2 dark:border-dark-3"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="block font-medium text-gray-900 dark:text-white">
                          {getPermissionLabel(perm)}
                        </span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          {getPermissionShort(perm)}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSinglePermission(perm.id)}
                        className="rounded border border-gray-200 px-2 py-1 text-xs font-medium hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {selectedPermissions.length === 0 && (
                    <p className="p-2 text-xs text-gray-500">
                      No permissions assigned yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </FormSection>
        </div>
      )}

      {step === 3 && (
        <FormSection title="Step 3: Preview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">Full Name</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {fullName || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Email</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {email || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Mobile</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {mobile || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Role</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedRoleName ? getRoleLabel(selectedRoleName) : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Designation</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {designation || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Reports To</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {higherRoleUsers.find((u) => u.id === reportsTo)?.name ||
                  "No Manager"}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-400 mb-1">Permissions Selected</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedPermissionIds.length}
              </p>
            </div>
          </div>
        </FormSection>
      )}

      {formError && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20">
          {formError}
        </p>
      )}

      <div className="mt-12 pt-6 border-t border-gray-200 dark:border-dark-3 flex justify-start gap-4">
        {step > 1 && (
          <button
            type="button"
            onClick={goBack}
            className="px-8 py-3 border border-gray-200 dark:border-dark-3 text-gray-600 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors"
          >
            Back
          </button>
        )}

        {step < 3 && (
          <button
            type="button"
            onClick={goNext}
            className="px-8 py-3 bg-[#0B1727] text-white rounded-lg font-medium hover:bg-[#1a2639] transition-colors"
          >
            Next
          </button>
        )}

        {step === 3 && (
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="px-8 py-3 bg-[#0B1727] text-white rounded-lg font-medium hover:bg-[#1a2639] transition-colors"
          >
            {pending
              ? "Saving..."
              : isEdit
                ? "Update Employee"
                : "Create Employee"}
          </button>
        )}

        <button
          type="button"
          onClick={() => router.back()}
          className="px-8 py-3 border border-gray-200 dark:border-dark-3 text-gray-600 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
