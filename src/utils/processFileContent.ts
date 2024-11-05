// src/utils/processFileContent.ts

import { Polygon } from "../types";
import getColorForPolygon from "./getColorForPolygon";

const processFileContent = (
  content: string,
  setLastLabelIndex: React.Dispatch<React.SetStateAction<number>>,
  setPolygons: React.Dispatch<React.SetStateAction<Polygon[]>>
) => {
  const jsonData = JSON.parse(content);

  const loadedPolygons = Object.values(jsonData).map((item, index) => {
    const itemStr =
      typeof item === "string" ? item.trim() : JSON.stringify(item).trim();
    const parts = itemStr.split(" ");

    if (parseInt(parts[0]) === 0) return null;

    const labelIndex = index;
    const predictionValue = parseFloat(parts[parts.length - 1]);

    const points = parts
      .slice(1, -1)
      .map((part, idx, array) =>
        idx % 2 === 0
          ? [parseFloat(array[idx]), parseFloat(array[idx + 1])]
          : null
      )
      .filter((point) => point) as [number, number][];

    if (
      points.length > 1 &&
      (points[0][0] !== points[points.length - 1][0] ||
        points[0][1] !== points[points.length - 1][1])
    ) {
      points.push([...points[0]]);
    }

    const color = getColorForPolygon(labelIndex);

    return {
      labelIndex,
      points,
      prediction: predictionValue,
      color,
      isVisible: true,
    } as Polygon;
  });

  setLastLabelIndex(loadedPolygons.length);
  setPolygons(loadedPolygons.filter((polygon) => polygon !== null));
};

export default processFileContent;
