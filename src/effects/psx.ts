type PsxOptions = {
  resolutionScale: number;
  colorLevels: number;
  warpAmount: number;
  jitterAmount: number;
  ditherStrength: number;
  blockSize: number;
  compositeBlur: number;
  chromaBleed: number;
};

export function applyPsx(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: PsxOptions
) {
  const resolutionScale = clamp(options.resolutionScale, 1, 12);
  const colorLevels = clamp(options.colorLevels, 2, 32);
  const warpAmount = clamp(options.warpAmount, 0, 20);
  const jitterAmount = clamp(options.jitterAmount, 0, 20);
  const ditherStrength = clamp(options.ditherStrength, 0, 1);
  const blockSize = clamp(options.blockSize, 4, 64);
  const compositeBlur = clamp(options.compositeBlur, 0, 6);
  const chromaBleed = clamp(options.chromaBleed, 0, 8);

  applyLowResolution(
    ctx,
    width,
    height,
    resolutionScale
  );

  if (warpAmount > 0 || jitterAmount > 0) {
    applyBlockWarp(
      ctx,
      width,
      height,
      warpAmount,
      jitterAmount,
      blockSize
    );
  }

  applyPosterizeWithDither(
    ctx,
    width,
    height,
    colorLevels,
    ditherStrength
  );

  if (compositeBlur > 0) {
    applyCompositeBlur(
      ctx,
      width,
      height,
      compositeBlur
    );
  }

  if (chromaBleed > 0) {
    applyChromaBleed(
      ctx,
      width,
      height,
      chromaBleed
    );
  }
}

function applyLowResolution(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  resolutionScale: number
) {
  const smallWidth = Math.max(
    1,
    Math.floor(width / resolutionScale)
  );

  const smallHeight = Math.max(
    1,
    Math.floor(height / resolutionScale)
  );

  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');

  if (!tempCtx) return;

  tempCanvas.width = smallWidth;
  tempCanvas.height = smallHeight;

  tempCtx.imageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;

  tempCtx.drawImage(
    ctx.canvas,
    0,
    0,
    smallWidth,
    smallHeight
  );

  ctx.clearRect(0, 0, width, height);

  ctx.drawImage(
    tempCanvas,
    0,
    0,
    smallWidth,
    smallHeight,
    0,
    0,
    width,
    height
  );
}

function applyBlockWarp(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  warpAmount: number,
  jitterAmount: number,
  blockSize: number
) {
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');

  if (!tempCtx) return;

  tempCanvas.width = width;
  tempCanvas.height = height;

  tempCtx.drawImage(ctx.canvas, 0, 0);

  // Сначала оставляем базовое изображение,
  // затем поверх него рисуем слегка смещенные блоки.
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(tempCanvas, 0, 0);

  for (let y = 0; y < height; y += blockSize) {
    for (let x = 0; x < width; x += blockSize) {
      const currentBlockWidth = Math.min(
        blockSize,
        width - x
      );

      const currentBlockHeight = Math.min(
        blockSize,
        height - y
      );

      const waveX =
        Math.sin(y * 0.05 + x * 0.02) *
        warpAmount *
        0.6;

      const waveY =
        Math.cos(x * 0.04 + y * 0.015) *
        warpAmount *
        0.25;

      const randomX =
        (Math.random() - 0.5) * jitterAmount;

      const randomY =
        (Math.random() - 0.5) *
        jitterAmount *
        0.35;

      const shiftX = Math.round(waveX + randomX);
      const shiftY = Math.round(waveY + randomY);

      ctx.drawImage(
        tempCanvas,
        x,
        y,
        currentBlockWidth,
        currentBlockHeight,
        x + shiftX,
        y + shiftY,
        currentBlockWidth,
        currentBlockHeight
      );
    }
  }
}

function applyPosterizeWithDither(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colorLevels: number,
  ditherStrength: number
) {
  const imageData = ctx.getImageData(
    0,
    0,
    width,
    height
  );

  const data = imageData.data;

  const step = 255 / (colorLevels - 1);

  const bayer4 = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;

      const threshold =
        ((bayer4[y % 4][x % 4] / 15) - 0.5) *
        step *
        ditherStrength;

      data[i] = quantizeChannel(
        data[i] + threshold,
        step
      );

      data[i + 1] = quantizeChannel(
        data[i + 1] + threshold,
        step
      );

      data[i + 2] = quantizeChannel(
        data[i + 2] + threshold,
        step
      );
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function applyCompositeBlur(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  compositeBlur: number
) {
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');

  if (!tempCtx) return;

  tempCanvas.width = width;
  tempCanvas.height = height;

  tempCtx.drawImage(ctx.canvas, 0, 0);

  ctx.save();

  ctx.globalAlpha = Math.min(
    0.55,
    0.18 + compositeBlur * 0.08
  );

  ctx.filter = `blur(${compositeBlur}px)`;
  ctx.drawImage(tempCanvas, 0, 0);

  ctx.restore();
}

function applyChromaBleed(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  chromaBleed: number
) {
  const imageData = ctx.getImageData(
    0,
    0,
    width,
    height
  );

  const data = imageData.data;
  const source = new Uint8ClampedArray(data);

  const offset = Math.max(
    0,
    Math.round(chromaBleed)
  );

  if (offset <= 0) return;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;

      const rX = clamp(x + offset, 0, width - 1);
      const bX = clamp(x - offset, 0, width - 1);

      const rIdx = (y * width + rX) * 4;
      const bIdx = (y * width + bX) * 4;

      data[i] = source[rIdx];
      data[i + 1] = source[i + 1];
      data[i + 2] = source[bIdx + 2];
      data[i + 3] = source[i + 3];
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function quantizeChannel(
  value: number,
  step: number
) {
  return clamp(
    Math.round(value / step) * step,
    0,
    255
  );
}

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(min, Math.min(max, value));
}