import { BREADCRUMB_MAP } from "@/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

const Breadcrumb = () => {
  const pathname = usePathname();
  const companies = useSelector((state: RootState) => state.company.companies);
  const users = useSelector((state: RootState) => state.user.items);

  const segments = pathname.split("/").filter(Boolean);
  
  const resolveLabel = (segment: string, index: number, pathSegments: string[]) => {
    // Check for static map matches first
    const fullPath = `/${pathSegments.slice(0, index + 1).join("/")}`;
    if (BREADCRUMB_MAP[fullPath]) return BREADCRUMB_MAP[fullPath];

    // Handle common segments
    if (segment === "company") return "Companies";
    if (segment === "users") return "Users";
    if (segment === "edit") return "Edit";
    if (segment === "add") return "Add New";
    if (segment === "policies") return "Policies";
    if (segment === "claims") return "Claims";

    // Try to resolve IDs
    const prevSegment = pathSegments[index - 1];
    
    // Resolve Company Name
    if (prevSegment === "company") {
      const company = companies.find(c => String(c.id) === segment || c.companyId === segment);
      if (company) return company.name;
      return "Company Details";
    }

    // Resolve User Name (handling both /users/[id] and /users/edit/[id])
    if (prevSegment === "users" || (prevSegment === "edit" && pathSegments[index - 2] === "users")) {
      const user = users.find(u => String(u.id) === segment);
      if (user) return user.name;
      return "Employee Details";
    }

    // Default formatting
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
  };

  const breadcrumbs = segments
    .map((segment, index) => {
      const label = resolveLabel(segment, index, segments);
      const path = `/${segments.slice(0, index + 1).join("/")}`;
      return { label, path, segment };
    })
    .filter(crumb => crumb.segment !== "edit");

  const currentPageTitle = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : (BREADCRUMB_MAP[pathname] || "Dashboard");

  return (
    <div className="mb-0.5 flex flex-col gap-3">
      <h1 className="text-heading-5 font-bold leading-[30px] text-dark dark:text-white">
        {currentPageTitle}
      </h1>

      <nav>
        <ol className="flex items-center gap-2">
          <li>
            <Link className="font-medium text-gray-500 hover:text-primary transition-colors" href="/">
              Insurrack
            </Link>
          </li>
          {breadcrumbs.map((crumb, idx) => (
            <li key={crumb.path} className="flex items-center gap-2 font-medium">
              <span className="text-gray-400">/</span>
              {idx === breadcrumbs.length - 1 ? (
                <span className="text-primary">{crumb.label}</span>
              ) : (
                <Link 
                  href={crumb.path}
                  className="text-gray-500 hover:text-primary transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
