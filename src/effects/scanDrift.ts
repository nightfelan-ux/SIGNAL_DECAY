export type ScanDriftDirection =
  | 'horizontal'
  | 'vertical';

export type ScanDriftOptions = {
  direction: ScanDriftDirection;
  amount: number;
  bandSize: number;
  chaos: number;
  random: () => number;
};

export function applyScanDrift(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: ScanDriftOptions
) {
  const amount = Math.round(clamp(options.amount, 0, 128));
  const bandSize = Math.max(
    1,
    Math.round(clamp(options.bandSize, 1, 160))
  );
  const chaos = clamp(options.chaos, 0, 1);

  if (amount <= 0) return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const source = new Uint8ClampedArray(imageData.data);
  const data = imageData.data;
  const horizontal = options.direction === 'horizontal';
  const primaryLength = horizontal ? height : width;
  const bandCount = Math.ceil(primaryLength / bandSize);
  const shifts = Array.from({ length: bandCount }, (_, index) => {
    const wave =
      Math.sin(index * 1.73 + options.random() * Math.PI) *
      amount *
      (0.25 + chaos * 0.45);
    const rupture =
      options.random() < chaos
        ? (options.random() - 0.5) * amount * 2
        : 0;

    return Math.round(wave + rupture);
  });

  if (horizontal) {
    for (let y = 0; y < height; y++) {
      const band = Math.floor(y / bandSize);
      const shift = shifts[band] ?? 0;

      for (let x = 0; x < width; x++) {
        const targetIndex = (y * width + x) * 4;
        const sourceX = wrapIndex(x - shift, width);
        const sourceIndex = (y * width + sourceX) * 4;

        data[targetIndex] = source[sourceIndex];
        data[targetIndex + 1] = source[sourceIndex + 1];
        data[targetIndex + 2] = source[sourceIndex + 2];
        data[targetIndex + 3] = source[sourceIndex + 3];
      }
    }
  } else {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const band = Math.floor(x / bandSize);
        const shift = shifts[band] ?? 0;
        const targetIndex = (y * width + x) * 4;
        const sourceY = wrapIndex(y - shift, height);
        const sourceIndex = (sourceY * width + x) * 4;

        data[targetIndex] = source[sourceIndex];
        data[targetIndex + 1] = source[sourceIndex + 1];
        data[targetIndex + 2] = source[sourceIndex + 2];
        data[targetIndex + 3] = source[sourceIndex + 3];
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(min, Math.min(max, value));
}

function wrapIndex(value: number, max: number) {
  return ((value % max) + max) % max;
}
