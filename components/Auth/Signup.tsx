"use client";
import Link from "next/link";
import InputGroup from "../ui-elements/FormElements/InputGroup";
import { Checkbox } from "../ui-elements/FormElements/checkbox";
import { EmailIcon, PasswordIcon, UserIcon } from "@/assets/icons";
import { useAuth } from "@/context-provider/AuthProvider";

export default function SignUp() {
  const { signupState, signup, isSignupPending } = useAuth();
  // const [data, setData] = useState({
  //     fullName: "",
  //     email: process.env.NEXT_PUBLIC_DEMO_USER_MAIL || "",
  //     password: process.env.NEXT_PUBLIC_DEMO_USER_PASS || "",
  //     remember: false,
  //   });

  //   const [loading, setLoading] = useState(false);

  //   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     setData({
  //       ...data,
  //       [e.target.name]: e.target.value,
  //     });
  //   };

  //   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //     e.preventDefault();

  //     // You can remove this code block
  //     setLoading(true);

  //     setTimeout(() => {
  //       setLoading(false);
  //     }, 1000);
  //   };
  return (
    <>
      <div>
        <form action={signup}>
          {signupState.error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded mb-4">
              {signupState.error}
            </div>
          )}
          <InputGroup
            type="name"
            label="Full Name"
            className="mb-4 [&_input]:py-[15px]"
            placeholder="Enter your name"
            name="name"
            icon={<UserIcon />}
          />
          <InputGroup
            type="email"
            label="Email"
            className="mb-4 [&_input]:py-[15px]"
            placeholder="Enter your email"
            name="email"
            icon={<EmailIcon />}
          />

          <InputGroup
            type="password"
            label="Password"
            className="mb-5 [&_input]:py-[15px]"
            placeholder="Enter your password"
            name="password"
            icon={<PasswordIcon />}
          />

          <div className="mb-6 flex items-center justify-between gap-2 py-2 font-medium">
            <Checkbox
              label="Remember me"
              name="remember"
              withIcon="check"
              minimal
              radius="md"
            />

            <Link
              href="/auth/forgot-password"
              className="hover:text-primary dark:text-white dark:hover:text-primary"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="mb-4.5">
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90"
            >
              Sign Up
              {isSignupPending && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-primary dark:border-t-transparent" />
          )}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 text-center">
        <p>
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary">
            Login
          </Link>
        </p>
      </div>
    </>
  );
}
