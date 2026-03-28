import SignUp from "@/components/Auth/Signup";
import type { Metadata } from "next";
import Link from "next/link";
import { Square } from "lucide-react";

export const metadata: Metadata = {
  title: "Request Access | Insurrack",
  description: "Request company access to the Insurrack platform.",
};

export default function SignupPage() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full font-sans bg-white dark:bg-black">
      {/* Left Section - Hero/Brand */}
      <div className="w-full lg:w-1/2 bg-black relative overflow-hidden flex flex-col justify-between p-8 lg:p-16 text-white h-auto lg:h-auto min-h-[300px] lg:min-h-0">
        <div className="absolute inset-0 bg-black z-0">
          <div className="absolute inset-0 bg-linear-to-br from-black via-gray-900 to-cyan-600 opacity-90" />
          <div className="absolute right-0 top-0 bottom-0 w-2/3 bg-linear-to-l from-cyan-600/30 via-black to-transparent opacity-10" />
        </div>

        <Link href="/" className="relative z-20 flex items-center gap-3 mb-10 lg:mb-0">
          <Square className="w-4 h-4 text-white fill-white" />
          <span className="text-lg font-medium tracking-wide">Insurance</span>
        </Link>

        <div className="relative z-20 mt-auto mb-10 lg:mb-20 max-w-lg">
          <h1 className="text-4xl lg:text-5xl font-medium leading-tight text-white mb-2">
            Get Your
          </h1>
          <h1 className="text-4xl lg:text-5xl font-medium leading-tight text-white mb-2">
            Company Onboard
          </h1>
          <h1 className="text-4xl lg:text-5xl font-medium leading-tight text-white">
            with{" "}
            <span className="text-[#C6F200] font-semibold">
              InsurRack
            </span>
          </h1>
          <p className="mt-6 text-gray-400 text-base max-w-sm">
            Submit a request and our team will set up your account within 24 hours.
          </p>
        </div>
      </div>

      {/* Right Section - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white dark:bg-gray-dark overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <SignUp />
        </div>
      </div>
    </div>
  );
}
