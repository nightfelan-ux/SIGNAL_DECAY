export type CodecDamageMode =
  | 'blocks'
  | 'compression-bands'
  | 'broken-iframe';

export type CodecDamageOptions = {
  mode: CodecDamageMode;
  blockSize: number;
  amount: number;
  chromaShift: number;
  colorDepth: number;
  random: () => number;
};

export function applyCodecDamage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: CodecDamageOptions
) {
  const blockSize = Math.max(
    4,
    Math.round(options.blockSize)
  );
  const amount = clamp(options.amount, 0, 1);
  const chromaShift = Math.round(
    clamp(options.chromaShift, 0, 24)
  );
  const colorDepth = Math.max(
    2,
    Math.round(clamp(options.colorDepth, 2, 32))
  );

  if (amount <= 0) return;

  if (options.mode === 'compression-bands') {
    applyCompressionBands(ctx, width, height, {
      blockSize,
      amount,
      chromaShift,
      colorDepth,
      random: options.random
    });
    return;
  }

  if (options.mode === 'broken-iframe') {
    applyBrokenIFrame(ctx, width, height, {
      blockSize,
      amount,
      chromaShift,
      colorDepth,
      random: options.random
    });
    return;
  }

  const imageData = ctx.getImageData(0, 0, width, height);
  const source = new Uint8ClampedArray(imageData.data);
  const data = imageData.data;
  const step = 255 / (colorDepth - 1);

  for (let by = 0; by < height; by += blockSize) {
    for (let bx = 0; bx < width; bx += blockSize) {
      if (options.random() > amount) continue;

      const blockWidth = Math.min(blockSize, width - bx);
      const blockHeight = Math.min(blockSize, height - by);
      const driftX = Math.round(
        (options.random() - 0.5) * blockSize * amount * 1.8
      );
      const driftY = Math.round(
        (options.random() - 0.5) * blockSize * amount
      );
      const channelOffset =
        chromaShift > 0
          ? Math.round(
              (options.random() - 0.5) * chromaShift * 2
            )
          : 0;

      for (let y = 0; y < blockHeight; y++) {
        for (let x = 0; x < blockWidth; x++) {
          const targetX = bx + x;
          const targetY = by + y;
          const sourceX = clampIndex(targetX + driftX, width);
          const sourceY = clampIndex(targetY + driftY, height);
          const redX = clampIndex(
            sourceX + channelOffset,
            width
          );
          const blueX = clampIndex(
            sourceX - channelOffset,
            width
          );

          const targetIndex = (targetY * width + targetX) * 4;
          const sourceIndex = (sourceY * width + sourceX) * 4;
          const redIndex = (sourceY * width + redX) * 4;
          const blueIndex = (sourceY * width + blueX) * 4;

          data[targetIndex] = quantize(
            source[redIndex],
            step
          );
          data[targetIndex + 1] = quantize(
            source[sourceIndex + 1],
            step
          );
          data[targetIndex + 2] = quantize(
            source[blueIndex + 2],
            step
          );
          data[targetIndex + 3] = source[sourceIndex + 3];
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function applyCompressionBands(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: {
    blockSize: number;
    amount: number;
    chromaShift: number;
    colorDepth: number;
    random: () => number;
  }
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const source = new Uint8ClampedArray(imageData.data);
  const data = imageData.data;
  const step = 255 / (options.colorDepth - 1);
  const bandHeight = Math.max(4, Math.round(options.blockSize * 0.65));

  for (let by = 0; by < height; by += bandHeight) {
    if (options.random() > options.amount) continue;

    const driftX = Math.round(
      (options.random() - 0.5) * options.blockSize * 2.6
    );
    const quantizeEvery = options.random() > 0.45;
    const bandEnd = Math.min(height, by + bandHeight);

    for (let y = by; y < bandEnd; y++) {
      for (let x = 0; x < width; x++) {
        const targetIndex = (y * width + x) * 4;
        const sourceX = clampIndex(x + driftX, width);
        const sourceIndex = (y * width + sourceX) * 4;
        const redIndex =
          (y *
            width +
            clampIndex(sourceX + options.chromaShift, width)) *
          4;
        const blueIndex =
          (y *
            width +
            clampIndex(sourceX - options.chromaShift, width)) *
          4;

        data[targetIndex] = quantizeEvery
          ? quantize(source[redIndex], step)
          : source[redIndex];
        data[targetIndex + 1] = quantizeEvery
          ? quantize(source[sourceIndex + 1], step)
          : source[sourceIndex + 1];
        data[targetIndex + 2] = quantizeEvery
          ? quantize(source[blueIndex + 2], step)
          : source[blueIndex + 2];
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function applyBrokenIFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: {
    blockSize: number;
    amount: number;
    chromaShift: number;
    colorDepth: number;
    random: () => number;
  }
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const source = new Uint8ClampedArray(imageData.data);
  const data = imageData.data;
  const macroBlock = Math.max(8, Math.round(options.blockSize * 1.35));
  const step = 255 / (options.colorDepth - 1);

  for (let by = 0; by < height; by += macroBlock) {
    for (let bx = 0; bx < width; bx += macroBlock) {
      if (options.random() > options.amount) continue;

      const copyFromX = clampIndex(
        bx + Math.round((options.random() - 0.5) * macroBlock * 4),
        width
      );
      const copyFromY = clampIndex(
        by + Math.round((options.random() - 0.5) * macroBlock * 2),
        height
      );
      const blockWidth = Math.min(macroBlock, width - bx);
      const blockHeight = Math.min(macroBlock, height - by);
      const tint = 0.78 + options.random() * 0.32;

      for (let y = 0; y < blockHeight; y++) {
        for (let x = 0; x < blockWidth; x++) {
          const targetX = bx + x;
          const targetY = by + y;
          const sourceX = clampIndex(copyFromX + x, width);
          const sourceY = clampIndex(copyFromY + y, height);
          const targetIndex = (targetY * width + targetX) * 4;
          const sourceIndex = (sourceY * width + sourceX) * 4;

          data[targetIndex] = quantize(source[sourceIndex] * tint, step);
          data[targetIndex + 1] = quantize(
            source[sourceIndex + 1] * tint,
            step
          );
          data[targetIndex + 2] = quantize(
            source[sourceIndex + 2] * tint,
            step
          );
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function quantize(value: number, step: number) {
  return Math.max(
    0,
    Math.min(255, Math.round(value / step) * step)
  );
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
