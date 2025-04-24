// components/dashboard/SubscriptionDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function SubscriptionDialog({
  open,
  onOpenChange,
  onSubscribe,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscribe: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-white shadow-2xl rounded-xl">
        <DialogHeader>
          <div className="bg-[#E84C30] rounded-full w-24 h-24 flex items-center justify-center mb-4">
            <span className="text-white text-3xl font-bold">X . X</span>
          </div>
          <DialogTitle className="text-lg">Free Trial Ended!</DialogTitle>
          <DialogDescription>
            To keep going, just add your payment details. You’ll only be charged
            €4.99/month.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={onSubscribe}
            className="bg-[#B04E34] text-white w-full"
          >
            Subscribe Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
