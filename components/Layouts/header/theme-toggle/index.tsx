"use client";

import { cn } from "@/lib/utils";
import { Moon, Sun } from "./icons";
import { useState } from "react";

const THEMES = [
  { name: "light", Icon: Sun },
  { name: "dark", Icon: Moon },
];


export function ThemeToggleSwitch() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    const nextIsDark = !document.documentElement.classList.contains("dark");

    document.documentElement.classList.toggle("dark", nextIsDark);
    localStorage.setItem("theme", nextIsDark ? "dark" : "light");

    setIsDark(nextIsDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className="group rounded-full bg-gray-3 p-1.25 text-[#111928] outline-1 outline-primary focus-visible:outline dark:bg-[#020D1A] dark:text-current"
    >
      <span className="sr-only">Toggle theme</span>

      <span aria-hidden className="relative flex gap-2.5">
        {/* Indicator */}
        <span
          className={cn(
            "absolute size-[38px] rounded-full border border-gray-200 bg-white transition-all",
            "dark:border-none dark:bg-dark-2 dark:group-hover:bg-dark-3",
            isDark && "translate-x-12",
          )}
        />

        {THEMES.map(({ name, Icon }) => (
          <span
            key={name}
            className={cn(
              "relative grid size-[38px] place-items-center rounded-full",
              name === "dark" && "dark:text-white",
            )}
          >
            <Icon />
          </span>
        ))}
      </span>
    </button>
  );
}
