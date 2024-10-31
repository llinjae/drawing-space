const distanceFromPointToLineSegment = (px, py, x1, y1, x2, y2) => {
  const lineLength = Math.hypot(x2 - x1, y2 - y1);
  if (lineLength === 0) {
    return Math.hypot(px - x1, py - y1);
  }
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / lineLength ** 2;
  t = Math.max(0, Math.min(1, t));
  const projectionX = x1 + t * (x2 - x1);
  const projectionY = y1 + t * (y2 - y1);
  return Math.hypot(px - projectionX, py - projectionY);
};

export default distanceFromPointToLineSegment;
