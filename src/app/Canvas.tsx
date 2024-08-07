// "use client";

// import React, { useCallback, useEffect, useRef, useState } from "react";

// import CanvasModal from "@/components/CanvasModal";

// import useSetPredictionRange from "@/hooks/useSetPredictionRange";

// import getColorForPolygon from "@/utils/getColorForPolygon";
// import useDrawPolygon from "@/hooks/useDrawPolygon";

// import useDrawImageAndPolygons from "@/hooks/useDrawImageandPolygons";
// import distanceBetween from "@/utils/distanceBetween";
// import isMouseInPolygon from "@/utils/isMouseInPolygon";
// import processFileContent from "@/utils/processFileContent";
// import handleSimplifyPolygons from "@/utils/handleSimplifyPolygons";
// import { polygon } from "@turf/turf";
// import { Point, Polygon, startPosType } from "./type";

// const Canvas = () => {
//   const [polygons, setPolygons] = useState<Polygon[] | []>([]);
//   const [selectedPolygonIndex, setSelectedPolygonIndex] = useState(0);
//   const [predictionRange, setPredictionRange] = useState(0.5);
//   const [scaleFactor, setScaleFactor] = useState(1.0);
//   const [currentPolygon, setCurrentPolygon] = useState<[number, number][] | []>([]);
//   const [isWheelDown, setIsWheelDown] = useState(false);
//   const [startPos, setStartPos] = useState<startPosType>({ x: 0, y: 0 });
//   const [fileContent, setFileContent] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [modalPos, setModalPos] = useState({ x: 0, y: 0 });
//   const [modalPolygonIndex, setModalPolygonIndex] = useState<number | null>(null);
//   const [hoveredPolygonIndex, setHoveredPolygonIndex] = useState<number>(0);
//   const [photos, setPhotos] = useState({});
//   const [lastLabelIndex, setLastLabelIndex] = useState(0);
//   const [clickMode, setClickMode] = useState("polygonMake");
//   const [isResizing, setIsResizing] = useState(false);
//   const [selectedEdge, setSelectedEdge] = useState(null); // State for selected edge
//   const [selectedPolygon, setSelectedPolygon] = useState(null);
//   const [isDragging, setIsDragging] = useState(false);

//   const canvasRef = useRef(null);
//   const dragStart = useRef({ x: 0, y: 0 });
//   const initialMousePos = useRef({ x: 0, y: 0 });
//   const img = useRef(new Image());

//   useSetPredictionRange({ polygons, selectedPolygonIndex, predictionRange, setSelectedPolygonIndex });

//   const drawPolygon = useDrawPolygon(
//     predictionRange,
//     selectedPolygonIndex,
//     modalPolygonIndex,
//     hoveredPolygonIndex,
//     img
//   );
//   const drawImageAndPolygons = useDrawImageAndPolygons(
//     canvasRef,
//     img,
//     startPos,
//     polygons,
//     predictionRange,
//     drawPolygon,
//     scaleFactor,
//     currentPolygon
//   );

//   useEffect(() => {
//     if (!img.current.src) {
//       img.current.src = "/test58.jpg";
//       img.current.onload = () => {
//         drawImageAndPolygons();
//       };
//     }
//   }, [drawImageAndPolygons]);

//   useEffect(() => {
//     drawImageAndPolygons();
//   }, [predictionRange, drawImageAndPolygons]);

//   const handleCanvasClick = useCallback(
//     (e: MouseEvent) => {
//       if (clickMode !== "polygonMake" || showModal) {
//         return null;
//       }

//       const completionThreshold = 0.007;
//       if (canvasRef.current) {
//         const rect = (canvasRef.current as HTMLCanvasElement).getBoundingClientRect();
//         const scaledX = (e.clientX - rect.left - startPos.x) / scaleFactor;
//         const scaledY = (e.clientY - rect.top - startPos.y) / scaleFactor;
//         const x = scaledX / img.current.width;
//         const y = scaledY / img.current.height;
//         const distance =
//           currentPolygon.length > 0
//             ? distanceBetween(x, y, currentPolygon[0][0], currentPolygon[0][1])
//             : Number.MAX_VALUE;

//         setCurrentPolygon((prev) => [...prev, [x, y]]);

//         if (currentPolygon.length > 2 && distance < completionThreshold) {
//           const newPolygon = {
//             labelIndex: lastLabelIndex,
//             points: [...currentPolygon, [x, y]] as Point[],
//             prediction: 0.95,
//             color: getColorForPolygon(lastLabelIndex),
//             isVisible: true,
//             tag: "",
//             description: "",
//           };
//           setLastLabelIndex((prev) => prev + 1);
//           setPolygons((prev) => [...prev, newPolygon]);
//           setCurrentPolygon([]);
//         }

