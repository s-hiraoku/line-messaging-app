import { useState, useEffect, RefObject } from "react";

/**
 * Hook to calculate the scale for the imagemap canvas
 * The imagemap is always 1040x1040, but the canvas may be smaller
 */
export function useImagemapScale(
  containerRef: RefObject<HTMLDivElement | null>
) {
  const [scale, setScale] = useState(1);
  const IMAGEMAP_SIZE = 1040;

  const updateScale = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const newScale = Math.min(containerWidth / IMAGEMAP_SIZE, 1);
    setScale(newScale);
  };

  useEffect(() => {
    updateScale();
  }, []);

  useEffect(() => {
    const handleResize = () => updateScale();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return scale;
}
