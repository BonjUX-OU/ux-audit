"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STORAGE_KEY_FOR_PAYMENT } from "@/constants/common.constants";
import { useSession } from "next-auth/react";
import LogoStarEyes from "@/components/layout/LogoStarEyes";
import StepperProgressBar from "@/components/layout/StepperProgressBar";

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
        <div className="grid grid-cols-2 gap-4 w-full max-w-6xl">
          {/* Left Section */}
          <div className="flex flex-col justify-start items-start">
            <Link href={`/preiew/${reportId}`} className="flex items-center text-[#C25B3F] mb-12">
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Back to report preview</span>
            </Link>

            <LogoStarEyes />

            <h2 className="text-2xl my-6">Glad to hear you are interested in report 🤩</h2>
            <p className="text-gray-600 max-w-md">
              To access the full report, you’ll need to register and complete the payment. Once registered, you’ll be
              redirected to the Stripe page to finalize your purchase.
            </p>
          </div>
          {/* Right Section */}
          <div className="flex flex-col justify-start w-[75%] mx-auto">
            <StepperProgressBar
              steps={[{ label: "Register", completed: true }, { label: "Report Payment" }]}
              activeStepIndex={1}
            />

            <h2 className="text-2xl font-medium my-4">Before the full report, time to pay</h2>

            <div className="border rounded-lg overflow-hidden bg-[#F8F8F8]">
              <div className="p-6">
                <h2 className="text-xl font-medium my-2">Welcome {session?.user?.name} 👋</h2>
                <p className="text-gray-600 mb-8">
                  Here is a summary for your purchase. Once you complete payment, you will reach the full report.
                </p>

                <div className="w-full flex justify-between my-2">
                  <span className="text-gray-600 text-md">Report Price</span>
                  <span className="text-lg">17.50 €</span>
                </div>

                {/* <div className="w-full flex justify-between my-2">
                  <span className="text-gray-600 text-md">Commission/VAT</span>
                  <span className="text-lg">3.60 € (3%)</span>
                </div> */}

                <div className="w-full flex justify-between my-4">
                  <span className="text-gray-600 text-md">Applied Discount</span>
                  <span className="text-lg text-red-600">2.61 € (15%)</span>
                </div>

                <div className="h-1 w-full border-b my-8"></div>

                <div className="w-full flex justify-between my-4">
                  <span className="text-gray-600 text-md">Total Amount:</span>
                  <span className="text-lg">14.99 €</span>
                </div>

                {/* <div className="flex flex-col items-center mb-4">
                  <span className="text-gray-500 line-through">19.99 €</span>
                  <span className="text-[#00C48C] text-5xl font-bold">14.99 €</span>
                  <div className="text-gray-500 text-sm mt-1">
                    <span>per month</span>
                    <div>valid for upcoming 6 months</div>
                  </div>
                </div> */}

                <form action="/api/checkout" method="POST">
                  <input type="hidden" name="reportId" defaultValue={reportId} />
                  <input type="hidden" name="userId" defaultValue={session?.user?._id} />
                  <Button
                    type="submit"
                    className="w-full bg-[#C25B3F] hover:bg-[#A04A32] text-white flex items-center justify-center">
                    Complete Purchase
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
  );
}

export default PaymentPage;
