export type MachineViewMode =
  | 'tracking'
  | 'surveillance'
  | 'classifier';

export type MachineViewOptions = {
  mode: MachineViewMode;
  count: number;
  sensitivity: number;
  opacity: number;
  color: string;
  showLabels: boolean;
  seed: number;
};

type Detection = {
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
};

type Candidate = Detection & {
  row: number;
  column: number;
};

type RegionMetrics = {
  score: number;
  brightness: number;
};

type RandomGenerator = () => number;

const LABELS: Record<MachineViewMode, string[]> = {
  tracking: [
    'FOCUS AREA',
    'SUBJECT LOCK',
    'TRACKING ACTIVE',
    'MOTION VECTOR',
    'TARGET REGION'
  ],
  surveillance: [
    'UNDER CAMERA',
    'SURVEILLANCE',
    'RECORDED AREA',
    'OBSERVED BLOCK',
    'ARCHIVE SUBJECT'
  ],
  classifier: [
    'OBJECT CLASS',
    'FEATURE MATCH',
    'LUMA SAMPLE',
    'EDGE CANDIDATE',
    'UNKNOWN SUBJECT'
  ]
};

export function applyMachineView(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: MachineViewOptions
) {
  const count = clamp(Math.round(options.count), 1, 12);
  const sensitivity = clamp(options.sensitivity, 0, 1);
  const opacity = clamp(options.opacity, 0, 1);

  if (opacity <= 0) return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const detections = findDetections(
    imageData.data,
    width,
    height,
    count,
    sensitivity,
    options.seed
  );

  if (detections.length === 0) return;

  const random = createLocalRandom(options.seed);
  const fontSize = Math.max(9, Math.round(width / 80));
  const lineWidth = Math.max(1, Math.round(width / 720));

  ctx.save();

  ctx.globalAlpha = opacity;
  ctx.strokeStyle = options.color;
  ctx.fillStyle = options.color;
  ctx.lineWidth = lineWidth;
  ctx.font = `700 ${fontSize}px 'Datatype', monospace`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.shadowColor = options.color;
  ctx.shadowBlur = lineWidth * 3;

  detections.forEach((detection, index) => {
    drawDetectionBox(
      ctx,
      detection,
      index,
      width,
      height,
      options,
      random,
      fontSize
    );
  });

  ctx.restore();
}

