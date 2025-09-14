"use client";

import { HTMLMotionProps, motion } from "framer-motion";

type MotionButtonProps = HTMLMotionProps<"button">;

export function CTAButton({ children, ...props }: MotionButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: 2 }}
      whileTap={{ scale: 0.9, rotate: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="from-primary to-secondary cursor-pointer rounded-xl bg-gradient-to-r px-6 py-3 font-bold text-white shadow-lg hover:shadow-xl focus:outline-none"
      {...props}>
      {children}
    </motion.button>
  );
}
