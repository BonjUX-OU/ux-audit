import { useCallback, useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";

type RectData = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  screenshot: string;
};

export function useDrawRect(containerRef: React.RefObject<HTMLDivElement>) {
  const [rectangles, setRectangles] = useState<RectData[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const startRef = useRef<{ x: number; y: number } | null>(null);
  const rectDivRef = useRef<HTMLDivElement | null>(null);
  const isMouseDownRef = useRef(false);

  const enableDrawing = () => setIsDrawing(true);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!isDrawing || !containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      const x = e.clientX - rect.left + container.scrollLeft;
      const y = e.clientY - rect.top + container.scrollTop;

      startRef.current = { x, y };
      isMouseDownRef.current = true;

      const drawDiv = document.createElement("div");
      Object.assign(drawDiv.style, {
        position: "absolute",
        border: "2px solid red",
        backgroundColor: "rgba(255, 0, 0, 0.1)",
        left: `${x}px`,
        top: `${y}px`,
        zIndex: "9999",
        pointerEvents: "none",
      });

      rectDivRef.current = drawDiv;
      container.appendChild(drawDiv);
    },
    [isDrawing, containerRef]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDrawing || !isMouseDownRef.current || !startRef.current || !rectDivRef.current || !containerRef.current)
        return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      const x = e.clientX - rect.left + container.scrollLeft;
      const y = e.clientY - rect.top + container.scrollTop;

      const startX = startRef.current.x;
      const startY = startRef.current.y;

      const width = x - startX;
      const height = y - startY;

      Object.assign(rectDivRef.current.style, {
        width: `${Math.abs(width)}px`,
        height: `${Math.abs(height)}px`,
        left: `${Math.min(x, startX)}px`,
        top: `${Math.min(y, startY)}px`,
      });
    },
    [isDrawing, containerRef]
  );

  const handleMouseUp = useCallback(async () => {
    if (!isDrawing || !isMouseDownRef.current || !rectDivRef.current || !startRef.current || !containerRef.current)
      return;

    const container = containerRef.current;
    const drawDiv = rectDivRef.current;
    // const start = startRef.current;

    const width = drawDiv.offsetWidth;
    const height = drawDiv.offsetHeight;
    const left = parseFloat(drawDiv.style.left);
    const top = parseFloat(drawDiv.style.top);

    // Temporarily remove the rectangle before capture
    container.removeChild(drawDiv);

    // Capture the container using html2canvas
    const canvas = await html2canvas(container, {
      scrollX: 0,
      scrollY: 0,
      useCORS: true,
    });

    const context = canvas.getContext("2d");
    if (!context) return;

    const cropped = context.getImageData(left, top, width, height);
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx?.putImageData(cropped, 0, 0);

    const screenshot = tempCanvas.toDataURL("image/png");

    // Restore the rectangle for visual reference
    container.appendChild(drawDiv);

    setRectangles((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        left,
        top,
        width,
        height,
        screenshot,
      },
    ]);

    // Reset state
    isMouseDownRef.current = false;
    rectDivRef.current = null;
    startRef.current = null;
    setIsDrawing(false); // Disable drawing until toggled again
  }, [isDrawing, containerRef]);

  useEffect(() => {
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  return { rectangles, isDrawing, enableDrawing };
}
