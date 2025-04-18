"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"; // Import ShadCN Dialog components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

function SignupPage() {
  const [error, setError] = useState("");
  //const [acceptedTerms, setAcceptedTerms] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    console.log(data);

    const { name, email, password, confirmPassword } = data;

    if (!isValidEmail(email as string)) {
      setError("Invalid email address");
      return;
    }

    if (!password || (password as string).length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // if (!acceptedTerms) {
    //   setError("You must accept the terms and conditions to proceed");
    //   return;
    // }

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
        }),
      });

      if (res.status === 400) {
        setError("User already exists");
      } else if (res.status === 200) {
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (result?.error) {
          setError("Error occurred. Please try again.");
        } else {
          router.push("/information");
        }
      } else {
        setError("An error occurred. Please try again.");
      }
    } catch (err) {
      setError("Error occurred. Please try again.");
      console.error(err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="bg-gray-100 p-8 h-screen">
      <div className="bg-white flex justify-center py-8 px-4 h-full rounded-lg">
        <div className="grid grid-cols-12 gap-12 w-full max-w-5xl">
          {/* Left Section */}
          <div className="col-span-12 md:col-span-6 lg:col-span-6 flex flex-col justify-start items-start">
            <Link href="/" className="flex items-center text-[#C25B3F] mb-12">
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Back to homepage</span>
            </Link>

            <div className="flex-grow flex flex-col justify-center items-center md:items-start">
              <div className="bg-[#E84C30] rounded-full w-32 h-32 flex items-center justify-center mb-8">
                <span className="text-white text-4xl font-bold">0.0</span>
              </div>

              <h2 className="text-2xl font-bold mb-4">
                Thank you for being our Beta User👋
              </h2>
              <p className="text-gray-600 max-w-md">
                We are here to identify usability issues and opportunities,
                providing insights for improving UX in your products.
              </p>

              <Link
                href="/signin"
                className="flex items-center text-[#C25B3F] mt-8"
              >
                <span>I have already an account</span>
                <ChevronLeft className="h-4 w-4 ml-2 rotate-180" />
              </Link>
            </div>
          </div>
          {/* Right Section */}
          <div className="col-span-12 md:col-span-6 lg:col-span-6">
            <div className="max-w-md mx-auto">
              {/* Progress Indicator */}
              <div className="flex items-center mb-12">
                <div className="flex items-center">
                  <div className="bg-[#C25B3F] rounded-full w-6 h-6 flex items-center justify-center">
                    <span className="text-white text-xs">1</span>
                  </div>
                  <span className="ml-2 text-sm">User Details</span>
                </div>
                <div className="h-px bg-gray-300 flex-grow mx-2"></div>
                <div className="flex items-center">
                  <div className="bg-[#E5E5E5] rounded-full w-6 h-6 flex items-center justify-center">
                    <span className="text-gray-600 text-xs">2</span>
                  </div>
                  <span className="ml-2 text-sm text-gray-400">
                    Beta User Payment
                  </span>
                </div>
              </div>

              <h1 className="text-2xl font-bold mb-8">
                Let's create an account first
              </h1>
              <form className="space-y-3" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label htmlFor="name" className="block font-medium">
                    Your full name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Type your full name"
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block font-medium">
                    Your Business Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Your business email address"
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Type your password"
                      className="w-full pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button
                  //type="submit"
                  className="w-full  bg-[#B04E34] hover:bg-[#963F28] text-white"
                  disabled
                >
                  Continue with email
                </Button>

                <div className="flex items-center my-6">
                  <div className="flex-grow h-px bg-gray-300"></div>
                  <span className="px-4 text-gray-500">or</span>
                  <div className="flex-grow h-px bg-gray-300"></div>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2 my-1 w-full"
                    type="button"
                    onClick={() => signIn("google")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      x="0px"
                      y="0px"
                      width="20"
                      height="20"
                      viewBox="0 0 48 48"
                    >
                      <path
                        fill="#fbc02d"
                        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                      ></path>
                      <path
                        fill="#e53935"
                        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                      ></path>
                      <path
                        fill="#4caf50"
                        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                      ></path>
                      <path
                        fill="#1565c0"
                        d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                      ></path>
                    </svg>
                    <span>Google</span>
                  </Button>
                </div>
              </form>
              <p className="text-sm text-gray-500 text-center mt-6">
                By registering you accept our{" "}
                <Link href="/privacy-policy" className="text-[#C25B3F]">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/terms" className="text-[#C25B3F]">
                  Terms of Use
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
