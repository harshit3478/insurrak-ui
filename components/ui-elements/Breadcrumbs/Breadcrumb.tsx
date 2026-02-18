import { BREADCRUMB_MAP } from "@/types";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Breadcrumb = () => {
  const pathname = usePathname();
  const pageName =
    BREADCRUMB_MAP[pathname] ??
    pathname.split("/").at(-1)?.replace(/-/g, " ") ??
    "Page";

  return (
    <div className="mb-0.5 flex flex-col gap-3">
      <h1 className="text-heading-5 font-bold leading-[30px] text-dark dark:text-white">
        {pageName}
      </h1>

      <nav>
        <ol className="flex items-center gap-2">
          <li>
            <Link className="font-medium" href="/">
              Insurrack /
            </Link>
          </li>
          <li className="font-medium text-primary">{pageName}</li>
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
