import { Dispatch, SetStateAction } from "react";

export type Point = [number, number];

export interface Polygon {
  labelIndex: number;
  points: Point[];
  prediction: number;
  color: string;
  isVisible: boolean;
  tag?: string;
  description?: string;
}

export type useSetPredictionRangeProps = {
  polygons: Polygon[] | [];
  selectedPolygonIndex: number | string;
  predictionRange: number;
  setSelectedPolygonIndex: Dispatch<SetStateAction<number | string>>;
};
