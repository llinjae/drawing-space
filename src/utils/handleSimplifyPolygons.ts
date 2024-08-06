import { Polygon } from "@/app/type";
import { simplify } from "@turf/turf";

const handleSimplifyPolygons = (
  polygons: Polygon[],
  setPolygons: React.Dispatch<React.SetStateAction<Polygon[]>>,
  drawImageAndPolygons: void
) => {
  const simplifiedPolygons = polygons.map((polygon) => {
    const coords = polygon.points.map(([x, y]) => [x, y]);
    const simplified = simplify({ type: "Polygon", coordinates: [coords] }, { tolerance: 0.01, highQuality: true });
    const points = simplified.coordinates[0].map(([x, y]) => [x, y]);
    return { ...polygon, points };
  });
  setPolygons(simplifiedPolygons);
  drawImageAndPolygons();
};
export default handleSimplifyPolygons;
