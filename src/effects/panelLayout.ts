export type PanelLayoutMode =
  | 'side-panel'
  | 'grid-2x2'
  | 'vertical-strips'
  | 'diagnostic-wall'
  | 'split-scan'
  | 'film-strip'
  | 'contact-sheet'
  | 'center-diagnostics'
  | 'cross-layout'
  | 'broken-archive-wall';

export type PanelLayoutOptions = {
  mode: PanelLayoutMode;
  gap: number;
  borderWidth: number;
  borderColor: string;
  backgroundColor: string;
  panelOpacity: number;
  randomCrop: boolean;
  cropIntensity: number;
  panX?: number;
  panY?: number;
  mirrorAlternate: boolean;
  seed?: number;
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type RandomGenerator = () => number;

export function applyPanelLayout(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: PanelLayoutOptions
) {
  const gap = clamp(options.gap, 0, 80);
  const borderWidth = clamp(options.borderWidth, 0, 20);
  const panelOpacity = clamp(options.panelOpacity, 0, 1);
  const cropIntensity = clamp(options.cropIntensity, 0, 100);

  if (panelOpacity <= 0) return;

  const sourceCanvas = document.createElement('canvas');
  const sourceCtx = sourceCanvas.getContext('2d');

  if (!sourceCtx) return;

  sourceCanvas.width = width;
  sourceCanvas.height = height;
  sourceCtx.drawImage(ctx.canvas, 0, 0);

  const random = createLocalRandom(options.seed ?? 123456);

  const panels = createPanels(
    options.mode,
    width,
    height,
    gap
  );

  ctx.save();

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = options.backgroundColor;
  ctx.fillRect(0, 0, width, height);

  panels.forEach((panel, index) => {
    const sourceRect = createSourceRect({
      panel,
      canvasWidth: width,
      canvasHeight: height,
      random,
      randomCrop: options.randomCrop,
      cropIntensity,
      panX: options.panX ?? 0,
      panY: options.panY ?? 0
    });

    ctx.save();

    ctx.globalAlpha = panelOpacity;

    ctx.beginPath();
    ctx.rect(panel.x, panel.y, panel.width, panel.height);
    ctx.clip();

    if (options.mirrorAlternate && index % 2 === 1) {
      ctx.translate(panel.x + panel.width, panel.y);
      ctx.scale(-1, 1);

      ctx.drawImage(
        sourceCanvas,
        sourceRect.x,
        sourceRect.y,
        sourceRect.width,
        sourceRect.height,
        0,
        0,
        panel.width,
        panel.height
      );
    } else {
      ctx.drawImage(
        sourceCanvas,
        sourceRect.x,
        sourceRect.y,
        sourceRect.width,
        sourceRect.height,
        panel.x,
        panel.y,
        panel.width,
        panel.height
      );
    }

    ctx.restore();

    if (borderWidth > 0) {
      ctx.strokeStyle = options.borderColor;
      ctx.lineWidth = borderWidth;
      ctx.strokeRect(
        panel.x + borderWidth / 2,
        panel.y + borderWidth / 2,
        panel.width - borderWidth,
        panel.height - borderWidth
      );
    }

    drawPanelMarks(
      ctx,
      panel,
      index,
      options.borderColor,
      borderWidth
    );
  });

  ctx.restore();
}

function createPanels(
  mode: PanelLayoutMode,
  width: number,
  height: number,
  gap: number
): Rect[] {
  if (mode === 'side-panel') {
    const sideWidth = Math.round(width * 0.28);
    const mainWidth = width - sideWidth - gap;
    const sidePanelHeight = (height - gap * 2) / 3;

    return [
      {
        x: 0,
        y: 0,
        width: mainWidth,
        height
      },
      {
        x: mainWidth + gap,
        y: 0,
        width: sideWidth,
        height: sidePanelHeight
      },
      {
        x: mainWidth + gap,
        y: sidePanelHeight + gap,
        width: sideWidth,
        height: sidePanelHeight
      },
      {
        x: mainWidth + gap,
        y: (sidePanelHeight + gap) * 2,
        width: sideWidth,
        height: sidePanelHeight
      }
    ];
  }

  if (mode === 'grid-2x2') {
    const cellWidth = (width - gap) / 2;
    const cellHeight = (height - gap) / 2;

    return [
      {
        x: 0,
        y: 0,
        width: cellWidth,
        height: cellHeight
      },
      {
        x: cellWidth + gap,
        y: 0,
        width: cellWidth,
        height: cellHeight
      },
      {
        x: 0,
        y: cellHeight + gap,
        width: cellWidth,
        height: cellHeight
      },
      {
        x: cellWidth + gap,
        y: cellHeight + gap,
        width: cellWidth,
        height: cellHeight
      }
    ];
  }

  if (mode === 'vertical-strips') {
    const count = 5;
    const stripWidth = (width - gap * (count - 1)) / count;

    return Array.from({ length: count }, (_, index) => ({
      x: index * (stripWidth + gap),
      y: 0,
      width: stripWidth,
      height
    }));
  }

  if (mode === 'diagnostic-wall') {
    const columns = 3;
    const rows = 3;
    const cellWidth = (width - gap * (columns - 1)) / columns;
    const cellHeight = (height - gap * (rows - 1)) / rows;

    return Array.from({ length: columns * rows }, (_, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);

      return {
        x: column * (cellWidth + gap),
        y: row * (cellHeight + gap),
        width: cellWidth,
        height: cellHeight
      };
    });
  }

  if (mode === 'film-strip') {
    const count = 5;
    const railHeight = Math.round(height * 0.14);
    const panelHeight = height - railHeight * 2;
    const panelWidth = (width - gap * (count - 1)) / count;

    return Array.from({ length: count }, (_, index) => ({
      x: index * (panelWidth + gap),
      y: railHeight,
      width: panelWidth,
      height: panelHeight
    }));
  }

  if (mode === 'contact-sheet') {
    const columns = 4;
    const rows = 3;
    const cellWidth =
      (width - gap * (columns - 1)) / columns;
    const cellHeight =
      (height - gap * (rows - 1)) / rows;

    return Array.from(
      { length: columns * rows },
      (_, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);

        return {
          x: column * (cellWidth + gap),
          y: row * (cellHeight + gap),
          width: cellWidth,
          height: cellHeight
        };
      }
    );
  }

  if (mode === 'center-diagnostics') {
    const sideWidth = Math.round(width * 0.22);
    const centerWidth = width - sideWidth * 2 - gap * 2;
    const smallHeight = (height - gap * 3) / 4;

    return [
      {
        x: sideWidth + gap,
        y: 0,
        width: centerWidth,
        height
      },
      ...Array.from({ length: 4 }, (_, index) => ({
        x: 0,
        y: index * (smallHeight + gap),
        width: sideWidth,
        height: smallHeight
      })),
      ...Array.from({ length: 4 }, (_, index) => ({
        x: sideWidth + gap + centerWidth + gap,
        y: index * (smallHeight + gap),
        width: sideWidth,
        height: smallHeight
      }))
    ];
  }

  if (mode === 'cross-layout') {
    const centerWidth = Math.round(width * 0.46);
    const centerHeight = Math.round(height * 0.46);
    const sideWidth = (width - centerWidth - gap * 2) / 2;
    const sideHeight = (height - centerHeight - gap * 2) / 2;
    const centerX = sideWidth + gap;
    const centerY = sideHeight + gap;

    return [
      {
        x: centerX,
        y: centerY,
        width: centerWidth,
        height: centerHeight
      },
      {
        x: centerX,
        y: 0,
        width: centerWidth,
        height: sideHeight
      },
      {
        x: centerX,
        y: centerY + centerHeight + gap,
        width: centerWidth,
        height: sideHeight
      },
      {
        x: 0,
        y: centerY,
        width: sideWidth,
        height: centerHeight
      },
      {
        x: centerX + centerWidth + gap,
        y: centerY,
        width: sideWidth,
        height: centerHeight
      }
    ];
  }

  if (mode === 'broken-archive-wall') {
    const leftWidth = Math.round(width * 0.32);
    const centerWidth = Math.round(width * 0.38);
    const rightWidth = width - leftWidth - centerWidth - gap * 2;
    const topHeight = Math.round(height * 0.28);
    const midHeight = Math.round(height * 0.34);
    const bottomHeight = height - topHeight - midHeight - gap * 2;

    return [
      {
        x: 0,
        y: 0,
        width: leftWidth,
        height: topHeight + midHeight + gap
      },
      {
        x: leftWidth + gap,
        y: 0,
        width: centerWidth,
        height: topHeight
      },
      {
        x: leftWidth + gap + centerWidth + gap,
        y: 0,
        width: rightWidth,
        height: topHeight + bottomHeight + gap
      },
      {
        x: leftWidth + gap,
        y: topHeight + gap,
        width: centerWidth,
        height: midHeight
      },
      {
        x: 0,
        y: topHeight + midHeight + gap * 2,
        width: leftWidth + centerWidth + gap,
        height: bottomHeight
      },
      {
        x: leftWidth + gap + centerWidth + gap,
        y: topHeight + bottomHeight + gap * 2,
        width: rightWidth,
        height: midHeight
      }
    ];
  }

  const topHeight = Math.round(height * 0.36);
  const bottomHeight = height - topHeight - gap;
  const bottomLeftWidth = Math.round(width * 0.58);
  const bottomRightWidth = width - bottomLeftWidth - gap;

  return [
    {
      x: 0,
      y: 0,
      width,
      height: topHeight
    },
    {
      x: 0,
      y: topHeight + gap,
      width: bottomLeftWidth,
      height: bottomHeight
    },
    {
      x: bottomLeftWidth + gap,
      y: topHeight + gap,
      width: bottomRightWidth,
      height: bottomHeight
    }
  ];
}

