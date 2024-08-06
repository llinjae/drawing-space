import findCentroid from "@/utils/findCentroid";
import increaseOpacity from "@/utils/increaseOpacity";
import { useCallback } from "react";

const useDrawPolygon = (predictionRange, selectedPolygonIndex, modalPolygonIndex, hoveredPolygonIndex, img) => {
  return useCallback(
    (polygon, ctx) => {
      //prediction range 에 들어오지 않으면 그리지 않음
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
      //캔버스 도형 그리기 시작
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
      ctx.stroke();

      const centroid = findCentroid(polygon.points.map(([x, y]) => [x * img.current.width, y * img.current.height]));

      if (polygon.tag || polygon.description) {
        ctx.font = "16px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        let textToDisPlay = polygon.tag;
        ctx.fillText(textToDisPlay, centroid.x, centroid.y);
      }

      for (let i = 0; i < polygon.points.length; i++) {
        const [x1, y1] = polygon.points[i];
        const [x2, y2] = polygon.points[(i + 1) % polygon.points.length];
        const midX = ((x1 + x2) / 2) * img.current.width;
        const midY = ((y1 + y2) / 2) * img.current.height;
        ctx.fillStyle = "green";
        ctx.fillRect(midX - 3, midY - 3, 6, 6);
      }
    },
    [predictionRange, selectedPolygonIndex, modalPolygonIndex, hoveredPolygonIndex, img]
  );
};

export default useDrawPolygon;
