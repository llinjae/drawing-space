import drawCurrentPolygon from "@/utils/drawCurrentPolygon";
import { useCallback } from "react";

const useDrawImageAndPolygons = (
  canvasRef,
  img,
  startPos,
  polygons,
  predictionRange,
  drawPolygon,
  scaleFactor,
  currentPolygon
) => {
  return useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(startPos.x, startPos.y);
    ctx.scale(scaleFactor, scaleFactor);
    ctx.drawImage(img.current, 0, 0);

    polygons.forEach((polygon) => {
      if (polygon.prediction >= predictionRange) {
        polygon.isVisible = true;
        drawPolygon(polygon, ctx);
      } else polygon.isVisible = false;
    });
    drawCurrentPolygon(currentPolygon, ctx, img);
    ctx.restore();
  }, [polygons, drawPolygon, drawCurrentPolygon, startPos, scaleFactor]);
};
export default useDrawImageAndPolygons;
