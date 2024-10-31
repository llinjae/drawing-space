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
  const isMouseDown = useRef(false);
  const hasMoved = useRef(false);

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
    } else if (key === "e") {
      setClickMode("addEdge");
    }
  }, [key]);

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

  const getCanvasCoordinates = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const canvasX = (x - startPos.x) / scaleFactor;
    const canvasY = (y - startPos.y) / scaleFactor;
    return { x: canvasX, y: canvasY };
  };

  // const handleCanvasClick = useCallback(
  //   (e) => {
  //     if (clickMode !== "polygonMake" || showModal) {
  //       return;
  //     }
  
  //     const completionThreshold = 5; // 픽셀 단위
  
  //     if (canvasRef.current) {
  //       const { x: canvasX, y: canvasY } = getCanvasCoordinates(e);
  
  //       // 이미지 크기로 정규화
  //       const x = canvasX / img.current.width;
  //       const y = canvasY / img.current.height;
  
  //       // 현재 폴리곤에 점 추가
  //       setCurrentPolygon((prev) => [...prev, [x, y]]);
  
  //       // 첫 번째 점과의 거리 계산 (화면 좌표계에서)
  //       if (currentPolygon.length > 0) {
  //         const adjustedX = x * img.current.width;
  //         const adjustedY = y * img.current.height;
  //         const firstPointX = currentPolygon[0][0] * img.current.width;
  //         const firstPointY = currentPolygon[0][1] * img.current.height;
  
  //         const screenAdjustedX = adjustedX * scaleFactor + startPos.x;
  //         const screenAdjustedY = adjustedY * scaleFactor + startPos.y;
  //         const screenFirstPointX = firstPointX * scaleFactor + startPos.x;
  //         const screenFirstPointY = firstPointY * scaleFactor + startPos.y;
  
  //         const distance = Math.hypot(
  //           screenAdjustedX - screenFirstPointX,
  //           screenAdjustedY - screenFirstPointY
  //         );
  
  //         if (currentPolygon.length > 2 && distance < completionThreshold) {
  //           const newPolygon = {
  //             labelIndex: lastLabelIndex,
  //             points: currentPolygon,
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
  //       }
  
  //       drawImageAndPolygons();
  //     }
  //   },
  //   [clickMode, showModal, currentPolygon, polygons, startPos, scaleFactor, img, lastLabelIndex, predictionRange]
  // );

  const handleCanvasRightClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();

      if (!canvasRef.current) return;
  
      // 폴리곤 내부에서만 우클릭 시 모달을 표시
      const { x: mouseX, y: mouseY } = getCanvasCoordinates(e);
  
      let foundPolygonIndex: number | null = null;
  
      polygons.forEach((polygon, index) => {
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
  
      if (clickMode === "polygonMake") {
        setCurrentPolygon([]);
      }
    },
    [clickMode,
      polygons,
      scaleFactor,
      startPos,
      img,
      getCanvasCoordinates
    ]
  );

  const handleMouseDown = useCallback(
    (e) => {
      if (e.button === 1) {
        // 팬(Pan) 기능 처리
        setIsWheelDown(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.style.cursor = "grabbing";
      } else if (e.button === 0) {
        const { x: mouseX, y: mouseY } = getCanvasCoordinates(e);
  
        // // 드래그 여부 초기화
        // hasMoved.current = false;
        // isMouseDown.current = true;
  
        // // 점 삭제 로직을 polygonMake 모드에서만 실행
        // let pointDeleted = false;
        // if (clickMode === "polygonMake") {
        //   polygons.forEach((polygon, polygonIndex) => {
        //     polygon.points.forEach((point, pointIndex) => {
        //       const adjustedX = point[0] * img.current.width;
        //       const adjustedY = point[1] * img.current.height;
  
        //       if (
        //         Math.abs(mouseX - adjustedX) < 5 / scaleFactor &&
        //         Math.abs(mouseY - adjustedY) < 5 / scaleFactor
        //       ) {
        //         // 점 삭제
        //         setPolygons((prevPolygons) =>
        //           prevPolygons.map((poly, idx) =>
        //             idx === polygonIndex
        //               ? {
        //                   ...poly,
        //                   points: poly.points.filter(
        //                     (_, idx) => idx !== pointIndex
        //                   ),
        //                 }
        //               : poly
        //           )
        //         );
        //         pointDeleted = true;
        //       }
        //     });
        //   });
  
        //   if (pointDeleted) {
        //     drawImageAndPolygons();
        //     return; // 점을 삭제한 경우, 이후 로직 실행하지 않음
        //   }
        // }
  
        // 리사이징 및 드래깅 로직
        let foundPoint = false;
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
              foundPoint = true;
            }
          });
        });
  
        if (!foundPoint) {
          // 폴리곤 내부 클릭 시 이동 시작
          polygons.forEach((polygon, polygonIndex) => {
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
              setSelectedPolygonIndex(polygonIndex);
              initialMousePos.current = { x: mouseX, y: mouseY };
              setIsDragging(true);
            }
          });
        }
  
        // 리사이징이나 드래깅이 아닐 때만 점 추가
        if (!isResizing && !isDragging && clickMode === "polygonMake") {
          const completionThreshold = 5; // 픽셀 단위
  
          if (canvasRef.current) {
            // 이미지 크기로 정규화
            const x = mouseX / img.current.width;
            const y = mouseY / img.current.height;
  
            // 현재 폴리곤에 점 추가
            setCurrentPolygon((prev) => [...prev, [x, y]]);
  
            // 첫 번째 점과의 거리 계산
            if (currentPolygon.length > 0) {
              const firstPointX = currentPolygon[0][0] * img.current.width;
              const firstPointY = currentPolygon[0][1] * img.current.height;
  
              const distance = Math.hypot(
                mouseX - firstPointX,
                mouseY - firstPointY
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
        }
      }
    },
    [
      clickMode,
      polygons,
      scaleFactor,
      startPos,
      img,
      currentPolygon,
      lastLabelIndex,
      drawImageAndPolygons,
    ]
  );
  
  const handleMouseMove = useCallback(
    (e) => {
      if (isMouseDown.current) {
        // 마우스 이동 거리를 계산하여 드래그 여부를 판단합니다.
        const deltaX = e.clientX - dragStart.current.x;
        const deltaY = e.clientY - dragStart.current.y;
        if (Math.hypot(deltaX, deltaY) > 5) {
          hasMoved.current = true;
        }
      }
      
      if (isWheelDown) {
        // 팬(Pan) 기능 처리
        const deltaX = e.clientX - dragStart.current.x;
        const deltaY = e.clientY - dragStart.current.y;
        const newOffset = {
          x: startPos.x + deltaX,
          y: startPos.y + deltaY,
        };
        setStartPos(newOffset);
        dragStart.current = { x: e.clientX, y: e.clientY };
        e.preventDefault();
      } else if (selectedEdge !== null && isResizing) {
        // 점 조절 로직
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
  
        drawImageAndPolygons();
      } else if (isDragging && selectedPolygonIndex !== null) {
        // 폴리곤 이동 로직
        const { x: mouseX, y: mouseY } = getCanvasCoordinates(e);
  
        const deltaX = (mouseX - initialMousePos.current.x) / img.current.width;
        const deltaY = (mouseY - initialMousePos.current.y) / img.current.height;
  
        setPolygons((prevPolygons) =>
          prevPolygons.map((polygon, index) => {
            if (index === selectedPolygonIndex) {
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
        // 커서 모양 변경 및 호버 효과 처리
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
      const { x: mouseX, y: mouseY } = getCanvasCoordinates(e);
  
      let pointFound = false;
  
      polygons.forEach((polygon, polygonIndex) => {
        polygon.points.forEach((point, pointIndex) => {
          const adjustedX = point[0] * img.current.width;
          const adjustedY = point[1] * img.current.height;
  
          if (
            Math.abs(mouseX - adjustedX) < 5 / scaleFactor &&
            Math.abs(mouseY - adjustedY) < 5 / scaleFactor
          ) {
            // 점 삭제
            setPolygons((prevPolygons) =>
              prevPolygons.map((poly, idx) =>
                idx === polygonIndex
                  ? {
                      ...poly,
                      points: poly.points.filter(
                        (_, idx) => idx !== pointIndex
                      ),
                    }
                  : poly
              )
            );
            pointFound = true;
          }
        });
      });
  
      if (pointFound) {
        drawImageAndPolygons();
      }
    },
    [polygons, scaleFactor, img, drawImageAndPolygons]
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
  const changeModeToAddEdge = () => {
    setClickMode("addEdge");
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
        onClick={changeModeToAddEdge}
        style={{ backgroundColor: clickMode === "addEdge" ? "lightblue" : "white" }}
      >
        엣지 추가(r)
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
        // onClick={handleCanvasClick}
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
