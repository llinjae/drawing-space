// src/utils/isMouseInPolygon.ts

import { Polygon } from "../types";

const isMouseInPolygon = (
  mouseX: number,
  mouseY: number,
  polygon: Polygon,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  scaleFactor: number,
  startPos: { x: number; y: number },
  img: React.MutableRefObject<HTMLImageElement | null>
): boolean => {
  const ctx = canvasRef.current!.getContext("2d");
  ctx!.beginPath();

  polygon.points.forEach(([x, y], index) => {
    const adjustedX = x * img.current!.width * scaleFactor + startPos.x;
    const adjustedY = y * img.current!.height * scaleFactor + startPos.y;

    if (index === 0) {
      ctx!.moveTo(adjustedX, adjustedY);
    } else {
      ctx!.lineTo(adjustedX, adjustedY);
    }
  });
  ctx!.closePath();

  return (
    ctx!.isPointInPath(
      mouseX * scaleFactor + startPos.x,
      mouseY * scaleFactor + startPos.y
    ) && polygon.isVisible
  );
};

export default isMouseInPolygon;
