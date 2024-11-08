import { useCallback } from "react";

import { Polygon, startPosType } from "@/types";
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
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx || !img.current) return;

    // 캔버스 초기화
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    // 스케일링 및 이동 적용
    ctx.translate(startPos.x, startPos.y);
    ctx.scale(scaleFactor, scaleFactor);

    // 이미지의 비율 계산
    const imgAspectRatio = img.current.width / img.current.height;
    const canvasAspectRatio = canvas.width / canvas.height;

    let drawWidth, drawHeight;

    // 이미지가 캔버스에 맞도록 크기 조정
    if (canvasAspectRatio > imgAspectRatio) {
      drawHeight = canvas.height;
      drawWidth = drawHeight * imgAspectRatio;
    } else {
      drawWidth = canvas.width;
      drawHeight = drawWidth / imgAspectRatio;
    }

    // 이미지의 위치 계산 (중앙 정렬)
    const offsetX = (canvas.width - drawWidth) / 2;
    const offsetY = (canvas.height - drawHeight) / 2;

    // 이미지 그리기
    ctx.drawImage(img.current, offsetX, offsetY, drawWidth, drawHeight);

    // 폴리곤 그리기
    polygons.forEach((polygon) => {
      if (polygon.isVisible && polygon.prediction >= predictionRange) {
        drawPolygon(polygon, ctx, drawWidth, drawHeight, offsetX, offsetY);
      }
    });

    // 현재 그리고 있는 폴리곤 그리기
    if (currentPolygon.length > 0) {
      drawCurrentPolygon(
        currentPolygon,
        ctx,
        drawWidth,
        drawHeight,
        offsetX,
        offsetY,
        scaleFactor
      );
    }

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
