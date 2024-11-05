// src/types/index.ts

export interface Point {
  x: number;
  y: number;
}

export interface Polygon {
  labelIndex: number;
  points: [number, number][];
  prediction: number;
  color: string;
  isVisible: boolean;
  tag?: string;
  description?: string;
  isSimplified?: boolean;
}

export interface StartPosType {
  x: number;
  y: number;
}

export interface ModalInputValue {
  tag: string;
  description: string;
}

export interface CanvasModalProps {
  modalPos: { x: number; y: number };
  onDelete: () => void;
  onModalInputUpdate: (modalInputValue: ModalInputValue) => void;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  currentData: Polygon | undefined;
  onPhotoUpload: (photo: string) => void;
}

export interface UseSetPredictionRangeProps {
  polygons: Polygon[];
  selectedPolygonLabelIndex: number | null;
  predictionRange: number;
  setSelectedPolygonLabelIndex: React.Dispatch<
    React.SetStateAction<number | null>
  >;
}

export interface UseDrawPolygonProps {
  predictionRange: number;
  selectedPolygonLabelIndex: number | null;
  modalPolygonLabelIndex: number | null;
  hoveredPolygonLabelIndex: number | null;
  img: React.MutableRefObject<HTMLImageElement | null>;
  scaleFactor: number;
}

export interface UseDrawImageAndPolygonsProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  img: React.MutableRefObject<HTMLImageElement | null>;
  startPos: StartPosType;
  polygons: Polygon[];
  predictionRange: number;
  drawPolygon: (polygon: Polygon, ctx: CanvasRenderingContext2D) => void;
  scaleFactor: number;
  currentPolygon: [number, number][];
}
