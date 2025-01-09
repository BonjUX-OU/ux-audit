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

function SignupPage() {
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/information");
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

    if (!acceptedTerms) {
      setError("You must accept the terms and conditions to proceed");
      return;
    }

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

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="p-6 w-full max-w-md bg-white shadow-md rounded-md">
        <h1 className="text-xl text-center font-bold mt-4 mb-3">
          Create an account
        </h1>
        <p className="text-base text-center mb-6">
          Enter your details to sign up for this app
          <br />
        </p>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <Input
              type="name"
              name="name"
              placeholder="Enter full name"
              className="w-full"
            />
          </div>
          <div>
            <Input
              type="email"
              name="email"
              placeholder="Enter email address"
              className="w-full"
            />
          </div>
          <div>
            <Input
              type="password"
              name="password"
              placeholder="New password"
              className="w-full"
            />
          </div>
          <div>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              className="w-full"
            />
          </div>
          <div className="flex justify-center">
            <Button
              variant="outline"
              type="submit"
              className="mb-1 bg-indigo-500 text-white w-full"
            >
              Sign up with email
            </Button>
          </div>
          <p className="text-sm text-red-500 text-center mt-2">
            {error && error}
          </p>
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
          <div className="flex justify-center items-center space-x-4">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked: any) => setAcceptedTerms(!!checked)}
            />
            <p className="text-sm text-center text-gray-500">
              I have read and agree to the
              <br />
              <Dialog>
                <DialogTrigger asChild>
                  <a className="text-sm text-gray-500 underline hover:text-indigo-500">
                    Terms of Service
                  </a>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Terms of Service</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    By signing up, you agree to the{" "}
                    <a
                      href="/terms"
                      className="text-indigo-500 underline hover:text-indigo-700"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      className="text-indigo-500 underline hover:text-indigo-700"
                    >
                      Privacy Policy
                    </a>
                    .
                  </DialogDescription>
                </DialogContent>
              </Dialog>{" "}
              and{" "}
              <Dialog>
                <DialogTrigger asChild>
                  <a className="text-sm text-gray-500 underline hover:text-indigo-500">
                    Privacy Policy
                  </a>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Privacy Policy</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    By signing up, you agree to the{" "}
                    <a
                      href="/terms"
                      className="text-indigo-500 underline hover:text-indigo-700"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      className="text-indigo-500 underline hover:text-indigo-700"
                    >
                      Privacy Policy
                    </a>
                    .
                  </DialogDescription>
                </DialogContent>
              </Dialog>
            </p>
          </div>
        </form>
        <p className="text-base text-center mb-3 mt-6">
          If you have an existing account,{" "}
          <a href="/login" className="font-bold text-indigo-500">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
