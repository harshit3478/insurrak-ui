// lib/features/user/userSelectors.ts
import type { RootState } from "@/lib/store";

export const selectUsers = (state: RootState) => state.user.items;

export const selectUsersMeta = (state: RootState) => ({
  total: state.user.total,
  page: state.user.page,
  limit: state.user.limit,
});