//         let foundPolygonIndex = null;
//         polygons.forEach((polygon, index) => {
//           if (polygon.prediction >= predictionRange) {
//             foundPolygonIndex = index;
//           }
//         });

//         setSelectedPolygonIndex(foundPolygonIndex !== 0 ? foundPolygonIndex : 0);
//       }
//     },
//     [clickMode, showModal, currentPolygon, polygons, startPos, scaleFactor, img]
//   );

//   const handleCanvasRightClick = useCallback(
//     (e: MouseEvent) => {
//       e.preventDefault();

//       if (clickMode === "sizeControll" && currentPolygon.length > 0) {
//         setCurrentPolygon([]);
//         const canvas = canvasRef.current;
//         const ctx = (canvas! as HTMLCanvasElement)?.getContext("2d");
//         drawImageAndPolygons(
//           canvasRef,
//           img,
//           startPos,
//           polygons,
//           predictionRange,
//           drawPolygon,
//           scaleFactor,
//           currentPolygon
//         );
//         return;
//       }

//       setShowModal(true);
//       setModalPos({
//         x: e.clientX + window.scrollX,
//         y: e.clientY + window.scrollY,
//       });

//       const rect = canvasRef?.current?.getBoundingClientRect();
//       const mouseX = e.clientX - rect.left;
//       const mouseY = e.clientY - rect.top;

//       let foundPolygonIndex = null;
//       polygons.forEach((polygon, index) => {
//         if (isMouseInPolygon(mouseX, mouseY, polygon, canvasRef, scaleFactor, startPos, img)) {
//           foundPolygonIndex = index;
//         }
//       });
//       setModalPolygonIndex(foundPolygonIndex);

//       if (foundPolygonIndex !== null) {
//         setModalPolygonIndex(foundPolygonIndex);
//       } else {
//         setCurrentPolygon([]);
//       }
//     },
//     [clickMode, currentPolygon, polygons, startPos, scaleFactor, img, drawImageAndPolygons]
//   );
//   const handleMouseDown = useCallback(
//     (e: MouseEvent) => {
//       if (e.button === 1) {
//         setIsWheelDown(true);
//         dragStart.current = { x: e.clientX, y: e.clientY };
//         e.currentTarget.style.cursor = "grabbing";
//       } else if (e.button === 0) {
//         const rect = canvasRef.current.getBoundingClientRect();
//         const mouseX = e.clientX - rect.left;
//         const mouseY = e.clientY - rect.top;

//         if (clickMode === "polygonMake") {
//           let foundPolygon = false;

//           polygons.forEach((polygon) => {
//             if (isMouseInPolygon(mouseX, mouseY, polygon, canvasRef, scaleFactor, startPos, img)) {
//               setSelectedPolygonIndex(polygon.labelIndex);
//               foundPolygon = true;
//             }
//           });

//           if (!foundPolygon) {
//             setSelectedPolygonIndex(0);
//           }
//         } else if (clickMode === "sizeControll") {
//           polygons.forEach((polygon, polygonIndex) => {
//             for (let i = 0; i < polygon.points.length; i++) {
//               const [x1, y1] = polygon.points[i];
//               const [x2, y2] = polygon.points[(i + 1) % polygon.points.length];
//               const midX = ((x1 + x2) / 2) * img.current.width;
//               const midY = ((y1 + y2) / 2) * img.current.height;
//               if (mouseX >= midX - 5 && mouseX <= midX + 5 && mouseY >= midY - 5 && mouseY <= midY + 5) {
//                 initialMousePos.current = { x: mouseX, y: mouseY };
//                 setSelectedPolygonIndex(polygonIndex);
//                 setSelectedEdge({ polygonIndex, edgeIndex: i });
//                 break;
//               }
//             }
//           });
//         } else if (clickMode === "movePolygon") {
//           polygons.forEach((polygon, polygonIndex) => {
//             if (isMouseInPolygon(mouseX, mouseY, polygon, canvasRef, scaleFactor, startPos, img)) {
//               setSelectedPolygon(polygonIndex);
//               initialMousePos.current = { x: mouseX, y: mouseY };
//               setIsDragging(true);
//             }
//           });
//         } else if (clickMode === "addEdge" && selectedPolygonIndex !== null) {
//           // Updated logic to add edge to selected polygon
//           const polygon = polygons[selectedPolygonIndex];
//           for (let i = 0; i < polygon.points.length; i++) {
//             const [x1, y1] = polygon.points[i];
//             const [x2, y2] = polygon.points[(i + 1) % polygon.points.length];
//             const midX = ((x1 + x2) / 2) * img.current.width;
//             const midY = ((y1 + y2) / 2) * img.current.height;
//             if (Math.abs(mouseX - midX) < 5 && Math.abs(mouseY - midY) < 5) {
//               const newPoint = [(x1 + x2) / 2, (y1 + y2) / 2] as Point;
//               setPolygons((prevPolygons) =>
//                 prevPolygons.map((polygon, idx) =>
//                   idx === selectedPolygonIndex
//                     ? {
//                         ...polygon,
//                         points: [...polygon.points.slice(0, i + 1), newPoint, ...polygon.points.slice(i + 1)],
//                       }
//                     : polygon
//                 )
//               );
//               break;
//             }
//           }
//         } else if (clickMode === "deleteEdge") {
//           // Added delete edge mode
//           polygons.forEach((polygon, polygonIndex) => {
//             for (let i = 0; i < polygon.points.length; i++) {
//               const [x1, y1] = polygon.points[i];
//               const [x2, y2] = polygon.points[(i + 1) % polygon.points.length];
//               const midX = ((x1 + x2) / 2) * img.current.width;
//               const midY = ((y1 + y2) / 2) * img.current.height;
//               if (mouseX >= midX - 5 && mouseX <= midX + 5 && mouseY >= midY - 5 && mouseY <= midY + 5) {
//                 setPolygons((prevPolygons) =>
//                   prevPolygons.map((polygon, idx) =>
//                     idx === polygonIndex
//                       ? {
//                           ...polygon,
//                           points: polygon.points.filter((_, pointIndex) => pointIndex !== i),
//                         }
//                       : polygon
//                   )
//                 );
//                 break;
//               }
//             }
//           });
//         }
//       }
//     },
//     [clickMode, polygons, isResizing, isMouseInPolygon]
//   );

