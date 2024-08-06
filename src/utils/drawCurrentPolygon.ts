const drawCurrentPolygon = (currentPolygon, ctx, img) => {
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
};

export default drawCurrentPolygon;
