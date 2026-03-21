"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PolicyDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/policies/${id}/documents`);
  }, [id, router]);

  return null;
}
