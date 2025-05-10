import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import useSubsription from "@/hooks/useSubscribe";
import { useEffect, useState } from "react";

const SubscribeModal = () => {
  const { subscribed, handleSubscribeNow } = useSubsription();

  const [isOpen, setIsOpen] = useState(false);

  // We'll show a forced subscription dialog if user is blocked
  // If blocked from analyzing, open subscription modal
  useEffect(() => {
    setIsOpen(subscribed);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribed]);

  return (
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
  );
};

export default SubscribeModal;
