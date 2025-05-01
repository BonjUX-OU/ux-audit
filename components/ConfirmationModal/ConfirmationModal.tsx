import React, { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfirmationModalProps = {
  variant?: "default" | "delete";
  title?: string | ReactNode;
  description?: string | ReactNode;
  children?: ReactNode;
  isOpen: boolean;
  confirmButtonTitle?: string;
  cancelButtonTitle?: string;
  confirmButtonDisabled?: boolean;
  cancelButtonDisabled?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const ConfirmationModal = ({
  variant = "default",
  title,
  description,
  children,
  isOpen,
  confirmButtonTitle = "Confirm",
  cancelButtonTitle = "Cancel",
  confirmButtonDisabled,
  cancelButtonDisabled,
  onClose,
  onConfirm,
}: ConfirmationModalProps) => {
  const isDeleteModal = variant === "delete";
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm bg-white shadow-2xl border-none rounded-xl">
        <DialogHeader>
          {title && <DialogTitle className={cn("text-lg", { "text-red-600": isDeleteModal })}>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children && <DialogContent>{children}</DialogContent>}
        <DialogFooter>
          <Button
            disabled={cancelButtonDisabled}
            variant="outline"
            onClick={onClose}
            className="bg-white hover:bg-gray-100 shadow-sm hover:shadow transition-all duration-200">
            {cancelButtonTitle}
          </Button>
          <Button
            disabled={confirmButtonDisabled}
            onClick={onConfirm}
            className={cn("bg-red-600 text-white shadow-md hover:shadow-lg transition-all duration-200", {
              "bg-red-600": isDeleteModal,
              "bg-[#B04E34] hover:bg-[#963F28]": !isDeleteModal,
              "cursor-not-allowed opacity-50": confirmButtonDisabled,
            })}>
            {confirmButtonTitle}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
