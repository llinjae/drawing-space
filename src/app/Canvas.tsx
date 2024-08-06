"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { simplify } from "@turf/turf";
import CanvasModal from "@/components/CanvasModal";
import findCentroid from "@/utils/findCentroid";
import useSetPredictionRange from "@/hooks/useSetPredictionRange";
import increaseOpacity from "@/utils/increaseOpacity";
import getColorForPolygon from "@/utils/getColorForPolygon";
import useDrawPolygon from "@/hooks/useDrawPolygon";
import drawCurrentPolygon from "@/utils/drawCurrentPolygon";
import useDrawImageAndPolygons from "@/hooks/useDrawImageandPolygons";
import distanceBetween from "@/utils/distanceBetween";
import isMouseInpolygon from "@/utils/isMouseInPolygon";
import processFileContent from "@/utils/processFileContent";

const Canvas = () => {
  const [polygons, setPolygons] = useState([]);
  const [selectedPolygonIndex, setSelectedPolygonIndex] = useState("");
  const [predictionRange, setPredictionRange] = useState(0.5);
  const [scaleFactor, setScaleFactor] = useState(1.0);
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [isWheelDown, setIsWheelDown] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [fileContent, setFileContent] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });
  const [modalPolygonIndex, setModalPolygonIndex] = useState(null);
  const [hoveredPolygonIndex, setHoveredPolygonIndex] = useState(null);
  const [photos, setPhotos] = useState({});
  const [lastLabelIndex, setLastLabelIndex] = useState(0);
  const [clickMode, setClickMode] = useState("polygonMake");
  const [isResizing, setIsResizing] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState(null); // State for selected edge
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const canvasRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialMousePos = useRef({ x: 0, y: 0 });
  const img = useRef(new Image());

  useSetPredictionRange({ polygons, selectedPolygonIndex, predictionRange, setSelectedPolygonIndex });

  const drawPolygon = useDrawPolygon(
    predictionRange,
    selectedPolygonIndex,
    modalPolygonIndex,
    hoveredPolygonIndex,
    img
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
    if (!img.current.src) {
      img.current.src = "/test58.jpg";
      img.current.onload = () => {
        drawImageAndPolygons();
      };
    }
  }, [drawImageAndPolygons]);

  useEffect(() => {
    drawImageAndPolygons();
  }, [predictionRange, drawImageAndPolygons]);

  const handleCanvasClick = useCallback(
    (e) => {
      if (clickMode !== "polygonMake" || showModal) {
        return null;
      }

      const completionThreshold = 0.007;

      const rect = canvasRef.current.getBoundingClientRect();
      const scaledX = (e.clientX - rect.left - startPos.x) / scaleFactor;
      const scaledY = (e.clientY - rect.top - startPos.y) / scaleFactor;
      const x = scaledX / img.current.width;
      const y = scaledY / img.current.height;
      const distance =
        currentPolygon.length > 0
          ? distanceBetween(x, y, currentPolygon[0][0], currentPolygon[0][1])
          : Number.MAX_VALUE;

      setCurrentPolygon((prev) => [...prev, [x, y]]);

      if (currentPolygon.length > 2 && distance < completionThreshold) {
        const newPolygon = {
          labelIndex: lastLabelIndex,
          points: [...currentPolygon, [x, y]],
          prediction: 0.95,
          color: getColorForPolygon(lastLabelIndex),
        };
        setLastLabelIndex((prev) => prev + 1);
        setPolygons((prev) => [...prev, newPolygon]);
        setCurrentPolygon([]);
      }

      let foundPolygonIndex = null;
      polygons.forEach((polygon, index) => {
        if (polygon.prediction >= predictionRange) {
          foundPolygonIndex = index;
        }
      });

      setSelectedPolygonIndex(foundPolygonIndex !== null ? foundPolygonIndex : "None");
    },
    [clickMode, showModal, currentPolygon, polygons, startPos, scaleFactor, img]
  );

  const handleCanvasRightClick = useCallback(
    (e) => {
      e.preventDefault();

      if (clickMode === "sizeControll" && currentPolygon.length > 0) {
        setCurrentPolygon([]);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
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

      let foundPolygonIndex = null;
      polygons.forEach((polygon, index) => {
        if (isMouseInPolygon(mouseX, mouseY, polygon)) {
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
            if (isMouseInpolygon(mouseX, mouseY, polygon, canvasRef, scaleFactor, startPos, img)) {
              setSelectedPolygonIndex(polygon.labelIndex);
              foundPolygon = true;
            }
          });

          if (!foundPolygon) {
            setSelectedPolygonIndex("None");
          }
        } else if (clickMode === "sizeControll") {
          polygons.forEach((polygon, polygonIndex) => {
            for (let i = 0; i < polygon.points.length; i++) {
              const [x1, y1] = polygon.points[i];
              const [x2, y2] = polygon.points[(i + 1) % polygon.points.length];
              const midX = ((x1 + x2) / 2) * img.current.width;
              const midY = ((y1 + y2) / 2) * img.current.height;
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
            if (isMouseInpolygon(mouseX, mouseY, polygon, canvasRef, scaleFactor, startPos, img)) {
              setSelectedPolygon(polygonIndex);
              initialMousePos.current = { x: mouseX, y: mouseY };
              setIsDragging(true);
            }
          });
        } else if (clickMode === "addEdge") {
          polygons.forEach((polygon, polygonIndex) => {
            for (let i = 0; i < polygon.points.length; i++) {
              const [x1, y1] = polygon.points[i];
              const [x2, y2] = polygon.points[(i + 1) % polygon.points.length];
              const midX = ((x1 + x2) / 2) * img.current.width;
              const midY = ((y1 + y2) / 2) * img.current.height;
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
        const mouseX = (e.clientX - rect.left) / img.current.width;
        const mouseY = (e.clientY - rect.top) / img.current.height;
        const deltaX = mouseX - initialMousePos.current.x / img.current.width;
        const deltaY = mouseY - initialMousePos.current.y / img.current.height;

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
        initialMousePos.current = { x: mouseX * img.current.width, y: mouseY * img.current.height };
        drawImageAndPolygons();
      } else if (isDragging && selectedPolygon !== null) {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const deltaX = (mouseX - initialMousePos.current.x) / img.current.width;
        const deltaY = (mouseY - initialMousePos.current.y) / img.current.height;

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
            const midX = ((x1 + x2) / 2) * img.current.width;
            const midY = ((y1 + y2) / 2) * img.current.height;
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

  const handleWheel = (e) => {
    if (!isWheelDown) {
      const newOffset = {
        x: startPos.x,
        y: startPos.y,
      };
      setStartPos(newOffset);
      const delta = Math.sign(e.deltaY);
      setScaleFactor((prevScale) => {
        let newScale = delta > 0 ? prevScale + 0.1 : Math.max(prevScale - 0.1, 0.1);
        return newScale;
      });
    }
  };

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

  const handleSimplifyPolygons = () => {
    const simplifiedPolygons = polygons.map((polygon) => {
      const coords = polygon.points.map(([x, y]) => [x, y]);
      const simplified = simplify({ type: "Polygon", coordinates: [coords] }, { tolerance: 0.01, highQuality: true });
      const points = simplified.coordinates[0].map(([x, y]) => [x, y]);
      return { ...polygon, points };
    });
    setPolygons(simplifiedPolygons);
    drawImageAndPolygons();
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
      <button onClick={handleSimplifyPolygons}>Simplify Polygons</button>
      <canvas
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
      {photos[modalPolygonIndex] && <img src={photos[modalPolygonIndex]} alt="사진" />}
    </div>
  );
};

export default Canvas;
