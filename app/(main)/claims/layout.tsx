import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isBypassActive } from "@/types/permissions";
import { ClaimsProvider } from "@/context-provider/ClaimProvider";

export default async function ClaimsLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (
    !isBypassActive() &&
    (!role || !["COMPANY_ADMIN", "BRANCH_ADMIN", "COMPANY_USER"].includes(role))
  ) {
    redirect("/");
  }

  return <ClaimsProvider>{children}</ClaimsProvider>;
}
