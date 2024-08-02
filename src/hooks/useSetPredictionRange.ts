import { useSetPredictionRangeProps } from "@/app/type";
import { useEffect } from "react";

const useSetPredictionRange = ({
  polygons,
  selectedPolygonIndex,
  predictionRange,
  setSelectedPolygonIndex,
}: useSetPredictionRangeProps) => {
  useEffect(() => {
    let isVisible = false;
    polygons.forEach((polygon) => {
      if (polygon.labelIndex === selectedPolygonIndex && polygon.prediction >= predictionRange) {
        isVisible = true;
      }
    });

    if (!isVisible) {
      setSelectedPolygonIndex("None");
    }
  }, [predictionRange, polygons, selectedPolygonIndex]);
};

export default useSetPredictionRange;
