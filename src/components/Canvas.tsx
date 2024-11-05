// src/components/Canvas.tsx

"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import useDrawImageAndPolygons from "@/hooks/useDrawImageandPolygons";

import useDrawPolygon from "../hooks/useDrawPolygon";
import useSetPredictionRange from "../hooks/useSetPredictionRange";
import distanceFromPointToLineSegment from "../utils/distanceFromPointToLineSegment";
import getColorForPolygon from "../utils/getColorForPolygon";
import handleSimplifyPolygons from "../utils/handleSimplifyPolygons";
import isMouseInPolygon from "../utils/isMouseInPolygon";
import processFileContent from "../utils/processFileContent";
import { Polygon, StartPosType } from "../types";
import CanvasModal from "./CanvasModal";

const Canvas: React.FC = () => {
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [selectedPolygonLabelIndex, setSelectedPolygonLabelIndex] = useState<number | null>(null);
  const [predictionRange, setPredictionRange] = useState<number>(0.5);
  const [scaleFactor, setScaleFactor] = useState<number>(1.0);
  const [currentPolygon, setCurrentPolygon] = useState<[number, number][]>([]);
  const [isWheelDown, setIsWheelDown] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<StartPosType>({ x: 0, y: 0 });
  const [fileContent, setFileContent] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalPos, setModalPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [modalPolygonLabelIndex, setModalPolygonLabelIndex] = useState<number | null>(null);
  const [hoveredPolygonLabelIndex, setHoveredPolygonLabelIndex] = useState<number | null>(null);
  const [photos, setPhotos] = useState<Record<number, string>>({});
  const [lastLabelIndex, setLastLabelIndex] = useState<number>(0);
  const [clickMode, setClickMode] = useState<string>("polygonMake");
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [selectedEdge, setSelectedEdge] = useState<{ polygonLabelIndex: number; edgeIndex: number } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [key, setKey] = useState<string>("Q");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const img = useRef<HTMLImageElement | null>(null);
  const isMouseDown = useRef<boolean>(false);
  const hasMoved = useRef<boolean>(false);

  useSetPredictionRange({
    polygons,
    selectedPolygonLabelIndex,
    predictionRange,
    setSelectedPolygonLabelIndex,
  });

  const drawPolygon = useDrawPolygon({
    predictionRange,
    selectedPolygonLabelIndex,
    modalPolygonLabelIndex,
    hoveredPolygonLabelIndex,
    img,
    scaleFactor,
  });

  const drawImageAndPolygons = useDrawImageAndPolygons({
    canvasRef,
    img,
    startPos,
    polygons,
    predictionRange,
    drawPolygon,
    scaleFactor,
    currentPolygon,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKey(e.key);

      if (e.key === "Escape") {
        if (clickMode === "polygonMake") {
          setCurrentPolygon([]);
          drawImageAndPolygons();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [clickMode, drawImageAndPolygons]);

  useMemo(() => {
    if (key === "q") {
      setClickMode("polygonMake");
    } else if (key === "w") {
      setClickMode("sizeControll");
    }
  }, [key]);

  useEffect(() => {
    initialMousePos.current = startPos;
  }, [startPos]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!img.current || img.current.src === "") {
        img.current = new Image();
        img.current.src = "/image4.png";
        img.current.onload = () => {
          drawImageAndPolygons();
        };
      }
    }
  }, [drawImageAndPolygons]);

  useEffect(() => {
    if (img.current && img.current.complete) {
      drawImageAndPolygons();
    }
  }, [predictionRange, drawImageAndPolygons]);

  const getCanvasCoordinates = (e: React.MouseEvent | MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();

    if (!rect) return { x: 0, y: 0 };

    const x = (e.clientX - rect.left - startPos.x) / scaleFactor;
    const y = (e.clientY - rect.top - startPos.y) / scaleFactor;

    return { x, y };
  };

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (clickMode !== "polygonMake" || showModal) {
        return;
      }

      const completionThreshold = 5;

      if (canvasRef.current && img.current) {
        const { x: canvasX, y: canvasY } = getCanvasCoordinates(e);

        const x = canvasX / img.current.width;
        const y = canvasY / img.current.height;

        setCurrentPolygon((prev) => [...prev, [x, y]]);

        if (currentPolygon.length > 0) {
          const adjustedX = x * img.current.width;
          const adjustedY = y * img.current.height;
          const firstPointX = currentPolygon[0][0] * img.current.width;
          const firstPointY = currentPolygon[0][1] * img.current.height;

          const screenAdjustedX = adjustedX * scaleFactor + startPos.x;
          const screenAdjustedY = adjustedY * scaleFactor + startPos.y;
          const screenFirstPointX = firstPointX * scaleFactor + startPos.x;
          const screenFirstPointY = firstPointY * scaleFactor + startPos.y;

          const distance = Math.hypot(
            screenAdjustedX - screenFirstPointX,
            screenAdjustedY - screenFirstPointY
          );

          if (currentPolygon.length > 2 && distance < completionThreshold) {
            const newPolygon: Polygon = {
              labelIndex: lastLabelIndex,
              points: currentPolygon,
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
        }

        drawImageAndPolygons();
      }
    },
    [
      clickMode,
      showModal,
      currentPolygon,
      polygons,
      startPos,
      scaleFactor,
      img,
      lastLabelIndex,
      predictionRange,
      drawImageAndPolygons,
    ]
  );

  const handleCanvasRightClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      e.preventDefault();

      if (!canvasRef.current) return;

      const { x: mouseX, y: mouseY } = getCanvasCoordinates(e);

      let foundPolygonLabelIndex: number | null = null;

      polygons.forEach((polygon) => {
        if (
          isMouseInPolygon(
            mouseX,
            mouseY,
            polygon,
            canvasRef,
            scaleFactor,
            startPos,
            img
          )
        ) {
          foundPolygonLabelIndex = polygon.labelIndex;
        }
      });

      if (foundPolygonLabelIndex !== null) {
        setModalPolygonLabelIndex(foundPolygonLabelIndex);
        setModalPos({
          x: e.clientX + window.scrollX,
          y: e.clientY + window.scrollY,
        });
        setShowModal(true);
      } else {
        setShowModal(false);
        setModalPolygonLabelIndex(null);
      }

      if (clickMode === "polygonMake") {
        setCurrentPolygon([]);
      }
    },
    [clickMode, polygons, scaleFactor, startPos, img, getCanvasCoordinates]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (e.button === 1) {
        setIsWheelDown(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.style.cursor = "grabbing";
      } else if (e.button === 0) {
        const { x: mouseX, y: mouseY } = getCanvasCoordinates(e);
        isMouseDown.current = true;
        dragStart.current = { x: e.clientX, y: e.clientY };

        if (clickMode === "sizeControll") {
          let pointFound = false;

          polygons.forEach((polygon) => {
            polygon.points.forEach((point, pointIndex) => {
              const adjustedX = point[0] * img.current!.width;
              const adjustedY = point[1] * img.current!.height;

              if (
                Math.abs(mouseX - adjustedX) < 5 / scaleFactor &&
                Math.abs(mouseY - adjustedY) < 5 / scaleFactor
              ) {
                initialMousePos.current = { x: mouseX, y: mouseY };
                setSelectedPolygonLabelIndex(polygon.labelIndex);
                setSelectedEdge({ polygonLabelIndex: polygon.labelIndex, edgeIndex: pointIndex });
                setIsResizing(true);
                pointFound = true;
              }
            });
          });

          if (!pointFound) {
            let edgeFound = false;
            polygons.forEach((polygon) => {
              const points = polygon.points.map(([x, y]) => [
                x * img.current!.width,
                y * img.current!.height,
              ]);

              for (let i = 0; i < points.length; i++) {
                const [x1, y1] = points[i];
                const [x2, y2] = points[(i + 1) % points.length];

                const distance = distanceFromPointToLineSegment(
                  mouseX,
                  mouseY,
                  x1,
                  y1,
                  x2,
                  y2
                );

                if (distance < 5 / scaleFactor) {
                  const normalizedX = mouseX / img.current!.width;
                  const normalizedY = mouseY / img.current!.height;

                  setPolygons((prevPolygons) =>
                    prevPolygons.map((poly) => {
                      if (poly.labelIndex === polygon.labelIndex) {
                        const newPoints = [...poly.points];
                        const insertIndex = (i + 1) % newPoints.length;
                        newPoints.splice(insertIndex, 0, [normalizedX, normalizedY]);
                        return { ...poly, points: newPoints };
                      }
                      return poly;
                    })
                  );

                  setSelectedPolygonLabelIndex(polygon.labelIndex);
                  setSelectedEdge({
                    polygonLabelIndex: polygon.labelIndex,
                    edgeIndex: (i + 1) % polygon.points.length,
                  });
                  initialMousePos.current = { x: mouseX, y: mouseY };
                  setIsResizing(true);

                  edgeFound = true;
                  break;
                }
              }
            });

            if (!edgeFound) {
              polygons.forEach((polygon) => {
                if (
                  isMouseInPolygon(
                    mouseX,
                    mouseY,
                    polygon,
                    canvasRef,
                    scaleFactor,
                    startPos,
                    img
                  )
                ) {
                  setSelectedPolygonLabelIndex(polygon.labelIndex);
                  initialMousePos.current = { x: mouseX, y: mouseY };
                  setIsDragging(true);
                }
              });
            }
          }
        }
      }
    },
    [clickMode, polygons, scaleFactor, startPos, img]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x: mouseX, y: mouseY } = getCanvasCoordinates(e);
      let hoveredLabelIndex: number | null = null;

      polygons.forEach((polygon) => {
        if (
          isMouseInPolygon(
            mouseX,
            mouseY,
            polygon,
            canvasRef,
            scaleFactor,
            startPos,
            img
          )
        ) {
          hoveredLabelIndex = polygon.labelIndex;
        }
      });

      setHoveredPolygonLabelIndex(hoveredLabelIndex);
      drawImageAndPolygons();

      if (isMouseDown.current) {
        const deltaX = e.clientX - dragStart.current.x;
        const deltaY = e.clientY - dragStart.current.y;
        if (Math.hypot(deltaX, deltaY) > 5) {
          hasMoved.current = true;
        }
      }

      if (isWheelDown) {
        const deltaX = e.clientX - dragStart.current.x;
        const deltaY = e.clientY - dragStart.current.y;
        const newOffset = {
          x: startPos.x + deltaX,
          y: startPos.y + deltaY,
        };
        setStartPos(newOffset);
        dragStart.current = { x: e.clientX, y: e.clientY };
        e.preventDefault();
      } else if (selectedEdge && isResizing) {
        const normalizedX = mouseX / img.current!.width;
        const normalizedY = mouseY / img.current!.height;

        setPolygons((prevPolygons) =>
          prevPolygons.map((polygon) => {
            if (polygon.labelIndex === selectedEdge.polygonLabelIndex) {
              const updatedPoints: [number, number][] = polygon.points.map(
                (point: [number, number], pointIndex) => {
                  if (pointIndex === selectedEdge.edgeIndex) {
                    return [normalizedX, normalizedY] as [number, number];
                  }
                  return point;
                }
              );
              return { ...polygon, points: updatedPoints };
            }
            return polygon;
          })
        );
        
        drawImageAndPolygons();
      } else if (isDragging && selectedPolygonLabelIndex !== null) {
        const deltaX = (mouseX - initialMousePos.current.x) / img.current!.width;
        const deltaY = (mouseY - initialMousePos.current.y) / img.current!.height;
      
        setPolygons((prevPolygons) =>
          prevPolygons.map((polygon) => {
            if (polygon.labelIndex === selectedPolygonLabelIndex) {
              const updatedPoints: [number, number][] = polygon.points.map(
                ([x, y]: [number, number]) => {
                  return [x + deltaX, y + deltaY] as [number, number];
                }
              );
              return { ...polygon, points: updatedPoints };
            }
            return polygon;
          })
        );
      
        drawImageAndPolygons();
      } else {
        let cursorChanged = false;
        polygons.forEach((polygon) => {
          polygon.points.forEach(([x, y]) => {
            const adjustedX = x * img.current!.width;
            const adjustedY = y * img.current!.height;

            if (
              Math.abs(mouseX - adjustedX) < 5 / scaleFactor &&
              Math.abs(mouseY - adjustedY) < 5 / scaleFactor
            ) {
              if (canvasRef.current) {
                canvasRef.current.style.cursor = "pointer";
              }
              cursorChanged = true;
            }
          });

          if (
            !cursorChanged &&
            isMouseInPolygon(
              mouseX,
              mouseY,
              polygon,
              canvasRef,
              scaleFactor,
              startPos,
              img
            )
          ) {
            if (canvasRef.current) {
              canvasRef.current.style.cursor = "move";
            }
            cursorChanged = true;
          }
        });

        if (!cursorChanged && canvasRef.current) {
          canvasRef.current.style.cursor = "default";
        }
      }
    },
    [
      isWheelDown,
      selectedEdge,
      isResizing,
      isDragging,
      selectedPolygonLabelIndex,
      polygons,
      scaleFactor,
      startPos,
      img,
      drawImageAndPolygons,
    ]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (e.button === 1 || e.button === 0) {
        e.preventDefault();
        setIsWheelDown(false);
        setIsResizing(false);
        setIsDragging(false);
        setSelectedEdge(null);
        e.currentTarget.style.cursor = "default";
        isMouseDown.current = false;
      }
    },
    []
  );

  const handleCanvasDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (clickMode !== "sizeControll") return;

      const { x: mouseX, y: mouseY } = getCanvasCoordinates(e);
      let pointFound = false;

      setPolygons((prevPolygons) =>
        prevPolygons
          .map((polygon) => {
            const updatedPoints = polygon.points.filter((point) => {
              const adjustedX = point[0] * img.current!.width;
              const adjustedY = point[1] * img.current!.height;

              const isCloseToMouse =
                Math.abs(mouseX - adjustedX) < 5 / scaleFactor &&
                Math.abs(mouseY - adjustedY) < 5 / scaleFactor;

              if (isCloseToMouse) {
                pointFound = true;
                return false;
              }
              return true;
            });

            return updatedPoints.length >= 2 ? { ...polygon, points: updatedPoints } : null;
          })
          .filter(Boolean) as Polygon[]
      );

      if (pointFound) {
        drawImageAndPolygons();
      }
    },
    [clickMode, scaleFactor, img, getCanvasCoordinates, drawImageAndPolygons]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files![0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target!.result as string;
      setFileContent(content);
      processFileContent(content, setLastLabelIndex, setPolygons);
    };
    reader.readAsText(file);
  };

  const handleDeletePolygon = () => {
    if (modalPolygonLabelIndex !== null) {
      setPolygons((prev) => prev.filter((polygon) => polygon.labelIndex !== modalPolygonLabelIndex));
      setSelectedPolygonLabelIndex(null);
      setHoveredPolygonLabelIndex(null);
      setModalPolygonLabelIndex(null);
      setShowModal(false);
    }
  };

  const handleModalInputUpdate = (modalInputValue: { tag: string; description: string }) => {
    if (modalPolygonLabelIndex !== null) {
      const updatedPolygons = polygons.map((polygon) => {
        if (polygon.labelIndex === modalPolygonLabelIndex) {
          return {
            ...polygon,
            tag: modalInputValue.tag,
            description: modalInputValue.description,
          };
        }
        return polygon;
      });
      setPolygons(updatedPolygons);
    }
    setShowModal(false);
  };

  const onPhotoUpload = (photo: string) => {
    if (isNaN(modalPolygonLabelIndex as number)) return;
    setPhotos((prev) => ({
      ...prev,
      [modalPolygonLabelIndex!]: photo,
    }));
    setShowModal(false);
  };

  const handleZoom = useCallback(
    (zoomIn: boolean) => {
      const newScaleFactor = zoomIn ? scaleFactor + 0.1 : scaleFactor - 0.1;
      setScaleFactor(newScaleFactor);
      setClickMode((prevMode) => prevMode);
    },
    [scaleFactor]
  );

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();

        const { x: mouseX, y: mouseY } = getCanvasCoordinates(e);

        const zoomAmount = e.deltaY < 0 ? 0.1 : -0.1;
        const newScaleFactor = scaleFactor + zoomAmount;

        if (newScaleFactor < 0.1 || newScaleFactor > 10) return;

        const newStartPos = {
          x: startPos.x - mouseX * zoomAmount,
          y: startPos.y - mouseY * zoomAmount,
        };

        setScaleFactor(newScaleFactor);
        setStartPos(newStartPos);
      }
    },
    [scaleFactor, startPos]
  );

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      canvas.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("wheel", handleWheel);
      }
    };
  }, [handleWheel]);

  const changeModeToPolygon = () => {
    setClickMode("polygonMake");
  };

  const changeModeToSizeControll = () => {
    setClickMode("sizeControll");
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
        onChange={(e) => setPredictionRange(parseFloat(e.target.value))}
      />
      <button
        type="button"
        onClick={changeModeToPolygon}
        style={{
          backgroundColor: clickMode === "polygonMake" ? "lightblue" : "white",
        }}
      >
        폴리곤 만들기(q)
      </button>
      <button
        type="button"
        onClick={changeModeToSizeControll}
        style={{
          backgroundColor: clickMode === "sizeControll" ? "lightblue" : "white",
        }}
      >
        폴리곤 사이즈 조절(w)
      </button>
      <button
        onClick={() =>
          handleSimplifyPolygons(polygons, setPolygons, drawImageAndPolygons)
        }
      >
        Simplify Polygons
      </button>
      <canvas
        className="canvas"
        ref={canvasRef}
        width={3380}
        height={1808}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
        onContextMenu={handleCanvasRightClick}
      />
      {showModal && (
        <CanvasModal
          modalPos={modalPos}
          onDelete={handleDeletePolygon}
          onModalInputUpdate={handleModalInputUpdate}
          setShowModal={setShowModal}
          currentData={polygons.find(
            (polygon) => polygon.labelIndex === modalPolygonLabelIndex
          )}
          onPhotoUpload={onPhotoUpload}
        />
      )}
      <p>
        선택된 폴리곤 라벨 인덱스: <span>{selectedPolygonLabelIndex}</span>
      </p>
      <button onClick={() => handleZoom(true)}>확대</button>
      <button onClick={() => handleZoom(false)}>축소</button>
      <button onClick={logPolygons}>로그 폴리곤</button>
      {photos[modalPolygonLabelIndex!] && (
        <img src={photos[modalPolygonLabelIndex!]} alt="사진" />
      )}
    </div>
  );
};

export default Canvas;
