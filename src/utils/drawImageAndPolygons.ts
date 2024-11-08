import { MutableRefObject } from "react";

import { Polygon, startPosType } from "@/types";

import drawCurrentPolygon from "./drawCurrentPolygon";

const drawImageAndPolygons = (
  canvasRef: MutableRefObject<HTMLCanvasElement | null>,
  img: MutableRefObject<HTMLImageElement>,
  startPos: startPosType,
  polygons: Polygon[],
  predictionRange: number,
  drawPolygon: (polygon, ctx, canvas) => void,
  scaleFactor,
  currentPolygon
) => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  // ctx.translate(startPos.x, startPos.y);
  ctx.scale(scaleFactor, scaleFactor);
  ctx.drawImage(img.current, 0, 0);

  if (img.current) {
    ctx.drawImage(img.current, 0, 0, canvas.width, canvas.height);
  }

  polygons.forEach((polygon) => {
    if (polygon.prediction >= predictionRange) {
      polygon.isVisible = true;
      drawPolygon(polygon, ctx, canvas);
    } else polygon.isVisible = false;
  });
  drawCurrentPolygon(currentPolygon, ctx, canvas, scaleFactor);
  ctx.restore();
};
export default drawImageAndPolygons;
