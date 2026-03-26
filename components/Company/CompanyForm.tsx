"use client";

import React, { useState } from "react";
import { Company } from "@/types";

type CompanyFormProps = {
  onSubmit: (data: { name: string; adminEmail: string }) => void;
  pending: boolean;
  error?: string;
};

/**
 * Simplified company creation form — company name + admin email only.
 * The admin email becomes the login email for the company admin.
 */
export function CompanyForm({ onSubmit, pending, error }: CompanyFormProps) {
  const [name, setName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [localError, setLocalError] = useState("");

  const inputClass =
    "w-full px-4 py-3 border border-gray-200 dark:border-dark-3 rounded-lg bg-white dark:bg-dark-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20 dark:focus:ring-white/10 transition-all text-sm";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    if (!name.trim()) {
      setLocalError("Company name is required.");
      return;
    }
    if (!adminEmail.trim() || !adminEmail.includes("@")) {
      setLocalError("A valid admin email is required.");
      return;
    }
    onSubmit({ name: name.trim(), adminEmail: adminEmail.trim() });
  };

  const displayError = error || localError;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Company Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Acme Corporation"
          className={inputClass}
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Admin Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          placeholder="e.g. admin@acme.com"
          className={inputClass}
        />
        <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
          This email will be used to log in to the platform.
        </p>
      </div>

      {displayError && (
        <p className="rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-500 dark:text-red-400">
          {displayError}
        </p>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={pending}
          className="w-full py-3 bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727] rounded-lg font-medium hover:bg-[#1a2639] dark:hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
        >
          {pending ? "Creating..." : "Create Company"}
        </button>
      </div>
    </form>
  );
}


type EditCompanyFormProps = {
  defaultValues: Partial<Company>;
  onSubmit: (data: Partial<Company>) => void;
  pending: boolean;
  error?: string;
};

export function EditCompanyForm({ defaultValues, onSubmit, pending, error }: EditCompanyFormProps) {
  const [name, setName] = useState(defaultValues.name || "");
  const [email, setEmail] = useState(defaultValues.email || "");
  const [mobile, setMobile] = useState(defaultValues.mobile_number || "");
  const [address, setAddress] = useState(defaultValues.address || "");
  const [gst, setGst] = useState(defaultValues.gst_number || "");
  const [localError, setLocalError] = useState("");

  const inputClass =
    "w-full px-4 py-3 border border-gray-200 dark:border-dark-3 rounded-lg bg-white dark:bg-dark-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0B1727]/20 dark:focus:ring-white/10 transition-all text-sm";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    if (!name.trim()) { setLocalError("Company name is required."); return; }
    onSubmit({ name, email, mobile_number: mobile, address, gst_number: gst });
  };

  const displayError = error || localError;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company Name <span className="text-red-500">*</span></label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Acme Corp" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="admin@acme.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
          <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} className={inputClass} placeholder="9876543210" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">GST Number</label>
          <input type="text" value={gst} onChange={e => setGst(e.target.value)} className={inputClass} placeholder="27AADCB2230M1Z2" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Registered Address</label>
          <input type="text" value={address} onChange={e => setAddress(e.target.value)} className={inputClass} placeholder="Full address..." />
        </div>
      </div>

      {displayError && (
        <p className="rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-500 dark:text-red-400">{displayError}</p>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={pending}
          className="w-full py-3 bg-[#0B1727] dark:bg-white text-white dark:text-[#0B1727] rounded-lg font-medium hover:bg-[#1a2639] dark:hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
        >
          {pending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
