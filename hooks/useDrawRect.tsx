import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";

export interface IssueRectangleData {
  id: string;
  top: number;
  left: number;
  width: number;
  height: number;
  screenshot?: string;
}

export function useDrawRect(containerRef: React.RefObject<HTMLDivElement>) {
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
  // const [rectangles, setRectangles] = useState<IssueRectangleData[]>([]);
  const [rectangle, setRectangle] = useState<IssueRectangleData | null>();
  const [isCropping, setIsCropping] = useState(false);

  const startRef = useRef<{ x: number; y: number } | null>(null);
  const rectDivRef = useRef<HTMLDivElement | null>(null);
  const isMouseDownRef = useRef(false);

  const enableDrawing = () => setIsDrawingEnabled(true);
  const disableDrawing = () => setIsDrawingEnabled(false);
  const clearRectangle = () => setRectangle(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDrawingEnabled(false); // Or whatever your cancel logic is
      }
    };

    if (isDrawingEnabled) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDrawingEnabled]);

  useEffect(() => {
    if (!isDrawingEnabled) return;

    const container = containerRef.current;
    if (!container) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (!container.contains(e.target as Node)) return;

      const containerRect = container.getBoundingClientRect();
      const x = e.clientX - containerRect.left + container.scrollLeft;
      const y = e.clientY - containerRect.top + container.scrollTop;

      startRef.current = { x, y };
      isMouseDownRef.current = true;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDownRef.current || !startRef.current || !container) return;

      const containerRect = container.getBoundingClientRect();
      const currentX = e.clientX - containerRect.left + container.scrollLeft;
      const currentY = e.clientY - containerRect.top + container.scrollTop;
      const { x: startX, y: startY } = startRef.current;

      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);
      const left = Math.min(currentX, startX);
      const top = Math.min(currentY, startY);

      if (!rectDivRef.current && (width > 2 || height > 2)) {
        const drawDiv = document.createElement("div");
        Object.assign(drawDiv.style, {
          position: "absolute",
          border: "1px solid #CCC",
          backgroundColor: "rgba(255, 255, 255, 0.3)",
          zIndex: "9999",
          pointerEvents: "none",
        });
        container.appendChild(drawDiv);
        rectDivRef.current = drawDiv;
      }

      if (rectDivRef.current) {
        Object.assign(rectDivRef.current.style, {
          width: `${width}px`,
          height: `${height}px`,
          left: `${left}px`,
          top: `${top}px`,
        });
      }
    };

    const handleMouseUp = async () => {
      if (!rectDivRef.current || !startRef.current || !container) return;

      setIsCropping(true);

      const rect = rectDivRef.current.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const left = rect.left - containerRect.left + container.scrollLeft;
      const top = rect.top - containerRect.top + container.scrollTop;
      const width = rect.width;
      const height = rect.height;

      // Remove the rectangle before capture
      container.removeChild(rectDivRef.current);

      const canvas = await html2canvas(container, {
        scrollX: -container.scrollLeft,
        scrollY: -container.scrollTop,
        useCORS: true,
        scale: window.devicePixelRatio, // Better quality on high DPI screens
        allowTaint: false, // Don't allow cross-origin images to taint canvas
        backgroundColor: null, // Transparent background
        logging: false, // Disable logs
      });
      const ctx = canvas.getContext("2d");
      const imageData = ctx?.getImageData(left, top, width, height);
      let croppedImage: string | undefined = undefined;

      if (imageData) {
        const croppedCanvas = document.createElement("canvas");
        croppedCanvas.width = width;
        croppedCanvas.height = height;
        const croppedCtx = croppedCanvas.getContext("2d");
        croppedCtx?.putImageData(imageData, 0, 0);
        croppedImage = croppedCanvas.toDataURL("image/png");
      }

      // If you want to save the rectangles as array of objects use this
      // setRectangles((prev) => [
      //   ...prev,
      //   {
      //     id: Date.now().toString(),
      //     top,
      //     left,
      //     width,
      //     height,
      //     screenshot: croppedImage,
      //   },
      // ]);

      setRectangle({
        id: Date.now().toString(),
        top,
        left,
        width,
        height,
        screenshot: croppedImage,
      });

      // Can be appended to the container or used as needed
      // container.appendChild(rectDivRef.current);

      rectDivRef.current = null;
      startRef.current = null;
      isMouseDownRef.current = false;
      setIsDrawingEnabled(false); // Disable after one draw
      setIsCropping(false);
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDrawingEnabled, containerRef]);

  return { enableDrawing, disableDrawing, isDrawingEnabled, rectangle, isCropping, clearRectangle };
}