function createSourceRect({
  panel,
  canvasWidth,
  canvasHeight,
  random,
  randomCrop,
  cropIntensity,
  panX,
  panY
}: {
  panel: Rect;
  canvasWidth: number;
  canvasHeight: number;
  random: RandomGenerator;
  randomCrop: boolean;
  cropIntensity: number;
  panX: number;
  panY: number;
}): Rect {
  const panelRatio = panel.width / panel.height;
  const canvasRatio = canvasWidth / canvasHeight;

  let sourceWidth = canvasWidth;
  let sourceHeight = canvasHeight;

  if (panelRatio > canvasRatio) {
    sourceHeight = canvasWidth / panelRatio;
  } else {
    sourceWidth = canvasHeight * panelRatio;
  }

  const cropZoom = randomCrop
    ? 1 + (cropIntensity / 100) * 1.4
    : 1;

  sourceWidth = Math.max(1, sourceWidth / cropZoom);
  sourceHeight = Math.max(1, sourceHeight / cropZoom);

  const maxX = Math.max(0, canvasWidth - sourceWidth);
  const maxY = Math.max(0, canvasHeight - sourceHeight);

  const centeredX = maxX / 2;
  const centeredY = maxY / 2;

  const randomX = random() * maxX;
  const randomY = random() * maxY;

  const mix = randomCrop ? cropIntensity / 100 : 0;
  const baseX = centeredX * (1 - mix) + randomX * mix;
  const baseY = centeredY * (1 - mix) + randomY * mix;
  const offsetX = (clamp(panX, -100, 100) / 100) * maxX;
  const offsetY = (clamp(panY, -100, 100) / 100) * maxY;

  return {
    x: clamp(baseX + offsetX, 0, maxX),
    y: clamp(baseY + offsetY, 0, maxY),
    width: sourceWidth,
    height: sourceHeight
  };
}

