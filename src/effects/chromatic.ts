type ChromaticOptions = {
  amount: number;
  width?: number;
  edgeOnly?: boolean;
  overridePalette?: boolean;
};

export function applyChromatic(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: ChromaticOptions
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const source = new Uint8ClampedArray(data);

  const offset = Math.round(options.amount);

  if (offset <= 0) {
    return;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;

      const rX = clampInt(x + offset, 0, width - 1);
      const gX = x;
      const bX = clampInt(x - offset, 0, width - 1);

      const rIndex = (y * width + rX) * 4;
      const gIndex = (y * width + gX) * 4;
      const bIndex = (y * width + bX) * 4;

      data[i] = source[rIndex];
      data[i + 1] = source[gIndex + 1];
      data[i + 2] = source[bIndex + 2];
      data[i + 3] = source[i + 3];
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function clampInt(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}