"use client";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import userReducer from "./features/user/userSlice";
import companyReducer from "./features/company/companySlice";
import notificationReducer from "./features/notification/notificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    company: companyReducer,
    notification: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
