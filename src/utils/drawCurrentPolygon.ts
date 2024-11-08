const drawCurrentPolygon = (currentPolygon, ctx, canvas, scaleFactor) => {
  if (currentPolygon.length > 0) {
    ctx.beginPath();

    currentPolygon.forEach(([x, y], index) => {
      const adjustedX = x * canvas.width;
      const adjustedY = y * canvas.height;

      if (index === 0) {
        ctx.moveTo(adjustedX, adjustedY);
      } else {
        ctx.lineTo(adjustedX, adjustedY);
      }

      // 꼭지점에 원 그리기
      ctx.beginPath();
      ctx.arc(adjustedX, adjustedY, 5 / scaleFactor, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();
    });

    ctx.strokeStyle = "red";
    ctx.lineWidth = 2 / scaleFactor;
    ctx.stroke();
  }
};

export default drawCurrentPolygon;
