// models/User.ts
import { UserType } from "@/types/user.types";
import mongoose from "mongoose";
/**
 * The UserSchema stores all key fields:
 * - `email`, `password`: standard user credentials (password hashed).
 * - `role`: "user", "admin", or "tester".
 * - `subscribed`: if they've paid for the subscription.
 * - `usedAnalyses`: how many total analyses the user has run.
 * - `trialStart`: optional custom field if you want a separate date for trial start (not used below).
 *   but we rely on `createdAt` for the 7-day logic. We can keep `trialStart` if we ever want
 *   a custom logic in the future.
 * - `stripeCustomerId`, `stripeSubscriptionId`: if you want to store these from Stripe in the future.
 * - `preferences` or other fields for expansions (commented out).
 * - Timestamps: we rely on `createdAt` for the 7-day trial logic.
 */
const UserSchema = new mongoose.Schema<UserType>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["customer", "validator", "contributor"],
      default: "customer",
      required: true,
    },
    subscribed: {
      type: Boolean,
      default: false,
    },
    usedAnalyses: {
      type: Number,
      default: 0,
    },
    trialStartDate: {
      type: String,
      default: null, // not used in the example below, but available if needed
    },
    stripeCustomerId: {
      type: String,
      default: "",
    },
    stripeSubscriptionId: {
      type: String,
      default: "",
    },
    profileImgUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
