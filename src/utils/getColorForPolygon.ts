const getColorForPolygon = (labelIndex: number) => {
  const colors = [
    "rgba(255, 0, 0, 0.5)",
    "rgba(255, 140, 0, 0.5)",
    "rgba(255, 255, 0, 0.5)",
    "rgba(0, 255, 0, 0.5)",
    "rgba(0, 0, 255, 0.5)",
    "rgba(255, 153, 504, 0.5)",
  ];
  return colors[labelIndex % colors.length];
};

export default getColorForPolygon;
