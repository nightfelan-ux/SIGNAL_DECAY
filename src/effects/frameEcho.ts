export type FrameEchoMode =
  | 'horizontal'
  | 'vertical'
  | 'diagonal';

export type FrameEchoOptions = {
  mode: FrameEchoMode;
  copies: number;
  offset: number;
  decay: number;
  jitter: number;
  random: () => number;
};

export function applyFrameEcho(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: FrameEchoOptions
) {
  const copies = Math.max(1, Math.round(options.copies));
  const offset = Math.round(clamp(options.offset, 0, 128));
  const decay = clamp(options.decay, 0, 1);
  const jitter = Math.round(clamp(options.jitter, 0, 64));

  if (offset <= 0 || decay <= 0) return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const source = new Uint8ClampedArray(imageData.data);
  const data = imageData.data;
  const echoOffsets = Array.from(
    { length: copies },
    (_, index) => {
      const copy = index + 1;
      const drift =
        jitter > 0
          ? Math.round((options.random() - 0.5) * jitter)
          : 0;

      return {
        x: getOffsetX(options.mode, offset * copy) + drift,
        y:
          getOffsetY(options.mode, offset * copy) +
          Math.round(drift * 0.45),
        alpha: Math.pow(decay, copy) * 0.7
      };
    }
  );

  echoOffsets.forEach(({ x: shiftX, y: shiftY, alpha }) => {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const sourceX = x - shiftX;
        const sourceY = y - shiftY;

        if (
          sourceX < 0 ||
          sourceX >= width ||
          sourceY < 0 ||
          sourceY >= height
        ) {
          continue;
        }

        const targetIndex = (y * width + x) * 4;
        const sourceIndex = (sourceY * width + sourceX) * 4;
        const brightness =
          0.299 * source[sourceIndex] +
          0.587 * source[sourceIndex + 1] +
          0.114 * source[sourceIndex + 2];
        const lumaAlpha =
          alpha * (0.35 + (brightness / 255) * 0.65);

        data[targetIndex] = blend(
          data[targetIndex],
          source[sourceIndex],
          lumaAlpha
        );
        data[targetIndex + 1] = blend(
          data[targetIndex + 1],
          source[sourceIndex + 1],
          lumaAlpha
        );
        data[targetIndex + 2] = blend(
          data[targetIndex + 2],
          source[sourceIndex + 2],
          lumaAlpha
        );
      }
    }
  });

  ctx.putImageData(imageData, 0, 0);
}

function getOffsetX(mode: FrameEchoMode, offset: number) {
  if (mode === 'vertical') return 0;
  return offset;
}

function getOffsetY(mode: FrameEchoMode, offset: number) {
  if (mode === 'horizontal') return 0;
  if (mode === 'diagonal') return Math.round(offset * 0.45);
  return offset;
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
