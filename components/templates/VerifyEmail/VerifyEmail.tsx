"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect } from "react";

const VerifyEmail = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const verifyEmail = async () => {
    try {
      const res = await fetch("/api/user/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to verify email");
      }

      if (res.redirected) {
        window.location.href = res.url;
      }

      // Show success message and redirect
    } catch (error) {
      console.error("Error verifying email:", error);
    }
  };

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token, router]);

  return (
    <div className="bg-gray-100 p-8 h-screen">
      <div className="bg-white flex justify-center py-8 px-4 h-full rounded-lg">
        <div className="grid grid-cols-12 gap-12 w-full max-w-5xl">
          {/* Left Section */}
          <div className="col-span-12 md:col-span-6 lg:col-span-6 flex flex-col justify-start items-start">
            <div className="flex-grow flex flex-col justify-center items-center md:items-start">
              <div className="bg-[#E84C30] rounded-full w-32 h-32 flex items-center justify-center mb-8">
                <span className="text-white text-4xl font-bold">0.0</span>
              </div>

              <h2 className="text-2xl font-bold mb-4">Thank you for being our Beta User👋</h2>
              <p className="text-gray-600 max-w-md">
                We are here to identify usability issues and opportunities, providing insights for improving UX in your
                products.
              </p>
            </div>
          </div>
          {/* Right Section */}
          <div className="col-span-12 md:col-span-6 lg:col-span-6">
            <div className="flex justify-center mt-6  px-4">
              <div className="p-6 w-full max-w-md bg-white">
                <h1 className="text-xl  font-bold mt-4 mb-3">Verifing your email...</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
