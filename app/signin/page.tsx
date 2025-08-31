"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import LoadingOverlay from "@/components/layout/LoadingOverlay";
import Logo_O from "@/components/layout/Logo_O";
import googleIcon from "@/public/google.svg";
import Image from "next/image";

function LoginPage() {
  const [error, setError] = useState("");
  const router = useRouter();
  const { status } = useSession();

  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!isValidEmail(email)) {
      setError("Invalid email address");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setRequesting(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setRequesting(false);
    } else {
      setError("");
      if (res?.url) router.replace(res.url); // Redirect to the URL provided by the server
    }
  };

  if (requesting) return <LoadingOverlay message="Signin in..." />;

  return (
    <div className="bg-gray-100 p-8 h-screen">
      <div className="bg-white flex justify-center py-8 px-4 h-full rounded-lg">
        <div className="grid grid-cols-2 gap-4 w-full max-w-5xl">
          {/* Left Section */}
          <div className="flex-grow flex flex-col justify-start items-center md:items-start">
            <Link href="/" className="flex items-center text-[#C25B3F] mb-12">
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Back to landing</span>
            </Link>
            <Logo_O />

            <h2 className="text-2xl font-bold mb-4">Thank you for joining us! 👋</h2>
            <p className="text-gray-600 max-w-md">
              We are here to identify usability issues and opportunities, providing insights for improving UX in your
              products.
            </p>

            <Link href="/signup" className="flex items-center text-[#C25B3F] mt-8">
              <span>I don&apos;t have an account</span>
              <ChevronLeft className="h-4 w-4 ml-2 rotate-180" />
            </Link>
          </div>
          {/* Right Section */}
          <div className="flex justify-center mt-6 px-4">
            <div className="p-6 w-full max-w-md bg-white">
              <h1 className="text-xl  font-bold mt-4 mb-3">Lets sign you in</h1>

              <form className="space-y-3" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block font-medium">
                    Your Business Email
                  </label>
                  <Input type="email" name="email" placeholder="Enter email address" className="w-full" />
                </div>
                <div>
                  <label htmlFor="password" className="block font-medium">
                    Password
                  </label>
                  <Input type="password" name="password" placeholder="Enter password" className="w-full" />
                </div>
                <div className="flex justify-center mb-4">
                  <a href="#" className="text-sm text-gray-500 underline hover:text-indigo-500">
                    Forgot password?
                  </a>
                </div>
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    type="submit"
                    className="w-full  bg-[#B04E34] hover:bg-[#963F28] text-white">
                    Log in with email
                  </Button>
                </div>
                <p className="text-sm text-red-500 text-center mt-2">{error && error}</p>
                <div className="flex items-center mb-4">
                  <div className="flex-grow h-px bg-gray-300" />
                  <span className="text-sm text-gray-500 mx-2">or continue with</span>
                  <div className="flex-grow h-px bg-gray-300" />
                </div>
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2 my-1 w-full"
                    type="button"
                    onClick={() => signIn("google")}>
                    <Image src={googleIcon} alt="Google" width={24} height={24} />
                    <span>Google</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
