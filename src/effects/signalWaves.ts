export type SignalWavesMode =
  | 'horizontal'
  | 'vertical'
  | 'topographic'
  | 'contour'
  | 'contour-pulse'
  | 'depth-scan'
  | 'field-lines';

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
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = options.color;
  ctx.shadowBlur = Math.max(2, ctx.lineWidth * 3);

  switch (options.mode) {
    case 'horizontal':
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
      break;
    case 'vertical':
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
      break;
    case 'topographic':
      drawTopographicLines(
        ctx,
        source.data,
        width,
        height,
        frequency,
        density,
        options.reactToImage
      );
      break;
    case 'contour':
      drawContourFlowLines(
        ctx,
        source.data,
        width,
        height,
        frequency,
        amplitude,
        density,
        options.reactToImage
      );
      break;
    case 'contour-pulse':
      drawContourPulseLines(
        ctx,
        source.data,
        width,
        height,
        frequency,
        amplitude,
        density,
        options.reactToImage
      );
      break;
    case 'depth-scan':
      drawDepthScanLines(
        ctx,
        source.data,
        width,
        height,
        frequency,
        amplitude,
        density,
        options.reactToImage
      );
      break;
    case 'field-lines':
      drawFieldLines(
        ctx,
        source.data,
        width,
        height,
        frequency,
        amplitude,
        density,
        options.reactToImage
      );
      break;
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
  const sampleRadius = Math.max(2, Math.round(spacing * 0.55));

  for (let baseY = 0; baseY <= height; baseY += spacing) {
    ctx.beginPath();

    let smoothedY = baseY;

    for (let x = 0; x <= width; x += 2) {
      const sampleX = clampInt(x, 0, width - 1);
      const sampleY = clampInt(smoothedY, 0, height - 1);

      const brightness = getAverageBrightnessAt(
        data,
        width,
        height,
        sampleX,
        sampleY,
        sampleRadius
      );
      const verticalGradient = getAverageBrightnessAt(
        data,
        width,
        height,
        sampleX,
        clampInt(sampleY + sampleRadius, 0, height - 1),
        sampleRadius
      ) - getAverageBrightnessAt(
        data,
        width,
        height,
        sampleX,
        clampInt(sampleY - sampleRadius, 0, height - 1),
        sampleRadius
      );

      const imageInfluence = reactToImage
        ? (brightness / 255 - 0.5) * amplitude * 0.55 +
          (verticalGradient / 255) * amplitude * 1.8
        : 0;

      const wave =
        Math.sin((x / width) * frequency * Math.PI * 2) *
        amplitude *
        0.18;

      const targetY = baseY + wave + imageInfluence;
      smoothedY = lerp(smoothedY, targetY, reactToImage ? 0.38 : 1);

      if (x === 0) {
        ctx.moveTo(x, smoothedY);
      } else {
        ctx.lineTo(x, smoothedY);
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
  const sampleRadius = Math.max(2, Math.round(spacing * 0.55));

  for (let baseX = 0; baseX <= width; baseX += spacing) {
    ctx.beginPath();

    let smoothedX = baseX;

    for (let y = 0; y <= height; y += 2) {
      const sampleX = clampInt(smoothedX, 0, width - 1);
      const sampleY = clampInt(y, 0, height - 1);

      const brightness = getAverageBrightnessAt(
        data,
        width,
        height,
        sampleX,
        sampleY,
        sampleRadius
      );
      const horizontalGradient = getAverageBrightnessAt(
        data,
        width,
        height,
        clampInt(sampleX + sampleRadius, 0, width - 1),
        sampleY,
        sampleRadius
      ) - getAverageBrightnessAt(
        data,
        width,
        height,
        clampInt(sampleX - sampleRadius, 0, width - 1),
        sampleY,
        sampleRadius
      );

      const imageInfluence = reactToImage
        ? (brightness / 255 - 0.5) * amplitude * 0.55 +
          (horizontalGradient / 255) * amplitude * 1.8
        : 0;

      const wave =
        Math.sin((y / height) * frequency * Math.PI * 2) *
        amplitude *
        0.18;

      const targetX = baseX + wave + imageInfluence;
      smoothedX = lerp(smoothedX, targetX, reactToImage ? 0.38 : 1);

      if (y === 0) {
        ctx.moveTo(smoothedX, y);
      } else {
        ctx.lineTo(smoothedX, y);
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
  frequency: number,
  density: number,
  reactToImage: boolean
) {
  if (!reactToImage) {
    drawSyntheticTopographicLines(ctx, width, height, density);
    return;
  }

  const cellSize = Math.max(3, Math.round(density * 0.45));
  const levels = clampInt(
    Math.round(260 / density + frequency * 0.18),
    7,
    28
  );

  for (let level = 1; level < levels; level++) {
    const target = (level / levels) * 255;
    drawMarchingSquares(
      ctx,
      data,
      width,
      height,
      cellSize,
      target,
      reactToImage ? 1 : 0
    );
  }
}

function drawSyntheticTopographicLines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  density: number
) {
  const spacing = Math.max(5, density);

  for (let baseY = 0; baseY <= height; baseY += spacing) {
    ctx.beginPath();

    for (let x = 0; x <= width; x += 3) {
      const y =
        baseY +
        Math.sin(x * 0.018 + baseY * 0.04) * spacing * 0.55 +
        Math.cos(x * 0.041) * spacing * 0.18;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  }
}

function drawContourFlowLines(
  ctx: CanvasRenderingContext2D,
  data: Uint8ClampedArray,
  width: number,
  height: number,
  frequency: number,
  amplitude: number,
  density: number,
  reactToImage: boolean
) {
  const spacing = Math.max(4, Math.round(density * 0.55));
  const sampleRadius = Math.max(2, Math.round(spacing * 0.7));
  const lineCount = Math.ceil(height / spacing);

  for (let line = -1; line <= lineCount + 1; line++) {
    const baseY = line * spacing;

    ctx.beginPath();

    let started = false;
    let y = baseY;

    for (let x = 0; x <= width; x += 2) {
      const sampleX = clampInt(x, 0, width - 1);
      const sampleY = clampInt(y, 0, height - 1);
      const brightness = getAverageBrightnessAt(
        data,
        width,
        height,
        sampleX,
        sampleY,
        sampleRadius
      );
      const edgeStrength = getEdgeStrengthAt(
        data,
        width,
        height,
        sampleX,
        sampleY,
        sampleRadius
      );
      const silhouettePush = reactToImage
        ? (brightness / 255 - 0.5) * amplitude * 0.7 +
          edgeStrength * amplitude * 0.85
        : 0;
      const wave =
        Math.sin(
          (x / width) * frequency * Math.PI * 2 +
            line * 0.35
        ) *
        amplitude *
        0.12;

      y = lerp(
        y,
        baseY + silhouettePush + wave,
        reactToImage ? 0.42 : 1
      );

      if (y < -spacing || y > height + spacing) continue;

      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  }

  drawTopographicLines(
    ctx,
    data,
    width,
    height,
    frequency,
    density * 0.75,
    reactToImage
  );
}

function drawContourPulseLines(
  ctx: CanvasRenderingContext2D,
  data: Uint8ClampedArray,
  width: number,
  height: number,
  frequency: number,
  amplitude: number,
  density: number,
  reactToImage: boolean
) {
  if (!reactToImage) {
    drawContourFlowLines(
      ctx,
      data,
      width,
      height,
      frequency,
      amplitude,
      density,
      false
    );
    return;
  }

  const cellSize = Math.max(3, Math.round(density * 0.42));
  const centerLevel = 128;
  const pulseCount = clampInt(Math.round(frequency / 8), 3, 10);

  for (let pulse = -pulseCount; pulse <= pulseCount; pulse++) {
    const target = clamp(
      centerLevel + pulse * Math.max(8, amplitude * 0.18),
      12,
      244
    );

    drawMarchingSquares(
      ctx,
      data,
      width,
      height,
      cellSize,
      target,
      1.4
    );
  }
}

function drawDepthScanLines(
  ctx: CanvasRenderingContext2D,
  data: Uint8ClampedArray,
  width: number,
  height: number,
  frequency: number,
  amplitude: number,
  density: number,
  reactToImage: boolean
) {
  const spacing = Math.max(4, Math.round(density * 0.7));
  const sampleRadius = Math.max(2, Math.round(spacing * 0.8));

  for (let baseY = 0; baseY <= height; baseY += spacing) {
    ctx.beginPath();

    let y = baseY;

    for (let x = 0; x <= width; x += 2) {
      const brightness = getAverageBrightnessAt(
        data,
        width,
        height,
        clampInt(x, 0, width - 1),
        clampInt(y, 0, height - 1),
        sampleRadius
      );
      const depth = reactToImage
        ? Math.pow(brightness / 255, 1.35)
        : 0.5;
      const terrain =
        (depth - 0.5) * amplitude +
        Math.sin((x / width) * frequency * Math.PI * 2) *
          amplitude *
          0.08;

      y = lerp(y, baseY + terrain, reactToImage ? 0.32 : 1);

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  }
}

function drawFieldLines(
  ctx: CanvasRenderingContext2D,
  data: Uint8ClampedArray,
  width: number,
  height: number,
  frequency: number,
  amplitude: number,
  density: number,
  reactToImage: boolean
) {
  const spacing = Math.max(8, density);
  const stepSize = Math.max(2, density * 0.28);
  const maxSteps = clampInt(80 + frequency * 2, 90, 220);
  const sampleRadius = Math.max(2, Math.round(density * 0.45));

  for (let startY = spacing; startY < height; startY += spacing) {
    for (let startX = spacing; startX < width; startX += spacing) {
      if ((startX / spacing + startY / spacing) % 2 > 1) continue;

      ctx.beginPath();
      ctx.moveTo(startX, startY);

      let x = startX;
      let y = startY;

      for (let step = 0; step < maxSteps; step++) {
        const sampleX = clampInt(x, 0, width - 1);
        const sampleY = clampInt(y, 0, height - 1);
        const gradient = reactToImage
          ? getGradientAt(
              data,
              width,
              height,
              sampleX,
              sampleY,
              sampleRadius
            )
          : {
              x: Math.sin((y / height) * Math.PI * 2),
              y: Math.cos((x / width) * Math.PI * 2)
            };
        const strength = Math.max(
          0.18,
          Math.sqrt(
            gradient.x * gradient.x + gradient.y * gradient.y
          )
        );
        const tangentX = -gradient.y / strength;
        const tangentY = gradient.x / strength;
        const curl =
          Math.sin((x + y + step * frequency) * 0.012) *
          amplitude *
          0.006;

        x += (tangentX + curl) * stepSize;
        y += (tangentY - curl) * stepSize;

        if (x < 0 || x >= width || y < 0 || y >= height) break;

        ctx.lineTo(x, y);
      }

      ctx.stroke();
    }
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

function getAverageBrightnessAt(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  radius: number
) {
  let total = 0;
  let count = 0;
  const step = Math.max(1, Math.round(radius / 2));

  for (let yy = y - radius; yy <= y + radius; yy += step) {
    for (let xx = x - radius; xx <= x + radius; xx += step) {
      total += getBrightnessAt(
        data,
        width,
        clampInt(xx, 0, width - 1),
        clampInt(yy, 0, height - 1)
      );
      count++;
    }
  }

  return count > 0 ? total / count : 0;
}

function getEdgeStrengthAt(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  radius: number
) {
  const left = getAverageBrightnessAt(
    data,
    width,
    height,
    clampInt(x - radius, 0, width - 1),
    y,
    radius
  );
  const right = getAverageBrightnessAt(
    data,
    width,
    height,
    clampInt(x + radius, 0, width - 1),
    y,
    radius
  );
  const top = getAverageBrightnessAt(
    data,
    width,
    height,
    x,
    clampInt(y - radius, 0, height - 1),
    radius
  );
  const bottom = getAverageBrightnessAt(
    data,
    width,
    height,
    x,
    clampInt(y + radius, 0, height - 1),
    radius
  );

  return clamp(
    (Math.abs(right - left) + Math.abs(bottom - top)) / 255,
    0,
    1
  );
}

function getGradientAt(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  radius: number
) {
  const left = getAverageBrightnessAt(
    data,
    width,
    height,
    clampInt(x - radius, 0, width - 1),
    y,
    radius
  );
  const right = getAverageBrightnessAt(
    data,
    width,
    height,
    clampInt(x + radius, 0, width - 1),
    y,
    radius
  );
  const top = getAverageBrightnessAt(
    data,
    width,
    height,
    x,
    clampInt(y - radius, 0, height - 1),
    radius
  );
  const bottom = getAverageBrightnessAt(
    data,
    width,
    height,
    x,
    clampInt(y + radius, 0, height - 1),
    radius
  );

  return {
    x: (right - left) / 255,
    y: (bottom - top) / 255
  };
}

function drawMarchingSquares(
  ctx: CanvasRenderingContext2D,
  data: Uint8ClampedArray,
  width: number,
  height: number,
  cellSize: number,
  target: number,
  wobble: number
) {
  const sampleRadius = Math.max(1, Math.round(cellSize * 0.75));

  for (let y = 0; y < height - cellSize; y += cellSize) {
    for (let x = 0; x < width - cellSize; x += cellSize) {
      const topLeft = getAverageBrightnessAt(
        data,
        width,
        height,
        x,
        y,
        sampleRadius
      );
      const topRight = getAverageBrightnessAt(
        data,
        width,
        height,
        x + cellSize,
        y,
        sampleRadius
      );
      const bottomRight = getAverageBrightnessAt(
        data,
        width,
        height,
        x + cellSize,
        y + cellSize,
        sampleRadius
      );
      const bottomLeft = getAverageBrightnessAt(
        data,
        width,
        height,
        x,
        y + cellSize,
        sampleRadius
      );
      const points: Array<{ x: number; y: number }> = [];

      addCrossing(
        points,
        topLeft,
        topRight,
        target,
        x,
        y,
        x + cellSize,
        y,
        wobble
      );
      addCrossing(
        points,
        topRight,
        bottomRight,
        target,
        x + cellSize,
        y,
        x + cellSize,
        y + cellSize,
        wobble
      );
      addCrossing(
        points,
        bottomRight,
        bottomLeft,
        target,
        x + cellSize,
        y + cellSize,
        x,
        y + cellSize,
        wobble
      );
      addCrossing(
        points,
        bottomLeft,
        topLeft,
        target,
        x,
        y + cellSize,
        x,
        y,
        wobble
      );

      if (points.length === 2) {
        strokeSegment(ctx, points[0], points[1]);
      } else if (points.length === 4) {
        strokeSegment(ctx, points[0], points[1]);
        strokeSegment(ctx, points[2], points[3]);
      }
    }
  }
}

function addCrossing(
  points: Array<{ x: number; y: number }>,
  a: number,
  b: number,
  target: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  wobble: number
) {
  const crosses =
    (a <= target && b > target) ||
    (a > target && b <= target);

  if (!crosses) return;

  const ratio = clamp((target - a) / (b - a || 1), 0, 1);
  const wave =
    Math.sin((x1 + x2 + y1 + y2 + target) * 0.025) *
    wobble *
    1.8;

  points.push({
    x: lerp(x1, x2, ratio) + wave,
    y: lerp(y1, y2, ratio) - wave * 0.5
  });
}

function strokeSegment(
  ctx: CanvasRenderingContext2D,
  start: { x: number; y: number },
  end: { x: number; y: number }
) {
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
}

function lerp(
  from: number,
  to: number,
  amount: number
) {
  return from + (to - from) * amount;
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
