import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isBypassActive } from "@/types/permissions";
import { PoliciesProvider } from "@/context-provider/PolicyProvider";

export default async function PoliciesLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (
    !isBypassActive() &&
    (!role || !["COMPANY_ADMIN", "BRANCH_ADMIN", "COMPANY_USER"].includes(role))
  ) {
    redirect("/");
  }

  return <PoliciesProvider>{children}</PoliciesProvider>;
}
