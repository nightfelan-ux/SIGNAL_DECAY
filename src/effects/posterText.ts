import { createRandom } from '../utils/random';

export type PosterTextMode = 'blend' | 'replace';

export type PosterTextFont =
  | 'consolas'
  | 'lucida-console'
  | 'courier-new'
  | 'bahnschrift'
  | 'arial-black';

export type PosterTextOptions = {
  text: string;
  x: number;
  y: number;
  vertical: boolean;
  font: PosterTextFont;
  weight: number;
  size: number;
  tracking: number;
  opacity: number;
  color: string;
  glitch: boolean;
  mode: PosterTextMode;
  seed: number;
};

type DrawTextOptions = {
  text: string;
  x: number;
  y: number;
  tracking: number;
  lineHeight: number;
};

const FONT_FAMILIES: Record<PosterTextFont, string> = {
  consolas: 'Consolas, monospace',
  'lucida-console': '"Lucida Console", Monaco, monospace',
  'courier-new': '"Courier New", monospace',
  bahnschrift: 'Bahnschrift, "Arial Narrow", sans-serif',
  'arial-black': '"Arial Black", Impact, sans-serif'
};

export function applyPosterText(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: PosterTextOptions
) {
  const text = options.text.trim();

  if (!text) return;

  const size = clamp(options.size, 12, 260);
  const tracking = clamp(options.tracking, 0, 48);
  const opacity = clamp(options.opacity, 0, 1);
  const x = (clamp(options.x, 0, 100) / 100) * width;
  const y = (clamp(options.y, 0, 100) / 100) * height;
  const weight = clamp(options.weight, 100, 900);

  if (opacity <= 0) return;

  const random = createRandom(options.seed);

  ctx.save();

  ctx.translate(x, y);
  ctx.rotate(options.vertical ? -Math.PI / 2 : 0);

  ctx.font = `${weight} ${size}px ${FONT_FAMILIES[options.font]}`;
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = opacity;
  ctx.globalCompositeOperation =
    options.mode === 'blend' ? 'screen' : 'source-over';

  const lineHeight = size * 1.04;
  const drawOptions = {
    text,
    x: 0,
    y: 0,
    tracking,
    lineHeight
  };

  if (options.mode === 'replace') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#050505';
    ctx.globalAlpha = Math.min(0.65, opacity * 0.85);

    drawTrackedText(ctx, {
      ...drawOptions,
      x: 2,
      y: 2
    });
  }

  if (options.glitch) {
    drawGlitchText(
      ctx,
      drawOptions,
      opacity,
      random
    );
  }

  ctx.globalAlpha = opacity;
  ctx.globalCompositeOperation =
    options.mode === 'blend' ? 'screen' : 'source-over';
  ctx.fillStyle = options.color;

  drawTrackedText(ctx, drawOptions);

  ctx.restore();
}
function drawGlitchText(
  ctx: CanvasRenderingContext2D,
  options: DrawTextOptions,
  opacity: number,
  random: () => number
) {
  const offsets = [
    {
      color: '#00c8ff',
      alpha: 0.38
    },
    {
      color: '#ff00cc',
      alpha: 0.32
    }
  ];

  for (const offset of offsets) {
    ctx.globalAlpha = opacity * offset.alpha;
    ctx.fillStyle = offset.color;

    drawTrackedText(ctx, {
      ...options,
      x: options.x + Math.round((random() - 0.5) * 10),
      y: options.y + Math.round((random() - 0.5) * 4)
    });
  }
}

function drawTrackedText(
  ctx: CanvasRenderingContext2D,
  options: DrawTextOptions
) {
  const lines = options.text.split('\n');
  const blockHeight =
    (lines.length - 1) * options.lineHeight;
  const startY = options.y - blockHeight / 2;

  for (let i = 0; i < lines.length; i++) {
    drawTrackedLine(
      ctx,
      lines[i],
      options.x,
      startY + i * options.lineHeight,
      options.tracking
    );
  }
}

function drawTrackedLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number
) {
  const chars = Array.from(text);
  const width = getTrackedTextWidth(ctx, chars, tracking);
  let cursor = x - width / 2;

  for (const char of chars) {
    ctx.fillText(char, cursor, y);
    cursor += ctx.measureText(char).width + tracking;
  }
}

function getTrackedTextWidth(
  ctx: CanvasRenderingContext2D,
  chars: string[],
  tracking: number
) {
  return chars.reduce((total, char, index) => {
    const next = total + ctx.measureText(char).width;

    return index === chars.length - 1
      ? next
      : next + tracking;
  }, 0);
}

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(min, Math.min(max, value));
}
