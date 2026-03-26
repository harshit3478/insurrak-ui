"use client";

import Image from "next/image";
import Link from "next/link";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { ThemeToggleSwitch } from "./theme-toggle";
import { UserDropdown } from "./user-info/UserDropdown";
import { useAuth } from "@/context-provider/AuthProvider";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";

/**
 * Header provides the top-level navigation bar.
 * Contains: sidebar toggle (mobile + desktop), logo (mobile), theme toggle, user profile.
 */
export function Header() {
  const { toggleSidebar, isMobile, isOpen } = useSidebarContext();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stroke bg-white px-4 py-4 shadow-1 dark:border-stroke-dark dark:bg-gray-dark md:px-5 2xl:px-8">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={toggleSidebar}
          className="rounded-lg border px-1.5 py-1 dark:border-stroke-dark dark:bg-[#020D1A] hover:dark:bg-[#FFFFFF1A] lg:hidden"
        >
          <Menu className="w-5 h-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </button>

        {/* Desktop sidebar collapse/expand button */}
        {/* <button
          onClick={toggleSidebar}
          className="hidden lg:flex items-center justify-center rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-2 transition-colors"
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? (
            <PanelLeftClose className="w-5 h-5" />
          ) : (
            <PanelLeftOpen className="w-5 h-5" />
          )}
        </button> */}

        {isMobile && (
          <Link href={"/"} className="ml-1 max-[430px]:hidden">
            <Image
              src={"/images/logo/logo-icon.svg"}
              width={28}
              height={28}
              alt="Insurrack"
            />
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3 2xsm:gap-4">
        <ThemeToggleSwitch />

        {user ? (
          <UserDropdown
            user={{
              name: user.role === "COMPANY_ADMIN"
                ? (user.companyName || user.name || user.email || "User").toUpperCase()
                : user.name || user.email || "User",
              email: user.email || "",
            }}
            onLogout={logout}
          />
        ) : (
          <Link
            href="/auth/login"
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
