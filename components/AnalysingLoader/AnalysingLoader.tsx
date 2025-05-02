import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AnalysingSteps } from "./AnalysingLoader.constants";
import { cn } from "@/lib/utils";
import { Check, Loader2, XCircle } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

type AnalysingLoaderProps = {
  isOpen: boolean;
  hasError: boolean;
  reportId: string | null;
  onOpenChange: (newVal: boolean) => void;
};

const AnalysingLoader = ({ isOpen, hasError, reportId, onOpenChange }: AnalysingLoaderProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="text-xl text-center">
          {hasError ? <span className="text-red-500">Analysis Failed</span> : "Analyzing Your Website..."}
        </DialogTitle>
        <DialogDescription className="text-center">
          {hasError ? (
            <>
              <p className="text-red-600 mb-2">An error occurred during analysis:</p>
              <p className="text-sm italic">{hasError}</p>
              <p className="mt-4 text-sm">
                Try checking the URL, ensuring the site is public, or retrying in a few moments.
              </p>
            </>
          ) : (
            "We're generating your usability report step-by-step."
          )}
        </DialogDescription>
      </DialogHeader>
      <DialogContent className="sm:max-w-md bg-white shadow-2xl border-none rounded-xl">
        <div className="py-4 space-y-3">
          {AnalysingSteps.map((step, idx) => (
            <div
              key={idx}
              className={cn(
                "flex items-center p-2 rounded-md transition-all duration-200",
                step.status === "in-progress" ? "bg-blue-50" : step.status === "error" ? "bg-red-50" : "bg-gray-50"
              )}>
              <div className="mr-3">
                {step.status === "pending" && (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    <span className="text-xs text-gray-400">{idx + 1}</span>
                  </div>
                )}
                {step.status === "in-progress" && (
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                    <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                  </div>
                )}
                {step.status === "done" && (
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-500" />
                  </div>
                )}
                {step.status === "error" && (
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="w-3 h-3 text-red-500" />
                  </div>
                )}
              </div>
              <div className="text-sm">
                {step.status === "in-progress" ? (
                  <span className="font-medium text-blue-600">{step.label}</span>
                ) : step.status === "done" ? (
                  <span className="text-gray-600">{step.label}</span>
                ) : step.status === "error" ? (
                  <span className="text-red-600">{step.label}</span>
                ) : (
                  <span className="text-gray-500">{step.label}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
      <DialogFooter className="flex justify-center">
        {hasError ? (
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white hover:bg-gray-100 shadow-sm hover:shadow transition-all duration-200">
            Close
          </Button>
        ) : reportId ? (
          <Link href={`/report/${reportId}`}>
            <Button className="bg-[#B04E34] hover:bg-[#963F28] text-white shadow-md hover:shadow-lg transition-all duration-200">
              View Full Analysis
            </Button>
          </Link>
        ) : (
          <Button
            disabled
            className="bg-gray-200 text-gray-500 cursor-not-allowed"
            title="Please wait until the analysis completes.">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Working...
          </Button>
        )}
      </DialogFooter>
    </Dialog>
  );
};

export default AnalysingLoader;
