export type SignalWavesMode =
  | 'horizontal'
  | 'vertical'
  | 'topographic'
  | 'radar';

export type SignalWavesOptions = {
  mode: SignalWavesMode;
  frequency: number;
  amplitude: number;
  density: number;
  opacity: number;
  color: string;
  backgroundColor: string;
  replaceImage: boolean;
  reactToImage: boolean;
};

export function applySignalWaves(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: SignalWavesOptions
) {
  const frequency = clamp(options.frequency, 1, 80);
  const amplitude = clamp(options.amplitude, 0, 120);
  const density = clamp(options.density, 4, 80);
  const opacity = clamp(options.opacity, 0, 1);

  if (opacity <= 0) return;

  const source = ctx.getImageData(0, 0, width, height);

  if (options.replaceImage) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.save();

  ctx.globalAlpha = opacity;
  ctx.strokeStyle = options.color;
  ctx.fillStyle = options.color;
  ctx.lineWidth = Math.max(1, Math.round(Math.min(width, height) / 900));

  if (options.mode === 'horizontal') {
    drawHorizontalWaves(
      ctx,
      source.data,
      width,
      height,
      frequency,
      amplitude,
      density,
      options.reactToImage
    );
  }

  if (options.mode === 'vertical') {
    drawVerticalWaves(
      ctx,
      source.data,
      width,
      height,
      frequency,
      amplitude,
      density,
      options.reactToImage
    );
  }

  if (options.mode === 'topographic') {
    drawTopographicLines(
      ctx,
      source.data,
      width,
      height,
      density,
      options.reactToImage
    );
  }

  if (options.mode === 'radar') {
    drawRadarLines(
      ctx,
      source.data,
      width,
      height,
      frequency,
      amplitude,
      density,
      options.reactToImage
    );
  }

  ctx.restore();
}

function drawHorizontalWaves(
  ctx: CanvasRenderingContext2D,
  data: Uint8ClampedArray,
  width: number,
  height: number,
  frequency: number,
  amplitude: number,
  density: number,
  reactToImage: boolean
) {
  const spacing = Math.max(4, density);

  for (let baseY = 0; baseY <= height; baseY += spacing) {
    ctx.beginPath();

    for (let x = 0; x <= width; x += 3) {
      const sampleX = clampInt(x, 0, width - 1);
      const sampleY = clampInt(baseY, 0, height - 1);

      const brightness = getBrightnessAt(
        data,
        width,
        sampleX,
        sampleY
      );

      const imageInfluence = reactToImage
        ? (brightness / 255 - 0.5) * amplitude
        : 0;

      const wave =
        Math.sin((x / width) * frequency * Math.PI * 2) *
        amplitude *
        0.35;

      const y = baseY + wave + imageInfluence;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  }
}

function drawVerticalWaves(
  ctx: CanvasRenderingContext2D,
  data: Uint8ClampedArray,
  width: number,
  height: number,
  frequency: number,
  amplitude: number,
  density: number,
  reactToImage: boolean
) {
  const spacing = Math.max(4, density);

  for (let baseX = 0; baseX <= width; baseX += spacing) {
    ctx.beginPath();

    for (let y = 0; y <= height; y += 3) {
      const sampleX = clampInt(baseX, 0, width - 1);
      const sampleY = clampInt(y, 0, height - 1);

      const brightness = getBrightnessAt(
        data,
        width,
        sampleX,
        sampleY
      );

      const imageInfluence = reactToImage
        ? (brightness / 255 - 0.5) * amplitude
        : 0;

      const wave =
        Math.sin((y / height) * frequency * Math.PI * 2) *
        amplitude *
        0.35;

      const x = baseX + wave + imageInfluence;

      if (y === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  }
}

function drawTopographicLines(
  ctx: CanvasRenderingContext2D,
  data: Uint8ClampedArray,
  width: number,
  height: number,
  density: number,
  reactToImage: boolean
) {
  const cellSize = Math.max(5, density);
  const levels = 9;

  for (let level = 1; level < levels; level++) {
    const target = (level / levels) * 255;

    ctx.beginPath();

    let started = false;

    for (let y = 0; y < height; y += cellSize) {
      for (let x = 0; x < width; x += cellSize) {
        const brightness = getBrightnessAt(
          data,
          width,
          clampInt(x, 0, width - 1),
          clampInt(y, 0, height - 1)
        );

        const distance = Math.abs(brightness - target);

        if (distance < 12 || !reactToImage) {
          const waveX =
            x +
            Math.sin((y + level * 40) * 0.025) *
              cellSize *
              0.8;

          const waveY =
            y +
            Math.cos((x + level * 50) * 0.02) *
              cellSize *
              0.6;

          if (!started) {
            ctx.moveTo(waveX, waveY);
            started = true;
          } else {
            ctx.lineTo(waveX, waveY);
          }
        }
      }
    }

    ctx.stroke();
  }
}

function drawRadarLines(
  ctx: CanvasRenderingContext2D,
  data: Uint8ClampedArray,
  width: number,
  height: number,
  frequency: number,
  amplitude: number,
  density: number,
  reactToImage: boolean
) {
  const centerX = width / 2;
  const centerY = height / 2;

  const maxRadius = Math.sqrt(
    centerX * centerX + centerY * centerY
  );

  const spacing = Math.max(8, density);

  for (let radius = spacing; radius < maxRadius; radius += spacing) {
    ctx.beginPath();

    for (let angle = 0; angle <= Math.PI * 2 + 0.05; angle += 0.035) {
      const rawX = centerX + Math.cos(angle) * radius;
      const rawY = centerY + Math.sin(angle) * radius;

      const sampleX = clampInt(Math.round(rawX), 0, width - 1);
      const sampleY = clampInt(Math.round(rawY), 0, height - 1);

      const brightness = getBrightnessAt(
        data,
        width,
        sampleX,
        sampleY
      );

      const imageInfluence = reactToImage
        ? (brightness / 255 - 0.5) * amplitude
        : 0;

      const ripple =
        Math.sin(angle * frequency + radius * 0.04) *
        amplitude *
        0.22;

      const finalRadius = radius + ripple + imageInfluence;

      const x = centerX + Math.cos(angle) * finalRadius;
      const y = centerY + Math.sin(angle) * finalRadius;

      if (angle === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  }
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

function clampInt(
  value: number,
  min: number,
  max: number
) {
  return Math.round(Math.max(min, Math.min(max, value)));
}