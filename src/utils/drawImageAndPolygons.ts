// src/utils/drawImageAndPolygons.ts

import { MutableRefObject } from "react";

import { Polygon, StartPosType } from "../types";
import drawCurrentPolygon from "./drawCurrentPolygon";

const drawImageAndPolygons = (
  canvasRef: MutableRefObject<HTMLCanvasElement | null>,
  img: MutableRefObject<HTMLImageElement | null>,
  startPos: StartPosType,
  polygons: Polygon[],
  predictionRange: number,
  drawPolygon: (polygon: Polygon, ctx: CanvasRenderingContext2D) => void,
  scaleFactor: number,
  currentPolygon: [number, number][]
): void => {
  const canvas = canvasRef.current;
  if (!canvas || !img.current) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  // Apply scaling and translation
  ctx.translate(startPos.x, startPos.y);
  ctx.scale(scaleFactor, scaleFactor);

  // Draw the image
  ctx.drawImage(img.current, 0, 0);

  // Draw each polygon
  polygons.forEach((polygon) => {
    if (polygon.prediction >= predictionRange) {
      polygon.isVisible = true;
      drawPolygon(polygon, ctx);
    } else {
      polygon.isVisible = false;
    }
  });

  // Draw the current polygon being created
  drawCurrentPolygon(currentPolygon, ctx, img, scaleFactor);

  ctx.restore();
};

export default drawImageAndPolygons;
