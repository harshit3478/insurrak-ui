import { UsersProvider } from "@/context-provider/UserProvider";


export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UsersProvider>{children}</UsersProvider>;
}