function findDetections(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  count: number,
  sensitivity: number,
  seed: number
) {
  const columns = clamp(Math.round(width / 110), 4, 14);
  const rows = clamp(Math.round(height / 110), 4, 14);
  const cellWidth = width / columns;
  const cellHeight = height / rows;
  const candidates: Candidate[] = [];
  const threshold = 0.18 + (1 - sensitivity) * 0.2;
  const random = createLocalRandom(seed ^ 0x9e3779b9);

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const probeX = Math.round(column * cellWidth);
      const probeY = Math.round(row * cellHeight);
      const probeWidth = Math.round(cellWidth * 1.25);
      const probeHeight = Math.round(cellHeight * 1.25);
      const metrics = getRegionMetrics(
        data,
        width,
        height,
        probeX,
        probeY,
        probeWidth,
        probeHeight
      );

      if (metrics.score < threshold) continue;

      const scale = 0.72 + metrics.brightness * 1.18;
      const rectWidth = Math.round(
        cellWidth * scale * (0.72 + random() * 0.84)
      );
      const rectHeight = Math.round(
        cellHeight * scale * (0.72 + random() * 0.84)
      );
      const centerX =
        (column + 0.5 + (random() - 0.5) * 0.48) * cellWidth;
      const centerY =
        (row + 0.5 + (random() - 0.5) * 0.48) * cellHeight;
      const x = Math.round(
        clamp(centerX - rectWidth / 2, 0, width - rectWidth)
      );
      const y = Math.round(
        clamp(centerY - rectHeight / 2, 0, height - rectHeight)
      );

      candidates.push({
        x,
        y,
        width: Math.min(width - x, rectWidth),
        height: Math.min(height - y, rectHeight),
        score: metrics.score,
        row,
        column
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  const selected: Detection[] = [];

  selectCandidates(
    candidates.filter((candidate) => candidate.score >= threshold),
    selected,
    count
  );

  if (selected.length < count) {
    selectCandidates(candidates, selected, count);
  }

  if (selected.length === 0) {
    selected.push(
      createFallbackDetection(width, height, columns, rows)
    );
  }

  return selected;
}

function selectCandidates(
  candidates: Candidate[],
  selected: Detection[],
  count: number
) {
  candidates.forEach((candidate) => {
    if (selected.length >= count) return;

    const overlaps = selected.some((detection) =>
      getOverlapRatio(candidate, detection) > 0.12
    );

    if (!overlaps) {
      selected.push({
        x: candidate.x,
        y: candidate.y,
        width: candidate.width,
        height: candidate.height,
        score: candidate.score
      });
    }
  });
}

function createFallbackDetection(
  width: number,
  height: number,
  columns: number,
  rows: number
): Detection {
  const cellWidth = width / columns;
  const cellHeight = height / rows;
  const boxWidth = Math.round(cellWidth * 1.8);
  const boxHeight = Math.round(cellHeight * 1.8);

  return {
    x: Math.round((width - boxWidth) / 2),
    y: Math.round((height - boxHeight) / 2),
    width: boxWidth,
    height: boxHeight,
    score: 0.5
  };
}

function drawDetectionBox(
  ctx: CanvasRenderingContext2D,
  detection: Detection,
  index: number,
  width: number,
  height: number,
  options: MachineViewOptions,
  random: RandomGenerator,
  fontSize: number
) {
  const inset = Math.max(4, fontSize * 0.4);
  const headerHeight = Math.max(fontSize * 1.6, detection.height * 0.14);
  const label = createLabel(options.mode, index, detection.score, random);
  const textColor = '#050505';

  ctx.strokeRect(
    detection.x,
    detection.y,
    detection.width,
    detection.height
  );

  ctx.save();
  ctx.globalAlpha *= 0.92;
  ctx.fillRect(
    detection.x,
    detection.y,
    detection.width,
    headerHeight
  );
  ctx.restore();

  drawFittedText(
    ctx,
    label,
    detection.x + inset,
    detection.y,
    Math.max(1, detection.width - inset * 2),
    headerHeight,
    fontSize,
    textColor
  );

  drawCornerTicks(ctx, detection, inset * 1.5);

  if (!options.showLabels) return;

  const labelWidth = Math.min(
    width * 0.42,
    Math.max(fontSize * 8, ctx.measureText(label).width + inset * 2)
  );
  const labelHeight = fontSize * 1.7;
  const preferLeft = detection.x + detection.width / 2 > width / 2;
  const labelX = preferLeft
    ? clamp(detection.x - labelWidth - width * 0.05, 0, width - labelWidth)
    : clamp(
        detection.x + detection.width + width * 0.05,
        0,
        width - labelWidth
      );
  const labelY = clamp(
    detection.y + detection.height * (0.18 + random() * 0.55),
    0,
    height - labelHeight
  );
  const sourceX = preferLeft
    ? detection.x
    : detection.x + detection.width;
  const sourceY = detection.y + detection.height * 0.5;

  ctx.beginPath();
  ctx.moveTo(sourceX, sourceY);
  ctx.lineTo(labelX + (preferLeft ? labelWidth : 0), labelY + labelHeight / 2);
  ctx.stroke();

  ctx.save();
  ctx.globalAlpha *= 0.92;
  ctx.fillRect(labelX, labelY, labelWidth, labelHeight);
  ctx.restore();

  drawFittedText(
    ctx,
    label,
    labelX + inset,
    labelY,
    Math.max(1, labelWidth - inset * 2),
    labelHeight,
    fontSize,
    textColor
  );
}

function drawFittedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  height: number,
  fontSize: number,
  color: string
) {
  const family = "'Datatype', monospace";
  let currentSize = fontSize;
  let fittedText = text;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, maxWidth, height);
  ctx.clip();
  ctx.shadowBlur = 0;
  ctx.fillStyle = color;

  while (currentSize > 7) {
    ctx.font = `700 ${currentSize}px ${family}`;

    if (ctx.measureText(fittedText).width <= maxWidth) {
      break;
    }

    currentSize -= 1;
  }

  while (
    fittedText.length > 2 &&
    ctx.measureText(fittedText).width > maxWidth
  ) {
    fittedText = `${fittedText.slice(0, -3)}..`;
  }

  ctx.fillText(
    fittedText,
    x,
    y + Math.max(1, (height - currentSize) / 2)
  );
  ctx.restore();
}

