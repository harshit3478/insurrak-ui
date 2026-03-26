"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context-provider/AuthProvider";

const TOUR_KEY_COMPANY = "insurrack_tour_done_company";
const TOUR_KEY_SUPERADMIN = "insurrack_tour_done_superadmin";

type Step = {
  target: string; // data-tour attribute value
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
};

/** Tour for COMPANY_ADMIN / BRANCH_ADMIN / COMPANY_USER */
const COMPANY_STEPS: Step[] = [
  {
    target: "dashboard-stats",
    title: "Your Insurance Dashboard",
    description:
      "This is your command center. See your total sum insured across active policies and the number of items waiting for your approval — all at a glance.",
    position: "bottom",
  },
  {
    target: "sidebar-nav",
    title: "Navigate Your Platform",
    description:
      "Use the sidebar to move between Units & Branches, the Dashboard, and Claims Management. Each section handles a different part of your insurance lifecycle.",
    position: "right",
  },
  {
    target: "profile-icon",
    title: "Your Account",
    description:
      "Click here to view your company profile, check your account details, or sign out. Your company name is displayed here so you always know which account you're in.",
    position: "bottom",
  },
  {
    target: "dark-mode",
    title: "Light & Dark Mode",
    description:
      "Toggle between light and dark mode to suit your working environment. Your preference is saved automatically.",
    position: "bottom",
  },
];

/** Tour for SUPER_ADMIN */
const SUPERADMIN_STEPS: Step[] = [
  {
    target: "company-stats",
    title: "Your Companies at a Glance",
    description:
      "See total companies onboarded and how many are currently active — your birds-eye view of the entire platform.",
    position: "bottom",
  },
  {
    target: "add-company-btn",
    title: "Onboard a New Client",
    description:
      "Add a new insurance company here. You'll set up their admin email and they'll receive an invite to get started right away.",
    position: "bottom",
  },
  {
    target: "sidebar-toggle",
    title: "Collapse the Sidebar",
    description:
      "Click this button to collapse or expand the sidebar whenever you need more screen space.",
    position: "right",
  },
  {
    target: "dark-mode",
    title: "Light & Dark Mode",
    description:
      "Toggle between light and dark mode. Your preference is saved automatically.",
    position: "bottom",
  },
  {
    target: "profile-icon",
    title: "Your Account",
    description:
      "Access your profile settings or sign out from here.",
    position: "bottom",
  },
];

type Rect = { top: number; left: number; width: number; height: number };

const PADDING = 8; // px around the spotlight

