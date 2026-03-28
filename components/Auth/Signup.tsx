"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";

const inputClasses =
  "w-full px-4 py-3 bg-gray-100 border-none rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C6F200] focus:bg-white transition-all duration-200 text-sm";

const labelClasses = "block text-xs font-medium text-gray-500 mb-1.5";

interface FormData {
  company_name: string;
  admin_name: string;
  admin_email: string;
  admin_phone: string;
  address: string;
  gst_number: string;
  message: string;
}

const emptyForm: FormData = {
  company_name: "",
  admin_name: "",
  admin_email: "",
  admin_phone: "",
  address: "",
  gst_number: "",
  message: "",
};

export default function SignUp() {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setSubmitting(true);
    try {
      await apiClient.submitRegistrationRequest({
        company_name: form.company_name.trim(),
        admin_name: form.admin_name.trim(),
        admin_email: form.admin_email.trim(),
        admin_phone: form.admin_phone.trim() || null,
        address: form.address.trim() || null,
        gst_number: form.gst_number.trim() || null,
        message: form.message.trim() || null,
      });
      setSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6 text-center py-6">
        <div className="flex justify-center">
          <CheckCircle2 className="w-16 h-16 text-[#C6F200]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Request Submitted!</h2>
          <p className="text-gray-500 text-sm">
            Your company registration request is under review.
          </p>
          <p className="text-gray-400 text-sm">
            We&apos;ll reach out to{" "}
            <span className="font-medium text-gray-600">{form.admin_email}</span>{" "}
            once your account is approved.
          </p>
        </div>
        <p className="text-xs text-gray-400">
          Typical review time: <span className="font-medium">within 24 hours</span>
        </p>
        <Link
          href="/auth/login"
          className="inline-block mt-4 text-sm font-medium text-gray-700 hover:text-gray-900 underline underline-offset-2"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Request Company Access
        </h2>
        <p className="text-gray-500 text-sm">
          Fill in your details and we&apos;ll set up your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Company Information */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Company Details
          </p>

          <div>
            <label htmlFor="company_name" className={labelClasses}>
              Company Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="company_name"
                type="text"
                required
                placeholder="Acme Corp Ltd."
                value={form.company_name}
                onChange={set("company_name")}
                className={inputClasses}
              />
              <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="gst_number" className={labelClasses}>
                GST Number
              </label>
              <div className="relative">
                <input
                  id="gst_number"
                  type="text"
                  placeholder="22AAAAA0000A1Z5"
                  value={form.gst_number}
                  onChange={set("gst_number")}
                  className={inputClasses}
                />
                <FileText className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label htmlFor="admin_phone" className={labelClasses}>
                Phone Number
              </label>
              <div className="relative">
                <input
                  id="admin_phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.admin_phone}
                  onChange={set("admin_phone")}
                  className={inputClasses}
                />
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="address" className={labelClasses}>
              Company Address
            </label>
            <div className="relative">
              <input
                id="address"
                type="text"
                placeholder="123 Business Park, Mumbai"
                value={form.address}
                onChange={set("address")}
                className={inputClasses}
              />
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Admin Information */}
        <div className="space-y-3 pt-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Admin Contact
          </p>

          <div>
            <label htmlFor="admin_name" className={labelClasses}>
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="admin_name"
                type="text"
                required
                placeholder="Rajesh Kumar"
                value={form.admin_name}
                onChange={set("admin_name")}
                className={inputClasses}
              />
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="admin_email" className={labelClasses}>
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="admin_email"
                type="email"
                required
                placeholder="rajesh@acmecorp.com"
                value={form.admin_email}
                onChange={set("admin_email")}
                className={inputClasses}
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Optional message */}
        <div>
          <label htmlFor="message" className={labelClasses}>
            Additional Notes
          </label>
          <div className="relative">
            <textarea
              id="message"
              rows={3}
              placeholder="Tell us about your insurance requirements..."
              value={form.message}
              onChange={set("message")}
              className={`${inputClasses} resize-none`}
            />
            <MessageSquare className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex justify-center py-3 px-4 rounded-full text-sm font-semibold text-black bg-[#C6F200] hover:bg-[#b0d600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {submitting ? (
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-black border-t-transparent" />
          ) : (
            "Submit Request"
          )}
        </button>

        <p className="text-center text-xs text-gray-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-gray-600 hover:text-gray-900">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
