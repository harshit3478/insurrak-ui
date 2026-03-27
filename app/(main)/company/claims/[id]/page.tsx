"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ClaimDetailRedirect() {
  const params = useParams();
  const router = useRouter();
  useEffect(() => {
    router.replace(`/company/claims/${params.id}/overview`);
  }, [params.id, router]);
  return null;
}
