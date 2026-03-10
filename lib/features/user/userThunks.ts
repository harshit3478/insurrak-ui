import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/apiClient";
import { Role } from "@/types";

export const createUser = createAsyncThunk(
  "users/create",
  async (formData: FormData) => {
    return await apiClient.createUser({
      name: String(formData.get("name")),
      email: String(formData.get("email")),
      role: formData.get("role") as Role,
      password: String(formData.get("password")),
    });
  },
);

export const updateUser = createAsyncThunk(
  "users/update",
  async ({
    id,
    data,
  }: {
    id: string;
    data: {
      name: string;
      email: string;
      password?: string;
      role: Role;
    };
  }) => {
    return await apiClient.updateProfile(id, data);
  },
);
