"use client";

import { cn } from "@/lib/utils";
import { PanelLeft, ArrowLeft, ChevronUp } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getNavData } from "./data";
import { MenuItem } from "./menu-item";
import { useSidebarContext } from "./sidebar-context";
import { useAuth } from "@/context-provider/AuthProvider";

/**
 * Sidebar component provides the primary vertical navigation for the application.
 * It dynamically renders navigation items based on the user's role and 
 * authentication status, supporting both desktop (with toggle) and mobile 
 * overlay modes.
 */
export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Recompute nav data whenever the auth user changes
  const NAV_DATA = getNavData(!!user, user?.role ?? undefined);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? [] : [title]));
  };

  useEffect(() => {
    // Keep collapsible open, when it's subpage is active
    NAV_DATA.some((section) => {
      return section.items.some((item) => {
        return item.items?.some((subItem) => {
          if (subItem.url === pathname) {
            if (!expandedItems.includes(item.title)) {
              toggleExpanded(item.title);
            }

            // Break the loop
            return true;
          }
        });
      });
    });
  }, [pathname]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        data-tour="sidebar-nav"
        className={cn(
          "overflow-hidden border-r border-gray-200 bg-white transition-all duration-300 ease-linear dark:border-gray-800 dark:bg-gray-dark",
          "fixed top-0 bottom-0 left-0 z-50 h-screen",
          isMobile
            ? isOpen
              ? "w-full max-w-[290px]"
              : "w-0"
            : isOpen
              ? "w-[290px]"
              : "w-21.25",
        )}
        aria-label="Main navigation"
        aria-hidden={isMobile ? !isOpen : false}
        inert={isMobile ? !isOpen : undefined}
      >
        <div className={cn(
          "flex h-full flex-col py-10 pr-1.75",
          !isOpen && !isMobile ? "items-center px-0" : "pl-6.25",
        )}>
          <div className={cn(
            "flex items-center gap-3 pr-4.5",
            !isOpen && !isMobile && "justify-center",
          )}>
            {/* Desktop sidebar toggle — only this button collapses/expands */}
            {!isMobile && (
              <button
                data-tour="sidebar-toggle"
                onClick={toggleSidebar}
                aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-2 transition-colors shrink-0"
              >
                <PanelLeft className="size-5" />
              </button>
            )}

            {(isOpen || isMobile) && (
              <span className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                Insurrack
              </span>
            )}

            {/* Mobile close button */}
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="ml-auto p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <span className="sr-only">Close Menu</span>
                <ArrowLeft className="size-5" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="custom-scrollbar mt-6 flex-1 overflow-y-auto overflow-x-hidden pr-3 min-[850px]:mt-10">
            {NAV_DATA.map((section) => (
              <div key={section.label} className="mb-6">
                {(isOpen || isMobile) && (
                  <h2 className="mb-5 text-sm font-medium text-dark-4 dark:text-dark-6">
                    {section.label}
                  </h2>
                )}

                <nav role="navigation" aria-label={section.label}>
                  <ul className="space-y-2">
                    {section.items.map((item) => {
                      const isCollapsible = item.items && item.items.length > 0;
                      const isSubItemActive =
                        isCollapsible &&
                        item.items.some(({ url }) => url === pathname);

                      return (
                        <li key={item.title}>
                          <div className="group relative">
                            {isCollapsible ? (
                              <>
                                <MenuItem
                                  isActive={!!isSubItemActive}
                                  onClick={() =>
                                    (isOpen || isMobile) &&
                                    toggleExpanded(item.title)
                                  }
                                  className={cn(
                                    !isOpen && !isMobile && "justify-center",
                                  )}
                                >
                                  <item.icon
                                    className="size-6 shrink-0"
                                    aria-hidden="true"
                                  />
                                  {(isOpen || isMobile) && (
                                    <span className="whitespace-nowrap">
                                      {item.title}
                                    </span>
                                  )}
                                  {(isOpen || isMobile) && (
                                    <ChevronUp
                                      className={cn(
                                        "ml-auto rotate-180 transition-transform duration-200",
                                        expandedItems.includes(item.title) &&
                                          "rotate-0",
                                      )}
                                      aria-hidden="true"
                                    />
                                  )}
                                </MenuItem>
                                {(isOpen || isMobile) &&
                                  expandedItems.includes(item.title) && (
                                    <ul
                                      className="ml-9 mr-0 space-y-1.5 pb-3.75 pr-0 pt-2"
                                      role="menu"
                                    >
                                      {item.items.map((subItem) => (
                                        <li key={subItem.title} role="none">
                                          <MenuItem
                                            as="link"
                                            href={subItem.url}
                                            isActive={pathname === subItem.url}
                                          >
                                            <span>{subItem.title}</span>
                                          </MenuItem>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                              </>
                            ) : (
                              (() => {
                                const href =
                                  "url" in item
                                    ? item.url + ""
                                    : "/" +
                                      item.title
                                        .toLowerCase()
                                        .split(" ")
                                        .join("-");

                                return (
                                  <MenuItem
                                    className={cn(
                                      "flex items-center gap-3 py-3",
                                      !isOpen && !isMobile && "justify-center",
                                    )}
                                    as="link"
                                    href={href}
                                    isActive={pathname === href}
                                  >
                                    <item.icon
                                      className="size-6 shrink-0"
                                      aria-hidden="true"
                                    />
                                    {(isOpen || isMobile) && (
                                      <span className="whitespace-nowrap">
                                        {item.title}
                                      </span>
                                    )}
                                  </MenuItem>
                                );
                              })()
                            )}
                            {!isOpen && !isMobile && (
                              <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-4 -translate-y-1/2 whitespace-nowrap rounded bg-gray-dark px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                {item.title}
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
