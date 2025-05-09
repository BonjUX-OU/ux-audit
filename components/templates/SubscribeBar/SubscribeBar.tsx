import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import React from "react";

// Payment Link from env
const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || "";

// TODO: Create a hook for Subscription & Free Trial Logic
// TODO: use the hook both in here and SubscribeModal components
const SubscribeBar = () => {
  const { data: session } = useSession();

  // ------------------------------------
  // Subscription & Free Trial Logic
  // ------------------------------------
  const userSubscribed = session?.user?.subscribed;
  const userUsedAnalyses = session?.user?.usedAnalyses ?? 0;
  const userCreatedAt = session?.user?.createdAt ? new Date(session.user.createdAt) : new Date(0);

  // 7-day trial calculation
  const trialEnd = new Date(userCreatedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const within7Days = now < trialEnd;
  const under10Analyses = userUsedAnalyses < 10;

  // Calculate how many days left in trial
  const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  const handleSubscribeNow = () => {
    if (!paymentLink) {
      alert("No Payment Link available. Please contact support.");
      return;
    }
    window.location.href = paymentLink;
  };
  return !userSubscribed && (within7Days || under10Analyses) ? (
    <div className="bg-[#FFF1E0] text-sm text-gray-700  mt-4 mb-2 p-3 rounded-md flex items-center justify-between border border-[#FADBBB]">
      <div>
        <strong className="mr-1">Your free trial ends in {daysLeft} Days.</strong>
        <br />
        {"To keep going, just add your payment details — you’ll only be charged"}{" "}
        <span className="font-semibold">€4.99/month</span> {"after your free trial ends."}
      </div>
      <Button onClick={handleSubscribeNow} variant="ghost" className="text-[#B04E34] ml-4">
        Subscribe Now
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  ) : null;
};

export default SubscribeBar;
