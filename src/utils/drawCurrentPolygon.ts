const drawCurrentPolygon = (currentPolygon, ctx, img, scaleFactor) => {
  if (currentPolygon.length > 0) {
    ctx.beginPath();

    currentPolygon.forEach(([x, y], index) => {
      const adjustedX = x * img.current.width;
      const adjustedY = y * img.current.height;

      if (index === 0) {
        ctx.moveTo(adjustedX, adjustedY);
      } else {
        ctx.lineTo(adjustedX, adjustedY);
      }

      // 꼭지점에 원 그리기
      ctx.beginPath();
      ctx.arc(adjustedX, adjustedY, 5 / scaleFactor, 0, 2 * Math.PI); // 확대/축소에 따라 반지름 조절
      ctx.fillStyle = "red";
      ctx.fill();
    });

    ctx.strokeStyle = "red";
    ctx.lineWidth = 2 / scaleFactor; // 확대/축소에 따라 선 두께 조절
    ctx.stroke();
  }
};

export default drawCurrentPolygon;
