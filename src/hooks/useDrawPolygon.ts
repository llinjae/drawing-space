import { useCallback } from "react";

import findCentroid from "@/utils/findCentroid";
import increaseOpacity from "@/utils/increaseOpacity";

const useDrawPolygon = (
  predictionRange,
  selectedPolygonIndex,
  modalPolygonIndex,
  hoveredPolygonIndex,
  scaleFactor
) => {
  return useCallback(
    (polygon, ctx, drawWidth, drawHeight, offsetX, offsetY) => {
      if (polygon.prediction < predictionRange) {
        return;
      }

      let fillColor = polygon.color;

      if (
        polygon.labelIndex === selectedPolygonIndex ||
        polygon.labelIndex === modalPolygonIndex ||
        polygon.labelIndex === hoveredPolygonIndex
      ) {
        fillColor = increaseOpacity(fillColor);
      }

      ctx.beginPath();
      polygon.points.forEach(([x, y], index) => {
        const adjustedX = x * drawWidth + offsetX;
        const adjustedY = y * drawHeight + offsetY;

        if (index === 0) {
          ctx.moveTo(adjustedX, adjustedY);
        } else {
          ctx.lineTo(adjustedX, adjustedY);
        }
      });
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = "blue";
      ctx.lineWidth = Math.min(Math.max(2 / scaleFactor, 1), 10); // 선 두께를 scaleFactor에 따라 조정
      ctx.stroke();

      // 꼭지점 그리기
      ctx.fillStyle = "green";
      polygon.points.forEach(([x, y]) => {
        const adjustedX = x * drawWidth + offsetX;
        const adjustedY = y * drawHeight + offsetY;
        ctx.beginPath();
        ctx.arc(adjustedX, adjustedY, 5 / scaleFactor, 0, 2 * Math.PI);
        ctx.fill();
      });

      // 태그 또는 설명 표시
      const centroid = findCentroid(
        polygon.points.map(([x, y]) => [
          x * drawWidth + offsetX,
          y * drawHeight + offsetY,
        ])
      );

      if (polygon.tag || polygon.description) {
        ctx.font = `${16 / scaleFactor}px Arial`;
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(polygon.tag || "", centroid.x, centroid.y);
      }
    },
    [
      predictionRange,
      selectedPolygonIndex,
      modalPolygonIndex,
      hoveredPolygonIndex,
      scaleFactor,
    ]
  );
};

export default useDrawPolygon;
