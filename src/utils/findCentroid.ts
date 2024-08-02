const findCentroid = (points: number[][]) => {
  const xCoords = points.map((point) => point[0]);
  const yCoords = points.map((point) => point[1]);

  const minX = Math.min(...xCoords);
  const maxX = Math.max(...xCoords);
  const minY = Math.min(...yCoords);
  const maxY = Math.max(...yCoords);

  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
  };
};

export default findCentroid;
