export type LumaDisplacementMode =
  | 'horizontal'
  | 'vertical'
  | 'split';

export type LumaDisplacementOptions = {
  mode: LumaDisplacementMode;
  amount: number;
  threshold: number;
  jitter: number;
  random: () => number;
};

export function applyLumaDisplacement(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: LumaDisplacementOptions
) {
  const amount = Math.round(clamp(options.amount, 0, 96));
  const threshold = clamp(options.threshold, 0, 255);
  const jitter = Math.round(clamp(options.jitter, 0, 48));

  if (amount <= 0) return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const source = new Uint8ClampedArray(imageData.data);
  const data = imageData.data;
  const rowJitter = Array.from({ length: height }, () =>
    jitter > 0
      ? Math.round((options.random() - 0.5) * jitter)
      : 0
  );
  const columnJitter = Array.from({ length: width }, () =>
    jitter > 0
      ? Math.round((options.random() - 0.5) * jitter)
      : 0
  );

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const brightness = getBrightness(
        source[index],
        source[index + 1],
        source[index + 2]
      );
      const lumaOffset = clamp(
        (brightness - threshold) / 128,
        -1,
        1
      );
      const displacement = Math.round(lumaOffset * amount);
      const scanBias =
        rowJitter[y] +
        Math.round(
          Math.sin((y / Math.max(1, height)) * Math.PI * 6) *
            jitter *
            0.35
        );

      const shiftX =
        options.mode === 'vertical'
          ? 0
          : displacement + scanBias;
      const shiftY =
        options.mode === 'horizontal'
          ? 0
          : options.mode === 'split'
            ? Math.round(displacement * 0.38) + columnJitter[x]
            : displacement + columnJitter[x];

      const sourceX = clampIndex(x - shiftX, width);
      const sourceY = clampIndex(y - shiftY, height);
      const sourceIndex = (sourceY * width + sourceX) * 4;

      data[index] = source[sourceIndex];
      data[index + 1] = source[sourceIndex + 1];
      data[index + 2] = source[sourceIndex + 2];
      data[index + 3] = source[sourceIndex + 3];
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function getBrightness(
  r: number,
  g: number,
  b: number
) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(min, Math.min(max, value));
}

function clampIndex(value: number, max: number) {
  return Math.max(0, Math.min(max - 1, value));
}
