"use client";

import Link from "next/link";
import { ChevronLeft, CheckCircle, UnlockIcon, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

function PaymentPage() {
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
                providing insights for improving UX in your products. We are
                here to identify usability issues and opportunities, providing
                insights for improving UX in your products.
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
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="ml-2 text-sm">User Details</span>
                </div>
                <div className="h-px bg-[#C25B3F] flex-grow mx-2"></div>
                <div className="flex items-center">
                  <div className="bg-[#C25B3F] rounded-full w-6 h-6 flex items-center justify-center">
                    <span className="text-white text-xs">2</span>
                  </div>
                  <span className="ml-2 text-sm">Free Trial</span>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-[#2A3B4D] text-white py-2 px-4">
                  <span className="text-sm font-medium">
                    Beta User Free Trial
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex mb-6">
                    <div className="mr-3">
                      <div className="bg-[#2A3B4D] rounded-full p-2">
                        <UnlockIcon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-[#2A3B4D]">
                        {"Start your free trial today"}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {
                          "Unlock full access to UXMust and quickly discover what's holding your website back. Spot usability issues with ease."
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex mb-6">
                    <div className="mr-3">
                      <div className="bg-[#2A3B4D] rounded-full p-2">
                        <Mail className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-[#2A3B4D]">
                        {"Day 7 - Heads up, your trial is almost over"}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {
                          "To keep going, just add your payment details. You won't be charged until the trial ends."
                        }
                      </p>
                    </div>
                  </div>

                  <p className="text-center text-white text-sm">
                    {"*Enjoy 7 days free, then only €4.99/month."}
                  </p>
                  <Link href="/dashboard">
                    <Button className="w-full bg-[#C25B3F] hover:bg-[#A04A32] text-white py-6">
                      Continue to Free Trial
                    </Button>
                  </Link>
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
