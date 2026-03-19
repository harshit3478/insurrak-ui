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
import { deleteUser, setUsers, toggleUserActive } from "@/lib/features/user/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { useRouter } from "next/navigation";

// export default function UsersPage({
//   searchParams,
// }: {
//   searchParams: { page?: string; search?: string };
// }) {
//   const page = Number(searchParams.page ?? 1);
//   const search = searchParams.search ?? "";
//   const limit = 10;

//   const users = await apiClient.getAll() as User[];

//   return (
//     <div className="space-y-6">
//       <UsersToolbar />
//       <UsersTable data={users} />
//     </div>
//   );
// }

import { api } from "@/lib/api";
import { Loading } from "@/components/ui/Loading";
import { useState } from "react";

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

  //  Redux users
  const users = useSelector(selectUsers);
  const { total, page, limit } = useSelector(selectUsersMeta);

  const handleDeleteUser = (user: User) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmed) return;

    dispatch(deleteUser(user.id));
  };

  const handleToggleUser = (user: User) => {
    dispatch(toggleUserActive(user.id));
  };


  //  Permissions
  const canCreate = hasPermission(authUser, Permission.CREATE_USER);
  const canEdit = hasPermission(authUser, Permission.EDIT_USER);
  const canDelete = hasPermission(authUser, Permission.DELETE_USER);
  const canToggle = hasPermission(authUser, Permission.TOGGLE_USER_STATUS);

  // Hard stop: no access at all
  if (!hasPermission(authUser, Permission.MANAGE_USERS)) {
    return <p className="text-red-500">Access denied</p>;
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <div className="space-y-6 bg-white dark:bg-gray-dark p-10 rounded-2xl">
        <UsersToolbar
          onAddUser={canCreate ? () => router.push('/users/add') : undefined}
        />

        <UsersTable
          data={users}
          total={total}
          page={page}
          limit={limit}
          onEditUser={canEdit ? (user) => router.push(`/users/edit/${user.id}`) : undefined}
          onDeleteUser={canDelete ? handleDeleteUser : undefined}
          onToggleUser={canToggle ? handleToggleUser : undefined}
          canEdit={canEdit}
          canDelete={canDelete}
          canToggle={canToggle}
        />
      </div>
    </>
  );
}
