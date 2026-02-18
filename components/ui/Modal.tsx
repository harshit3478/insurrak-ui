"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export function Modal({
  open,
  onClose,
  title,
  children,
}: ModalProps) {
  // ESC key close
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Lock background scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-100">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Wrapper */}
      <div className="absolute inset-0 flex items-end sm:items-center justify-center p-4">
        <div
          className="
            w-full max-w-4xl
            rounded-t-2xl sm:rounded-2xl
            bg-white dark:bg-gray-900
            shadow-xl
            transition-transform
            animate-in slide-in-from-bottom sm:fade-in
          "
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between border-b px-6 py-4 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="rounded-md p-2 text-gray-500 hover:bg-black/5 dark:hover:bg-white/10"
              >
                ✕
              </button>
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-5 text-gray-700 dark:text-gray-300">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
