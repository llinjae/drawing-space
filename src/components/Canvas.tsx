"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Point, Polygon, startPosType } from "@/types";
import CanvasModal from "@/components/CanvasModal";
import distanceFromPointToLineSegment from "@/utils/distanceFromPointToLineSegment";
import getColorForPolygon from "@/utils/getColorForPolygon";
import handleSimplifyPolygons from "@/utils/handleSimplifyPolygons";
import isMouseInPolygon from "@/utils/isMouseInPolygon";
import processFileContent from "@/utils/processFileContent";
import useDrawImageAndPolygons from "@/hooks/useDrawImageandPolygons";
import useDrawPolygon from "@/hooks/useDrawPolygon";
import useSetPredictionRange from "@/hooks/useSetPredictRange";

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
  const [modalPolygonLabelIndex, setModalPolygonLabelIndex] = useState<number | null>(null);
  const [hoveredPolygonLabelIndex, setHoveredPolygonLabelIndex] = useState<number | null>(null);
  const [photos, setPhotos] = useState<Record<number, string>>({});
  const [lastLabelIndex, setLastLabelIndex] = useState(0);
  const [clickMode, setClickMode] = useState("polygonMake");
  const [isResizing, setIsResizing] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<{ polygonLabelIndex: number; edgeIndex: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [key, setKey] = useState("Q");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialMousePos = useRef({ x: 0, y: 0 });
  const img = useRef<HTMLImageElement | null>(null);
  const isMouseDown = useRef(false);
  const hasMoved = useRef(false);

  useSetPredictionRange({
    polygons,
    selectedPolygonIndex,
    predictionRange,
    setSelectedPolygonIndex,
  });

  const drawPolygon = useDrawPolygon(
    predictionRange,
    selectedPolygonIndex,
    modalPolygonLabelIndex,
    hoveredPolygonLabelIndex,
    img,
    scaleFactor
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
    const handleKeyDown = (e) => {
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
          if (canvasRef.current && img.current) {
            // 화면의 너비와 높이 가져오기
            const maxWidth = window.innerWidth;
            const maxHeight = window.innerHeight;

            // 이미지와 화면 크기 비교하여 스케일링 팩터 계산
            const imgWidth = img.current.width;
            const imgHeight = img.current.height;

            const widthRatio = maxWidth / imgWidth;
            const heightRatio = maxHeight / imgHeight;
            const scalingFactor = Math.min(widthRatio, heightRatio, 1);

            // 캔버스 크기 설정
            canvasRef.current.width = imgWidth * scalingFactor;
            canvasRef.current.height = imgHeight * scalingFactor;

            // 스케일링 팩터 상태 업데이트
            setScaleFactor(scalingFactor);

            // 이미지 및 폴리곤 그리기
            drawImageAndPolygons();
          }
        };
      }
    }
  }, [drawImageAndPolygons]);

  useEffect(() => {
    if (img.current && img.current.complete) {
      drawImageAndPolygons();
    }
  }, [predictionRange, drawImageAndPolygons]);

  const getCanvasCoordinates = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();

    // 화면 좌표에서 캔버스 상대 좌표로 변환
    const x = (e.clientX - rect.left - startPos.x) / scaleFactor;
    const y = (e.clientY - rect.top - startPos.y) / scaleFactor;

    return { x, y };
  };

  const handleCanvasClick = useCallback(
    (e) => {
      if (clickMode !== "polygonMake" || showModal) {
        return;
      }

      const completionThreshold = 5; // 픽셀 단위

      if (canvasRef.current) {
        const { x: canvasX, y: canvasY } = getCanvasCoordinates(e);

        // 이미지 크기로 정규화
        const x = canvasX / img.current.width;
        const y = canvasY / img.current.height;

        // 현재 폴리곤에 점 추가
        setCurrentPolygon((prev) => [...prev, [x, y]]);

        // 첫 번째 점과의 거리 계산 (화면 좌표계에서)
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
            const newPolygon = {
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
    (e: MouseEvent) => {
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
    (e) => {
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

          // 기존 점 클릭 확인
          polygons.forEach((polygon) => {
            polygon.points.forEach((point, pointIndex) => {
              const adjustedX = point[0] * img.current.width;
              const adjustedY = point[1] * img.current.height;

              if (
                Math.abs(mouseX - adjustedX) < 5 / scaleFactor &&
                Math.abs(mouseY - adjustedY) < 5 / scaleFactor
              ) {
                initialMousePos.current = { x: mouseX, y: mouseY };
                setSelectedPolygonIndex(polygon.labelIndex);
                setSelectedEdge({ polygonLabelIndex: polygon.labelIndex, edgeIndex: pointIndex });
                setIsResizing(true);
                pointFound = true;
              }
            });
          });

          // 에지 클릭 확인 및 새 점 추가
          if (!pointFound) {
            let edgeFound = false;
            polygons.forEach((polygon) => {
              const points = polygon.points.map(([x, y]) => [
                x * img.current.width,
                y * img.current.height,
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
                  const normalizedX = mouseX / img.current.width;
                  const normalizedY = mouseY / img.current.height;

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

                  // 추가된 점을 선택 상태로 설정
                  setSelectedPolygonIndex(polygon.labelIndex);
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

            // 폴리곤 내부 클릭 시 이동 처리
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
                  setSelectedPolygonIndex(polygon.labelIndex);
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
    (e) => {
      const { x: mouseX, y: mouseY } = getCanvasCoordinates(e);
      let hoveredLabelIndex = null;

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

      // 휠을 누른 상태에서 canvas 이동
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
        const { x: mouseX, y: mouseY } = getCanvasCoordinates(e);

        const normalizedX = mouseX / img.current.width;
        const normalizedY = mouseY / img.current.height;

        setPolygons((prevPolygons) =>
          prevPolygons.map((polygon) => {
            if (polygon.labelIndex === selectedEdge.polygonLabelIndex) {
              const updatedPoints = polygon.points.map((point, pointIndex) => {
                if (pointIndex === selectedEdge.edgeIndex) {
                  return [normalizedX, normalizedY];
                }
                return point;
              });
              return { ...polygon, points: updatedPoints };
            }
            return polygon;
          })
        );

        drawImageAndPolygons();
      } else if (isDragging && selectedPolygonIndex !== null) {
        const { x: mouseX, y: mouseY } = getCanvasCoordinates(e);

        const deltaX = (mouseX - initialMousePos.current.x) / img.current.width;
        const deltaY = (mouseY - initialMousePos.current.y) / img.current.height;

        setPolygons((prevPolygons) =>
          prevPolygons.map((polygon) => {
            if (polygon.labelIndex === selectedPolygonIndex) {
              const updatedPoints = polygon.points.map(([x, y]) => [
                x + deltaX,
                y + deltaY,
              ]);
              return { ...polygon, points: updatedPoints };
            }
            return polygon;
          })
        );

        initialMousePos.current = { x: mouseX, y: mouseY };
        drawImageAndPolygons();
      } else {
        let cursorChanged = false;
        polygons.forEach((polygon) => {
          polygon.points.forEach(([x, y]) => {
            const adjustedX = x * img.current.width;
            const adjustedY = y * img.current.height;

            if (
              Math.abs(mouseX - adjustedX) < 5 / scaleFactor &&
              Math.abs(mouseY - adjustedY) < 5 / scaleFactor
            ) {
              canvasRef.current.style.cursor = "pointer";
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
            canvasRef.current.style.cursor = "move";
            cursorChanged = true;
          }
        });

        if (!cursorChanged) {
          canvasRef.current.style.cursor = "default";
        }
      }
    },
    [
      isWheelDown,
      selectedEdge,
      isResizing,
      isDragging,
      selectedPolygonIndex,
      polygons,
      scaleFactor,
      startPos,
      img,
      drawImageAndPolygons,
    ]
  );

  const handleMouseUp = useCallback(
    (e) => {
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
    (e) => {
      if (clickMode !== "sizeControll") return;

      const { x: mouseX, y: mouseY } = getCanvasCoordinates(e);
      let pointFound = false;

      // polygons 상태 업데이트
      setPolygons((prevPolygons) =>
        prevPolygons
          .map((polygon) => {
            const updatedPoints = polygon.points.filter((point) => {
              const adjustedX = point[0] * img.current.width;
              const adjustedY = point[1] * img.current.height;

              const isCloseToMouse =
                Math.abs(mouseX - adjustedX) < 5 / scaleFactor &&
                Math.abs(mouseY - adjustedY) < 5 / scaleFactor;

              if (isCloseToMouse) {
                pointFound = true; // 점을 삭제하므로 flag 설정
                return false; // 삭제할 점은 필터링으로 제거
              }
              return true;
            });

            // 점이 3개 미만일 경우 해당 폴리곤을 제거
            return updatedPoints.length >= 2 ? { ...polygon, points: updatedPoints } : null;
          })
          .filter(Boolean)
      );

      // 점 삭제가 이루어졌을 때마다 바로 캔버스 업데이트
      if (pointFound) {
        drawImageAndPolygons();
      }
    },
    [clickMode, scaleFactor, img, getCanvasCoordinates, drawImageAndPolygons]
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
    if (modalPolygonLabelIndex !== null) {
      setPolygons((prev) => prev.filter((polygon) => polygon.labelIndex !== modalPolygonLabelIndex));
      setSelectedPolygonIndex(null);
      setHoveredPolygonLabelIndex(null);
      setModalPolygonLabelIndex(null);
      setShowModal(false);
    }
  };

  const handleModalInputUpdate = (modalInputValue) => {
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

  const onPhotoUpload = (photo) => {
    if (isNaN(modalPolygonLabelIndex)) return;
    setPhotos((prev) => ({
      ...prev,
      [modalPolygonLabelIndex]: photo,
    }));
    setShowModal(false);
  };

  const handleZoom = useCallback(
    (zoomIn) => {
      const newScaleFactor = zoomIn ? scaleFactor + 0.1 : scaleFactor - 0.1;
      setScaleFactor(newScaleFactor);
      setClickMode((prevMode) => prevMode);
    },
    [scaleFactor]
  );

  const handleWheel = useCallback(
    (e) => {
      if (e.ctrlKey) {
        e.preventDefault();

        const { x: mouseX, y: mouseY } = getCanvasCoordinates(e);

        const zoomAmount = e.deltaY < 0 ? 0.1 : -0.1;
        const newScaleFactor = scaleFactor + zoomAmount;

        // 확대/축소 한계를 설정합니다.
        if (newScaleFactor < 0.1 || newScaleFactor > 10) return;

        // 마우스 위치를 기준으로 startPos 조정
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
        onChange={(e) => setPredictionRange(e.target.value)}
      />
      <button
        type="button"
        onClick={changeModeToPolygon}
        style={{
          backgroundColor: clickMode === "polygonMake" ? "lightblue" : "white",
        }}
      >
        폴리건 만들기(q)
      </button>
      <button
        type="button"
        onClick={changeModeToSizeControll}
        style={{
          backgroundColor: clickMode === "sizeControll" ? "lightblue" : "white",
        }}
      >
        폴리건 사이즈 조절(w)
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
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
        onContextMenu={handleCanvasRightClick}
        onWheel={handleWheel}
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
        선택된 폴리곤 라벨 인덱스: <span>{selectedPolygonIndex}</span>
      </p>
      <button onClick={() => handleZoom(true)}>확대</button>
      <button onClick={() => handleZoom(false)}>축소</button>
      <button onClick={logPolygons}>로그 폴리곤</button>
      {photos[modalPolygonLabelIndex] && (
        <img src={photos[modalPolygonLabelIndex]} alt="사진" />
      )}
    </div>
  );
};

export default Canvas;