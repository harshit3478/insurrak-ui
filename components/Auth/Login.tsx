"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context-provider/AuthProvider";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import InputGroup from "../ui-elements/FormElements/InputGroup";

interface LogInProps {
  systemMode?: boolean;
}

export default function LogIn({ systemMode = false }: LogInProps) {
  const { loginState, login, isLoginPending } = useAuth();
  // const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  //   useEffect(() => {
  //   if (loginState.success) {
  //     router.replace("/dashboard");
  //   }
  // }, [loginState.success]);
  // const [data, setData] = useState({
  //   email: process.env.NEXT_PUBLIC_DEMO_USER_MAIL || "",
  //   password: process.env.NEXT_PUBLIC_DEMO_USER_PASS || "",
  //   remember: false,
  // });

  const inputClasses =
    "w-full px-4 py-3.5 bg-gray-100 border-none rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C6F200] focus:bg-white transition-all duration-200 dark:bg-form-input dark:text-gray-900 dark:focus:text-white dark:focus:bg-gray-dark";

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight dark:text-white">
          {systemMode ? "System Login" : "Welcome"}
        </h2>
        <p className="text-gray-500 text-sm dark:text-dark-6">
          {systemMode
            ? "Sign in with system account credentials"
            : "Enter your login details to continue"}
        </p>
      </div>

      <form action={login} className="space-y-6 mt-8">
        <input
          type="hidden"
          name="system_login"
          value={systemMode ? "true" : "false"}
        />
        {loginState.error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded">
            {loginState.error}
          </div>
        )}
        <div className="space-y-4">
          <InputGroup
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            placeholder="Username"
            inputClassName={inputClasses}
            className="mt-0! mb-0!"
          />

          <InputGroup
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="Password"
            inputClassName={`${inputClasses} pr-12`}
            className="mt-0! mb-0!"
            endIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            }
          />
        </div>

        <div className="flex items-center justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-sm font-medium text-primary hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isLoginPending}
            className="w-24 flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-semibold text-black bg-[#C6F200] hover:bg-[#b0d600] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C6F200] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoginPending ? (
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-black border-t-transparent" />
            ) : (
              "Log In"
            )}
          </button>
          {systemMode ? (
            <p className="text-sm text-gray-500 dark:text-dark-6">
              Use normal user login?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-primary hover:underline"
              >
                Back to Login
              </Link>
            </p>
          ) : (
            <Link
              href="/auth/system-login"
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-dark-3 dark:text-dark-7 dark:hover:bg-dark-2"
            >
              <ShieldCheck className="h-4 w-4" />
              Login as System
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}
