function distanceFromPointToLineSegment(px, py, x1, y1, x2, y2) {
  const lineLengthSquared = (x2 - x1) ** 2 + (y2 - y1) ** 2;

  if (lineLengthSquared === 0) {
    // 선분의 시작점과 끝점이 동일한 경우
    const dx = px - x1;
    const dy = py - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  const t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / lineLengthSquared;
  const tClamped = Math.max(0, Math.min(1, t));

  const projectionX = x1 + tClamped * (x2 - x1);
  const projectionY = y1 + tClamped * (y2 - y1);

  const dx = px - projectionX;
  const dy = py - projectionY;
  return Math.sqrt(dx * dx + dy * dy);
}

export default distanceFromPointToLineSegment;
