import { redirect } from "next/navigation";

// Password-based first-login flow has been replaced by OTP login.
export default function SetPasswordPage() {
  redirect("/auth/login");
}
