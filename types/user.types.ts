import { DataObjectType } from "./common.types";

export type UserType = DataObjectType & {
  email: string;
  password: string;
  name: string;
  role: UserRoleType;
  subscribed?: boolean;
  usedAnalyses?: number;
  trialStartDate?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  profileImgUrl?: string;
  createdAt: string;
  isProfileCompleted?: boolean;
  isNewUser?: boolean;
};


export enum UserRoleType {
  Customer = "CUSTOMER",
  Validator = "VALIDATOR",
  Contributor = "CONTRIBUTOR",

}
