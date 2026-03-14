"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/lib/store";

export default function DashboardRedirect() {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();

  if (!user) return null;

  switch (user.role) {
    case "SUPER_ADMIN":
      router.replace("/dashboard/admin");
      break;
    case "COMPANY_ADMIN":
      router.replace("/dashboard/manager");
      break;
    default:
      router.replace("/dashboard/user");
  }

  return null;
}