//   const handleMouseMove = useCallback(
//     (e) => {
//       if (isWheelDown) {
//         if (clickMode === "polygonMake") {
//           const newOffset = {
//             x: startPos.x + (e.clientX - dragStart.current.x),
//             y: startPos.y + (e.clientY - dragStart.current.y),
//           };
//           setStartPos(newOffset);
//           dragStart.current = { x: e.clientX, y: e.clientY };
//           e.preventDefault();
//         }
//       } else if (selectedEdge !== null) {
//         const rect = canvasRef.current.getBoundingClientRect();
//         const mouseX = (e.clientX - rect.left) / img.current.width;
//         const mouseY = (e.clientY - rect.top) / img.current.height;
//         const deltaX = mouseX - initialMousePos.current.x / img.current.width;
//         const deltaY = mouseY - initialMousePos.current.y / img.current.height;

//         setPolygons((prevPolygons) =>
//           prevPolygons.map((polygon, polygonIndex) => {
//             if (polygonIndex === selectedEdge.polygonIndex) {
//               const updatedPoints = polygon.points.map((point, pointIndex) => {
//                 const nextPointIndex = (selectedEdge.edgeIndex + 1) % polygon.points.length;
//                 const prevPointIndex = selectedEdge.edgeIndex;
//                 if (pointIndex === prevPointIndex) {
//                   return [point[0] + deltaX, point[1] + deltaY];
//                 }
//                 if (pointIndex === nextPointIndex) {
//                   return [point[0] + deltaX, point[1] + deltaY];
//                 }
//                 return point;
//               });
//               return { ...polygon, points: updatedPoints };
//             }
//             return polygon;
//           })
//         );
//         initialMousePos.current = { x: mouseX * img.current.width, y: mouseY * img.current.height };
//         drawImageAndPolygons();
//       } else if (isDragging && selectedPolygon !== null) {
//         const rect = canvasRef.current.getBoundingClientRect();
//         const mouseX = e.clientX - rect.left;
//         const mouseY = e.clientY - rect.top;
//         const deltaX = (mouseX - initialMousePos.current.x) / img.current.width;
//         const deltaY = (mouseY - initialMousePos.current.y) / img.current.height;

//         setPolygons((prevPolygons) =>
//           prevPolygons.map((polygon, polygonIndex) => {
//             if (polygonIndex === selectedPolygon) {
//               const updatedPoints = polygon.points.map(([x, y]) => [x + deltaX, y + deltaY]);
//               return { ...polygon, points: updatedPoints };
//             }
//             return polygon;
//           })
//         );
//         initialMousePos.current = { x: mouseX, y: mouseY };
//         drawImageAndPolygons();
//       } else {
//         const rect = canvasRef.current.getBoundingClientRect();
//         const mouseX = e.clientX - rect.left;
//         const mouseY = e.clientY - rect.top;

//         let cursorChanged = false;
//         polygons.forEach((polygon) => {
//           for (let i = 0; i < polygon.points.length; i++) {
//             const [x1, y1] = polygon.points[i];
//             const [x2, y2] = polygon.points[(i + 1) % polygon.points.length];
//             const midX = ((x1 + x2) / 2) * img.current.width;
//             const midY = ((y1 + y2) / 2) * img.current.height;
//             if (mouseX >= midX - 5 && mouseX <= midX + 5 && mouseY >= midY - 5 && mouseY <= midY + 5) {
//               canvasRef.current.style.cursor = "pointer";
//               cursorChanged = true;
//               break;
//             }
//           }
//         });

