"use client";

import Link from "next/link";
import { UserDropdown } from "./UserDropdown";
import { useAuth } from "@/context-provider/AuthProvider";

export function UserInfo() {
  const { user, logout } = useAuth();

  return (
    <div>
      {user ? (
        <UserDropdown user={user} onLogout={logout} />
      ) : (
        <>
          <Link
            href={"/auth/login"}
            className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-dark"
          >
            Sign in
          </Link>
        </>
      )}
    </div>
  );
}

