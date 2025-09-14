"use client";

import React, { useEffect, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

const LoadingOverlay: React.FC = () => {
  const [showOverlay, setShowOverlay] = useState(true);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    if (step === 0) {
      timers.push(setTimeout(() => setStep(1), 400)); // overlay slides down
    }
    if (step === 1) {
      timers.push(setTimeout(() => setStep(2), 700)); // circle grows
    }
    if (step === 2) {
      timers.push(setTimeout(() => setStep(3), 800)); // circle goes up
    }
    if (step === 3) {
      timers.push(setTimeout(() => setShowOverlay(false), 400)); // overlay goes up
    }

    return () => timers.forEach((t) => clearTimeout(t));
  }, [step]);

  return (
    <AnimatePresence>
      {showOverlay && (
        <motion.div
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.5 }}
          className="bg-background/90 fixed inset-0 z-50 flex items-center justify-center">
          {step >= 1 && (
            <motion.div
              initial={{ width: 60, height: 60 }}
              animate={{
                width: step >= 2 ? 180 : 80,
                height: step >= 2 ? 180 : 80,
                y: step >= 3 ? -300 : 0,
                opacity: step >= 3 ? 0 : 1,
              }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-center rounded-full bg-[#e0362a]">
              <span className="text-4xl font-bold text-white">0.-</span>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;