export function OnboardingTour() {
  const { user } = useAuth();
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const rafRef = useRef<number>(0);

  // Determine which steps + storage key to use based on role
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isCompanyRole = ["COMPANY_ADMIN", "BRANCH_ADMIN", "COMPANY_USER"].includes(user?.role ?? "");

  const STEPS = isSuperAdmin ? SUPERADMIN_STEPS : COMPANY_STEPS;
  const TOUR_KEY = isSuperAdmin ? TOUR_KEY_SUPERADMIN : TOUR_KEY_COMPANY;

  // Activate tour on first visit for eligible roles
  useEffect(() => {
    if (!user?.role || (!isSuperAdmin && !isCompanyRole)) return;
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) {
      const t = setTimeout(() => setActive(true), 800);
      return () => clearTimeout(t);
    }
  }, [user?.role, TOUR_KEY, isSuperAdmin, isCompanyRole]);

  const updateRect = useCallback(() => {
    const current = STEPS[step];
    const el = document.querySelector(`[data-tour="${current.target}"]`);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });

    // Compute tooltip position
    const tp = r.top - PADDING;
    const lp = r.left - PADDING;
    const wp = r.width + PADDING * 2;
    const hp = r.height + PADDING * 2;

    const tooltipWidth = 320;
    const tooltipHeight = 160;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 16;

    let tTop = 0;
    let tLeft = 0;

    switch (current.position) {
      case "bottom":
        tTop = tp + hp + margin;
        tLeft = lp + wp / 2 - tooltipWidth / 2;
        break;
      case "top":
        tTop = tp - tooltipHeight - margin;
        tLeft = lp + wp / 2 - tooltipWidth / 2;
        break;
      case "right":
        tTop = tp + hp / 2 - tooltipHeight / 2;
        tLeft = lp + wp + margin;
        break;
      case "left":
        tTop = tp + hp / 2 - tooltipHeight / 2;
        tLeft = lp - tooltipWidth - margin;
        break;
    }

    // Clamp within viewport
    tLeft = Math.max(margin, Math.min(vw - tooltipWidth - margin, tLeft));
    tTop = Math.max(margin, Math.min(vh - tooltipHeight - margin, tTop));

    setTooltipPos({ top: tTop, left: tLeft });
  }, [step, STEPS]);

  useEffect(() => {
    if (!active) return;
    updateRect();
    const onResize = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateRect);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, updateRect]);

  const dismiss = useCallback(() => {
    localStorage.setItem(TOUR_KEY, "1");
    setActive(false);
  }, [TOUR_KEY]);

  const next = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  }, [step, STEPS.length, dismiss]);

  const prev = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  if (!active) return null;

  const sp = rect
    ? {
        top: rect.top - PADDING,
        left: rect.left - PADDING,
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
      }
    : null;

  return (
    <>
      {/* Overlay — 4 dark panels around the spotlight */}
      {sp ? (
        <>
          {/* Top */}
          <div
            className="fixed inset-0 z-[9998] bg-black/60"
            style={{ bottom: `calc(100% - ${sp.top}px)` }}
          />
          {/* Bottom */}
          <div
            className="fixed inset-0 z-[9998] bg-black/60"
            style={{ top: `${sp.top + sp.height}px` }}
          />
          {/* Left */}
          <div
            className="fixed z-[9998] bg-black/60"
            style={{
              top: sp.top,
              left: 0,
              width: sp.left,
              height: sp.height,
            }}
          />
          {/* Right */}
          <div
            className="fixed z-[9998] bg-black/60"
            style={{
              top: sp.top,
              left: sp.left + sp.width,
              right: 0,
              height: sp.height,
            }}
          />
          {/* Spotlight border ring */}
          <div
            className="fixed z-[9999] rounded-xl outline outline-2 outline-white/40 pointer-events-none"
            style={{
              top: sp.top,
              left: sp.left,
              width: sp.width,
              height: sp.height,
              boxShadow: "0 0 0 4px rgba(255,255,255,0.15)",
            }}
          />
        </>
      ) : (
        // No target found — full dark overlay
        <div className="fixed inset-0 z-[9998] bg-black/60" />
      )}

      {/* Tooltip card */}
      {tooltipPos && (
        <div
          className="fixed z-[10000] w-80 rounded-2xl bg-white dark:bg-gray-dark border border-gray-100 dark:border-dark-3 shadow-2xl p-5"
          style={{ top: tooltipPos.top, left: tooltipPos.left }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === step
                        ? "w-5 bg-[#0B1727] dark:bg-white"
                        : "w-1.5 bg-gray-200 dark:bg-dark-3"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Step {step + 1} of {STEPS.length}
              </p>
            </div>
            <button
              onClick={dismiss}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-2 transition-colors -mr-1 -mt-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5">
            {STEPS[step].title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
            {STEPS[step].description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <button
              onClick={dismiss}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Skip tour
            </button>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={prev}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-dark-3 text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={next}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B1727] text-white text-xs font-medium rounded-lg hover:bg-[#1a2639] transition-colors dark:bg-white dark:text-[#0B1727] dark:hover:bg-gray-100"
              >
                {step === STEPS.length - 1 ? "Done" : "Next"}
                {step < STEPS.length - 1 && <ArrowRight className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
