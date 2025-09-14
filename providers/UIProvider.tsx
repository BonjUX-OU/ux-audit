"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";

import LoadingOverlay from "@/components/organisms/LoadingOverlay";

type UIContextType = {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  notify: (type: "success" | "error" | "info", message: string) => void;
};

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const notify = (type: "success" | "error" | "info", message: string) => {
    if (type === "success") toast.success(message);
    else if (type === "error") toast.error(message);
    else toast(message);
  };

  return (
    <UIContext.Provider value={{ isLoading, setLoading: setIsLoading, notify }}>
      {isLoading && <LoadingOverlay />}
      <Toaster
        position="top-right"
        toastOptions={{
          className: "w-auto max-w-[40%]",
          duration: 3500,
        }}
      />
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used inside UIProvider");
  return context;
};
