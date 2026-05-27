type PixelSortDirection = 'horizontal' | 'vertical';
type PixelSortMode = 'bright' | 'dark' | 'all';

type PixelSortOptions = {
  direction: PixelSortDirection;
  threshold: number;
  amount: number;
  mode: PixelSortMode;
};

type Pixel = {
  r: number;
  g: number;
  b: number;
  a: number;
  brightness: number;
};

export function applyPixelSort(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: PixelSortOptions
) {
  const threshold = clamp(options.threshold, 0, 255);
  const amount = clamp(options.amount, 0, 1);

  if (amount <= 0) return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  if (options.direction === 'horizontal') {
    sortHorizontal(
      data,
      width,
      height,
      threshold,
      amount,
      options.mode
    );
  } else {
    sortVertical(
      data,
      width,
      height,
      threshold,
      amount,
      options.mode
    );
  }

  ctx.putImageData(imageData, 0, 0);
}

function sortHorizontal(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  threshold: number,
  amount: number,
  mode: PixelSortMode
) {
  for (let y = 0; y < height; y++) {
    let x = 0;

    while (x < width) {
      while (
        x < width &&
        !shouldSortPixel(
          getBrightnessAt(data, width, x, y),
          threshold,
          mode
        )
      ) {
        x++;
      }

      const start = x;

      while (
        x < width &&
        shouldSortPixel(
          getBrightnessAt(data, width, x, y),
          threshold,
          mode
        )
      ) {
        x++;
      }

      const end = x;

      if (end - start > 1) {
        sortSegmentHorizontal(
          data,
          width,
          y,
          start,
          end,
          amount
        );
      }
    }
  }
}

function sortVertical(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  threshold: number,
  amount: number,
  mode: PixelSortMode
) {
  for (let x = 0; x < width; x++) {
    let y = 0;

    while (y < height) {
      while (
        y < height &&
        !shouldSortPixel(
          getBrightnessAt(data, width, x, y),
          threshold,
          mode
        )
      ) {
        y++;
      }

      const start = y;

      while (
        y < height &&
        shouldSortPixel(
          getBrightnessAt(data, width, x, y),
          threshold,
          mode
        )
      ) {
        y++;
      }

      const end = y;

      if (end - start > 1) {
        sortSegmentVertical(
          data,
          width,
          x,
          start,
          end,
          amount
        );
      }
    }
  }
}

function sortSegmentHorizontal(
  data: Uint8ClampedArray,
  width: number,
  y: number,
  startX: number,
  endX: number,
  amount: number
) {
  const pixels: Pixel[] = [];

  for (let x = startX; x < endX; x++) {
    pixels.push(readPixel(data, width, x, y));
  }

  pixels.sort((a, b) => a.brightness - b.brightness);

  const sortedLength = Math.floor(pixels.length * amount);
  const offset = Math.floor((pixels.length - sortedLength) / 2);

  for (let i = 0; i < sortedLength; i++) {
    writePixel(
      data,
      width,
      startX + offset + i,
      y,
      pixels[offset + i]
    );
  }
}

function sortSegmentVertical(
  data: Uint8ClampedArray,
  width: number,
  x: number,
  startY: number,
  endY: number,
  amount: number
) {
  const pixels: Pixel[] = [];

  for (let y = startY; y < endY; y++) {
    pixels.push(readPixel(data, width, x, y));
  }

  pixels.sort((a, b) => a.brightness - b.brightness);

  const sortedLength = Math.floor(pixels.length * amount);
  const offset = Math.floor((pixels.length - sortedLength) / 2);

  for (let i = 0; i < sortedLength; i++) {
    writePixel(
      data,
      width,
      x,
      startY + offset + i,
      pixels[offset + i]
    );
  }
}

function shouldSortPixel(
  brightness: number,
  threshold: number,
  mode: PixelSortMode
) {
  if (mode === 'bright') {
    return brightness >= threshold;
  }

  if (mode === 'dark') {
    return brightness <= threshold;
  }

  return true;
}

function readPixel(
  data: Uint8ClampedArray,
  width: number,
  x: number,
  y: number
): Pixel {
  const i = (y * width + x) * 4;

  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const a = data[i + 3];

  return {
    r,
    g,
    b,
    a,
    brightness: getBrightness(r, g, b)
  };
}

function writePixel(
  data: Uint8ClampedArray,
  width: number,
  x: number,
  y: number,
  pixel: Pixel
) {
  const i = (y * width + x) * 4;

  data[i] = pixel.r;
  data[i + 1] = pixel.g;
  data[i + 2] = pixel.b;
  data[i + 3] = pixel.a;
}

function getBrightnessAt(
  data: Uint8ClampedArray,
  width: number,
  x: number,
  y: number
) {
  const i = (y * width + x) * 4;

  return getBrightness(
    data[i],
    data[i + 1],
    data[i + 2]
  );
}

function getBrightness(
  r: number,
  g: number,
  b: number
) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(min, Math.min(max, value));
}