"use client";

import { Modal } from "./Modal";
import { AlertTriangle, Info } from "lucide-react";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onCancel}>
      <div className="flex gap-4">
        <div
          className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            variant === "danger"
              ? "bg-red-100 dark:bg-red-900/30"
              : "bg-blue-100 dark:bg-blue-900/30"
          }`}
        >
          {variant === "danger" ? (
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          ) : (
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium border border-gray-200 dark:border-dark-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            variant === "danger"
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727] hover:bg-[#1a2639] dark:hover:bg-gray-200"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
