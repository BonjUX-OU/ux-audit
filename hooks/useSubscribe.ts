import { UserType } from "@/types/user.types";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useToast } from "./useToast";

type SubsriptionState = {
  subscribed: boolean;
  daysLeft: number;
  credits: number;
};

const initialState: SubsriptionState = {
  subscribed: false,
  daysLeft: 0,
  credits: 0,
};

const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || "";

const checkSubscription = (user: UserType): SubsriptionState => {
  const result = { ...initialState };

  const userRole = user.role;
  const userSubscribed = user.subscribed;

  // If user is admin/tester => no limit
  // If user.subscribed => no limit
  if (userRole === "validator" || userRole === "contributor" || userSubscribed) {
    result.subscribed = true;
  } else {
    // Otherwise => must be within7Days && under10Analyses
    const userUsedAnalyses = user.usedAnalyses ?? 0;
    const userCreatedAt = user.createdAt ? new Date(user.createdAt) : new Date(0);

    // 7-day trial calculation
    const trialEnd = new Date(userCreatedAt.getTime() + 7 * 24 * 60 * 60 * 1000);

    if (trialEnd > new Date() && userUsedAnalyses < 10) {
      const daysLeftInTrial = Math.max(
        0,
        Math.ceil((trialEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      );
      result.daysLeft = daysLeftInTrial;
      result.credits = 10 - userUsedAnalyses;
    }
  }

  return result;
};

const handleSubscribeNow = () => {
  const { toast } = useToast();
  if (!paymentLink) {
    toast({ title: "Error", description: "No Payment Link available. Please contact support." });
    return;
  }
  window.location.href = paymentLink;
};

const useSubsription = () => {
  const { data: session } = useSession();
  const [state, setState] = useState<SubsriptionState>(initialState);

  useEffect(() => {
    if (!session?.user) setState(initialState);
    else {
      setState(checkSubscription(session.user));
    }
  }, [session]);

  return {
    ...state,
    handleSubscribeNow,
  };
};

export default useSubsription;
