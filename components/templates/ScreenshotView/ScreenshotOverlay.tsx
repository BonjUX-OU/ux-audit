import { LucideCircleX, X } from "lucide-react";
import React, { useEffect, useState } from "react";

type FocusOverlayProps = {
  targetRef: React.RefObject<HTMLElement>;
  onCancel?: () => void;
};

const ScreenshotOverlay: React.FC<FocusOverlayProps> = ({ targetRef, onCancel }) => {
  const [style, setStyle] = useState<React.CSSProperties | null>(null);

  useEffect(() => {
    const updateStyle = () => {
      const container = targetRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

      setStyle({
        position: "absolute",
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width,
        height: rect.height,
        zIndex: 35,
        boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.7)",
        pointerEvents: "auto",
        transition: "all 0.2s ease",
      });
    };

    updateStyle();
    window.addEventListener("scroll", updateStyle, true);
    window.addEventListener("resize", updateStyle);
    return () => {
      window.removeEventListener("scroll", updateStyle, true);
      window.removeEventListener("resize", updateStyle);
    };
  }, [targetRef]);

  if (!style) return null;

  return (
    <>
      <button
        onClick={onCancel}
        className="w-[3rem] h-[3rem] bg-transparent rounded-full flex items-center justify-center"
        style={{
          position: "fixed",
          top: 60,
          right: 20,
          cursor: "pointer",
          zIndex: 40,
        }}>
        <X strokeWidth={3} size={32} color="#FFF" />
      </button>
      <div style={style}></div>
    </>
  );
};

export default ScreenshotOverlay;
