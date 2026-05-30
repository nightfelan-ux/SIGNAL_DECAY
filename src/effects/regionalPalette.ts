import type { PanelLayoutMode } from './panelLayout';

export type RegionalPaletteMode =
  | 'vertical-split'
  | 'horizontal-split'
  | 'grid-2x2'
  | 'panel-layout-sync'
  | 'random-cells'
  | 'random-zones';

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
  randomZoneChaos?: number;
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

type RandomZoneBand = {
  yStart: number;
  yEnd: number;
  xStart: number;
  xEnd: number;
  zoneIndex: number;
};

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
    const sideHeight =
      (height - centerHeight - gap * 2) / 2;
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
    const rightWidth =
      width - leftWidth - centerWidth - gap * 2;
    const topHeight = Math.round(height * 0.28);
    const midHeight = Math.round(height * 0.34);
    const bottomHeight =
      height - topHeight - midHeight - gap * 2;

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

const createRandomZoneBands = (
  width: number,
  height: number,
  zoneCount: number,
  cellSize: number,
  chaos: number,
  seed: number
) => {
  const random = createRandom(seed);
  const chaosAmount = Math.max(0, Math.min(1, chaos / 100));
  const minBandHeight = Math.max(
    18,
    Math.round(cellSize * (0.85 - chaosAmount * 0.45))
  );
  const maxBandHeight = Math.max(
    minBandHeight + 1,
    Math.round(cellSize * (1.15 + chaosAmount * 1.2))
  );
  const bands: RandomZoneBand[] = [];

  let y = 0;

  while (y < height) {
    const bandHeight = Math.min(
      height - y,
      Math.round(minBandHeight + random() * (maxBandHeight - minBandHeight))
    );

    const baseSliceCount = Math.max(
      1,
      Math.round(width / Math.max(1, cellSize * (1.2 - chaosAmount * 0.55)))
    );

    const sliceCount = Math.max(
      1,
      Math.round(baseSliceCount + random() * (1 + chaosAmount * 3))
    );

    let x = 0;

    for (let i = 0; i < sliceCount; i++) {
      const remaining = width - x;
      const minSliceWidth = Math.max(
        24,
        Math.round(cellSize * (0.72 - chaosAmount * 0.35))
      );
      const sliceWidth =
        i === sliceCount - 1
          ? remaining
          : Math.min(
              remaining,
              Math.round(
                minSliceWidth +
                  random() *
                    cellSize *
                    (0.85 + chaosAmount * 2.1)
              )
            );

      const drift = Math.round(
        (random() - 0.5) * cellSize * chaosAmount
      );
      const bleed = Math.round(
        random() * cellSize * (0.2 + chaosAmount * 0.85)
      );

      bands.push({
        yStart: y,
        yEnd: y + bandHeight,
        xStart: Math.max(0, x + drift),
        xEnd: Math.min(width, x + sliceWidth + bleed),
        zoneIndex: Math.floor(random() * zoneCount)
      });

      x += sliceWidth;
      if (x >= width) break;
    }

    y += Math.max(1, bandHeight);
  }

  return bands;
};

const getRandomZoneIndex = (
  x: number,
  y: number,
  bands: RandomZoneBand[],
  fallbackZoneCount: number,
  seed: number
) => {
  for (let i = 0; i < bands.length; i++) {
    const band = bands[i];

    if (
      y >= band.yStart &&
      y < band.yEnd &&
      x >= band.xStart &&
      x < band.xEnd
    ) {
      return band.zoneIndex;
    }
  }

  const hash =
    x * 1597334677 +
    y * 3812015801 +
    seed * 958689;

  const value = Math.abs(Math.sin(hash) * 43758.5453123);

  return Math.floor((value - Math.floor(value)) * fallbackZoneCount);
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
  const randomZoneChaos = Math.max(
    0,
    Math.min(100, options.randomZoneChaos ?? 55)
  );

  const randomZoneBands =
    options.mode === 'random-zones'
      ? createRandomZoneBands(
          width,
          height,
          zonePalettes.length,
          randomCellSize,
          randomZoneChaos,
          randomSeed
        )
      : [];

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
          randomCellSize,
          zonePalettes.length,
          randomSeed
        );
      } else if (options.mode === 'random-zones') {
        zoneIndex = getRandomZoneIndex(
          x,
          y,
          randomZoneBands,
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
