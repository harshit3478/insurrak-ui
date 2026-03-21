import LogIn from "@/components/Auth/Login";
import type { Metadata } from "next";
import Link from "next/link";
import { Square } from "lucide-react";

export const metadata: Metadata = {
  title: "System Login | Insurrack",
  description: "Login with system administrator account.",
};

export default function SystemLoginPage() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full font-sans bg-white dark:bg-black">
      <div className="w-full lg:w-1/2 bg-black relative overflow-hidden flex flex-col justify-between p-8 lg:p-16 text-white h-auto lg:h-auto min-h-[300px] lg:min-h-0">
        <div className="absolute inset-0 bg-black z-0">
          <div className="absolute inset-0 bg-linear-to-br from-black via-gray-900 to-cyan-600 opacity-90" />
          <div className="absolute right-0 top-0 bottom-0 w-2/3 bg-linear-to-l from-cyan-600/30 via-black to-transparent opacity-10" />
        </div>

        <Link
          href="/"
          className="relative z-20 flex items-center gap-3 mb-10 lg:mb-0"
        >
          <Square className="w-4 h-4 text-white fill-white" />
          <span className="text-lg font-medium tracking-wide">Insurance</span>
        </Link>

        <div className="relative z-20 mt-auto mb-10 lg:mb-20 max-w-lg">
          <h1 className="text-4xl lg:text-5xl font-medium leading-tight text-white mb-2">
            Secure
          </h1>
          <h1 className="text-4xl lg:text-5xl font-medium leading-tight text-white mb-2">
            System Access
          </h1>
          <h1 className="text-4xl lg:text-5xl font-medium leading-tight text-white">
            for{" "}
            <span className="text-[#C6F200] font-semibold">Platform Admin</span>
          </h1>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white dark:bg-gray-dark">
        <div className="w-full max-w-md">
          <LogIn systemMode />
        </div>
      </div>
    </div>
  );
}
