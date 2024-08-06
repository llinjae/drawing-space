const isMouseInPolygon = (mouseX, mouseY, polygon, canvasRef, scaleFactor, startPos, img) => {
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
};

export default isMouseInPolygon;
