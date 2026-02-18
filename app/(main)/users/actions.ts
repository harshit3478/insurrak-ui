"use server";

import { apiClient } from "@/lib/apiClient";

export async function fetchUsers(
  page: number,
  limit: number,
  search?: string,
) {
//   return apiClient.getAll({ page, limit, search });
  return apiClient.getAll();
}