function drawCornerTicks(
  ctx: CanvasRenderingContext2D,
  detection: Detection,
  length: number
) {
  const x = detection.x;
  const y = detection.y;
  const right = detection.x + detection.width;
  const bottom = detection.y + detection.height;

  ctx.beginPath();
  ctx.moveTo(x, y + length);
  ctx.lineTo(x, y);
  ctx.lineTo(x + length, y);
  ctx.moveTo(right - length, y);
  ctx.lineTo(right, y);
  ctx.lineTo(right, y + length);
  ctx.moveTo(x, bottom - length);
  ctx.lineTo(x, bottom);
  ctx.lineTo(x + length, bottom);
  ctx.moveTo(right - length, bottom);
  ctx.lineTo(right, bottom);
  ctx.lineTo(right, bottom - length);
  ctx.stroke();
}

function createLabel(
  mode: MachineViewMode,
  index: number,
  score: number,
  random: RandomGenerator
) {
  const base = pick(LABELS[mode], random);
  const confidence = Math.round(clamp(score, 0, 1) * 100)
    .toString()
    .padStart(2, '0');

  if (mode === 'classifier') {
    return `${base} ${confidence}%`;
  }

  return `${base} ${String(index + 1).padStart(2, '0')}`;
}

function getRegionMetrics(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  rectWidth: number,
  rectHeight: number
): RegionMetrics {
  const step = Math.max(3, Math.round(Math.min(rectWidth, rectHeight) / 8));
  let brightnessTotal = 0;
  let brightnessSquareTotal = 0;
  let highlightTotal = 0;
  let edgeTotal = 0;
  let count = 0;

  for (let yy = y; yy < y + rectHeight; yy += step) {
    for (let xx = x; xx < x + rectWidth; xx += step) {
      const sampleX = clamp(Math.round(xx), 1, width - 2);
      const sampleY = clamp(Math.round(yy), 1, height - 2);
      const brightness = getBrightnessAt(data, width, sampleX, sampleY);
      const luma = brightness / 255;
      const edge =
        Math.abs(
          getBrightnessAt(data, width, sampleX + 1, sampleY) -
            getBrightnessAt(data, width, sampleX - 1, sampleY)
        ) +
        Math.abs(
          getBrightnessAt(data, width, sampleX, sampleY + 1) -
            getBrightnessAt(data, width, sampleX, sampleY - 1)
        );

      brightnessTotal += luma;
      brightnessSquareTotal += luma * luma;
      highlightTotal += smoothstep(0.52, 1, luma);
      edgeTotal += edge / 510;
      count++;
    }
  }

  if (count === 0) {
    return {
      score: 0,
      brightness: 0
    };
  }

  const brightness = brightnessTotal / count;
  const contrast = Math.sqrt(
    Math.max(0, brightnessSquareTotal / count - brightness * brightness)
  );
  const highlights = highlightTotal / count;
  const edges = edgeTotal / count;

  return {
    score: clamp(
      highlights * 0.58 +
        brightness * 0.25 +
        edges * 0.12 +
        contrast * 0.05,
      0,
      1
    ),
    brightness
  };
}

function getBrightnessAt(
  data: Uint8ClampedArray,
  width: number,
  x: number,
  y: number
) {
  const i = (y * width + x) * 4;

  return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
}

function getOverlapRatio(a: Detection, b: Detection) {
  const xOverlap = Math.max(
    0,
    Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)
  );
  const yOverlap = Math.max(
    0,
    Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y)
  );
  const overlapArea = xOverlap * yOverlap;
  const smallerArea = Math.min(a.width * a.height, b.width * b.height);

  return smallerArea > 0 ? overlapArea / smallerArea : 0;
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

function smoothstep(
  min: number,
  max: number,
  value: number
) {
  const t = clamp((value - min) / (max - min), 0, 1);

  return t * t * (3 - 2 * t);
}

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(min, Math.min(max, value));
}
