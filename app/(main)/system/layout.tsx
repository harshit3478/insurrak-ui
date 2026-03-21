import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RoleGuard } from "@/components/RoleGuard";
import { CompanyProvider } from "@/context-provider/CompanyProvider";

export default async function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const role = cookieStore.get("role")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  // Server-side guard: system operations are SUPER_ADMIN only.
  if (role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return (
    <CompanyProvider>
      <RoleGuard allowedRoles={["SUPER_ADMIN"]} disableBypass>
        {children}
      </RoleGuard>
    </CompanyProvider>
  );
}
