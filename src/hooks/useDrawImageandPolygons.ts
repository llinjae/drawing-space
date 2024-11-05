// src/hooks/useDrawImageAndPolygons.ts

import { useCallback } from "react";

import drawCurrentPolygon from "../utils/drawCurrentPolygon";
import { UseDrawImageAndPolygonsProps } from "../types";

const useDrawImageAndPolygons = ({
  canvasRef,
  img,
  startPos,
  polygons,
  predictionRange,
  drawPolygon,
  scaleFactor,
  currentPolygon,
}: UseDrawImageAndPolygonsProps) => {
  return useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !img.current) return;
    const ctx = canvas.getContext("2d");

    ctx!.clearRect(0, 0, canvas.width, canvas.height);

    ctx!.save();

    ctx!.setTransform(scaleFactor, 0, 0, scaleFactor, startPos.x, startPos.y);

    ctx!.drawImage(img.current, 0, 0);

    polygons.forEach((polygon) => {
      if (polygon.prediction >= predictionRange) {
        polygon.isVisible = true;
        drawPolygon(polygon, ctx!);
      } else {
        polygon.isVisible = false;
      }
    });

    drawCurrentPolygon(currentPolygon, ctx!, img, scaleFactor);

    ctx!.restore();
  }, [
    polygons,
    drawPolygon,
    currentPolygon,
    scaleFactor,
    startPos,
    canvasRef,
    img,
    predictionRange,
  ]);
};

export default useDrawImageAndPolygons;
