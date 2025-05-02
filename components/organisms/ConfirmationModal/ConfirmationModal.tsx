import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
} from "@/components/ui/dialog";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import clsx from "clsx";
import { ReactNode } from "react";

type ConfirmationModalProps = {
	title?: ReactNode;
	description?: ReactNode;
	confirmButtonDisabled?: boolean;
	confirmButtonTitle?: string;
	cancelButtonTitle?: string;
	variant?: "default" | "danger";
	children?: ReactNode;
	isOpen: boolean;
	onCancel: () => void;
	onConfirm?: () => void;
};

const ConfirmationModal = ({
	variant = "default",
	title,
	description,
	confirmButtonDisabled,
	confirmButtonTitle = "Confirm",
	cancelButtonTitle = "Cancel",
	children,
	isOpen,
	onCancel,
	onConfirm,
}: ConfirmationModalProps) => {
	const isDangerous = variant === "danger";
	return (
		<Dialog open={isOpen} onOpenChange={onCancel}>
			<DialogContent className="sm:max-w-sm bg-white shadow-2xl border-none rounded-xl">
				<DialogHeader>
					{title && (
						<DialogTitle className={clsx("text-lg", isDangerous && "text-red-600")}>
							{title}
						</DialogTitle>
					)}
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>
				{children}
				<DialogFooter>
					<Button
						variant="outline"
						onClick={onCancel}
						className="bg-white hover:bg-gray-100 shadow-sm hover:shadow transition-all duration-200">
						{cancelButtonTitle}
					</Button>
					{onConfirm && (
						<Button
							disabled={confirmButtonDisabled}
							onClick={onConfirm}
							className={clsx(
								"text-white shadow-md hover:shadow-lg transition-all duration-200",
								isDangerous ? "bg-red-600" : "bg-[#B04E34] hover:bg-[#963F28]"
							)}>
							{confirmButtonTitle}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ConfirmationModal;
