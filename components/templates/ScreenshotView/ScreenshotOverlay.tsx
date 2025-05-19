import { useScrollLock } from "@/hooks/useScrollLock";
import React, { useLayoutEffect, useState } from "react";

type FocusOverlayProps = {
  targetRef: React.RefObject<HTMLElement>;
  visible: boolean;
};

const ScreenshotOverlay: React.FC<FocusOverlayProps> = ({ targetRef, visible }) => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  useScrollLock(visible);

  useLayoutEffect(() => {
    if (targetRef.current) {
      const box = targetRef.current.getBoundingClientRect();
      setRect(box);
    }
  }, [targetRef, visible]);

  if (!visible || !rect) return null;

  const { top, left, width, height } = rect;

  return (
    <>
      {/* Top overlay */}
      <div
        className="fixed left-0 top-0 w-full"
        style={{ height: top, backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 50 }}
      />

      {/* Bottom overlay */}
      <div
        className="fixed left-0"
        style={{
          top: top + height,
          height: `calc(100vh - ${top + height}px)`,
          width: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 50,
        }}
      />

      {/* Left overlay */}
      <div
        className="fixed top-0"
        style={{ left: 0, top, width: left + 7, height, backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 50 }}
      />

      {/* Right overlay */}
      <div
        className="fixed top-0"
        style={{ left: left + width - 7, top, right: 0, height, backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 50 }}
      />
    </>
  );
};

export default ScreenshotOverlay;
