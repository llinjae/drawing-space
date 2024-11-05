// src/utils/drawCurrentPolygon.ts

import { MutableRefObject } from "react";

const drawCurrentPolygon = (
  currentPolygon: [number, number][],
  ctx: CanvasRenderingContext2D,
  img: MutableRefObject<HTMLImageElement | null>,
  scaleFactor: number
) => {
  if (currentPolygon.length > 0 && img.current) {
    ctx.beginPath();

    currentPolygon.forEach(([x, y], index) => {
      const adjustedX = x * img.current!.width;
      const adjustedY = y * img.current!.height;

      if (index === 0) {
        ctx.moveTo(adjustedX, adjustedY);
      } else {
        ctx.lineTo(adjustedX, adjustedY);
      }

      ctx.beginPath();
      ctx.arc(adjustedX, adjustedY, 5 / scaleFactor, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();
    });

    ctx.strokeStyle = "red";
    ctx.lineWidth = 2 / scaleFactor;
    ctx.stroke();
  }
};

export default drawCurrentPolygon;
