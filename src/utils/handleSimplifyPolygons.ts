// src/utils/handleSimplifyPolygons.ts

import simplify from "@turf/simplify";

import { Polygon } from "../types";

const handleSimplifyPolygons = (
  polygons: Polygon[],
  setPolygons: React.Dispatch<React.SetStateAction<Polygon[]>>,
  drawImageAndPolygons: () => void
) => {
  const simplifiedPolygons = polygons.map((polygon) => {
    if (polygon.isSimplified) return polygon;

    const coords = polygon.points.map(([x, y]) => [x, y]);
    const simplified = simplify(
      { type: "Polygon", coordinates: [coords] },
      { tolerance: 0.01, highQuality: true }
    );
    const newPoints = simplified.coordinates[0].map(([x, y]) => [x, y]) as [
      number,
      number
    ][];

    return { ...polygon, points: newPoints, isSimplified: true };
  });

  setPolygons(simplifiedPolygons);
  drawImageAndPolygons();
};

export default handleSimplifyPolygons;
