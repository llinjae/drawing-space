// src/hooks/useSetPredictionRange.ts

import { useEffect } from "react";

import { UseSetPredictionRangeProps } from "../types";

const useSetPredictionRange = ({
  polygons,
  selectedPolygonLabelIndex,
  predictionRange,
  setSelectedPolygonLabelIndex,
}: UseSetPredictionRangeProps) => {
  useEffect(() => {
    let isVisible = false;
    polygons.forEach((polygon) => {
      if (
        polygon.labelIndex === selectedPolygonLabelIndex &&
        polygon.prediction >= predictionRange
      ) {
        isVisible = true;
      }
    });

    if (!isVisible) {
      setSelectedPolygonLabelIndex(null);
    }
  }, [
    predictionRange,
    polygons,
    selectedPolygonLabelIndex,
    setSelectedPolygonLabelIndex,
  ]);
};

export default useSetPredictionRange;
