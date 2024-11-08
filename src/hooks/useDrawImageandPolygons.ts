import { useCallback } from "react";

import { Polygon, startPosType } from "@/types";
import drawCurrentPolygon from "@/utils/drawCurrentPolygon";

const useDrawImageAndPolygons = (
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
  img: React.MutableRefObject<HTMLImageElement | null>,
  startPos: { x: number; y: number },
  polygons: Polygon[],
  predictionRange: number,
  drawPolygon: (
    polygon: Polygon,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) => void,
  scaleFactor: number,
  currentPolygon: [number, number][]
) => {
  return useCallback(() => {
    if (!Array.isArray(polygons)) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 캔버스 초기화
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    // 스케일링 및 이동 적용
    ctx.translate(startPos.x, startPos.y);
    ctx.scale(scaleFactor, scaleFactor);

    // 이미지 그리기
    if (img.current) {
      ctx.drawImage(img.current, 0, 0, canvas.width, canvas.height);
    }

    // 폴리곤 그리기
    polygons.forEach((polygon) => {
      if (polygon.prediction >= predictionRange) {
        polygon.isVisible = true;
        drawPolygon(polygon, ctx, canvas);
      } else {
        polygon.isVisible = false;
      }
    });

    // 현재 그리고 있는 폴리곤 그리기
    drawCurrentPolygon(currentPolygon, ctx, canvas, scaleFactor);

    ctx.restore();
  }, [
    canvasRef,
    img,
    startPos,
    polygons,
    predictionRange,
    drawPolygon,
    scaleFactor,
    currentPolygon,
  ]);
};

export default useDrawImageAndPolygons;
