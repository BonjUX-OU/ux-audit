// app/(dashboard)/account/page.tsx
"use client";

import React, { useState, FormEvent } from "react";
import { useSession } from "next-auth/react";

// Extend the user type to include createdAt
declare module "next-auth" {
  interface Session {
    user?: UserType;
  }
}
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { UserType } from "@/types/user.types";

export default function AccountAndPlanDetailsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;
  const userCreatedAt = user?.createdAt ? new Date(user.createdAt) : new Date();

  // Trial logic
  const trialEnd = new Date(userCreatedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  // Subscription logic
  const userSubscribed = user?.subscribed;
  const [subCancelLoading, setSubCancelLoading] = useState(false);

  // Email change
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState<string>("");

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string>("");

  // Delete account
  const [deleteLoading, setDeleteLoading] = useState(false);

  const currentEmail = user?.email || "";

  async function handleCancelPlan() {
    if (!user) return;
    setSubCancelLoading(true);
    setEmailMsg("");
    setPasswordMsg("");
    try {
      const res = await fetch("/api/account/cancel", {
        method: "PATCH",
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t);
      }
      // Force refresh session
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to cancel subscription");
    } finally {
      setSubCancelLoading(false);
    }
  }

  async function handleChangeEmail(e: FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setEmailLoading(true);
    setEmailMsg("");
    try {
      const res = await fetch("/api/account/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t);
      }
      setEmailMsg("Email changed successfully!");
      setNewEmail("");
      // Force next-auth session update
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setEmailMsg(err.message || "Failed to change email");
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    if (!currentPassword.trim() || !newPassword.trim()) return;
    setPasswordLoading(true);
    setPasswordMsg("");
    try {
      const res = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t);
      }
      setPasswordMsg("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setPasswordMsg(err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "DELETE",
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t);
      }
      // sign the user out or redirect
      // or NextAuth automatically 401's them on next calls
      window.location.href = "/signin";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete account");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div>
      {/* Subscription or Trial Info */}
      <div className="mb-6 p-4 bg-gray-50 border rounded-md flex items-center justify-between">
        {userSubscribed ? (
          <div>
            <h2 className="text-xl font-medium">You have a subscribed plan!</h2>
            <p className="text-sm text-gray-600">Your plan is active.</p>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-medium">Beta User Plan</h2>
            {daysLeft > 0 ? (
              <p className="text-sm text-gray-600">
                Your free trial ends in <strong>{daysLeft}</strong> Days. To keep going, just add your payment details —
                you’ll only be charged €4.99/month after your trial ends.
              </p>
            ) : (
              <p className="text-sm text-red-600">Your free trial has ended. Please subscribe to continue usage.</p>
            )}
          </div>
        )}

        {/* Cancel button if subscribed */}
        {userSubscribed && (
          <button
            onClick={handleCancelPlan}
            disabled={subCancelLoading}
            className="text-sm font-semibold text-red-500 hover:text-red-700">
            {subCancelLoading ? "Canceling..." : "Cancel my plan ›"}
          </button>
        )}

        {/* Subscribe Now button if not subscribed (optional) */}
        {!userSubscribed && (
          <a
            href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || "#"}
            className="text-sm font-semibold text-orange-600 hover:text-orange-800">
            Subscribe Now ›
          </a>
        )}
      </div>

      {/* Change Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-3">Change Email</h3>
          <form onSubmit={handleChangeEmail} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Your Current Business Email</label>
              <Input type="text" readOnly value={currentEmail} className="bg-gray-100 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm mb-1">Your New Business Email</label>
              <Input
                type="email"
                placeholder="new@email.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={emailLoading} className="bg-[#B04E34] text-white">
              {emailLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Change Your Email"
              )}
            </Button>
            {emailMsg && <p className="mt-1 text-sm">{emailMsg}</p>}
          </form>
        </div>

        {/* Change Password */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Your Current Password</label>
              <Input
                type="password"
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Your New Password</label>
              <Input
                type="password"
                placeholder="Set a new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={passwordLoading} className="bg-[#B04E34] text-white">
              {passwordLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Change Your Password"
              )}
            </Button>
            {passwordMsg && <p className="mt-1 text-sm">{passwordMsg}</p>}
          </form>
        </div>
      </div>

      {/* Delete Account */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Delete Account</h3>
        <p className="text-sm text-gray-600 mb-4">
          You are about to delete your account. This action cannot be undone.
        </p>
        <Button
          variant="destructive"
          onClick={handleDeleteAccount}
          disabled={deleteLoading}
          className="bg-red-600 hover:bg-red-700 text-white">
          {deleteLoading ? "Deleting..." : "Delete my account ›"}
        </Button>
      </div>
    </div>
  );
}
