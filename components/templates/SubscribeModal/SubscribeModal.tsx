import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || "";

// TODO: Create a hook for Subscription & Free Trial Logic
// TODO: use the hook both in here and SubscribeBar components
const SubscribeModal = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  // ------------------------------------
  // Subscription & Free Trial Logic
  // ------------------------------------
  const userRole = session?.user?.role;
  const userSubscribed = session?.user?.subscribed;
  const userUsedAnalyses = session?.user?.usedAnalyses ?? 0;
  const userCreatedAt = session?.user?.createdAt ? new Date(session.user.createdAt) : new Date(0);

  // 7-day trial calculation
  const trialEnd = new Date(userCreatedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const inTrialPeriod = now < trialEnd;
  const hasCredit = userUsedAnalyses < 10;

  // If user is admin/tester => no limit
  // If user.subscribed => no limit
  // Otherwise => must be within7Days && under10Analyses
  const userAllowedToAnalyze =
    userRole === "validator" || userRole === "contributor" || userSubscribed || (inTrialPeriod && hasCredit);

  // We'll show a forced subscription dialog if user is blocked
  // If blocked from analyzing, open subscription modal
  useEffect(() => {
    if (session?.user && !userAllowedToAnalyze) {
      setIsOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, userAllowedToAnalyze]);

  const handleSubscribeNow = () => {
    if (!paymentLink) {
      alert("No Payment Link available. Please contact support.");
      return;
    }
    window.location.href = paymentLink;
  };

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
