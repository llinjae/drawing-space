import { useCallback } from "react";

import findCentroid from "@/utils/findCentroid";
import increaseOpacity from "@/utils/increaseOpacity";

const useDrawPolygon = (
  predictionRange,
  selectedPolygonIndex,
  modalPolygonIndex,
  hoveredPolygonIndex,
  img
) => {
  return useCallback(
    (polygon, ctx) => {
      // prediction range에 들어오지 않으면 그리지 않음
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

      // 캔버스 도형 그리기 시작
      ctx.beginPath();
      polygon.points.forEach(([x, y], index) => {
        const adjustedX = x * img.current.width;
        const adjustedY = y * img.current.height;

        if (index === 0) {
          ctx.moveTo(adjustedX, adjustedY);
        } else {
          ctx.lineTo(adjustedX, adjustedY);
        }
      });
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = "blue"; // 폴리곤의 경계선 색상
      ctx.lineWidth = 2;
      ctx.stroke();

      // 폴리곤의 꼭지점에 원 그리기 (반지름 5)
      ctx.fillStyle = "green";
      polygon.points.forEach(([x, y]) => {
        const adjustedX = x * img.current.width;
        const adjustedY = y * img.current.height;
        ctx.beginPath();
        ctx.arc(adjustedX, adjustedY, 5, 0, 2 * Math.PI);
        ctx.fill();
      });

      // 폴리곤 태그 또는 설명 표시
      const centroid = findCentroid(
        polygon.points.map(([x, y]) => [
          x * img.current.width,
          y * img.current.height,
        ])
      );

      if (polygon.tag || polygon.description) {
        ctx.font = "16px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        let textToDisPlay = polygon.tag;
        ctx.fillText(textToDisPlay, centroid.x, centroid.y);
      }
    },
    [
      predictionRange,
      selectedPolygonIndex,
      modalPolygonIndex,
      hoveredPolygonIndex,
      img,
    ]
  );
};

export default useDrawPolygon;
