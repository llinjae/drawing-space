const increaseOpacity = (color: string): string => {
  const rgba = color.match(/\d+/g)?.map(Number);
  if (rgba && rgba.length >= 4) {
    const [r, g, b, a] = rgba;
    const increasedOpacity = Math.min(a + 0.9, 1);
    return `rgba(${r}, ${g}, ${b}, ${increasedOpacity})`;
  }
  return color;
};

export default increaseOpacity;
