import type { PanelLayoutMode } from './panelLayout';

export type RegionalPaletteMode =
  | 'vertical-split'
  | 'horizontal-split'
  | 'grid-2x2'
  | 'panel-layout-sync'
  | 'random-cells';

export type RegionalPaletteZone = {
  startColor: string;
  endColor: string;
  steps: number;
  invert: boolean;
};

export type RegionalPaletteOptions = {
  mode: RegionalPaletteMode;
  zones: RegionalPaletteZone[];
  panelLayoutMode?: PanelLayoutMode;
  panelLayoutGap?: number;
  randomizeZones?: boolean;
  randomCellSize?: number;
  randomSeed?: number;
};

type RgbColor = {
  r: number;
  g: number;
  b: number;
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type RandomGenerator = () => number;

const hexToRgb = (hex: string): RgbColor => {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16)
  };
};

const generatePalette = (
  start: string,
  end: string,
  count: number
): RgbColor[] => {
  const s = hexToRgb(start);
  const e = hexToRgb(end);

  return Array.from({ length: count }, (_, i) => {
    const ratio = count > 1 ? i / (count - 1) : 0;

    return {
      r: Math.round(s.r + (e.r - s.r) * ratio),
      g: Math.round(s.g + (e.g - s.g) * ratio),
      b: Math.round(s.b + (e.b - s.b) * ratio)
    };
  });
};

const getBrightness = (
  r: number,
  g: number,
  b: number
) => {
  return 0.299 * r + 0.587 * g + 0.114 * b;
};

const buildZonePalettes = (
  zones: RegionalPaletteZone[]
) => {
  return zones.map((zone) => {
    const start = zone.invert
      ? zone.endColor
      : zone.startColor;

    const end = zone.invert
      ? zone.startColor
      : zone.endColor;

    return generatePalette(
      start,
      end,
      Math.max(2, zone.steps)
    );
  });
};

const createRandom = (seed: number): RandomGenerator => {
  let value = seed >>> 0;

  return function random() {
    value += 0x6d2b79f5;

    let t = value;

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffleIndexes = (
  count: number,
  random: RandomGenerator
) => {
  const indexes = Array.from(
    { length: count },
    (_, index) => index
  );

  for (let i = indexes.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));

    const temp = indexes[i];
    indexes[i] = indexes[j];
    indexes[j] = temp;
  }

  return indexes;
};

const createPanelLayoutRects = (
  mode: PanelLayoutMode,
  width: number,
  height: number,
  gap: number
): Rect[] => {
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

  const topHeight = Math.round(height * 0.36);
  const bottomHeight = height - topHeight - gap;
  const bottomLeftWidth = Math.round(width * 0.58);
  const bottomRightWidth =
    width - bottomLeftWidth - gap;

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
};

const getVerticalSplitZoneIndex = (
  x: number,
  width: number
) => {
  return x < width / 2 ? 0 : 1;
};

const getHorizontalSplitZoneIndex = (
  y: number,
  height: number
) => {
  return y < height / 2 ? 0 : 1;
};

const getGridZoneIndex = (
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const column = x < width / 2 ? 0 : 1;
  const row = y < height / 2 ? 0 : 1;

  return row * 2 + column;
};

const getPanelSyncZoneIndex = (
  x: number,
  y: number,
  rects: Rect[]
) => {
  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i];

    if (
      x >= rect.x &&
      x < rect.x + rect.width &&
      y >= rect.y &&
      y < rect.y + rect.height
    ) {
      return i;
    }
  }

  return 0;
};

const getRandomCellZoneIndex = (
  x: number,
  y: number,
  width: number,
  cellSize: number,
  zoneCount: number,
  seed: number
) => {
  const cellX = Math.floor(x / cellSize);
  const cellY = Math.floor(y / cellSize);

  const hash =
    cellX * 374761393 +
    cellY * 668265263 +
    seed * 1442695041;

  const value = Math.abs(
    Math.sin(hash) * 43758.5453123
  );

  return Math.floor(
    (value - Math.floor(value)) * zoneCount
  );
};

export const applyRegionalPalette = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: RegionalPaletteOptions
) => {
  const zones =
    options.zones.length > 0
      ? options.zones
      : [
          {
            startColor: '#000000',
            endColor: '#00ff99',
            steps: 4,
            invert: false
          }
        ];

  const randomSeed = options.randomSeed ?? 123456;
  const random = createRandom(randomSeed);

  const zonePalettes = buildZonePalettes(zones);
  const zoneShuffle = options.randomizeZones
    ? shuffleIndexes(zonePalettes.length, random)
    : zonePalettes.map((_, index) => index);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const panelRects =
    options.mode === 'panel-layout-sync'
      ? createPanelLayoutRects(
          options.panelLayoutMode ?? 'side-panel',
          width,
          height,
          options.panelLayoutGap ?? 10
        )
      : [];

  const randomCellSize = Math.max(
    16,
    options.randomCellSize ?? 96
  );

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;

      const alpha = data[i + 3];
      if (alpha === 0) continue;

      let zoneIndex = 0;

      if (options.mode === 'vertical-split') {
        zoneIndex = getVerticalSplitZoneIndex(x, width);
      } else if (
        options.mode === 'horizontal-split'
      ) {
        zoneIndex = getHorizontalSplitZoneIndex(
          y,
          height
        );
      } else if (options.mode === 'grid-2x2') {
        zoneIndex = getGridZoneIndex(
          x,
          y,
          width,
          height
        );
      } else if (
        options.mode === 'panel-layout-sync'
      ) {
        zoneIndex = getPanelSyncZoneIndex(
          x,
          y,
          panelRects
        );
      } else if (options.mode === 'random-cells') {
        zoneIndex = getRandomCellZoneIndex(
          x,
          y,
          width,
          randomCellSize,
          zonePalettes.length,
          randomSeed
        );
      }

      const shuffledZoneIndex =
        zoneShuffle[zoneIndex % zoneShuffle.length];

      const palette =
        zonePalettes[
          shuffledZoneIndex % zonePalettes.length
        ];

      const brightness =
        getBrightness(
          data[i],
          data[i + 1],
          data[i + 2]
        ) / 255;

      const paletteIndex = Math.max(
        0,
        Math.min(
          palette.length - 1,
          Math.round(
            brightness * (palette.length - 1)
          )
        )
      );

      const color = palette[paletteIndex];

      data[i] = color.r;
      data[i + 1] = color.g;
      data[i + 2] = color.b;
    }
  }

  ctx.putImageData(imageData, 0, 0);
};