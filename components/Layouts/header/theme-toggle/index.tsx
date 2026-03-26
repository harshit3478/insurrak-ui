"use client";

import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggleSwitch() {
  const [isDark, setIsDark] = useState(false);

  // Sync with actual DOM state after mount (respects the pre-hydration script)
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const nextIsDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nextIsDark);
    localStorage.setItem("theme", nextIsDark ? "dark" : "light");
    setIsDark(nextIsDark);
  };

  return (
    <button
      onClick={toggleTheme}
      data-tour="dark-mode"
      className="group rounded-full bg-gray-3 p-1.25 text-[#111928] outline-1 outline-primary focus-visible:outline dark:bg-[#020D1A] dark:text-current"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="sr-only">Toggle theme</span>
      <span aria-hidden className="relative flex gap-2.5">
        <span
          className={cn(
            "absolute size-[38px] rounded-full border border-gray-200 bg-white transition-all duration-300",
            "dark:border-none dark:bg-dark-2 dark:group-hover:bg-dark-3",
            isDark && "translate-x-12",
          )}
        />
        {[{ name: "light", Icon: Sun }, { name: "dark", Icon: Moon }].map(({ name, Icon }) => (
          <span
            key={name}
            className={cn(
              "relative grid size-[38px] place-items-center rounded-full",
              name === "dark" && "dark:text-white",
            )}
          >
            <Icon className="w-5 h-5" />
          </span>
        ))}
      </span>
    </button>
  );
}
