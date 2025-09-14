"use client";

import React, { useEffect, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

const LandingOverlay: React.FC = () => {
  const [showOverlay, setShowOverlay] = useState(true);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    if (step === 0) {
      timers.push(setTimeout(() => setStep(1), 500)); // overlay slides down
    }
    if (step === 1) {
      timers.push(setTimeout(() => setStep(2), 600)); // circle appears & grows
    }
    if (step === 2) {
      timers.push(setTimeout(() => setStep(3), 800)); // circle slides left + text appears
    }
    if (step === 3) {
      timers.push(setTimeout(() => setStep(4), 1000)); // text slides behind circle
    }
    if (step === 4) {
      timers.push(setTimeout(() => setStep(5), 800)); // circle goes up
    }
    if (step === 5) {
      timers.push(setTimeout(() => setShowOverlay(false), 500)); // overlay goes up
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
          {/* Circle */}
          {step >= 1 && (
            <motion.div
              initial={{ width: 20, height: 20, x: 0 }}
              animate={{
                width: step >= 2 ? 120 : 60,
                height: step >= 2 ? 120 : 60,
                x: step >= 3 ? -275 : 0,
              }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-center rounded-full bg-[#e0362a]">
              <span className="text-4xl font-bold text-white">0.0</span>
            </motion.div>
          )}

          {/* Text */}
          {step >= 3 && (
            <motion.div
              initial={{ opacity: 0, x: 120 }}
              animate={{
                opacity: step >= 3 ? 1 : 0,
                x: step >= 4 ? 0 : 0,
              }}
              transition={{ duration: 1 }}
              className="text-foreground absolute w-[400px]">
              <h1 className="text-start text-5xl font-bold">UXMust</h1>
              <p className="text-lg">Evaluate, Improve, Evolve!</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LandingOverlay;
