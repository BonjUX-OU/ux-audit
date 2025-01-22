"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

function LoginPage() {
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();

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

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      setError("");
      if (res?.url) router.replace(res.url); // Redirect to the URL provided by the server
    }
  };

  return (
    <div>
      <header className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-bold">UXMust</h1>
      </header>
      <div className="flex justify-center mt-6  px-4">
        <div className="p-6 w-full max-w-md bg-white shadow-md rounded-md">
          <h1 className="text-xl text-center font-bold mt-4 mb-3">Log in</h1>
          <p className="text-base text-center mb-6">
            Enter your details to log in to this app
            <br />
          </p>
          <form className="space-y-3" onSubmit={handleSubmit}>
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
                placeholder="Enter password"
                className="w-full"
              />
            </div>
            <div className="flex justify-center mb-4">
              <a
                href="#"
                className="text-sm text-gray-500 underline hover:text-indigo-500"
              >
                Forgot password?
              </a>
            </div>
            <div className="flex justify-center">
              <Button
                variant="default"
                type="submit"
                className="mb-1 text-white w-full"
              >
                Log in with email
              </Button>
            </div>
            <p className="text-sm text-red-500 text-center mt-2">
              {error && error}
            </p>
            <div className="flex items-center mb-4">
              <div className="flex-grow h-px bg-gray-300" />
              <span className="text-sm text-gray-500 mx-2">
                or continue with
              </span>
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
          </form>
          <p className="text-base text-center mb-3 mt-6">
            If you have no existing account,{" "}
            <a href="/signup" className="font-bold text-indigo-500">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
