"use client";

import Link from "next/link";
import { UserDropdown } from "./UserDropdown";
import { useAuth } from "@/context-provider/AuthProvider";
import { User } from "@/types";
import { logout } from "@/lib/features/auth/authSlice";

export function UserInfo() {
  // const { user, logout } = useAuth();
  // const { logout } = useAuth();

  const user = {
    name: "John Smith",
    email: "johnson@nextadmin.com",
    role: "SUPER_ADMIN"
  } as User | null;

  return (
    <div>
      {user ? (
        <UserDropdown user={user} onLogout={logout} />
      ) : (
        <>
          <Link
            href={"/auth/signup"}
            className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-dark"
          >
            Sign Up
          </Link>
        </>
      )}
    </div>
  );
}