//         if (!cursorChanged) {
//           canvasRef.current.style.cursor = "default";
//         }
//       }
//     },
//     [
//       isWheelDown,
//       clickMode,
//       polygons,
//       startPos,
//       isResizing,
//       selectedEdge,
//       drawImageAndPolygons,
//       isDragging,
//       selectedPolygon,
//     ]
//   );

//   const handleMouseUp = useCallback(
//     (e) => {
//       if (e.button === 1 || (clickMode === "sizeControll" && e.button === 0)) {
//         e.preventDefault();
//         setIsWheelDown(false);
//         setIsResizing(false);
//         setSelectedEdge(null);
//         e.currentTarget.style.cursor = "default";
//       } else if (clickMode === "movePolygon" && e.button === 0) {
//         setIsDragging(false);
//         setSelectedPolygon(null);
//       }
//     },
//     [clickMode]
//   );

//   const handleFileChange = (e: SubmitEvent) => {
//     const file = e.target.files[0];
//     if (!file) {
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const content = e.target.result;
//       setFileContent(content);
//       processFileContent(content, setLastLabelIndex, setPolygons);
//     };
//     reader.readAsText(file);
//   };

//   const handleDeletePolygon = () => {
//     if (modalPolygonIndex !== null) {
//       setPolygons((prev) => prev.filter((_, index) => index !== modalPolygonIndex));
//     }
//     setShowModal(false);
//     setModalPolygonIndex(null);
//   };

//   const handleModalInputUpdate = (modalInputValue) => {
//     if (modalPolygonIndex !== null) {
//       const updatedPolygons = polygons.map((polygon, index) => {
//         if (index === modalPolygonIndex) {
//           return { ...polygon, tag: modalInputValue.tag, description: modalInputValue.description };
//         }
//         return polygon;
//       });
//       setPolygons(updatedPolygons);
//     }
//     setShowModal(false);
//   };

//   const onPhotoUpload = (photo) => {
//     if (isNaN(modalPolygonIndex)) return;
//     setPhotos((prev) => ({
//       ...prev,
//       [modalPolygonIndex]: photo,
//     }));
//     setShowModal(false);
//   };

//   const changeModeToPolygon = () => {
//     setClickMode("polygonMake");
//   };
//   const changeModeToSizeControll = () => {
//     setClickMode("sizeControll");
//   };
//   const changeModeToMovePolygon = () => {
//     setClickMode("movePolygon");
//   };
//   const changeModeToAddEdge = () => {
//     setClickMode("addEdge");
//   };
//   const changeModeToDeleteEdge = () => {
//     // Added function to change to delete edge mode
//     setClickMode("deleteEdge");
//   };

//   return (
//     <div>
//       <input type="file" onChange={handleFileChange} />
//       <p>
//         예측값 범위: <span>{predictionRange}</span>
//       </p>
//       <input
//         type="range"
//         min="0"
//         max="1"
//         step="0.01"
//         value={predictionRange}
//         onChange={(e) => setPredictionRange(e.target.value)}
//       />
//       <button
//         type="button"
//         onClick={changeModeToPolygon}
//         style={{ backgroundColor: clickMode === "polygonMake" ? "lightblue" : "white" }}
//       >
//         폴리건 만들기
//       </button>
//       <button
//         type="button"
//         onClick={changeModeToSizeControll}
//         style={{ backgroundColor: clickMode === "sizeControll" ? "lightblue" : "white" }}
//       >
//         폴리건 사이즈 조절
//       </button>
//       <button
//         type="button"
//         onClick={changeModeToMovePolygon}
//         style={{ backgroundColor: clickMode === "movePolygon" ? "lightblue" : "white" }}
//       >
//         폴리건 이동
//       </button>
//       <button
//         type="button"
//         onClick={changeModeToAddEdge}
//         style={{ backgroundColor: clickMode === "addEdge" ? "lightblue" : "white" }}
//       >
//         엣지 추가
//       </button>
//       <button
//         type="button"
//         onClick={changeModeToDeleteEdge}
//         style={{ backgroundColor: clickMode === "deleteEdge" ? "lightblue" : "white" }}
//       >
//         엣지 삭제
//       </button>
//       <button onClick={() => handleSimplifyPolygons(polygons, setPolygons, drawImageAndPolygons)}>
//         Simplify Polygons
//       </button>
//       <button onClick={() => console.log(polygons)}>Log Polygons</button>
//       <canvas
//         ref={canvasRef}
//         width={2000}
//         height={1500}
//         onMouseDown={handleMouseDown}
//         onMouseUp={handleMouseUp}
//         onMouseMove={handleMouseMove}
//         onClick={handleCanvasClick}
//         onContextMenu={handleCanvasRightClick}
//         //onWheel={handleWheel}
//       />
//       {showModal && (
//         <CanvasModal
//           modalPos={modalPos}
//           onDelete={handleDeletePolygon}
//           onModalInputUpdate={handleModalInputUpdate}
//           setShowModal={setShowModal}
//           currentData={polygons[modalPolygonIndex]}
//           onPhotoUpload={onPhotoUpload}
//         />
//       )}
//       <p>
//         선택된 폴리곤 라벨 인덱스: <span>{selectedPolygonIndex}</span>
//       </p>
//       <button onClick={() => setScaleFactor(scaleFactor + 0.1)}>확대</button>
//       <button onClick={() => setScaleFactor(scaleFactor - 0.1)}>축소</button>
//       {photos[modalPolygonIndex] && <img src={photos[modalPolygonIndex]} alt="사진" />}
//     </div>
//   );
// };

