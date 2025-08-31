"use client";
// import Link from "next/link";
import { STORAGE_KEY_FOR_PAYMENT } from "@/constants/common.constants";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

function PaymentSuccessPage() {
  const params = useSearchParams();
  const session_id = params.get("session_id");

  const redirectToPreview = async () => {
    try {
      const response = await fetch(`/api/checkout?session_id=${session_id}`, {
        method: "GET",
      });

      if (response.url) {
        window.location.href = response.url;
      } else {
        console.error("Failed to redirect");
      }
    } catch (error) {
      console.error("Error fetching checkout session data:", error);
    }
  };

  useEffect(() => {
    if (session_id) {
      window.sessionStorage.removeItem(STORAGE_KEY_FOR_PAYMENT);
      redirectToPreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session_id]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h1>
        <p className="text-gray-700 mb-6">
          Thank you for your purchase. Your transaction has been completed successfully.
        </p>
        <p>You are being redirect to preview page.</p>
        {/* <Link href="/" className="text-blue-500 hover:underline">
          Go back to homepage
        </Link> */}
      </div>
    </div>
  );
}

export default PaymentSuccessPage;
