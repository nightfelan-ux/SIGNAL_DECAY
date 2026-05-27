export type PatternDitherShape =
  | 'dot'
  | 'circle'
  | 'square'
  | 'line'
  | 'cross'
  | 'ascii';

export type PatternDitherOptions = {
  shape: PatternDitherShape;
  scale: number;
  density: number;
  opacity: number;
  color: string;
  backgroundColor?: string;
  invert: boolean;
  replaceImage: boolean;
};

const ASCII_CHARS = ' .:-=+*#%@';

export function applyPatternDither(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: PatternDitherOptions
) {
  const scale = clamp(options.scale, 4, 80);
  const density = clamp(options.density, 0, 100) / 100;
  const opacity = clamp(options.opacity, 0, 1);

  if (density <= 0 || opacity <= 0) return;

  const source = ctx.getImageData(0, 0, width, height);

  if (options.replaceImage) {
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = options.backgroundColor ?? '#050505';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.save();

  ctx.globalAlpha = opacity;
  ctx.fillStyle = options.color;
  ctx.strokeStyle = options.color;
  ctx.lineWidth = Math.max(1, Math.round(scale * 0.08));
  ctx.font = `${Math.round(scale * 0.9)}px 'Datatype', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let y = 0; y < height; y += scale) {
    for (let x = 0; x < width; x += scale) {
      const sampleX = Math.min(
        width - 1,
        x + Math.floor(scale / 2)
      );

      const sampleY = Math.min(
        height - 1,
        y + Math.floor(scale / 2)
      );

      const brightness = getBrightnessAt(
        source.data,
        width,
        sampleX,
        sampleY
      );

      let normalized = brightness / 255;

      if (options.invert) {
        normalized = 1 - normalized;
      }

      const strength = normalized * density;

      if (strength <= 0.02) continue;

      drawPatternCell(
        ctx,
        x + scale / 2,
        y + scale / 2,
        scale,
        strength,
        options.shape
      );
    }
  }

  ctx.restore();
}

function drawPatternCell(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  scale: number,
  strength: number,
  shape: PatternDitherShape
) {
  const size = scale * clamp(strength, 0, 1);

  if (shape === 'dot') {
    ctx.fillRect(
      centerX - size * 0.08,
      centerY - size * 0.08,
      Math.max(1, size * 0.16),
      Math.max(1, size * 0.16)
    );

    return;
  }

  if (shape === 'circle') {
    ctx.beginPath();
    ctx.arc(
      centerX,
      centerY,
      Math.max(0.5, size * 0.38),
      0,
      Math.PI * 2
    );
    ctx.fill();

    return;
  }

  if (shape === 'square') {
    ctx.fillRect(
      centerX - size * 0.38,
      centerY - size * 0.38,
      size * 0.76,
      size * 0.76
    );

    return;
  }

  if (shape === 'line') {
    const lineLength = scale * clamp(strength, 0.05, 1);

    ctx.beginPath();
    ctx.moveTo(centerX - lineLength * 0.45, centerY);
    ctx.lineTo(centerX + lineLength * 0.45, centerY);
    ctx.stroke();

    return;
  }

  if (shape === 'cross') {
    const lineLength = scale * clamp(strength, 0.05, 1) * 0.45;

    ctx.beginPath();
    ctx.moveTo(centerX - lineLength, centerY);
    ctx.lineTo(centerX + lineLength, centerY);
    ctx.moveTo(centerX, centerY - lineLength);
    ctx.lineTo(centerX, centerY + lineLength);
    ctx.stroke();

    return;
  }

  const charIndex = Math.floor(
    clamp(strength, 0, 1) * (ASCII_CHARS.length - 1)
  );

  const char = ASCII_CHARS[charIndex];

  if (char.trim() === '') return;

  ctx.fillText(char, centerX, centerY);
}

function getBrightnessAt(
  data: Uint8ClampedArray,
  width: number,
  x: number,
  y: number
) {
  const i = (y * width + x) * 4;

  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];

  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(min, Math.min(max, value));
}