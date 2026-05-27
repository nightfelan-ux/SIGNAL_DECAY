export type DitherMode =
  | 'floyd-steinberg'
  | 'ordered-bayer'
  | 'atkinson';

type RgbColor = {
  r: number;
  g: number;
  b: number;
};

export const applyDithering = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  threshold: number,
  palette: RgbColor[],
  mode: DitherMode = 'floyd-steinberg'
) => {
  if (palette.length === 0) return;

  if (mode === 'ordered-bayer') {
    applyOrderedBayer(ctx, width, height, threshold, palette);
    return;
  }

  if (mode === 'atkinson') {
    applyAtkinson(ctx, width, height, threshold, palette);
    return;
  }

  applyFloydSteinberg(ctx, width, height, threshold, palette);
};

function applyFloydSteinberg(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  threshold: number,
  palette: RgbColor[]
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const errMult = threshold / 255;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;

      const oldR = data[i];
      const oldG = data[i + 1];
      const oldB = data[i + 2];

      const newColor = getPaletteColorByBrightness(
        oldR,
        oldG,
        oldB,
        palette
      );

      data[i] = newColor.r;
      data[i + 1] = newColor.g;
      data[i + 2] = newColor.b;

      const errR = (oldR - newColor.r) * errMult;
      const errG = (oldG - newColor.g) * errMult;
      const errB = (oldB - newColor.b) * errMult;

      distributeError(
        data,
        width,
        height,
        x + 1,
        y,
        errR,
        errG,
        errB,
        7 / 16
      );

      distributeError(
        data,
        width,
        height,
        x - 1,
        y + 1,
        errR,
        errG,
        errB,
        3 / 16
      );

      distributeError(
        data,
        width,
        height,
        x,
        y + 1,
        errR,
        errG,
        errB,
        5 / 16
      );

      distributeError(
        data,
        width,
        height,
        x + 1,
        y + 1,
        errR,
        errG,
        errB,
        1 / 16
      );
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function applyAtkinson(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  threshold: number,
  palette: RgbColor[]
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const errMult = threshold / 255;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;

      const oldR = data[i];
      const oldG = data[i + 1];
      const oldB = data[i + 2];

      const newColor = getPaletteColorByBrightness(
        oldR,
        oldG,
        oldB,
        palette
      );

      data[i] = newColor.r;
      data[i + 1] = newColor.g;
      data[i + 2] = newColor.b;

      const errR = ((oldR - newColor.r) / 8) * errMult;
      const errG = ((oldG - newColor.g) / 8) * errMult;
      const errB = ((oldB - newColor.b) / 8) * errMult;

      distributeError(data, width, height, x + 1, y, errR, errG, errB, 1);
      distributeError(data, width, height, x + 2, y, errR, errG, errB, 1);
      distributeError(data, width, height, x - 1, y + 1, errR, errG, errB, 1);
      distributeError(data, width, height, x, y + 1, errR, errG, errB, 1);
      distributeError(data, width, height, x + 1, y + 1, errR, errG, errB, 1);
      distributeError(data, width, height, x, y + 2, errR, errG, errB, 1);
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function applyOrderedBayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  threshold: number,
  palette: RgbColor[]
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const strength = threshold / 255;

  const bayer4 = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;

      const bayerValue = bayer4[y % 4][x % 4] / 15;
      const offset = (bayerValue - 0.5) * 120 * strength;

      const r = clamp(data[i] + offset);
      const g = clamp(data[i + 1] + offset);
      const b = clamp(data[i + 2] + offset);

      const newColor = getPaletteColorByBrightness(
        r,
        g,
        b,
        palette
      );

      data[i] = newColor.r;
      data[i + 1] = newColor.g;
      data[i + 2] = newColor.b;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function distributeError(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  errR: number,
  errG: number,
  errB: number,
  ratio: number
) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;

  const i = (y * width + x) * 4;

  data[i] = clamp(data[i] + errR * ratio);
  data[i + 1] = clamp(data[i + 1] + errG * ratio);
  data[i + 2] = clamp(data[i + 2] + errB * ratio);
}

function getPaletteColorByBrightness(
  r: number,
  g: number,
  b: number,
  palette: RgbColor[]
) {
  const brightness = getBrightness(r, g, b);
  const normalized = brightness / 255;
  const lastIndex = palette.length - 1;

  const paletteIndex = Math.max(
    0,
    Math.min(
      lastIndex,
      Math.round(normalized * lastIndex)
    )
  );

  return palette[paletteIndex];
}

function getBrightness(
  r: number,
  g: number,
  b: number
) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function clamp(value: number) {
  return Math.max(0, Math.min(255, value));
}