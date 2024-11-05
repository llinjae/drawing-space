// src/hooks/useDrawPolygon.ts

import { useCallback } from "react";

import findCentroid from "../utils/findCentroid";
import increaseOpacity from "../utils/increaseOpacity";
import { UseDrawPolygonProps, Polygon } from "../types";

const useDrawPolygon = ({
  predictionRange,
  selectedPolygonLabelIndex,
  modalPolygonLabelIndex,
  hoveredPolygonLabelIndex,
  img,
  scaleFactor,
}: UseDrawPolygonProps) => {
  return useCallback(
    (polygon: Polygon, ctx: CanvasRenderingContext2D) => {
      if (polygon.prediction < predictionRange) {
        return;
      }

      let fillColor = polygon.color;

      if (
        polygon.labelIndex === selectedPolygonLabelIndex ||
        polygon.labelIndex === modalPolygonLabelIndex ||
        polygon.labelIndex === hoveredPolygonLabelIndex
      ) {
        fillColor = increaseOpacity(fillColor);
      }

      ctx.beginPath();
      polygon.points.forEach(([x, y], index) => {
        const adjustedX = x * img.current!.width;
        const adjustedY = y * img.current!.height;

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
      ctx.lineWidth = Math.min(Math.max(2 / scaleFactor, 1), 10);
      ctx.stroke();

      ctx.fillStyle = "green";
      polygon.points.forEach(([x, y]) => {
        const adjustedX = x * img.current!.width;
        const adjustedY = y * img.current!.height;
        ctx.beginPath();
        ctx.arc(
          adjustedX,
          adjustedY,
          Math.min(Math.max(5 / scaleFactor, 3), 100),
          0,
          2 * Math.PI
        );
        ctx.fill();
      });

      const centroid = findCentroid(
        polygon.points.map(([x, y]) => [
          x * img.current!.width,
          y * img.current!.height,
        ])
      );

      if (polygon.tag || polygon.description) {
        ctx.font = "16px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        let textToDisplay = polygon.tag;
        ctx.fillText(textToDisplay as string, centroid.x, centroid.y);
      }
    },
    [
      predictionRange,
      selectedPolygonLabelIndex,
      modalPolygonLabelIndex,
      hoveredPolygonLabelIndex,
      img,
      scaleFactor,
    ]
  );
};

export default useDrawPolygon;
