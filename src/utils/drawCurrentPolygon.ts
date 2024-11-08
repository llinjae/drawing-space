const drawCurrentPolygon = (
  currentPolygon,
  ctx,
  drawWidth,
  drawHeight,
  offsetX,
  offsetY,
  scaleFactor
) => {
  if (currentPolygon.length > 0) {
    ctx.beginPath();

    currentPolygon.forEach(([x, y], index) => {
      const adjustedX = x * drawWidth + offsetX;
      const adjustedY = y * drawHeight + offsetY;

      if (index === 0) {
        ctx.moveTo(adjustedX, adjustedY);
      } else {
        ctx.lineTo(adjustedX, adjustedY);
      }

      // 꼭지점 그리기
      ctx.beginPath();
      ctx.arc(adjustedX, adjustedY, 5 / scaleFactor, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();
    });

    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
};

export default drawCurrentPolygon;
