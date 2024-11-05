const isMouseInPolygon = (
  mouseX,
  mouseY,
  polygon,
  canvasRef,
  scaleFactor,
  startPos,
  img
) => {
  const ctx = canvasRef.current.getContext("2d");
  ctx.beginPath();

  // 각 폴리곤 점을 현재 scaleFactor와 startPos에 맞게 변환
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

  // 변환된 좌표 내에 마우스가 있는지 확인
  return ctx.isPointInPath(
    mouseX * scaleFactor + startPos.x,
    mouseY * scaleFactor + startPos.y
  ) && polygon.isVisible;
};

export default isMouseInPolygon;
