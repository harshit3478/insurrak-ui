"use client";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import userReducer from "./features/user/userSlice";
import companyReducer from "./features/company/companySlice";
import notificationReducer from "./features/notification/notificationSlice";
import policyReducer from "./features/policy/policySlice";
import claimReducer from "./features/claim/claimSlice";
import renewalReducer from "./features/renewal/renewalSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    company: companyReducer,
    notification: notificationReducer,
    policy: policyReducer,
    claim: claimReducer,
    renewal: renewalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
