import React, { useEffect, useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  images?: string[];
}

const ImageCarousel: React.FC<CarouselProps> = ({
  images = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop",
  ],
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("left");
  const [visibleSlides, setVisibleSlides] = useState<number[]>([]);

  const animationDuration = 500;

  // Initialize visible slides
  useEffect(() => {
    const prev = (currentIndex - 1 + images.length) % images.length;
    const next = (currentIndex + 1) % images.length;
    setVisibleSlides([prev, currentIndex, next]);
  }, [currentIndex, images.length]);

  const goToNext = () => {
    if (animating) return;
    setAnimating(true);
    setDirection("left");
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setAnimating(false);
    }, animationDuration);
  };

  const goToPrevious = () => {
    if (animating) return;
    setAnimating(true);
    setDirection("right");
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      setAnimating(false);
    }, animationDuration);
  };

  const goToSlide = (index: number) => {
    if (animating || index === currentIndex) return;
    setDirection(index > currentIndex ? "left" : "right");
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setAnimating(false);
    }, animationDuration);
  };

  const getPositionClass = (index: number) => {
    const [left, center, right] = visibleSlides;

    if (index === center) return "center";
    if (index === left) return "left";
    if (index === right) return "right";
    return "hidden";
  };

  return (
    <div className="mx-auto w-full p-6">
      <div className="relative flex items-center justify-center select-none">
        {/* Navigation */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 z-40 cursor-pointer rounded-full p-3 backdrop-blur-sm transition-all duration-200 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50">
          <ChevronLeft className="h-6 w-6 text-gray-800" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 z-40 cursor-pointer rounded-full p-3 backdrop-blur-sm transition-all duration-200 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50">
          <ChevronRight className="h-6 w-6 text-gray-800" />
        </button>

        {/* Slides */}
        <div className="relative flex h-[380px] w-full items-center justify-center overflow-hidden">
          {images.map((src, idx) => {
            const position = getPositionClass(idx);
            let translateX = "0%";
            let scale = 1;
            let zIndex = 30;

            if (position === "left") {
              translateX = direction === "left" && animating ? "-100%" : "-60%";
              scale = 0.8;
              zIndex = 20;
            } else if (position === "right") {
              translateX = direction === "right" && animating ? "100%" : "60%";
              scale = 0.8;
              zIndex = 20;
            } else if (position === "center") {
              translateX = "0%";
              scale = 1;
              zIndex = 30;
            } else {
              translateX = direction === "left" ? "200%" : "-200%";
              scale = 0.8;
              zIndex = 10;
            }

            return (
              <div
                key={idx}
                className="absolute top-0 left-1/2 -translate-x-1/2 cursor-pointer drop-shadow-2xl transition-all duration-500"
                style={{
                  transform: `translateX(${translateX}) scale(${scale})`,
                  zIndex,
                }}
                onClick={() => position !== "center" && goToSlide(idx)}>
                <img
                  src={src}
                  alt={`Slide ${idx + 1}`}
                  className="h-[325px] w-[580px] rounded-xl object-cover transition-all duration-500"
                  draggable={false}
                  width={580}
                  height={325}
                  style={{ objectFit: "contain" }}
                />
              </div>
            );
          })}
        </div>

        {/* Dots */}
        <div className="absolute bottom-0 flex w-full items-center justify-center">
          <div className="mt-4 flex justify-center gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`h-3 w-3 cursor-pointer rounded-full transition-all duration-200 ${
                  idx === currentIndex ? "bg-primary scale-110" : "hover:bg-primary/70 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
