export type HudFrameStyle =
  | 'scan-frame'
  | 'archive-frame'
  | 'targeting-frame'
  | 'panel-labels'
  | 'corrupted-ui'
  | 'minimal';

export type HudFrameOptions = {
  opacity: number;
  color: string;
  style: HudFrameStyle;
  showGrid: boolean;
  showLabels: boolean;
  showCornerMarks: boolean;
  safeArea: number;
};

export function applyHudFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: HudFrameOptions
) {
  const opacity = clamp(options.opacity, 0, 1);

  if (opacity <= 0) return;

  const safeArea = clamp(options.safeArea, 0, 20) / 100;

  const marginX = Math.round(width * safeArea);
  const marginY = Math.round(height * safeArea);

  const x = marginX;
  const y = marginY;
  const frameWidth = width - marginX * 2;
  const frameHeight = height - marginY * 2;

  ctx.save();

  ctx.globalAlpha = opacity;
  ctx.strokeStyle = options.color;
  ctx.fillStyle = options.color;
  ctx.lineWidth = Math.max(1, Math.round(width / 900));
  ctx.font = `${Math.max(9, Math.round(width / 120))}px 'Datatype', monospace`;
  ctx.textBaseline = 'top';

  if (options.showGrid) {
    drawGrid(ctx, x, y, frameWidth, frameHeight, options.style);
  }

  if (options.style === 'targeting-frame') {
    drawTargetingFrame(ctx, width, height, x, y, frameWidth, frameHeight);
  } else if (options.style === 'panel-labels') {
    drawPanelLabelsFrame(ctx, x, y, frameWidth, frameHeight);
  } else if (options.style === 'archive-frame') {
    drawArchiveFrame(ctx, x, y, frameWidth, frameHeight);
  } else if (options.style === 'corrupted-ui') {
    drawCorruptedFrame(ctx, x, y, frameWidth, frameHeight);
  } else if (options.style === 'minimal') {
    drawMinimalFrame(ctx, x, y, frameWidth, frameHeight);
  } else {
    drawScanFrame(ctx, x, y, frameWidth, frameHeight);
  }

  if (options.showCornerMarks) {
    drawCornerMarks(ctx, x, y, frameWidth, frameHeight);
  }

  if (options.showLabels) {
    drawLabels(ctx, width, height, x, y, frameWidth, frameHeight);
  }

  ctx.restore();
}

function drawScanFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  ctx.strokeRect(x, y, width, height);

  const tickCount = 18;
  const tickSize = Math.min(width, height) * 0.012;

  for (let i = 0; i <= tickCount; i++) {
    const tx = x + (width / tickCount) * i;

    ctx.beginPath();
    ctx.moveTo(tx, y);
    ctx.lineTo(tx, y + tickSize);
    ctx.moveTo(tx, y + height);
    ctx.lineTo(tx, y + height - tickSize);
    ctx.stroke();
  }

  for (let i = 0; i <= tickCount; i++) {
    const ty = y + (height / tickCount) * i;

    ctx.beginPath();
    ctx.moveTo(x, ty);
    ctx.lineTo(x + tickSize, ty);
    ctx.moveTo(x + width, ty);
    ctx.lineTo(x + width - tickSize, ty);
    ctx.stroke();
  }
}

function drawArchiveFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  ctx.strokeRect(x, y, width, height);

  const headerHeight = Math.max(24, height * 0.055);
  const footerHeight = Math.max(18, height * 0.035);

  ctx.strokeRect(x, y, width, headerHeight);
  ctx.strokeRect(x, y + height - footerHeight, width, footerHeight);

  const sideWidth = Math.max(28, width * 0.045);

  ctx.strokeRect(x, y, sideWidth, height);
  ctx.strokeRect(x + width - sideWidth, y, sideWidth, height);
}

function drawTargetingFrame(
  ctx: CanvasRenderingContext2D,
  fullWidth: number,
  fullHeight: number,
  x: number,
  y: number,
  width: number,
  height: number
) {
  drawMinimalFrame(ctx, x, y, width, height);

  const centerX = fullWidth / 2;
  const centerY = fullHeight / 2;

  const radius = Math.min(width, height) * 0.13;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(centerX - radius * 1.5, centerY);
  ctx.lineTo(centerX - radius * 0.45, centerY);
  ctx.moveTo(centerX + radius * 0.45, centerY);
  ctx.lineTo(centerX + radius * 1.5, centerY);
  ctx.moveTo(centerX, centerY - radius * 1.5);
  ctx.lineTo(centerX, centerY - radius * 0.45);
  ctx.moveTo(centerX, centerY + radius * 0.45);
  ctx.lineTo(centerX, centerY + radius * 1.5);
  ctx.stroke();
}

function drawCorruptedFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const segments = 22;

  for (let i = 0; i < segments; i++) {
    const start = i / segments;
    const end = start + 0.025 + (i % 3) * 0.015;

    const x1 = x + width * start;
    const x2 = x + width * Math.min(1, end);

    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.moveTo(x1, y + height);
    ctx.lineTo(x2, y + height);
    ctx.stroke();
  }

  for (let i = 0; i < segments; i++) {
    const start = i / segments;
    const end = start + 0.02 + (i % 4) * 0.012;

    const y1 = y + height * start;
    const y2 = y + height * Math.min(1, end);

    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.moveTo(x + width, y1);
    ctx.lineTo(x + width, y2);
    ctx.stroke();
  }
}

function drawMinimalFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  ctx.strokeRect(x, y, width, height);
}

function drawCornerMarks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const length = Math.min(width, height) * 0.08;

  ctx.beginPath();

  ctx.moveTo(x, y + length);
  ctx.lineTo(x, y);
  ctx.lineTo(x + length, y);

  ctx.moveTo(x + width - length, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y + length);

  ctx.moveTo(x, y + height - length);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x + length, y + height);

  ctx.moveTo(x + width - length, y + height);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x + width, y + height - length);

  ctx.stroke();
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  style: HudFrameStyle
) {
  const columns = style === 'archive-frame' ? 6 : 4;
  const rows = style === 'archive-frame' ? 4 : 3;

  ctx.save();
  ctx.globalAlpha *= 0.35;

  for (let i = 1; i < columns; i++) {
    const tx = x + (width / columns) * i;

    ctx.beginPath();
    ctx.moveTo(tx, y);
    ctx.lineTo(tx, y + height);
    ctx.stroke();
  }

  for (let i = 1; i < rows; i++) {
    const ty = y + (height / rows) * i;

    ctx.beginPath();
    ctx.moveTo(x, ty);
    ctx.lineTo(x + width, ty);
    ctx.stroke();
  }

  ctx.restore();
}

function drawLabels(
  ctx: CanvasRenderingContext2D,
  fullWidth: number,
  fullHeight: number,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const fontSize = Math.max(9, Math.round(fullWidth / 120));
  const pad = Math.max(8, fontSize);

  ctx.fillText(`SIZE ${fullWidth}×${fullHeight}`, x + pad, y + pad);
  ctx.fillText('SIGNAL: ACTIVE', x + width - pad * 15, y + pad);
  ctx.fillText('SCANLINE: LOCKED', x + pad, y + height - pad * 2);
  ctx.fillText('ENTROPY ENGINE', x + width - pad * 16, y + height - pad * 2);
}

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(min, Math.min(max, value));
}

function drawPanelLabelsFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  drawMinimalFrame(ctx, x, y, width, height);

  const labelWidth = Math.max(72, width * 0.16);
  const labelHeight = Math.max(16, height * 0.035);
  const pad = Math.max(8, labelHeight * 0.45);
  const labels = [
    { text: 'INPUT A', x: x + pad, y: y + pad },
    { text: 'FOCUS NODE', x: x + width - labelWidth - pad, y: y + pad },
    { text: 'SIGNAL BODY', x: x + pad, y: y + height - labelHeight - pad },
    {
      text: 'OUTPUT MONITOR',
      x: x + width - labelWidth - pad,
      y: y + height - labelHeight - pad
    }
  ];

  labels.forEach((label) => {
    ctx.strokeRect(label.x, label.y, labelWidth, labelHeight);
    ctx.fillText(label.text, label.x + pad * 0.5, label.y + pad * 0.28);
  });

  ctx.beginPath();
  ctx.moveTo(x + width * 0.5, y);
  ctx.lineTo(x + width * 0.5, y + height);
  ctx.moveTo(x, y + height * 0.5);
  ctx.lineTo(x + width, y + height * 0.5);
  ctx.stroke();
}
