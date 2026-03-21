"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FormSection, FormInput, Stepper } from "@/components/ui/FormCommon";
import { Company } from "@/types";
import { User, Plus } from "lucide-react";

type CompanyFormProps = {
  action: (formData: FormData) => void;
  pending: boolean;
  defaultValues?: Partial<Company>;
  isEdit?: boolean;
};

interface AdminData {
  username: string;
  name: string;
  email: string;
  designation: string;
  phone: string;
  password?: string;
}

/**
 * CompanyForm is a multi-step component for onboarding or updating corporate
 * entities. It captures extensive company metadata (Step 1) and administrative
 * user details (Step 2) to establish a firm's operational presence on the platform.
 */
export function CompanyForm({
  action,
  pending,
  defaultValues,
  isEdit = false,
}: CompanyFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, startTransition] = useTransition();
  const [formError, setFormError] = useState("");

  // Company Data State
  const [formData, setFormData] = useState({
    name: defaultValues?.name || "",
    companyId: defaultValues?.companyId || "",
    // Includes extensive field mappings for company metadata, including head office
    // and policy detail placeholders for future data parity.
    pan: "",
    website: "",
    logo: "",
    address: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    email: defaultValues?.email || "",
    mobile_number: defaultValues?.mobile_number || "",
    gst_number: defaultValues?.gst_number || "",
    // Fields that ARE in the company type
    admin: defaultValues?.admin || "",
    adminEmail: defaultValues?.adminEmail || "",
    branches: defaultValues?.branches || "",
    activePolicies: defaultValues?.activePolicies || "",
  });

  // Admin Data State
  const [admins, setAdmins] = useState<AdminData[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<AdminData>({
    username: "",
    name: "",
    email: "",
    designation: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    if (isEdit && defaultValues) {
      // If editing, and there's an admin, populate the admins list
      if (defaultValues.admin && defaultValues.adminEmail) {
        setAdmins([
          {
            username: defaultValues.admin,
            name: defaultValues.admin,
            email: defaultValues.adminEmail,
            designation: "Admin",
            phone: "",
          },
        ]);
      }
    }
  }, [isEdit, defaultValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentAdmin({ ...currentAdmin, [e.target.name]: e.target.value });
  };

  const handleAddAdmin = () => {
    if (
      currentAdmin.username &&
      currentAdmin.email &&
      (isEdit || currentAdmin.password)
    ) {
      setAdmins([...admins, currentAdmin]);
      setCurrentAdmin({
        username: "",
        name: "",
        email: "",
        designation: "",
        phone: "",
        password: "",
      });
    }
  };

  const handleSubmit = () => {
    setFormError("");
    const finalFormData = new FormData();
    // Append company details
    finalFormData.append("name", formData.name);
    finalFormData.append("companyId", formData.companyId);
    finalFormData.append("email", formData.email);
    finalFormData.append("mobile_number", formData.mobile_number);
    finalFormData.append("address", formData.address);
    finalFormData.append("gst_number", formData.gst_number);
    finalFormData.append("branches", formData.branches);
    finalFormData.append("activePolicies", formData.activePolicies);
    finalFormData.append("website", formData.website || "");
    finalFormData.append("state", formData.state || "");
    finalFormData.append("city", formData.city || "");
    finalFormData.append("pincode", formData.pincode || "");

    // Maps the primary administrator for the company. The backend currently supports a single administrative entity per firm.
    const primaryAdmin = admins[0];
    if (!isEdit && !primaryAdmin) {
      setFormError("Please add one company superadmin before finishing.");
      return;
    }
    finalFormData.append(
      "admin",
      primaryAdmin
        ? primaryAdmin.username || primaryAdmin.name
        : formData.admin,
    );
    finalFormData.append(
      "adminName",
      primaryAdmin ? primaryAdmin.name : formData.admin,
    );
    finalFormData.append(
      "adminEmail",
      primaryAdmin ? primaryAdmin.email : formData.adminEmail,
    );
    finalFormData.append(
      "adminDesignation",
      primaryAdmin ? primaryAdmin.designation : "",
    );
    finalFormData.append("adminPhone", primaryAdmin ? primaryAdmin.phone : "");
    if (!isEdit) {
      finalFormData.append("adminPassword", primaryAdmin?.password || "");
    }

    startTransition(() => {
      action(finalFormData);
    });
  };

  const handleNext = () => {
    if (isEdit) {
      handleSubmit();
      return;
    }

    if (step === 1) {
      setStep(2);
      window.scrollTo(0, 0);
    } else {
      handleSubmit();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-dark p-8 rounded-2xl border border-gray-200 dark:border-dark-3 shadow-sm">
      {!isEdit && <Stepper steps={2} currentStep={step} />}

      {step === 1 || isEdit ? (
        /* STEP 1: Company Details */
        <div className="flex flex-col lg:flex-row gap-12 mt-8">
          <div className="flex-1">
            <FormSection title="Basic Details">
              <FormInput
                label="Company Name*"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <FormInput
                label="Corporate Identification Number*"
                name="companyId"
                value={formData.companyId}
                onChange={handleChange}
                required
              />
              <FormInput
                label="Company Website"
                name="website"
                value={formData.website}
                onChange={handleChange}
              />
              <FormInput
                label="Company Email*"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <FormInput
                label="Mobile Number"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
              />
              <FormInput
                label="GST Number"
                name="gst_number"
                value={formData.gst_number}
                onChange={handleChange}
                placeholder="e.g. 27AADCB2230M1Z2"
              />
              <FormInput
                label="Company Logo"
                name="logo"
                value={formData.logo}
                onChange={handleChange}
                placeholder="Upload logo..."
              />
            </FormSection>
          </div>
          <div className="hidden lg:block w-px bg-gray-100 dark:bg-dark-3" />
          <div className="flex-1">
            <FormSection title="Head Office & Policy Details">
              <FormInput
                label="Registered Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
              <FormInput
                label="Branches"
                name="branches"
                value={formData.branches}
                onChange={handleChange}
                required
              />
              <FormInput
                label="Active Policies"
                name="activePolicies"
                value={formData.activePolicies}
                onChange={handleChange}
                required
              />
            </FormSection>
          </div>
        </div>
      ) : (
        /* STEP 2: Admin Details */
        <div className="flex flex-col lg:flex-row gap-12 mt-8">
          {/* Left Column - List of Admins */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Admins
            </h3>
            <div className="space-y-4 mb-6">
              {admins.map((admin, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 border border-gray-100 dark:border-dark-3 rounded-lg bg-gray-50 dark:bg-dark-2"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-dark-3 flex items-center justify-center text-gray-500">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {admin.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-dark-6">
                      {admin.email}
                    </div>
                  </div>
                </div>
              ))}
              {admins.length === 0 && (
                <p className="text-sm text-gray-500">No admins added yet.</p>
              )}
            </div>
          </div>

          <div className="hidden lg:block w-px bg-gray-100 dark:bg-dark-3" />

          {/* Right Column - Admin Form */}
          <div className="flex-1">
            <FormSection title="Add Admin Details">
              <FormInput
                label="Username* (login handle)"
                name="username"
                value={currentAdmin.username}
                onChange={handleAdminChange}
                placeholder="e.g. john.doe"
              />
              <FormInput
                label="Full Name"
                name="name"
                value={currentAdmin.name}
                onChange={handleAdminChange}
              />
              <FormInput
                label="Email Address*"
                name="email"
                type="email"
                value={currentAdmin.email}
                onChange={handleAdminChange}
              />
              {!isEdit && (
                <FormInput
                  label="Password*"
                  name="password"
                  type="password"
                  value={currentAdmin.password}
                  onChange={handleAdminChange}
                />
              )}
              <FormInput
                label="Designation"
                name="designation"
                value={currentAdmin.designation}
                onChange={handleAdminChange}
              />
              <FormInput
                label="Phone Number"
                name="phone"
                value={currentAdmin.phone}
                onChange={handleAdminChange}
              />

              <div className="mt-8">
                <button
                  type="button"
                  onClick={handleAddAdmin}
                  className="px-8 py-3 bg-[#0B1727] text-white rounded-lg font-medium hover:bg-[#1a2639] transition-colors w-full sm:w-auto"
                >
                  Add Admin
                </button>
              </div>
            </FormSection>
          </div>
        </div>
      )}

      <div className="mt-12 pt-6 border-t border-gray-200 dark:border-dark-3 flex justify-start gap-4">
        <button
          type="button"
          onClick={handleNext}
          disabled={pending || isSubmitting}
          className="px-8 py-3 bg-[#0B1727] text-white rounded-lg font-medium hover:bg-[#1a2639] transition-colors"
        >
          {pending || isSubmitting
            ? "Saving..."
            : isEdit
              ? "Save Company Details"
              : step === 1
                ? "Next"
                : "Finish"}
        </button>
        <button
          type="button"
          onClick={step === 1 ? () => router.back() : () => setStep(step - 1)}
          className="px-8 py-3 border border-gray-200 dark:border-dark-3 text-gray-600 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors"
        >
          {isEdit || step === 1 ? "Cancel" : "Back"}
        </button>
      </div>
      {formError && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20">
          {formError}
        </p>
      )}
    </div>
  );
}
