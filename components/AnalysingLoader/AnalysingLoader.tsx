import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type AnalysingLoaderProps = {
	isOpen: boolean;
	hasError: boolean;
	onOpenChange: (newVal: boolean) => void;
};

const AnalysingLoader = ({ isOpen, hasError, onOpenChange }: AnalysingLoaderProps) => {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md bg-white shadow-2xl border-none rounded-xl">
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
			</DialogContent>
		</Dialog>
	);
};

export default AnalysingLoader;
