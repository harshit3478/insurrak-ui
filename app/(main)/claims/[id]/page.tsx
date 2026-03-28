"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ClaimDetailRedirect() {
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (id) router.replace(`/claims/${id}/overview`);
  }, [id, router]);

  return null;
}
