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

type ConfirmationModalProps = {
	title?: string;
	description?: string;
	children?: ReactNode;
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
};

const ConfirmationModal = ({ title, description, children, isOpen, onClose, onConfirm }: ConfirmationModalProps) => {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-sm bg-white shadow-2xl border-none rounded-xl">
				<DialogHeader>
					{title && <DialogTitle className="text-lg text-red-600">{title}</DialogTitle>}
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>
				{children && <DialogContent>{children}</DialogContent>}
				<DialogFooter>
					<Button
						variant="outline"
						onClick={onClose}
						className="bg-white hover:bg-gray-100 shadow-sm hover:shadow transition-all duration-200">
						Cancel
					</Button>
					<Button
						onClick={onConfirm}
						className="bg-red-600 text-white shadow-md hover:shadow-lg transition-all duration-200">
						Delete Report
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ConfirmationModal;
