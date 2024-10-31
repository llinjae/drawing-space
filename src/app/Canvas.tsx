"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import CanvasModal from "@/components/CanvasModal";
import distanceBetween from "@/utils/distanceBetween";
import getColorForPolygon from "@/utils/getColorForPolygon";
import handleSimplifyPolygons from "@/utils/handleSimplifyPolygons";
import isMouseInPolygon from "@/utils/isMouseInPolygon";
import processFileContent from "@/utils/processFileContent";
import useDrawImageAndPolygons from "@/hooks/useDrawImageandPolygons";
import useDrawPolygon from "@/hooks/useDrawPolygon";
import useSetPredictionRange from "@/hooks/useSetPredictionRange";

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
  const [key, setKey] = useState("Q");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialMousePos = useRef({ x: 0, y: 0 });
  const img = useRef<HTMLImageElement | null>(null);

  useSetPredictionRange({ polygons, selectedPolygonIndex, predictionRange, setSelectedPolygonIndex });

  if (typeof window !== "undefined") {
    window.addEventListener("keydown", (e) => setKey(e.key));
  }
  useMemo(() => {
    if (key === "q") {
      setClickMode("polygonMake");
    } else if (key === "w") {
      setClickMode("sizeControll");
    } else if (key === "e") {
      setClickMode("movePolygon");
    } else if (key === "r") {
      setClickMode("addEdge");
    } else if (key === "t") {
      setClickMode("deleteEdge");
    }
  }, [key]);

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
    initialMousePos.current = startPos;
  }, [startPos])

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!img.current || img.current.src === "") {
        img.current = new Image(); // 클라이언트 측에서만 Image 객체 초기화
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
    [clickMode, showModal, currentPolygon, polygons, startPos, scaleFactor, img, lastLabelIndex, predictionRange]
  );

  const handleCanvasRightClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
  
      // 폴리곤 내부에서만 우클릭 시 모달을 표시
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) - startPos.x;
      const mouseY = (e.clientY - rect.top) - startPos.y;
  
      let foundPolygonIndex: number | null = null;
  
      polygons.forEach((polygon, index) => {
        const isInPolygon = isMouseInPolygon(
          mouseX,
          mouseY,
          polygon,
          canvasRef,
          scaleFactor,
          startPos,
          img
        );
  
        if (isInPolygon) {
          foundPolygonIndex = index;
        }
      });
  
      // 폴리곤 내부가 아닌 경우 모달을 띄우지 않고, 클릭 모드에 따라 점 초기화
      if (foundPolygonIndex !== null) {
        setModalPolygonIndex(foundPolygonIndex);
        setModalPos({
          x: e.clientX + window.scrollX,
          y: e.clientY + window.scrollY,
        });
        setShowModal(true);
      } else {
        setShowModal(false);
        setModalPolygonIndex(null);
      }
  
      // 우클릭 시 폴리곤 내부가 아닌 경우 점을 초기화하여 클릭모드에서 벗어나도록 합니다.
      if (clickMode === "polygonMake") {
        setCurrentPolygon([]);
      }
    },
    [clickMode, currentPolygon, polygons, startPos, scaleFactor, img, drawImageAndPolygons]
  );

  const getCanvasCoordinates = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - startPos.x) / scaleFactor;
    const y = (e.clientY - rect.top - startPos.y) / scaleFactor;
    return { x, y };
  };

  const handleMouseDown = useCallback(
    (e) => {
      if (e.button === 1) {
        setIsWheelDown(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.style.cursor = "grabbing";
      } else if (e.button === 0) {
        const { x: mouseX, y: mouseY } = getCanvasCoordinates(e);
        
        if (clickMode === "polygonMake") {
          let foundPolygon = false;
  
          polygons.forEach((polygon, polygonIndex) => {
            polygon.points.forEach((point, pointIndex) => {
              const adjustedX = point[0] * img.current!.width;
              const adjustedY = point[1] * img.current!.height;
  
              // 점을 클릭했는지 확인
              if (
                Math.abs(mouseX - adjustedX) < 5 &&
                Math.abs(mouseY - adjustedY) < 5
              ) {
                // 클릭한 점 삭제
                setPolygons((prevPolygons) =>
                  prevPolygons.map((polygon, idx) =>
                    idx === polygonIndex
                      ? {
                          ...polygon,
                          points: polygon.points.filter(
                            (_, index) => index !== pointIndex
                          ),
                        }
                      : polygon
                  )
                );
                foundPolygon = true; // 점을 찾았으므로 이 동작 후 폴리곤 추가 작업을 방지
              }
            });
          });
  
          if (!foundPolygon) {
            polygons.forEach((polygon) => {
              if (isMouseInPolygon(mouseX, mouseY, polygon, canvasRef, scaleFactor, startPos, img)) {
                setSelectedPolygonIndex(polygon.labelIndex);
                foundPolygon = true;
              }
            });
  
            if (!foundPolygon) {
              setSelectedPolygonIndex(null);
            }
          }
        }
  
        if (clickMode === "sizeControll") {
          polygons.forEach((polygon, polygonIndex) => {
            polygon.points.forEach((point, pointIndex) => {
              const adjustedX = point[0] * img.current.width;
              const adjustedY = point[1] * img.current.height;
  
              if (
                Math.abs(mouseX - adjustedX) < 5 / scaleFactor &&
                Math.abs(mouseY - adjustedY) < 5 / scaleFactor
              ) {
                initialMousePos.current = { x: mouseX, y: mouseY };
                setSelectedPolygonIndex(polygonIndex);
                setSelectedEdge({ polygonIndex, edgeIndex: pointIndex });
                setIsResizing(true);
              }
            });
          });
        } else if (clickMode === "movePolygon") {
          polygons.forEach((polygon, polygonIndex) => {
            if (isMouseInPolygon(mouseX, mouseY, polygon, canvasRef, scaleFactor, startPos, img)) {
              setSelectedPolygon(polygonIndex);
              initialMousePos.current = { x: mouseX, y: mouseY };
              setIsDragging(true);
            }
          });
        }
      }
    },
    [clickMode, polygons, isResizing, scaleFactor]
  );
  
  const handleMouseMove = useCallback(
    (e) => {
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
        const { x: mouseX, y: mouseY } = getCanvasCoordinates(e);
  
        const normalizedX = mouseX / img.current.width;
        const normalizedY = mouseY / img.current.height;
  
        setPolygons((prevPolygons) =>
          prevPolygons.map((polygon, polygonIndex) => {
            if (polygonIndex === selectedEdge.polygonIndex) {
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
  
        initialMousePos.current = { x: mouseX, y: mouseY };
        drawImageAndPolygons();
      } else {
        const { x: mouseX, y: mouseY } = getCanvasCoordinates(e);
  
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
        });
  
        if (!cursorChanged) {
          canvasRef.current.style.cursor = "default";
        }
      }
    },
    [isWheelDown, selectedEdge, drawImageAndPolygons, scaleFactor, polygons]
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
          x: startPos.x - (mouseX * zoomAmount),
          y: startPos.y - (mouseY * zoomAmount),
        };
  
        setScaleFactor(newScaleFactor);
        setStartPos(newStartPos);
      }
    },
    [scaleFactor, startPos]
  );

  useEffect(() => {
    if (clickMode === "movePolygon" && selectedPolygonIndex !== null) {
      // 이동 모드일 때 확대/축소 후 상태가 최신으로 유지되도록 함
      drawImageAndPolygons();
    }
  }, [clickMode, scaleFactor, drawImageAndPolygons]);

  useEffect(() => {
    const canvas = canvasRef.current;
  
    if (canvas) {
      // 휠 이벤트를 캔버스 위에서만 발생하도록 하고 기본 동작 방지
      canvas.addEventListener("wheel", handleWheel, { passive: false });
    }
  
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
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
        폴리건 만들기(q)
      </button>
      <button
        type="button"
        onClick={changeModeToSizeControll}
        style={{ backgroundColor: clickMode === "sizeControll" ? "lightblue" : "white" }}
      >
        폴리건 사이즈 조절(w)
      </button>
      <button
        type="button"
        onClick={changeModeToMovePolygon}
        style={{ backgroundColor: clickMode === "movePolygon" ? "lightblue" : "white" }}
      >
        폴리건 이동(e)
      </button>
      <button
        type="button"
        onClick={changeModeToAddEdge}
        style={{ backgroundColor: clickMode === "addEdge" ? "lightblue" : "white" }}
      >
        엣지 추가(r)
      </button>
      <button
        type="button"
        onClick={changeModeToDeleteEdge}
        style={{ backgroundColor: clickMode === "deleteEdge" ? "lightblue" : "white" }}
      >
        엣지 삭제(t)
      </button>
      <button onClick={() => handleSimplifyPolygons(polygons, setPolygons, drawImageAndPolygons)}>
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
        onContextMenu={handleCanvasRightClick}
        onWheel={handleWheel}
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
      <button onClick={() => handleZoom(true)}>확대</button>
      <button onClick={() => handleZoom(false)}>축소</button>
      <button onClick={logPolygons}>로그 폴리곤</button>
      {photos[modalPolygonIndex] && <img src={photos[modalPolygonIndex]} alt="사진" />}
    </div>
  );
};

export default Canvas;
