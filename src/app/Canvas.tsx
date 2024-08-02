// // "use client";

// // import React, { useCallback, useEffect, useRef, useState } from "react";

// // const Canvas = ({ mockdata, baseImgUrl }) => {
// //   const [polygons, setPolygons] = useState([]);
// //   const [selectedPolygonIndex, setSelectedPolygonIndex] = useState("None");
// //   const [predictionRange, setPredictionRange] = useState(0.5);
// //   const [scaleFactor, setScaleFactor] = useState(1.0);
// //   const [currentPolygon, setCurrentPolygon] = useState([]);
// //   const [startPos, setStartPos] = useState({ x: 0, y: 0 });
// //   const [modalPolygonIndex, setModalPolygonIndex] = useState(null);
// //   const [hoveredPolygonIndex, setHoveredPolygonIndex] = useState(null);
// //   const [photos, setPhotos] = useState({});
// //   const [lastLabelIndex, setLastLabelIndex] = useState(0);

// //   const canvasRef = useRef(null);
// //   const img = useRef(new Image());

// //   useEffect(() => {
// //     let isVisible = false;
// //     polygons.forEach((polygon) => {
// //       if (polygon.labelIndex === selectedPolygonIndex && polygon.prediction >= predictionRange) {
// //         isVisible = true;
// //       }
// //     });

// //     if (!isVisible) {
// //       setSelectedPolygonIndex("None");
// //     }
// //   }, [predictionRange, polygons, selectedPolygonIndex]);

// //   const findCentroid = (points) => {
// //     const xCoords = points.map((point) => point[0]);
// //     const yCoords = points.map((point) => point[1]);

// //     const minX = Math.min(...xCoords);
// //     const maxX = Math.max(...xCoords);
// //     const minY = Math.min(...yCoords);
// //     const maxY = Math.max(...yCoords);

// //     return {
// //       x: (minX + maxX) / 2,
// //       y: (minY + maxY) / 2,
// //     };
// //   };

// //   const getColorForPolygon = useCallback((labelIndex) => {
// //     const colors = [
// //       "rgba(255, 0, 0, 0.5)",
// //       "rgba(255, 140, 0, 0.5)",
// //       "rgba(255, 255, 0, 0.5)",
// //       "rgba(0, 255, 0, 0.5)",
// //       "rgba(0, 0, 255, 0.5)",
// //       "rgba(255, 153, 504, 0.5)",
// //     ];
// //     return colors[labelIndex % colors.length];
// //   }, []);

// //   const increaseOpacity = (color) => {
// //     const [r, g, b, a] = color.match(/\d+/g).map(Number);
// //     const increasedOpacity = Math.min(a + 0.2, 1);
// //     return rgba(`${r}, ${g}, ${b}, ${increasedOpacity}`);
// //   };

// //   const drawPolygon = useCallback(
// //     (polygon, ctx) => {
// //       if (polygon.prediction < predictionRange) {
// //         return;
// //       }

// //       let fillColor = polygon.color;
// //       if (
// //         polygon.labelIndex === selectedPolygonIndex ||
// //         polygon.labelIndex === modalPolygonIndex ||
// //         hoveredPolygonIndex === polygon.labelIndex
// //       ) {
// //         fillColor = increaseOpacity(fillColor);
// //       }

// //       ctx.beginPath();

// //       polygon.points.forEach(([x, y], index) => {
// //         const adjustedX = x * img.current.width;
// //         const adjustedY = y * img.current.height;

// //         if (index === 0) {
// //           ctx.moveTo(adjustedX, adjustedY);
// //         } else {
// //           ctx.lineTo(adjustedX, adjustedY);
// //         }
// //       });

// //       ctx.closePath();
// //       ctx.fillStyle = fillColor;
// //       ctx.fill();
// //       ctx.stroke();

// //       const centroid = findCentroid(polygon.points.map(([x, y]) => [x * img.current.width, y * img.current.height]));

// //       if (polygon.tag || polygon.description) {
// //         ctx.font = "16px Arial";
// //         ctx.fillStyle = "black";
// //         ctx.textAlign = "center";
// //         let textToDisplay = polygon.tag;
// //         ctx.fillText(textToDisplay, centroid.x, centroid.y);
// //       }
// //     },
// //     [predictionRange, selectedPolygonIndex, modalPolygonIndex, hoveredPolygonIndex, scaleFactor, startPos, img]
// //   );

// //   const drawCurrentPolygon = useCallback(
// //     (ctx) => {
// //       if (currentPolygon.length > 0) {
// //         ctx.beginPath();
// //         currentPolygon.forEach(([x, y], index) => {
// //           if (index === 0) {
// //             ctx.moveTo(x * img.current.width, y * img.current.height);
// //           } else {
// //             ctx.lineTo(x * img.current.width, y * img.current.height);
// //           }
// //         });
// //         ctx.closePath();
// //         ctx.stroke();
// //       }
// //     },
// //     [currentPolygon]
// //   );

