"use client";

import { Header } from "@/components/Layouts/header/Header";
import { Sidebar } from "@/components/Layouts/sidebar/Sidebar";
import { useSidebarContext } from "@/components/Layouts/sidebar/sidebar-context";
import { cn } from "@/lib/utils";

export function MainAppLayoutClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, isMobile } = useSidebarContext();

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300 ease-linear",
          isMobile
            ? "ml-0"
            : isOpen
              ? "ml-[290px]"
              : "ml-21.25",
        )}
      >
        <Header />
        <main className="isolate mx-auto w-full max-w-screen-2xl overflow-x-auto p-4 md:p-6 2xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
