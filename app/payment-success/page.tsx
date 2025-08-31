"use client";
import { Suspense } from "react";
import PaymentSuccessTemplate from "@/components/templates/PaymentSuccess/PaymentSuccess";

function PaymentSuccessPage() {
  return (
    <Suspense>
      <PaymentSuccessTemplate />
    </Suspense>
  );
}

export default PaymentSuccessPage;
