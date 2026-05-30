export type MotionSmearDirection = 'horizontal' | 'vertical';

export type MotionSmearOptions = {
  direction: MotionSmearDirection;
  length: number;
  decay: number;
  threshold: number;
  random: () => number;
};

export function applyMotionSmear(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: MotionSmearOptions
) {
  const length = Math.max(1, Math.round(options.length));
  const decay = clamp(options.decay, 0, 1);
  const threshold = clamp(options.threshold, 0, 255);

  if (decay <= 0) return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const source = new Uint8ClampedArray(imageData.data);
  const data = imageData.data;
  const horizontal = options.direction === 'horizontal';
  const lineCount = horizontal ? height : width;
  const lineLengths = Array.from(
    { length: lineCount },
    () =>
      Math.max(
        1,
        Math.round(length * (0.65 + options.random() * 0.7))
      )
  );

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const brightness = getBrightness(
        source[index],
        source[index + 1],
        source[index + 2]
      );

      if (brightness < threshold) continue;

      const activeLength = horizontal
        ? lineLengths[y]
        : lineLengths[x];

      for (let offset = 1; offset <= activeLength; offset++) {
        const targetX = horizontal ? x + offset : x;
        const targetY = horizontal ? y : y + offset;

        if (targetX >= width || targetY >= height) break;

        const targetIndex = (targetY * width + targetX) * 4;
        const alpha =
          Math.pow(1 - offset / (activeLength + 1), 1.4) *
          decay;

        data[targetIndex] = blend(
          data[targetIndex],
          source[index],
          alpha
        );
        data[targetIndex + 1] = blend(
          data[targetIndex + 1],
          source[index + 1],
          alpha
        );
        data[targetIndex + 2] = blend(
          data[targetIndex + 2],
          source[index + 2],
          alpha
        );
      }
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

function blend(
  base: number,
  overlay: number,
  alpha: number
) {
  return Math.round(base * (1 - alpha) + overlay * alpha);
}

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(min, Math.min(max, value));
}
