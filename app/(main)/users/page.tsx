"use client";
import { UsersToolbar } from "@/components/Users/UsersToolbar";
import { UsersTable } from "@/components/Users/UserTable";
import { fetchUsers } from "./actions";
import { User } from "@/types";
import { useEffect } from "react";
import { hasPermission, Permission } from "@/types/permissions";
import { useSelector } from "react-redux";
import {
  selectUsers,
  selectUsersMeta,
} from "@/lib/features/user/userSelectors";
import { deleteUser, setUsers, updateUser as updateUserInStore } from "@/lib/features/user/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { Loading } from "@/components/ui/Loading";
import { useState } from "react";

/**
 * UsersPage manages the platform's user accounts and their associated permissions.
 * It provides administrative tools for creating, editing, and toggling user 
 * statuses, enforced by a rigorous role-based access control (RBAC) system.
 */
export default function UsersPage() {
  const authUser = useSelector((state: any) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await api.getAll();
        dispatch(setUsers(data));
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [dispatch]);

  // Retrieves users and pagination metadata from the global Redux state.
  const users = useSelector(selectUsers);
  const { total, page, limit } = useSelector(selectUsersMeta);

  const handleDeleteUser = async (user: User) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmed) return;

    try {
      await api.deleteUser(user.id);
    } catch (error) {
      console.error("Failed to delete user", error);
      alert("Failed to delete user");
      return;
    }

    dispatch(deleteUser(user.id));
  };

  const tryParseErrorDetail = (message: string) => {
    try {
      return JSON.parse(message);
    } catch {
      return null;
    }
  };

  const handleToggleUser = async (user: User) => {
    if (user.active) {
      try {
        const updated = await api.updateUserStatus(user.id, { is_active: false });
        dispatch(updateUserInStore(updated));
        return;
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Failed to deactivate user";
        const detail = typeof msg === "string" ? tryParseErrorDetail(msg) : null;

        const rawDetail = detail?.code ? detail : tryParseErrorDetail(String(detail));
        const code = rawDetail?.code || detail?.code;
        const subordinates = rawDetail?.subordinates || detail?.subordinates;

        if (code === "SUBORDINATES_PRESENT" && Array.isArray(subordinates) && subordinates.length > 0) {
          const options = users
            .filter((candidate) =>
              candidate.id !== user.id &&
              candidate.active &&
              !subordinates.some((s: { id: number }) => String(s.id) === candidate.id),
            )
            .map((candidate) => `${candidate.id}: ${candidate.name}`)
            .join("\n");

          const reassignedTo = window.prompt(
            `This user has active subordinates. Enter replacement manager ID:\n\n${options}`,
          );

          const reassignedToId = reassignedTo ? Number(reassignedTo) : NaN;
          if (!Number.isFinite(reassignedToId) || reassignedToId <= 0) {
            return;
          }

          try {
            const updated = await api.updateUserStatus(user.id, {
              is_active: false,
              reassign_reports_to: reassignedToId,
            });
            dispatch(updateUserInStore(updated));
            return;
          } catch (retryError) {
            console.error("Failed to deactivate user after reassignment", retryError);
            alert(retryError instanceof Error ? retryError.message : "Failed to deactivate user");
            return;
          }
        }

        console.error("Failed to deactivate user", error);
        alert(msg);
        return;
      }
    }

    try {
      const updated = await api.updateUserStatus(user.id, { is_active: true });
      dispatch(updateUserInStore(updated));
    } catch (error) {
      console.error("Failed to activate user", error);
      alert(error instanceof Error ? error.message : "Failed to activate user");
    }
  };


  // Evaluates role-based permissions for user management actions.
  const canCreate = hasPermission(authUser, Permission.CREATE_USER);
  const canEdit = hasPermission(authUser, Permission.EDIT_USER);
  const canDelete = hasPermission(authUser, Permission.DELETE_USER);
  const canToggle = hasPermission(authUser, Permission.TOGGLE_USER_STATUS);

  // Enforces a strict guard; if the user lacks management permissions, access is blocked.
  if (!hasPermission(authUser, Permission.MANAGE_USERS)) {
    return <p className="text-red-500">Access denied</p>;
  }

  return (
    <div className="p-8 bg-[#F4F7FE] dark:bg-gray-dark min-h-screen font-sans">
      <div className="space-y-6 bg-white dark:bg-gray-dark p-10 rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm min-h-[600px]">
        <UsersToolbar
          onAddUser={canCreate ? () => router.push('/company/users/add') : undefined}
        />

        <UsersTable
          loading={loading}
          data={users}
          total={total}
          page={page}
          limit={limit}
          onViewUser={(user) => router.push(`/company/users/view/${user.id}`)}
          onEditUser={canEdit ? (user) => router.push(`/company/users/edit/${user.id}`) : undefined}
          onDeleteUser={canDelete ? handleDeleteUser : undefined}
          onToggleUser={canToggle ? handleToggleUser : undefined}
          canEdit={canEdit}
          canDelete={canDelete}
          canToggle={canToggle}
        />
      </div>
    </div>
  );
}