// //   const drawImageAndPolygons = useCallback(() => {
// //     const canvas = canvasRef.current;
// //     const ctx = canvas.getContext("2d");
// //     ctx.clearRect(0, 0, canvas.width, canvas.height);
// //     ctx.save();
// //     ctx.translate(startPos.x, startPos.y);
// //     ctx.scale(scaleFactor, scaleFactor);
// //     ctx.drawImage(img.current, 0, 0, canvas.width, canvas.height);

// //     polygons.forEach((polygon) => {
// //       if (polygon.prediction >= predictionRange) {
// //         polygon.isVisible = true;
// //         drawPolygon(polygon, ctx);
// //       } else polygon.isVisible = false;
// //     });
// //     drawCurrentPolygon(ctx);

// //     ctx.restore();
// //   }, [polygons, drawPolygon, drawCurrentPolygon, startPos, scaleFactor]);

// //   useEffect(() => {
// //     if (!img.current.src) {
// //       img.current.src = baseImgUrl;
// //       img.current.onload = () => {
// //         drawImageAndPolygons();
// //       };
// //     }
// //   }, [drawImageAndPolygons]);

// //   useEffect(() => {
// //     drawImageAndPolygons();
// //   }, [predictionRange, drawImageAndPolygons]);

// //   const processFileContent = (content) => {
// //     const jsonData = content;
// //     const loadedPolygons = Object.values(jsonData).map((item) => {
// //       const parts = item.split(" ");
// //       const labelIndex = parseInt(parts[0]);
// //       const points = [];
// //       for (let i = 1; i < parts.length; i += 2) {
// //         points.push([parseFloat(parts[i]), parseFloat(parts[i + 1])]);
// //       }
// //       const color = getColorForPolygon(labelIndex);
// //       return { labelIndex, points, prediction: 0.95, color, isVisible: true };
// //     });
// //     setLastLabelIndex(loadedPolygons.length);
// //     setPolygons(loadedPolygons.filter((polygon) => polygon !== undefined));
// //   };

// //   useEffect(() => {
// //     processFileContent(mockdata);
// //   }, [mockdata]);

// //   return (
// //     <div>
// //       <canvas
// //         ref={canvasRef}
// //         width={800}
// //         height={565}
// //         //onMouseDown={handleMouseDown}
// //         // onMouseUp={handleMouseUp}
// //         //onMouseMove={handleMouseMove}
// //         //onClick={handleCanvasClick}
// //         //onContextMenu={handleCanvasRightClick}
// //         //onWheel={handleWheel}
// //       />

// //       <div style={{ height: "565px", width: "800px" }}>
// //         {photos[modalPolygonIndex] && (
// //           <img
// //             style={{ width: "100%", height: "100%", objectFit: "contain" }}
// //             src={photos[modalPolygonIndex]}
// //             alt="사진"
// //           />
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default Canvas;
"use client";
import { css } from "@emotion/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { simplify } from "@turf/turf";
import CanvasModal from "@/components/CanvasModal";
import useSetPredictionRange from "@/hooks/useSetPredictionRange";
import { Polygon } from "./type";
import findCentroid from "@/utils/findCentroid";

