"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import LoadingOverlay from "@/components/layout/LoadingOverlay";
import Logo_O from "@/components/layout/Logo_O";
import { STORAGE_KEY_FOR_PAYMENT } from "@/constants/common.constants";
import StepperProgressBar from "@/components/layout/StepperProgressBar";
import googleIcon from "@/public/google.svg";
import Image from "next/image";

function SignupPage() {
  const [error, setError] = useState("");
  const router = useRouter();
  const { status } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  // const [isVerificationEmailSent, setIsVerificationEmailSent] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [showProgressBar, setShowProgressBar] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  useEffect(() => {
    const storedItem = window.sessionStorage.getItem(STORAGE_KEY_FOR_PAYMENT);
    setShowProgressBar(!!storedItem);
  }, []);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    const { name, email, password } = data;

    if (!isValidEmail(email as string)) {
      setError("Invalid email address");
      return;
    }
    if (!email || !password) {
      setError("Email and password are required");
    }

    if (!password || (password as string).length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setStatusMessage("Creating your account...");

    // Call BE API Endpoint to create a new user.
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
        }),
      });

      if (res.status === 409) {
        setError("User already exists");
        setStatusMessage("");
      } else if (res.status === 200) {
        setStatusMessage("Account created successfully! Redirecting...");
        await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
      } else {
        setError("An error occurred. Please try again.");
      }
    } catch (err) {
      setError("Error occurred. Please try again.");
      setStatusMessage("");
      console.error(err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (statusMessage) return <LoadingOverlay message={statusMessage} />;

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

            <Link href="/signin" className="flex items-center text-[#C25B3F] mt-8">
              <span>I have already an account</span>
              <ChevronLeft className="h-4 w-4 ml-2 rotate-180" />
            </Link>
          </div>
          {/* Right Section */}

          {/* {isVerificationEmailSent ? (
            <div className="col-span-12 md:col-span-6 lg:col-span-6">
              <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold mb-8">Verify your email</h1>
                <p className="text-gray-600 mb-4">
                  We have sent a verification link to your email address. Please, go to your email and verify your
                  email, then we will direct you here again!
                </p>
              </div>
            </div>
          ) : ( */}
          <div className="flex flex-col justify-start mt-6 px-4">
            {showProgressBar && (
              <StepperProgressBar steps={[{ label: "Register" }, { label: "Report Payment" }]} activeStepIndex={0} />
            )}
            <div className="p-6 w-full max-w-md bg-white">
              <h1 className="text-2xl font-bold mb-8">Let&apos;s create an account first</h1>
              <form className="space-y-3" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label htmlFor="name" className="block font-medium">
                    Your full name
                  </label>
                  <Input id="name" name="name" placeholder="Type your full name" className="w-full" required />
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
                      className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button type="submit" className="w-full  bg-[#B04E34] hover:bg-[#963F28] text-white">
                  Create Account
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
                    onClick={() => signIn("google")}>
                    <Image src={googleIcon} alt="Google" width={24} height={24} />
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
          {/* )} */}
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