function drawPanelMarks(
  ctx: CanvasRenderingContext2D,
  panel: Rect,
  index: number,
  color: string,
  borderWidth: number
) {
  if (borderWidth <= 0) return;

  const markLength = Math.min(
    26,
    Math.max(10, Math.min(panel.width, panel.height) * 0.08)
  );

  const inset = borderWidth + 5;

  ctx.save();

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1, borderWidth);
  ctx.globalAlpha *= 0.8;

  ctx.beginPath();

  ctx.moveTo(panel.x + inset, panel.y + inset + markLength);
  ctx.lineTo(panel.x + inset, panel.y + inset);
  ctx.lineTo(panel.x + inset + markLength, panel.y + inset);

  ctx.moveTo(
    panel.x + panel.width - inset - markLength,
    panel.y + panel.height - inset
  );
  ctx.lineTo(
    panel.x + panel.width - inset,
    panel.y + panel.height - inset
  );
  ctx.lineTo(
    panel.x + panel.width - inset,
    panel.y + panel.height - inset - markLength
  );

  ctx.stroke();

  ctx.font = `${Math.max(8, Math.round(panel.width / 24))}px 'Datatype', monospace`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';

  ctx.fillText(
    `PANEL_${String(index + 1).padStart(2, '0')}`,
    panel.x + inset + 4,
    panel.y + inset + 4
  );

  ctx.restore();
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

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(min, Math.min(max, value));
}
