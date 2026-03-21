import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types";

interface UsersState {
  items: User[];
  total: number;
  page: number;
  limit: number;
}

const initialState: UsersState = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<User[]>) {
      state.items = action.payload;
      state.total = action.payload.length;
    },

    addUser(state, action: PayloadAction<User>) {
      state.items.unshift(action.payload);
    },
    updateUser(state, action: PayloadAction<User>) {
      const idx = state.items.findIndex((u) => u.id === action.payload.id);
      if (idx >= 0) state.items[idx] = action.payload;
    },

    toggleUserActive(state, action: PayloadAction<string>) {
      const user = state.items.find((u) => u.id === action.payload);
      if (user) user.active = !user.active;
    },

    deleteUser(state, action: PayloadAction<string>) {
      state.items = state.items.filter((u) => u.id !== action.payload);
      state.total -= 1;
    },
  },
});

// const userSlice = createSlice({
//   name: "user",
//   initialState,
//   reducers: {
//     toggleActive(state, action) {
//       const u = state.items.find(x => x.id === action.payload);
//       if (u) u.active = !u.active;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // CREATE USER
//       .addCase(createUser.pending, (state) => {
//         state.loading = true;
//         state.error = undefined;
//       })
//       .addCase(createUser.fulfilled, (state, action) => {
//         state.loading = false;
//         state.items.push(action.payload);
//       })
//       .addCase(createUser.rejected, (state) => {
//         state.loading = false;
//         state.error = "Failed to create user";
//       })

//       // UPDATE USER
//       .addCase(updateUser.fulfilled, (state, action) => {
//         const idx = state.items.findIndex(u => u.id === action.payload.id);
//         if (idx >= 0) state.items[idx] = action.payload;
//       });
//   },
// });
export const { setUsers, addUser, updateUser, toggleUserActive, deleteUser } =
  userSlice.actions;
export default userSlice.reducer;
