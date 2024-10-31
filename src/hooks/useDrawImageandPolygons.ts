import { useCallback } from "react";

import drawCurrentPolygon from "@/utils/drawCurrentPolygon";

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
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // 기존의 그리기 내용을 지웁니다
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    // 확대/축소 및 이동 적용
    ctx.setTransform(scaleFactor, 0, 0, scaleFactor, startPos.x, startPos.y);

    // 이미지 그리기
    if (img.current) {
      ctx.drawImage(img.current, 0, 0);
    }

    // 폴리곤 그리기
    polygons.forEach((polygon) => {
      if (polygon.prediction >= predictionRange) {
        polygon.isVisible = true;
        drawPolygon(polygon, ctx);
      } else {
        polygon.isVisible = false;
      }
    });

    // 현재 그리고 있는 폴리곤 그리기
    drawCurrentPolygon(currentPolygon, ctx, img, scaleFactor);

    ctx.restore();
  }, [polygons, drawPolygon, currentPolygon, scaleFactor, startPos]);
};

export default useDrawImageAndPolygons;
