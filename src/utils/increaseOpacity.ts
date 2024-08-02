const increaseOpacity = (color) => {
  const [r, g, b, a] = color.match(/\d+/g).map(Number);
  const increasedOpacity = Math.min(a + 0.2, 1);
  return `rgba(${r}, ${g}, ${b}, ${increasedOpacity})`;
};

export default increaseOpacity;
