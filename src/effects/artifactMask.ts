export type ArtifactMaskMode =
  | 'all'
  | 'bright'
  | 'dark'
  | 'edges'
  | 'random-zones'
  | 'center'
  | 'borders';

export type ArtifactMaskOptions = {
  mode: ArtifactMaskMode;
  threshold: number;
  seed: number;
  source: ImageData;
};

export function applyArtifactMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: ArtifactMaskOptions
) {
  if (options.mode === 'all') return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const source = options.source.data;
  const threshold = clamp(options.threshold, 0, 255);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;

      if (
        shouldKeepArtifact(
          x,
          y,
          width,
          height,
          source,
          threshold,
          options.mode,
          options.seed
        )
      ) {
        continue;
      }

      data[index] = source[index];
      data[index + 1] = source[index + 1];
      data[index + 2] = source[index + 2];
      data[index + 3] = source[index + 3];
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function shouldKeepArtifact(
  x: number,
  y: number,
  width: number,
  height: number,
  source: Uint8ClampedArray,
  threshold: number,
  mode: ArtifactMaskMode,
  seed: number
) {
  const index = (y * width + x) * 4;
  const brightness = getBrightness(
    source[index],
    source[index + 1],
    source[index + 2]
  );

  if (mode === 'bright') {
    return brightness >= threshold;
  }

  if (mode === 'dark') {
    return brightness <= threshold;
  }

  if (mode === 'edges') {
    const nextX = Math.min(width - 1, x + 1);
    const nextY = Math.min(height - 1, y + 1);
    const xIndex = (y * width + nextX) * 4;
    const yIndex = (nextY * width + x) * 4;
    const xBrightness = getBrightness(
      source[xIndex],
      source[xIndex + 1],
      source[xIndex + 2]
    );
    const yBrightness = getBrightness(
      source[yIndex],
      source[yIndex + 1],
      source[yIndex + 2]
    );

    return (
      Math.abs(brightness - xBrightness) +
        Math.abs(brightness - yBrightness) >
      threshold
    );
  }

  if (mode === 'random-zones') {
    const cellSize = Math.max(
      18,
      Math.round(Math.min(width, height) / 9)
    );
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);
    const value = hashToUnit(
      cellX * 374761393 + cellY * 668265263 + seed
    );

    return value < threshold / 255;
  }

  if (mode === 'center') {
    const nx = (x - width / 2) / (width / 2);
    const ny = (y - height / 2) / (height / 2);
    const radius = 0.2 + (threshold / 255) * 0.8;

    return nx * nx + ny * ny <= radius * radius;
  }

  if (mode === 'borders') {
    const distance = Math.min(
      x,
      y,
      width - 1 - x,
      height - 1 - y
    );
    const maxDistance = Math.min(width, height) / 2;
    const borderSize = (threshold / 255) * maxDistance;

    return distance <= borderSize;
  }

  return true;
}

function getBrightness(
  r: number,
  g: number,
  b: number
) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function hashToUnit(value: number) {
  const hashed = Math.abs(Math.sin(value) * 43758.5453123);

  return hashed - Math.floor(hashed);
}

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(min, Math.min(max, value));
}
