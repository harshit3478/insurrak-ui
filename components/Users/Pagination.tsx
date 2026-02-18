"use client";

import { useRouter } from "next/navigation";

export function Pagination({
  total,
  page,
  limit,
}: {
  total: number;
  page: number;
  limit: number;
}) {
  const router = useRouter();
  const pages = Math.ceil(total / limit);

  return (
    <div className="flex gap-2 justify-end">
      {Array.from({ length: pages }).map((_, i) => (
        <button
          key={i}
          onClick={() => router.push(`/users?page=${i + 1}`)}
          className={i + 1 === page ? "font-bold" : ""}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}
