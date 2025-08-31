"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STORAGE_KEY_FOR_PAYMENT } from "@/constants/common.constants";
import { useSession } from "next-auth/react";

function PaymentPage() {
  const { data: session } = useSession();
  const [reportId, setReportId] = useState("");

  useEffect(() => {
    const sessionItem = window.sessionStorage.getItem(STORAGE_KEY_FOR_PAYMENT);
    if (sessionItem) {
      const parsedItem = JSON.parse(sessionItem);
      parsedItem.comesFromRegisterAndPay = false;

      setReportId(parsedItem.reportId);

      window.sessionStorage.setItem(STORAGE_KEY_FOR_PAYMENT, JSON.stringify(parsedItem));
    }
  }, []);

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

              <h2 className="text-2xl font-bold mb-4">Thank you for being our Beta User👋</h2>
              <p className="text-gray-600 max-w-md">
                We are here to identify usability issues and opportunities, providing insights for improving UX in your
                products. We are here to identify usability issues and opportunities, providing insights for improving
                UX in your products.
              </p>

              <Link href="/signin" className="flex items-center text-[#C25B3F] mt-8">
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
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="ml-2 text-sm">User Details</span>
                </div>
                <div className="h-px bg-[#C25B3F] flex-grow mx-2"></div>
                <div className="flex items-center">
                  <div className="bg-[#C25B3F] rounded-full w-6 h-6 flex items-center justify-center">
                    <span className="text-white text-xs">2</span>
                  </div>
                  <span className="ml-2 text-sm">Beta User Payment</span>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-[#2A3B4D] text-white py-2 px-4">
                  <span className="text-sm font-medium">Special Offer</span>
                </div>

                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2">Beta User Plan</h2>
                  <p className="text-gray-600 mb-8">
                    UX heuristic report for up to 15 website&apos; pages with actionable insights
                  </p>

                  <div className="flex flex-col items-center mb-4">
                    <span className="text-gray-500 line-through">19.99 €</span>
                    <span className="text-[#00C48C] text-5xl font-bold">4.99 €</span>
                    <div className="text-gray-500 text-sm mt-1">
                      <span>per month</span>
                      <div>valid for upcoming 6 months</div>
                    </div>
                  </div>

                  <form action="/api/checkout" method="POST">
                    <input type="hidden" name="reportId" defaultValue={reportId} />
                    <input type="hidden" name="userId" defaultValue={session?.user?._id} />
                    <Button
                      type="submit"
                      className="w-full bg-[#C25B3F] hover:bg-[#A04A32] text-white flex items-center justify-center">
                      Accept the offer & Pay
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </form>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    You will be directed to the Stripe for payment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
