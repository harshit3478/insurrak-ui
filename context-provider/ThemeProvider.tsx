"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { createContext } from "react";

export const ThemeContext = createContext({});

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeContext.Provider value="dark">
      <SidebarProvider>{children}</SidebarProvider>
    </ThemeContext.Provider>
  );
}
