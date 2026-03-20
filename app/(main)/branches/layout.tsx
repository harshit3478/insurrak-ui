import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isBypassActive } from "@/types/permissions";
import { BranchesProvider } from "@/context-provider/BranchProvider";

export default async function BranchesLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (!isBypassActive() && (!role || !["COMPANY_ADMIN", "COMPANY_USER"].includes(role))) {
    redirect("/");
  }

  return <BranchesProvider>{children}</BranchesProvider>;
}
