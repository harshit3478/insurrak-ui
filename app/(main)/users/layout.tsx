import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isBypassActive } from "@/types/permissions";
import { UsersProvider } from "@/context-provider/UserProvider";

export default async function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (!isBypassActive() && (!role || !["SUPER_ADMIN", "COMPANY_ADMIN"].includes(role))) {
    redirect("/");
  }

  return (
    <UsersProvider>{children}</UsersProvider>
  );
}
