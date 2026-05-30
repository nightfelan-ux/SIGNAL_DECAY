export type CodecDamageOptions = {
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
