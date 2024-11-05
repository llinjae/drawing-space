import { useEffect } from "react";

import { useSetPredictionRangeProps } from "@/app/type";

const useSetPredictionRange = ({
  polygons,
  selectedPolygonIndex,
  predictionRange,
  setSelectedPolygonIndex,
}: useSetPredictionRangeProps) => {
  useEffect(() => {
    let isVisible = false;
    polygons.forEach((polygon) => {
      if (
        polygon.labelIndex === selectedPolygonIndex &&
        polygon.prediction >= predictionRange
      ) {
        isVisible = true;
      }
    });

    if (!isVisible) {
      setSelectedPolygonIndex("");
    }
  }, [predictionRange, polygons, selectedPolygonIndex]);
};

export default useSetPredictionRange;
