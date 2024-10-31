import getColorForPolygon from "./getColorForPolygon";

const processFileContent = (content, setLastLabelIndex, setPolygons) => {
  const jsonData = JSON.parse(content);
  const loadedPolygons = Object.values(jsonData).map((item, index) => {
    const itemStr =
      typeof item === "string" ? item.trim() : JSON.stringify(item).trim();
    const parts = itemStr.split(" ");
    if (parseInt(parts[0]) === 0) return;
    const labelIndex = index;
    const predictionValue = parseFloat(parts[parts.length - 1]);
    const points = parts
      .slice(1, -1)
      .map((part, index, array) =>
        index % 2 === 0
          ? [parseFloat(array[index]), parseFloat(array[index + 1])]
          : null
      )
      .filter((point) => point);
    const color = getColorForPolygon(labelIndex);
    return {
      labelIndex,
      points,
      prediction: predictionValue,
      color,
      isVisible: true,
    };
  });
  setLastLabelIndex(loadedPolygons.length);
  setPolygons(loadedPolygons.filter((polygon) => polygon !== undefined));
};

export default processFileContent;
