import clsx from "clsx";

const LoadingOverlay = ({ message, hasOpacity }: { message: string; hasOpacity?: boolean }) => {
  return (
    <div
      className={clsx(
        "fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-gray-50 z-50",
        hasOpacity && " bg-opacity-50"
      )}>
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#B04E34] border-t-transparent"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
