import { CompanyProvider } from "@/context-provider/CompanyProvider";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CompanyProvider>{children}</CompanyProvider>;
}
