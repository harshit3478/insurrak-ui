"use server";

import { cookies } from "next/headers";

/**
 * Server Actions for Authentication Session Management
 *
 * Since localStorage is inaccessible to Next.js Server Components, we use these
 * Server Actions directly from Client Components (like AuthProvider.tsx) during
 * login to synchronize the JWT token into a secure HttpOnly cookie.
 *
 * This enables Server Components (like Layouts) to read the token via `cookies()`
 * instantly, preventing unauthorized users from downloading protected JS payloads.
 */
export async function setAuthCookie(token: string, role: string) {
  const cookieStore = await cookies();

  // In non-HTTPS testing environments, Secure cookies are ignored by browsers.
  // Allow an explicit override via COOKIE_SECURE=true|false.
  const envOverride = process.env.COOKIE_SECURE;
  const secureFlag =
    envOverride === "true"
      ? true
      : envOverride === "false"
        ? false
        : process.env.NODE_ENV === "production";

  const options = {
    httpOnly: true,
    secure: secureFlag,
    maxAge: 604800, // 1 week
    path: "/",
    sameSite: "lax" as const,
  };

  cookieStore.set("token", token, options);
  cookieStore.set("role", role, options);
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  cookieStore.delete("role");
}
