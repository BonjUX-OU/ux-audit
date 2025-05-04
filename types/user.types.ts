import { DataObjectType } from "./common.types";

export type UserType = DataObjectType & {
  email: string;
  password: string;
  name: string;
  role: "customer" | "validator" | "contributor";
  subscribed?: boolean;
  usedAnalyses?: number;
  trialStartDate?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  profileImgUrl?: string;
  createdAt: string;
};
