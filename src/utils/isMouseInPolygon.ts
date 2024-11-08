const isMouseInPolygon = (
  mouseX,
  mouseY,
  polygon,
  canvasRef,
  scaleFactor,
  startPos,
  img
) => {
  if (!canvasRef.current || !img.current) return false;

  const ctx = canvasRef.current.getContext("2d");
  if (!ctx) return false;

  ctx.beginPath();

  polygon.points.forEach(([x, y], index) => {
    const adjustedX = x * img.current.width * scaleFactor + startPos.x;
    const adjustedY = y * img.current.height * scaleFactor + startPos.y;

    if (index === 0) {
      ctx.moveTo(adjustedX, adjustedY);
    } else {
      ctx.lineTo(adjustedX, adjustedY);
    }
  });
  ctx.closePath();

  return (
    ctx.isPointInPath(
      mouseX * scaleFactor + startPos.x,
      mouseY * scaleFactor + startPos.y
    ) && polygon.isVisible
  );
};

export default isMouseInPolygon;
