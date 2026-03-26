"use client";
import Link from "next/link";

export default function SignUp() {
  return (
    <div className="space-y-6 text-center">
      <p className="text-gray-600">
        Self-registration is not available. Please contact your administrator to get access.
      </p>
      <Link
        href="/auth/login"
        className="inline-block text-sm font-medium text-primary hover:underline"
      >
        Back to Login
      </Link>
    </div>
  );
}
