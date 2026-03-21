import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isBypassActive } from "@/types/permissions";
import { CompanyProvider } from "@/context-provider/CompanyProvider";

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (!isBypassActive() && (!role || !["SUPER_ADMIN"].includes(role))) {
    redirect("/");
  }

  return <CompanyProvider>{children}</CompanyProvider>;
}
