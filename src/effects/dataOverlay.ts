export type DataOverlayMode =
  | 'random-codes'
  | 'coordinates'
  | 'image-info'
  | 'metadata'
  | 'diagnostics'
  | 'warning'
  | 'custom';

export type DataOverlayOptions = {
  density: number;
  fontSize: number;
  opacity: number;
  color: string;
  mode: DataOverlayMode;
  customText?: string;
  seed?: number;
};

type RandomGenerator = () => number;

const DEFAULT_TEXT = [
  'SIGNAL',
  'SCAN',
  'OFFSET',
  'TRACE',
  'NULL',
  'VECTOR',
  'BUFFER',
  'FRAME',
  'LUMA',
  'SYNC',
  'NOISE',
  'DECAY',
  'SECTOR',
  'ALGORITHM',
  'THRESHOLD',
  'UNSTABLE'
];

export function applyDataOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: DataOverlayOptions
) {
  const density = clamp(options.density, 0, 100);

  if (density <= 0) return;

  const fontSize = clamp(options.fontSize, 6, 48);
  const opacity = clamp(options.opacity, 0, 1);

  const random = createLocalRandom(options.seed ?? 123456);

  const cellWidth = fontSize * 7;
  const cellHeight = fontSize * 2.2;

  const columns = Math.ceil(width / cellWidth);
  const rows = Math.ceil(height / cellHeight);

  const chance = density / 100;

  ctx.save();

  ctx.globalAlpha = opacity;
  ctx.fillStyle = options.color;
  ctx.font = `${fontSize}px 'Datatype', monospace`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      if (random() > chance) continue;

      const x = column * cellWidth + random() * fontSize;
      const y = row * cellHeight + random() * fontSize;

      const label = createOverlayText({
        mode: options.mode,
        customText: options.customText,
        x,
        y,
        width,
        height,
        random
      });

      ctx.fillText(label, x, y);
    }
  }

  ctx.restore();
}

function createOverlayText({
  mode,
  customText,
  x,
  y,
  width,
  height,
  random
}: {
  mode: DataOverlayMode;
  customText?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  random: RandomGenerator;
}) {
  if (mode === 'custom') {
    return customText?.trim() || 'CUSTOM DATA';
  }

  if (mode === 'coordinates') {
    const normalizedX = Math.round((x / width) * 9999)
      .toString()
      .padStart(4, '0');

    const normalizedY = Math.round((y / height) * 9999)
      .toString()
      .padStart(4, '0');

    return `X:${normalizedX} Y:${normalizedY}`;
  }

  if (mode === 'image-info') {
    const options = [
      `SIZE ${width}×${height}`,
      `SCAN ${randomInt(random, 100, 999)}`,
      `LUMA ${randomInt(random, 0, 255)}`,
      `OFFSET ${randomSigned(random, 99)}`,
      `FRAME ${randomInt(random, 1000, 9999)}`,
      `DENSITY ${randomInt(random, 10, 99)}%`
    ];

    return pick(options, random);
  }

  if (mode === 'metadata') {
    const tags = [
      `CAPTURE ${width}x${height}`,
      `PROFILE DITHER-${randomInt(random, 10, 99)}`,
      `GAMMA ${randomInt(random, 18, 24) / 10}`,
      `SCAN UTC ${randomInt(random, 0, 23)
        .toString()
        .padStart(2, '0')}:${randomInt(random, 0, 59)
        .toString()
        .padStart(2, '0')}`,
      `SENSOR ${randomInt(random, 100, 999)}-A`,
      `PACKET ${randomInt(random, 10000, 99999)}`
    ];

    return pick(tags, random);
  }

  if (mode === 'diagnostics') {
    const normalizedX = Math.round((x / width) * 100);
    const normalizedY = Math.round((y / height) * 100);
    const tags = [
      `NODE ${normalizedX}.${normalizedY}`,
      `VECTOR ${randomSigned(random, 32)}/${randomSigned(random, 32)}`,
      `LOSS ${randomInt(random, 0, 18)}%`,
      `EDGE ${randomInt(random, 10, 99)}`,
      `LUMA ${randomInt(random, 0, 255)}`,
      `LOCK ${random() > 0.35 ? 'TRUE' : 'FALSE'}`
    ];

    return pick(tags, random);
  }

  if (mode === 'warning') {
    const warnings = [
      'SIGNAL UNSTABLE',
      'BUFFER DECAY',
      'SCAN FAILURE',
      'DATA PRIVILEGE',
      'TRACE ACTIVE',
      'NOISE ABOVE LIMIT',
      'FRAME CORRUPTED',
      'LUMA OVERFLOW',
      'SYSTEM AWAKE',
      'UNAUTHORIZED SIGNAL'
    ];

    return pick(warnings, random);
  }

  const prefix = pick(DEFAULT_TEXT, random);
  const code = randomInt(random, 1000, 999999)
    .toString()
    .padStart(6, '0');

  const separator = pick([':', '/', '-', '_'], random);

  return `${prefix}${separator}${code}`;
}

function createLocalRandom(seed: number): RandomGenerator {
  let value = seed >>> 0;

  return function random() {
    value += 0x6d2b79f5;

    let t = value;

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: T[], random: RandomGenerator) {
  return items[Math.floor(random() * items.length)];
}

function randomInt(
  random: RandomGenerator,
  min: number,
  max: number
) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function randomSigned(
  random: RandomGenerator,
  max: number
) {
  const value = randomInt(random, 0, max);

  return random() > 0.5 ? `+${value}` : `-${value}`;
}

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(min, Math.min(max, value));
}
