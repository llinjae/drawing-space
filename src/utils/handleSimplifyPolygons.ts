import { Polygon } from "@/types";
import { simplify } from "@turf/turf";

const handleSimplifyPolygons = (
  polygons: Polygon[],
  setPolygons: React.Dispatch<React.SetStateAction<Polygon[]>>,
  drawImageAndPolygons: () => void
) => {
  const simplifiedPolygons = polygons.map((polygon) => {
    if (polygon.isSimplified) return polygon; // 이미 단순화된 폴리곤은 건너뜀

    const coords = polygon.points.map(([x, y]) => [x, y]);
    const simplified = simplify(
      { type: "Polygon", coordinates: [coords] },
      { tolerance: 0.01, highQuality: true }
    );
    const newPoints = simplified.coordinates[0].map(([x, y]) => [x, y]);

    return { ...polygon, points: newPoints, isSimplified: true };
  });

  setPolygons(simplifiedPolygons);
  drawImageAndPolygons();
};

export default handleSimplifyPolygons;
