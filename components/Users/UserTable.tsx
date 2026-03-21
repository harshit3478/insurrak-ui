"use client";

import { cn } from "@/lib/utils";
import type { User } from "@/types";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  MoreVertical,
  CircleX,
  User as UserIcon,
  Eye,
  CheckCircle,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Portal } from "@/components/ui/portal";
import { SkeletonRows } from "@/components/ui/SkeletonRows";

type UsersTableProps = {
  data: User[];
  loading?: boolean;
  total: number;
  page: number;
  limit: number;

  onEditUser?: (user: User) => void;
  onViewUser?: (user: User) => void;
  onDeleteUser?: (user: User) => void;
  onToggleUser?: (user: User) => void;

  canEdit: boolean;
  canDelete: boolean;
  canToggle: boolean;

  // Optional — for future bulk selection support
  selectedUsers?: string[];
  onSelectUser?: (id: string) => void;
  onSelectAllUsers?: () => void;
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Master Admin",
  COMPANY_ADMIN: "Admin",
  BRANCH_ADMIN: "Manager",
  COMPANY_USER: "User",
};

/**
 * UsersTable displays a tabular view of platform users with support for
 * role visualization, status toggling, and administrative actions.
 */
export function UsersTable({
  data,
  loading,
  total,
  page,
  limit,

  onEditUser,
  onViewUser,
  onDeleteUser,
  onToggleUser,

  canEdit,
  canDelete,
  canToggle,

  selectedUsers,
  onSelectUser,
  onSelectAllUsers,
}: UsersTableProps) {
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openActionId !== null &&
        !(event.target as Element).closest(".action-menu-container")
      ) {
        setOpenActionId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openActionId]);

  useEffect(() => {
    const handleScroll = () => {
      if (openActionId) {
        setOpenActionId(null);
        setMenuRect(null);
      }
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [openActionId]);

  const handleActionClick = (e: React.MouseEvent, id: string) => {
    if (openActionId === id) {
      setOpenActionId(null);
      setMenuRect(null);
    } else {
      setOpenActionId(id);
      setMenuRect(e.currentTarget.getBoundingClientRect());
    }
  };
  return (
    <div className="rounded-lg border border-gray-300 dark:border-dark-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">User</TableHead>
            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-300 dark:divide-dark-3">
          {loading ? (
            <SkeletonRows columns={5} rows={5} />
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-8 text-center text-neutral-500"
              >
                No users found
              </TableCell>
            </TableRow>
          ) : (
            data.map((user, index) => (
              <TableRow
                key={user.id}
                className="hover:bg-gray-50 transition-colors group"
              >
                <TableCell className="py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                  {user.name}
                </TableCell>

                <TableCell className="text-neutral-600 dark:text-neutral-400">
                  {user.email}
                </TableCell>

                <TableCell>{ROLE_LABELS[user.role] || user.role}</TableCell>
                <TableCell className="py-4 px-4">
                  {canToggle && onToggleUser && (
                    <span
                      onClick={() => onToggleUser(user)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.active
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          user.active ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></span>
                      {user.active ? "Active" : "Inactive"}
                    </span>
                  )}
                </TableCell>

                <TableCell className="py-4 px-6 text-right action-menu-container relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(e, user.id);
                    }}
                    className={`p-1 rounded transition-colors ${
                      openActionId === user.id
                        ? "bg-gray-100 text-gray-600 dark:bg-dark-3"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openActionId === user.id && menuRect && (
                    <Portal>
                      <div
                        onMouseDown={(e) => e.stopPropagation()}
                        style={{
                          position: "fixed",
                          top:
                            menuRect.bottom + 8 + 200 > window.innerHeight
                              ? menuRect.top - 180
                              : menuRect.bottom + 4,
                          left: menuRect.left - 160,
                          zIndex: 9999,
                        }}
                        className="w-48 bg-gray-1 dark:bg-gray-dark rounded-lg divide-y shadow-2xl border border-dark-3 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                      >
                        {onViewUser && (
                          <button
                            onClick={() => {
                              setOpenActionId(null);
                              onViewUser(user);
                            }}
                            className="w-full px-4 py-3 text-left text-sm dark:text-gray-300 hover:bg-[#253344] hover:text-white flex items-center gap-3 transition-colors"
                          >
                            <Eye className="w-4 h-4" /> View User
                          </button>
                        )}
                        {canEdit && onEditUser && (
                          <button
                            onClick={() => {
                              setOpenActionId(null);
                              onEditUser(user);
                            }}
                            className="w-full px-4 py-3 text-left text-sm dark:text-gray-300 hover:bg-[#253344] hover:text-white flex items-center gap-3 transition-colors"
                          >
                            <UserIcon className="w-4 h-4" /> Manage Admin
                          </button>
                        )}
                        <div className="h-px bg-gray-700/50 mx-2"></div>
                        {canToggle && onToggleUser && (
                          <button
                            onClick={() => {
                              setOpenActionId(null);
                              onToggleUser(user);
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-dark-2 hover:text-red-300 flex items-center gap-3 transition-colors"
                          >
                            {user.active ? (
                              <CircleX className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            {user.active ? "Deactivate" : "Activate"} Account
                          </button>
                        )}
                      </div>
                    </Portal>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination placeholder */}
      {/* <Pagination total={total} page={page} limit={limit} /> */}
    </div>
  );
}