// export default Canvas;

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import CanvasModal from "@/components/CanvasModal";

import useSetPredictionRange from "@/hooks/useSetPredictionRange";

import getColorForPolygon from "@/utils/getColorForPolygon";
import useDrawPolygon from "@/hooks/useDrawPolygon";

import useDrawImageAndPolygons from "@/hooks/useDrawImageandPolygons";
import distanceBetween from "@/utils/distanceBetween";
import isMouseInPolygon from "@/utils/isMouseInPolygon";
import processFileContent from "@/utils/processFileContent";
import handleSimplifyPolygons from "@/utils/handleSimplifyPolygons";
import { Point, Polygon, startPosType } from "./type";

const Canvas = () => {
  const [polygons, setPolygons] = useState<Polygon[] | []>([]);
  const [selectedPolygonIndex, setSelectedPolygonIndex] = useState<number | null>(null);
  const [predictionRange, setPredictionRange] = useState(0.5);
  const [scaleFactor, setScaleFactor] = useState(1.0);
  const [currentPolygon, setCurrentPolygon] = useState<[number, number][] | []>([]);
  const [isWheelDown, setIsWheelDown] = useState(false);
  const [startPos, setStartPos] = useState<startPosType>({ x: 0, y: 0 });
  const [fileContent, setFileContent] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });
  const [modalPolygonIndex, setModalPolygonIndex] = useState<number | null>(null);
  const [hoveredPolygonIndex, setHoveredPolygonIndex] = useState<number | null>(null);
  const [photos, setPhotos] = useState<Record<number, string>>({});
  const [lastLabelIndex, setLastLabelIndex] = useState(0);
  const [clickMode, setClickMode] = useState("polygonMake");
  const [isResizing, setIsResizing] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<{ polygonIndex: number; edgeIndex: number } | null>(null);
  const [selectedPolygon, setSelectedPolygon] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialMousePos = useRef({ x: 0, y: 0 });
  const img = useRef<HTMLImageElement | null>(null); // img를 null로 초기화

  useSetPredictionRange({ polygons, selectedPolygonIndex, predictionRange, setSelectedPolygonIndex });

  const drawPolygon = useDrawPolygon(
    predictionRange,
    selectedPolygonIndex,
    modalPolygonIndex,
    hoveredPolygonIndex,
    img
  );

  const drawCurrentPolygon = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (currentPolygon.length > 0) {
        ctx.beginPath();
        currentPolygon.forEach(([x, y], index) => {
          if (index === 0) {
            ctx.moveTo(x * img.current!.width, y * img.current!.height); // img가 null이 아님을 보장
          } else {
            ctx.lineTo(x * img.current!.width, y * img.current!.height); // img가 null이 아님을 보장
          }
        });
        ctx.closePath();
        ctx.stroke();
      }
    },
    [currentPolygon]
  );

  const drawImageAndPolygons = useDrawImageAndPolygons(
    canvasRef,
    img,
    startPos,
    polygons,
    predictionRange,
    drawPolygon,
    scaleFactor,
    currentPolygon
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      img.current = new Image(); // 클라이언트 측에서만 Image 객체 초기화
      img.current.src = "/test58.jpg";
      img.current.onload = () => {
        drawImageAndPolygons();
      };
    }
  }, [drawImageAndPolygons]);

  useEffect(() => {
    if (img.current && img.current.complete) {
      drawImageAndPolygons();
    }
  }, [predictionRange, drawImageAndPolygons]);

  const handleCanvasClick = useCallback(
    (e: MouseEvent) => {
      if (clickMode !== "polygonMake" || showModal) {
        return null;
      }

      const completionThreshold = 0.007;
      if (canvasRef.current) {
        const rect = (canvasRef.current as HTMLCanvasElement).getBoundingClientRect();
        const scaledX = (e.clientX - rect.left - startPos.x) / scaleFactor;
        const scaledY = (e.clientY - rect.top - startPos.y) / scaleFactor;
        const x = scaledX / img.current!.width; // img가 null이 아님을 보장
        const y = scaledY / img.current!.height; // img가 null이 아님을 보장
        const distance =
          currentPolygon.length > 0
            ? distanceBetween(x, y, currentPolygon[0][0], currentPolygon[0][1])
            : Number.MAX_VALUE;

        setCurrentPolygon((prev) => [...prev, [x, y]]);

        if (currentPolygon.length > 2 && distance < completionThreshold) {
          const newPolygon: Polygon = {
            labelIndex: lastLabelIndex,
            points: [...currentPolygon, [x, y]] as Point[],
            prediction: 0.95,
            color: getColorForPolygon(lastLabelIndex),
            isVisible: true,
            tag: "",
            description: "",
          };
          setLastLabelIndex((prev) => prev + 1);
          setPolygons((prev) => [...prev, newPolygon]);
          setCurrentPolygon([]);
        }

        let foundPolygonIndex: number | null = null;
        polygons.forEach((polygon, index) => {
          if (polygon.prediction >= predictionRange) {
            foundPolygonIndex = index;
          }
        });

        setSelectedPolygonIndex(foundPolygonIndex !== null ? foundPolygonIndex : null);
      }
    },
    [clickMode, showModal, currentPolygon, polygons, startPos, scaleFactor, img, lastLabelIndex, predictionRange]
  );

  const handleCanvasRightClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();

      if (clickMode === "sizeControll" && currentPolygon.length > 0) {
        setCurrentPolygon([]);
        const canvas = canvasRef.current;
        const ctx = canvas!.getContext("2d");
        drawImageAndPolygons(ctx);
        return;
      }

      setShowModal(true);
      setModalPos({
        x: e.clientX + window.scrollX,
        y: e.clientY + window.scrollY,
      });

      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let foundPolygonIndex: number | null = null;
      polygons.forEach((polygon, index) => {
        if (isMouseInPolygon(mouseX, mouseY, polygon, canvasRef, scaleFactor, startPos, img)) {
          foundPolygonIndex = index;
        }
      });
      setModalPolygonIndex(foundPolygonIndex);

      if (foundPolygonIndex !== null) {
        setModalPolygonIndex(foundPolygonIndex);
      } else {
        setCurrentPolygon([]);
      }
    },
    [clickMode, currentPolygon, polygons, startPos, scaleFactor, img, drawImageAndPolygons]
  );

  const handleMouseDown = useCallback(
    (e) => {
      if (e.button === 1) {
        setIsWheelDown(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.style.cursor = "grabbing";
      } else if (e.button === 0) {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (clickMode === "polygonMake") {
          let foundPolygon = false;

          polygons.forEach((polygon) => {
            if (isMouseInPolygon(mouseX, mouseY, polygon, canvasRef, scaleFactor, startPos, img)) {
              setSelectedPolygonIndex(polygon.labelIndex);
              foundPolygon = true;
            }
          });

          if (!foundPolygon) {
            setSelectedPolygonIndex(null);
          }
        } else if (clickMode === "sizeControll") {
          polygons.forEach((polygon, polygonIndex) => {
            for (let i = 0; i < polygon.points.length; i++) {
              const [x1, y1] = polygon.points[i];
              const [x2, y2] = polygon.points[(i + 1) % polygon.points.length];
              const midX = ((x1 + x2) / 2) * img.current!.width;
              const midY = ((y1 + y2) / 2) * img.current!.height;
              if (mouseX >= midX - 5 && mouseX <= midX + 5 && mouseY >= midY - 5 && mouseY <= midY + 5) {
                initialMousePos.current = { x: mouseX, y: mouseY };
                setSelectedPolygonIndex(polygonIndex);
                setSelectedEdge({ polygonIndex, edgeIndex: i });
                break;
              }
            }
          });
        } else if (clickMode === "movePolygon") {
          polygons.forEach((polygon, polygonIndex) => {
            if (isMouseInPolygon(mouseX, mouseY, polygon, canvasRef, scaleFactor, startPos, img)) {
              setSelectedPolygon(polygonIndex);
              initialMousePos.current = { x: mouseX, y: mouseY };
              setIsDragging(true);
            }
          });
        } else if (clickMode === "addEdge") {
          // const canvasDiv = document.getElementById("canvas");
          // canvasDiv?.addEventListener("mousemove", function (e) {
          //   let newX = e.screenX;
          //   let newY = e.screenY;
          // });
          polygons.forEach((polygon, polygonIndex) => {
            for (let i = 0; i < polygon.points.length; i++) {
              const [x1, y1] = polygon.points[i];
              const [x2, y2] = polygon.points[(i + 1) % polygon.points.length];
              const midX = ((x1 + x2) / 2) * img.current!.width;
              const midY = ((y1 + y2) / 2) * img.current!.height;
              if (mouseX >= midX - 5 && mouseX <= midX + 5 && mouseY >= midY - 5 && mouseY <= midY + 5) {
                const newPoint = [(x1 + x2) / 2, (y1 + y2) / 2];
                setPolygons((prevPolygons) =>
                  prevPolygons.map((polygon, idx) =>
                    idx === polygonIndex
                      ? {
                          ...polygon,
                          points: [...polygon.points.slice(0, i + 1), newPoint, ...polygon.points.slice(i + 1)],
                        }
                      : polygon
                  )
                );
                break;
              }
            }
          });
        } else if (clickMode === "deleteEdge") {
          // Added delete edge mode
          polygons.forEach((polygon, polygonIndex) => {
            for (let i = 0; i < polygon.points.length; i++) {
              const [x1, y1] = polygon.points[i];
              const [x2, y2] = polygon.points[(i + 1) % polygon.points.length];
              const midX = ((x1 + x2) / 2) * img.current!.width;
              const midY = ((y1 + y2) / 2) * img.current!.height;
              if (mouseX >= midX - 5 && mouseX <= midX + 5 && mouseY >= midY - 5 && mouseY <= midY + 5) {
                setPolygons((prevPolygons) =>
                  prevPolygons.map((polygon, idx) =>
                    idx === polygonIndex
                      ? {
                          ...polygon,
                          points: polygon.points.filter((_, pointIndex) => pointIndex !== i),
                        }
                      : polygon
                  )
                );
                break;
              }
            }
          });
        }
      }
    },
    [clickMode, polygons, isResizing, isMouseInPolygon]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (isWheelDown) {
        if (clickMode === "polygonMake") {
          const newOffset = {
            x: startPos.x + (e.clientX - dragStart.current.x),
            y: startPos.y + (e.clientY - dragStart.current.y),
          };
          setStartPos(newOffset);
          dragStart.current = { x: e.clientX, y: e.clientY };
          e.preventDefault();
        }
      } else if (selectedEdge !== null) {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / img.current!.width;
        const mouseY = (e.clientY - rect.top) / img.current!.height;
        const deltaX = mouseX - initialMousePos.current.x / img.current!.width;
        const deltaY = mouseY - initialMousePos.current.y / img.current!.height;

        setPolygons((prevPolygons) =>
          prevPolygons.map((polygon, polygonIndex) => {
            if (polygonIndex === selectedEdge.polygonIndex) {
              const updatedPoints = polygon.points.map((point, pointIndex) => {
                const nextPointIndex = (selectedEdge.edgeIndex + 1) % polygon.points.length;
                const prevPointIndex = selectedEdge.edgeIndex;
                if (pointIndex === prevPointIndex) {
                  return [point[0] + deltaX, point[1] + deltaY];
                }
                if (pointIndex === nextPointIndex) {
                  return [point[0] + deltaX, point[1] + deltaY];
                }
                return point;
              });
              return { ...polygon, points: updatedPoints };
            }
            return polygon;
          })
        );
        initialMousePos.current = { x: mouseX * img.current!.width, y: mouseY * img.current!.height };
        drawImageAndPolygons();
      } else if (isDragging && selectedPolygon !== null) {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const deltaX = (mouseX - initialMousePos.current.x) / img.current!.width;
        const deltaY = (mouseY - initialMousePos.current.y) / img.current!.height;

        setPolygons((prevPolygons) =>
          prevPolygons.map((polygon, polygonIndex) => {
            if (polygonIndex === selectedPolygon) {
              const updatedPoints = polygon.points.map(([x, y]) => [x + deltaX, y + deltaY]);
              return { ...polygon, points: updatedPoints };
            }
            return polygon;
          })
        );
        initialMousePos.current = { x: mouseX, y: mouseY };
        drawImageAndPolygons();
      } else {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        let cursorChanged = false;
        polygons.forEach((polygon) => {
          for (let i = 0; i < polygon.points.length; i++) {
            const [x1, y1] = polygon.points[i];
            const [x2, y2] = polygon.points[(i + 1) % polygon.points.length];
            const midX = ((x1 + x2) / 2) * img.current!.width;
            const midY = ((y1 + y2) / 2) * img.current!.height;
            if (mouseX >= midX - 5 && mouseX <= midX + 5 && mouseY >= midY - 5 && mouseY <= midY + 5) {
              canvasRef.current.style.cursor = "pointer";
              cursorChanged = true;
              break;
            }
          }
        });

        if (!cursorChanged) {
          canvasRef.current.style.cursor = "default";
        }
      }
    },
    [
      isWheelDown,
      clickMode,
      polygons,
      startPos,
      isResizing,
      selectedEdge,
      drawImageAndPolygons,
      isDragging,
      selectedPolygon,
    ]
  );

  const handleMouseUp = useCallback(
    (e) => {
      if (e.button === 1 || (clickMode === "sizeControll" && e.button === 0)) {
        e.preventDefault();
        setIsWheelDown(false);
        setIsResizing(false);
        setSelectedEdge(null);
        e.currentTarget.style.cursor = "default";
      } else if (clickMode === "movePolygon" && e.button === 0) {
        setIsDragging(false);
        setSelectedPolygon(null);
      }
    },
    [clickMode]
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setFileContent(content);
      processFileContent(content, setLastLabelIndex, setPolygons);
    };
    reader.readAsText(file);
  };

  const handleDeletePolygon = () => {
    if (modalPolygonIndex !== null) {
      setPolygons((prev) => prev.filter((_, index) => index !== modalPolygonIndex));
    }
    setShowModal(false);
    setModalPolygonIndex(null);
  };

  const handleModalInputUpdate = (modalInputValue) => {
    if (modalPolygonIndex !== null) {
      const updatedPolygons = polygons.map((polygon, index) => {
        if (index === modalPolygonIndex) {
          return { ...polygon, tag: modalInputValue.tag, description: modalInputValue.description };
        }
        return polygon;
      });
      setPolygons(updatedPolygons);
    }
    setShowModal(false);
  };

  const onPhotoUpload = (photo) => {
    if (isNaN(modalPolygonIndex)) return;
    setPhotos((prev) => ({
      ...prev,
      [modalPolygonIndex]: photo,
    }));
    setShowModal(false);
  };

  const changeModeToPolygon = () => {
    setClickMode("polygonMake");
  };
  const changeModeToSizeControll = () => {
    setClickMode("sizeControll");
  };
  const changeModeToMovePolygon = () => {
    setClickMode("movePolygon");
  };
  const changeModeToAddEdge = () => {
    setClickMode("addEdge");
  };
  const changeModeToDeleteEdge = () => {
    // Added function to change to delete edge mode
    setClickMode("deleteEdge");
  };

  const logPolygons = () => {
    console.log("Current Polygons:", polygons);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <p>
        예측값 범위: <span>{predictionRange}</span>
      </p>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={predictionRange}
        onChange={(e) => setPredictionRange(e.target.value)}
      />
      <button
        type="button"
        onClick={changeModeToPolygon}
        style={{ backgroundColor: clickMode === "polygonMake" ? "lightblue" : "white" }}
      >
        폴리건 만들기
      </button>
      <button
        type="button"
        onClick={changeModeToSizeControll}
        style={{ backgroundColor: clickMode === "sizeControll" ? "lightblue" : "white" }}
      >
        폴리건 사이즈 조절
      </button>
      <button
        type="button"
        onClick={changeModeToMovePolygon}
        style={{ backgroundColor: clickMode === "movePolygon" ? "lightblue" : "white" }}
      >
        폴리건 이동
      </button>
      <button
        type="button"
        onClick={changeModeToAddEdge}
        style={{ backgroundColor: clickMode === "addEdge" ? "lightblue" : "white" }}
      >
        엣지 추가
      </button>
      <button
        type="button"
        onClick={changeModeToDeleteEdge}
        style={{ backgroundColor: clickMode === "deleteEdge" ? "lightblue" : "white" }}
      >
        엣지 삭제
      </button>
      <button onClick={() => handleSimplifyPolygons(polygons, setPolygons, drawImageAndPolygons)}>
        Simplify Polygons
      </button>
      <canvas
        className="canvas"
        ref={canvasRef}
        width={2000}
        height={1500}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onClick={handleCanvasClick}
        onContextMenu={handleCanvasRightClick}
        //onWheel={handleWheel}
      />
      {showModal && (
        <CanvasModal
          modalPos={modalPos}
          onDelete={handleDeletePolygon}
          onModalInputUpdate={handleModalInputUpdate}
          setShowModal={setShowModal}
          currentData={polygons[modalPolygonIndex]}
          onPhotoUpload={onPhotoUpload}
        />
      )}
      <p>
        선택된 폴리곤 라벨 인덱스: <span>{selectedPolygonIndex}</span>
      </p>
      <button onClick={() => setScaleFactor(scaleFactor + 0.1)}>확대</button>
      <button onClick={() => setScaleFactor(scaleFactor - 0.1)}>축소</button>
      <button onClick={logPolygons}>로그 폴리곤</button>
      {photos[modalPolygonIndex] && <img src={photos[modalPolygonIndex]} alt="사진" />}
    </div>
  );
};

export default Canvas;
