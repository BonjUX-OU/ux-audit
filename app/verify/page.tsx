import VerifyEmail from "@/components/templates/VerifyEmail/VerifyEmail";
import React, { Suspense } from "react";

const VerifyPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmail />
    </Suspense>
  );
};

export default VerifyPage;
