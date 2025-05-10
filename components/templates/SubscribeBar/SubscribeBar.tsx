import { Button } from "@/components/ui/button";
import useSubsription from "@/hooks/useSubscribe";
import { ChevronRight } from "lucide-react";
import React from "react";

const SubscribeBar = () => {
  const { subscribed, daysLeft, handleSubscribeNow } = useSubsription();

  return !subscribed ? (
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
