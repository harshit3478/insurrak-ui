"use client";
import { Provider } from "react-redux";
import { store } from "../lib/store";
import { useEffect } from "react";
import { hydrate } from "../lib/features/auth/authSlice";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    store.dispatch(hydrate());
  }, []);
  return <Provider store={store}>{children}</Provider>;
}
