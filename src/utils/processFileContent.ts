import getColorForPolygon from "./getColorForPolygon";

const processFileContent = (content, setLastLabelIndex, setPolygons) => {
  const jsonData = JSON.parse(content);

  const loadedPolygons = Object.values(jsonData).map((item, index) => {
    const itemStr =
      typeof item === "string" ? item.trim() : JSON.stringify(item).trim();
    const parts = itemStr.split(" ");

    if (parseInt(parts[0]) === 0) return null; // 예측값이 0인 경우 건너뜀

    const labelIndex = index;
    const predictionValue = parseFloat(parts[parts.length - 1]);

    // 좌표 부분을 정리해서 점의 배열을 생성
    const points = parts
      .slice(1, -1)
      .map((part, idx, array) =>
        idx % 2 === 0
          ? [parseFloat(array[idx]), parseFloat(array[idx + 1])]
          : null
      )
      .filter((point) => point); // null 값 제거

    // 마지막 점이 첫 번째 점과 다를 경우 첫 번째 점을 마지막에 추가하여 폴리곤을 닫음
    if (
      points.length > 1 &&
      (points[0][0] !== points[points.length - 1][0] ||
        points[0][1] !== points[points.length - 1][1])
    ) {
      points.push([...points[0]]);
    }

    const color = getColorForPolygon(labelIndex);

    return {
      labelIndex,
      points,
      prediction: predictionValue,
      color,
      isVisible: true,
    };
  });

  // undefined 값 제거 후 상태 업데이트
  setLastLabelIndex(loadedPolygons.length);
  setPolygons(loadedPolygons.filter((polygon) => polygon !== null));
};

export default processFileContent;
