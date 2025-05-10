import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import useSubsribe from "@/hooks/useSubscribe";
import { ChevronRight } from "lucide-react";
import React, { useState } from "react";

const SubscribeBar = () => {
  const { subscribed, daysLeft, handleSubscribeNow } = useSubsribe();
  const [isOpen, setIsOpen] = useState(!subscribed);

  return !subscribed ? (
    <>
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
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-sm bg-white shadow-2xl border-none rounded-xl">
          <DialogHeader>
            <div className="bg-[#E84C30] rounded-full w-24 h-24 flex items-center justify-center mb-4">
              <span className="text-white text-3xl font-bold">X . X</span>
            </div>
            <DialogTitle className="text-lg">Free Trial Ended!</DialogTitle>
            <DialogDescription>
              To keep going, just add your payment details. You’ll only be charged €4.99/month.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleSubscribeNow} className="bg-[#B04E34] text-white w-full">
              Subscribe Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  ) : null;
};

export default SubscribeBar;
