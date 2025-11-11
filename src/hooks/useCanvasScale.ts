import { useState, useEffect, RefObject } from "react";
import type { RichMenuSize } from "@/types/richmenu";

export function useCanvasScale(
  containerRef: RefObject<HTMLDivElement | null>,
  richMenuSize: RichMenuSize
) {
  const [scale, setScale] = useState(1);

  const updateScale = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const newScale = Math.min(containerWidth / richMenuSize.width, 1);
    setScale(newScale);
  };

  useEffect(() => {
    updateScale();
  }, [richMenuSize]);

  useEffect(() => {
    const handleResize = () => updateScale();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [richMenuSize]);

  return scale;
}
