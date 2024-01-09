/** @jsxImportSource @emotion/react */
"use client";

import CanvasModal from '@/components/CanvasModal';
import { css } from '@emotion/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';



const Canvas = () => {
  const [polygons, setPolygons] = useState([]);
  const [selectedPolygonIndex, setSelectedPolygonIndex] = useState('None');
  const [predictionRange, setPredictionRange] = useState(0.5);
  const [scaleFactor, setScaleFactor] = useState(1.0);
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [isWheelDown, setIsWheelDown] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [fileContent, setFileContent] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });
  const [modalPolygonIndex, setModalPolygonIndex] = useState(null);
  const [hoveredPolygonIndex, setHoveredPolygonIndex] = useState(null);
  
  const canvasRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const img = useRef(new Image());

  useEffect(() => {
    let isVisible = false;
    polygons.forEach(polygon => {
      if (polygon.labelIndex === selectedPolygonIndex && polygon.prediction >= predictionRange) {
        isVisible = true;
      }
    });
  
    if (!isVisible) {
      setSelectedPolygonIndex('None');
    }
  }, [predictionRange, polygons, selectedPolygonIndex]);0

  const getColorForPolygon = useCallback((labelIndex) => {
    const colors = [
      'rgba(255, 0, 0, 0.5)',
      'rgba(255, 140, 0, 0.5)',
      'rgba(255, 255, 0, 0.5)',
      'rgba(0, 255, 0, 0.5)',
      'rgba(0, 0, 255, 0.5)',
      'rgba(255, 153, 504, 0.5)',
    ];
    return colors[labelIndex % colors.length];
  }, []);

  const increaseOpacity = (color) => {
    const [r, g, b, a] = color.match(/\d+/g).map(Number);
    const increasedOpacity = Math.min(a + 0.2, 1);
    return `rgba(${r}, ${g}, ${b}, ${increasedOpacity})`;
  }

  const drawPolygon = useCallback((polygon, ctx) => {
    if (polygon.prediction < predictionRange) {
      return;
    }
  
    let fillColor = polygon.color;
    if (polygon.labelIndex === selectedPolygonIndex || 
        polygon.labelIndex === modalPolygonIndex || 
        hoveredPolygonIndex === polygon.labelIndex) {
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

    const centroid = polygon.points.reduce((acc, [x, y]) => {
      acc.x += x;
      acc.y += y;
      return acc;
    }, { x: 0, y: 0 });
    centroid.x = (centroid.x / polygon.points.length) * img.current.width * scaleFactor + startPos.x;
    centroid.y = (centroid.y / polygon.points.length) * img.current.height * scaleFactor + startPos.y;
  
    if (polygon.tag || polygon.description) {
      ctx.font = '16px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      let textToDisplay = polygon.tag;
      ctx.fillText(textToDisplay, centroid.x, centroid.y);
    }
  }, [predictionRange, selectedPolygonIndex, modalPolygonIndex, hoveredPolygonIndex, scaleFactor, startPos, img]);

  const drawCurrentPolygon = useCallback((ctx) => {
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
  }, [currentPolygon]);

  const drawImageAndPolygons = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(startPos.x, startPos.y);
    ctx.scale(scaleFactor, scaleFactor);
    ctx.drawImage(img.current, 0, 0);

    // polygons.forEach(polygon => drawPolygon(polygon, ctx));
    polygons.forEach(polygon => {
      if(polygon.prediction >= predictionRange) {
        drawPolygon(polygon, ctx);
      }
    });
    drawCurrentPolygon(ctx);

    // polygons.forEach((polygon, index) => {
    //   drawPolygon(polygon, ctx, index);
    // });

    // tags.forEach(tag => {
    //   ctx.fillText(tag.text, tag.x, tag.y);
    // });

    ctx.restore();
  }, [polygons, drawPolygon, startPos, scaleFactor]);

  useEffect(() => {
    img.current.src = '/test58.jpg';
    img.current.onload = () => {
      drawImageAndPolygons();
    };
  }, [drawImageAndPolygons]);

  useEffect(() => {
    drawImageAndPolygons();
  }, [predictionRange, drawImageAndPolygons]);

  // const isNearStartPoint = (point, startPoint) => {
  //   const distance = Math.sqrt(Math.pow(point[0] - startPoint[0], 2) + Math.pow(point[1] - startPoint[1], 2));
  //   return distance < 0.01;
  // };

  // const drawCurrentPolygonWithNewPoint = useCallback((newPoint) => {
  //   const canvas = canvasRef.current;
  //   const ctx = canvas.getContext('2d');
  //   drawCurrentPolygon(ctx);

  //   if (currentPolygon.length > 0) {
  //     ctx.beginPath();
  //     currentPolygon.forEach((point, index) => {
  //       const adjustedX = point[0] * canvas.width;
  //       const adjustedY = point[1] * canvas.height;

  //       if (index === 0) {
  //         ctx.moveTo(adjustedX, adjustedY);
  //       } else {
  //         ctx.lineTo(adjustedX, adjustedY);
  //       }

  //       console.log(adjustedX, adjustedY);
  //     });
  //     ctx.lineTo(newPoint[0] * canvas.width, newPoint[1] * canvas.height);
  //     ctx.stroke();
  //   }
  // }, [currentPolygon, drawCurrentPolygon]);

  const distanceBetween = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  const handleCanvasClick = useCallback((e) => {
    if (showModal) {
      return null;
    }

    const completionThreshold = 0.007

    const rect = canvasRef.current.getBoundingClientRect();
    const scaledX = (e.clientX - rect.left - startPos.x) / scaleFactor;
    const scaledY = (e.clientY - rect.top - startPos.y) / scaleFactor;
    const x = scaledX / img.current.width;
    const y = scaledY / img.current.height;
    const distance = currentPolygon.length > 0 ? distanceBetween(x, y, currentPolygon[0][0], currentPolygon[0][1]) : Number.MAX_VALUE;

    setCurrentPolygon(prev => [...prev, [x, y]]);

    if (currentPolygon.length > 2 && distance < completionThreshold) {
      const newPolygon = {
        labelIndex: 12,
        // points: [...currentPolygon, currentPolygon[0]],
        points: [...currentPolygon, [x, y]],
        prediction: 0.95,
        color: getColorForPolygon(12)
      };
      setPolygons(prev => [...prev, newPolygon]);
      setCurrentPolygon([]);
    }

    let foundPolygonIndex = null;
    polygons.forEach((polygon, index) => {
      if (polygon.prediction >= predictionRange) {
        foundPolygonIndex = index;
      }
    });

    setSelectedPolygonIndex(foundPolygonIndex !== null ? foundPolygonIndex : 'None');

  },[showModal, currentPolygon, polygons, startPos, scaleFactor, img]);

  const handleCanvasRightClick = (e) => {
    e.preventDefault();

    if (currentPolygon.length > 0) {
      setCurrentPolygon([]);
      return;
    }

    setShowModal(true);
    setModalPos({
      x: e.clientX + window.scrollX,
      y: e.clientY + window.scrollY 
    });

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - startPos.x) / scaleFactor;
    const mouseY = (e.clientY - rect.top - startPos.y) / scaleFactor;

    let foundPolygonIndex = null;
    polygons.forEach((polygon, index) => {
      if (isMouseInPolygon(mouseX, mouseY, polygon)) {
        foundPolygonIndex = index;
        setModalPolygonIndex(index);
      }
    });
    setModalPolygonIndex(foundPolygonIndex);

    if (foundPolygonIndex !== null) {
      setModalPolygonIndex(foundPolygonIndex);
    } else {
      setCurrentPolygon([]);
    }
  };

  const isMouseInPolygon = useCallback((mouseX, mouseY, polygon) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
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
      })
    };
    
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const isInPath = ctx.isPointInPath(mouseX, mouseY);
    
    ctx.restore();
    return isInPath;
  }, [scaleFactor, startPos, img]);

  const handleMouseDown = useCallback((e) => {
    if (e.button === 1) {
      setIsWheelDown(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      e.currentTarget.style.cursor = 'grabbing';
    } else if (e.button === 0) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
  
      let foundPolygon = false;
  
      polygons.forEach(polygon => {
        if (isMouseInPolygon(mouseX, mouseY, polygon)) {
          setSelectedPolygonIndex(polygon.labelIndex);
          foundPolygon = true;
        }
      });
  
      if (!foundPolygon) {
        setSelectedPolygonIndex('None');
      }
    }
  }, [polygons, isWheelDown]);
  
 const handleMouseMove = useCallback((e) => {
    if (isWheelDown) {
      const newOffset = {
        x: startPos.x + (e.clientX - dragStart.current.x),
        y: startPos.y + (e.clientY - dragStart.current.y),
      };
      setStartPos(newOffset);
      dragStart.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    } else { 
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
  
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
    }
  }, [isWheelDown, polygons, startPos]);
  
  const handleMouseUp = useCallback((e) => {
    if (e.button === 1) {
      e.preventDefault();
      setIsWheelDown(false);
      e.currentTarget.style.cursor = 'default';
    }
  }, []);

  const handleWheel = (e) => {
    if (!isWheelDown) {
      const delta = Math.sign(e.deltaY);
      setScaleFactor(prevScale => {
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
    const loadedPolygons = Object.values(jsonData).map(item => {
      const itemStr = typeof item === 'string' ? item.trim() : JSON.stringify(item).trim();

      const parts = itemStr.split(' ');
      const labelIndex = parseInt(parts[0], 10);
      const predictionValue = parseFloat(parts[parts.length - 1]);
      const points = parts
        .slice(1, -1)
        .map((part, index, array) =>
          index % 2 === 0 ? [parseFloat(array[index]), parseFloat(array[index + 1])] : null
        )
        .filter(point => point);
      const color = getColorForPolygon(labelIndex);
      return { labelIndex, points, prediction: predictionValue, color };
    });
    setPolygons(loadedPolygons);
  };

  const handleDeletePolygon = () => {
    if (modalPolygonIndex !== null) {
      setPolygons(prev => prev.filter((_, index) => index !== modalPolygonIndex));
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

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <p>예측값 범위: <span>{predictionRange}</span></p>
      <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={predictionRange}
          onChange={(e) => setPredictionRange(e.target.value)}
      />
      <canvas
        ref={canvasRef}
        width={700}
        height={900}
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
        />
      )}
      <p>선택된 폴리곤 라벨 인덱스: <span>{selectedPolygonIndex}</span></p>
      <button onClick={() => setScaleFactor(scaleFactor + 0.1)}>확대</button>
      <button onClick={() => setScaleFactor(scaleFactor - 0.1)}>축소</button>
    </div>
  );
}

export default Canvas;