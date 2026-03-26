"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddCompanyRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/system"); }, [router]);
  return null;
}
