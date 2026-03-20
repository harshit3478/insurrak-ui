import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isBypassActive } from "@/types/permissions";

export default async function CompanyProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (!isBypassActive() && (!role || !["COMPANY_ADMIN", "COMPANY_USER"].includes(role))) {
    redirect("/");
  }

  return <>{children}</>;
}
