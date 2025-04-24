// components/dashboard/AnalysisModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Check, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisStep } from "@/types/dashboard";
import Link from "next/link";

export default function AnalysisModal({
  open,
  onOpenChange,
  steps,
  error,
  finalReportId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  steps: AnalysisStep[];
  error: string | null;
  finalReportId: string | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white shadow-2xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">
            {error ? (
              <span className="text-red-500">Analysis Failed</span>
            ) : (
              "Analyzing Your Website..."
            )}
          </DialogTitle>
          <DialogDescription className="text-center">
            {error ? (
              <>
                {" "}
                <p className="text-red-600 mb-2">An error occurred:</p>
                <p className="italic">{error}</p>{" "}
              </>
            ) : (
              "We're generating your usability report step-by-step."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          {steps.map((s, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center p-2 rounded-md",
                s.status === "in-progress"
                  ? "bg-blue-50"
                  : s.status === "error"
                  ? "bg-red-50"
                  : "bg-gray-50"
              )}
            >
              <div className="mr-3">
                {s.status === "pending" && (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                    {i + 1}
                  </div>
                )}
                {s.status === "in-progress" && (
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                    <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                  </div>
                )}
                {s.status === "done" && (
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-500" />
                  </div>
                )}
                {s.status === "error" && (
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="w-3 h-3 text-red-500" />
                  </div>
                )}
              </div>
              <div className="text-sm">
                {s.status === "in-progress" ? (
                  <span className="font-medium text-blue-600">{s.label}</span>
                ) : s.status === "done" ? (
                  <span className="text-gray-600">{s.label}</span>
                ) : s.status === "error" ? (
                  <span className="text-red-600">{s.label}</span>
                ) : (
                  <span className="text-gray-500">{s.label}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex justify-center">
          {error ? (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          ) : finalReportId ? (
            <Link href={`/report/${finalReportId}`}>
              <Button className="bg-[#B04E34] text-white">
                View Full Analysis
              </Button>
            </Link>
          ) : (
            <Button disabled className="bg-gray-200 text-gray-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Working...
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
