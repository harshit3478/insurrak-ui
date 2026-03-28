"use client";
import { useState } from "react";
import { useAuth } from "@/context-provider/AuthProvider";
import { apiClient } from "@/lib/apiClient";
import { Mail, ArrowLeft, ShieldCheck } from "lucide-react";
import InputGroup from "../ui-elements/FormElements/InputGroup";

const inputClasses =
  "w-full px-4 py-3.5 bg-gray-100 border-none rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C6F200] focus:bg-white transition-all duration-200";

export default function LogIn() {
  const { requestOtp, login, loginState, isLoginPending } = useAuth();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState(
    process.env.NODE_ENV === "development" ? "harshit@gmail.com" : "harshit@gmail.com",
  );
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | undefined>();
  const [isSending, setIsSending] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);
    setOtpError(undefined);
    const result = await requestOtp(email);
    setIsSending(false);
    if (result.error) {
      setOtpError(result.error);
    } else {
      setStep("otp");
      // POC: autofill OTP so testers don't need to check server logs
      apiClient.peekOtp(email).then((res) => {
        if (res.otp) setOtp(res.otp);
      }).catch(() => {});
    }
  };

  if (step === "email") {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Welcome
          </h2>
          <p className="text-gray-500 text-sm">
            Enter your email to receive a one-time login code
          </p>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-6 mt-8">
          {otpError && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded text-sm">
              {otpError}
            </div>
          )}

          <InputGroup
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Email Address"
            inputClassName={inputClasses}
            className="mt-0! mb-0!"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            endIcon={<Mail className="h-5 w-5 text-gray-400" />}
          />

          <button
            type="submit"
            disabled={isSending || !email}
            className="w-full flex justify-center py-3 px-4 mt-5 rounded-full text-sm font-semibold text-black bg-[#C6F200] hover:bg-[#b0d600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-black border-t-transparent" />
            ) : (
              "Send Code"
            )}
          </button>
        </form>
      </div>
    );
  }

  // Step 2: OTP entry
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-6 h-6 text-[#C6F200]" />
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
            Check your email
          </h2>
        </div>
        <p className="text-gray-500 text-sm">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-gray-400">{email}</span>
        </p>
      </div>

      <form action={login} className="space-y-6 mt-8">
        {/* Pass email as hidden field so the form action can read it */}
        <input type="hidden" name="email" value={email} />

        {(loginState.error || otpError) && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded text-sm">
            {loginState.error || otpError}
          </div>
        )}

        <InputGroup
          id="otp"
          name="otp"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          autoComplete="one-time-code"
          required
          placeholder="000000"
          inputClassName={`${inputClasses} text-center text-2xl tracking-[0.5em] font-mono`}
          className="mt-0! mb-0!"
          autoFocus
          value={otp}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtp(e.target.value)}
        />

        <button
          type="submit"
          disabled={isLoginPending}
          className="w-full flex justify-center py-3 px-4 mt-5 rounded-full text-sm font-semibold text-black bg-[#C6F200] hover:bg-[#b0d600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoginPending ? (
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-black border-t-transparent" />
          ) : (
            "Verify & Sign In"
          )}
        </button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setOtpError(undefined);
            }}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Change email
          </button>
          <button
            type="button"
            onClick={async () => {
              setOtpError(undefined);
              setOtp("");
              const result = await requestOtp(email);
              if (result.error) {
                setOtpError(result.error);
              } else {
                apiClient.peekOtp(email).then((res) => {
                  if (res.otp) setOtp(res.otp);
                }).catch(() => {});
              }
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            Resend code
          </button>
        </div>
      </form>
    </div>
  );
}
