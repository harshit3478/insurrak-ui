import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MainAppLayoutClientWrapper } from "@/components/Layouts/MainAppLayoutClientWrapper";

export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  return <MainAppLayoutClientWrapper>{children}</MainAppLayoutClientWrapper>;
}