const Canvas = () => {
  const [polygons, setPolygons] = useState<Polygon[] | []>([]);
  const [selectedPolygonIndex, setSelectedPolygonIndex] = useState<number | string>("None");
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
  const [selectedPolygon, setSelectedPolygon] = useState<string[] | null>(null);

  const canvasRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialMousePos = useRef({ x: 0, y: 0 });
  const img = useRef(new Image());

  useSetPredictionRange({
    polygons,
    selectedPolygonIndex,
    predictionRange,
    setSelectedPolygonIndex,
  });

  const getColorForPolygon = useCallback((labelIndex) => {
    const colors = [
      "rgba(255, 0, 0, 0.5)",
      "rgba(255, 140, 0, 0.5)",
      "rgba(255, 255, 0, 0.5)",
      "rgba(0, 255, 0, 0.5)",
      "rgba(0, 0, 255, 0.5)",
      "rgba(255, 153, 504, 0.5)",
    ];
    return colors[labelIndex % colors.length];
  }, []);

  const increaseOpacity = (color) => {
    const [r, g, b, a] = color.match(/\d+/g).map(Number);
    const increasedOpacity = Math.min(a + 0.2, 1);
    return `rgba(${r}, ${g}, ${b}, ${increasedOpacity})`;
  };

  const drawPolygon = useCallback(
    (polygon, ctx) => {
      if (polygon.prediction < predictionRange) {
        return;
      }

      let fillColor = polygon.color;
      if (
        polygon.labelIndex === selectedPolygonIndex ||
        polygon.labelIndex === modalPolygonIndex ||
        hoveredPolygonIndex === polygon.labelIndex
      ) {
        fillColor = increaseOpacity(fillColor);
      }

      ctx.beginPath();

      polygon.points.forEach(([x, y], index) => {
        const adjustedX = x * img.current.width;
        const adjustedY = y * img.current.height;

        if (index === 0) {
          ctx.moveTo(adjustedX, adjustedY);
        } else {
          ctx.lineTo(adjustedX, adjustedY);
        }
      });

      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.stroke();

      const centroid = findCentroid(polygon.points.map(([x, y]) => [x * img.current.width, y * img.current.height]));

      if (polygon.tag || polygon.description) {
        ctx.font = "16px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        let textToDisplay = polygon.tag;
        ctx.fillText(textToDisplay, centroid.x, centroid.y);
      }

      // Draw edges for resizing
      for (let i = 0; i < polygon.points.length; i++) {
        const [x1, y1] = polygon.points[i];
        const [x2, y2] = polygon.points[(i + 1) % polygon.points.length];
        const midX = ((x1 + x2) / 2) * img.current.width;
        const midY = ((y1 + y2) / 2) * img.current.height;
        ctx.fillStyle = "green";
        ctx.fillRect(midX - 3, midY - 3, 6, 6);
      }
    },
    [predictionRange, selectedPolygonIndex, modalPolygonIndex, hoveredPolygonIndex, scaleFactor, startPos, img]
  );

  const drawCurrentPolygon = useCallback(
    (ctx) => {
      if (currentPolygon.length > 0) {
        ctx.beginPath();
        currentPolygon.forEach(([x, y], index) => {
          if (index === 0) {
            ctx.moveTo(x * img.current.width, y * img.current.height);
          } else {
            ctx.lineTo(x * img.current.width, y * img.current.height);
          }
        });
        ctx.closePath();
        ctx.stroke();
      }
    },
    [currentPolygon]
  );

  const drawImageAndPolygons = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(startPos.x, startPos.y);
    ctx.scale(scaleFactor, scaleFactor);
    ctx.drawImage(img.current, 0, 0);

    polygons.forEach((polygon) => {
      if (polygon.prediction >= predictionRange) {
        polygon.isVisible = true;
        drawPolygon(polygon, ctx);
      } else polygon.isVisible = false;
    });
    drawCurrentPolygon(ctx);

    ctx.restore();
  }, [polygons, drawPolygon, drawCurrentPolygon, startPos, scaleFactor]);

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

  const distanceBetween = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

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

  const isMouseInPolygon = useCallback(
    (mouseX, mouseY, polygon) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.setTransform(scaleFactor, 0, 0, scaleFactor, startPos.x, startPos.y);

      ctx.beginPath();

      if (polygon && Array.isArray(polygon.points)) {
        polygon.points.forEach(([x, y], index) => {
          const polyX = x * img.current.width;
          const polyY = y * img.current.height;

          if (index === 0) {
            ctx.moveTo(polyX, polyY);
          } else {
            ctx.lineTo(polyX, polyY);
          }
        });
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const isInPath = ctx.isPointInPath(mouseX, mouseY) && polygon.isVisible;

      ctx.restore();
      return isInPath;
    },
    [scaleFactor, startPos, img]
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
            if (isMouseInPolygon(mouseX, mouseY, polygon)) {
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
        }
      }
    },
    [clickMode, polygons, isResizing]
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
              canvasRef.current.style.cursor = "ew-resize";
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
    [isWheelDown, clickMode, polygons, startPos, isResizing, selectedEdge, drawImageAndPolygons]
  );

  const handleMouseUp = useCallback(
    (e) => {
      if (e.button === 1 || (clickMode === "sizeControll" && e.button === 0)) {
        e.preventDefault();
        setIsWheelDown(false);
        setIsResizing(false);
        setSelectedEdge(null);
        e.currentTarget.style.cursor = "default";
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
      processFileContent(content);
    };
    reader.readAsText(file);
  };

  const processFileContent = (content) => {
    const jsonData = JSON.parse(content);
    const loadedPolygons = Object.values(jsonData).map((item, index) => {
      const itemStr = typeof item === "string" ? item.trim() : JSON.stringify(item).trim();
      const parts = itemStr.split(" ");
      if (parseInt(parts[0]) === 0) return;
      const labelIndex = index;
      const predictionValue = parseFloat(parts[parts.length - 1]);
      const points = parts
        .slice(1, -1)
        .map((part, index, array) =>
          index % 2 === 0 ? [parseFloat(array[index]), parseFloat(array[index + 1])] : null
        )
        .filter((point) => point);
      const color = getColorForPolygon(labelIndex);
      return { labelIndex, points, prediction: predictionValue, color, isVisible: true };
    });
    setLastLabelIndex(loadedPolygons.length);
    setPolygons(loadedPolygons.filter((polygon) => polygon !== undefined));
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
