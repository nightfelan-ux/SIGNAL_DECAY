import { applyAscii } from './effects/ascii';
import { applyArtifactMask } from './effects/artifactMask';
import { applyChannelPacketLoss } from './effects/channelPacketLoss';
import { applyChromatic } from './effects/chromatic';
import { applyCodecDamage } from './effects/codecDamage';
import { applyDataOverlay } from './effects/dataOverlay';
import { applyDithering } from './effects/dither';
import { applyFrameEcho } from './effects/frameEcho';
import { applyHudFrame } from './effects/hudFrame';
import { applyNoise } from './effects/noise';
import { applyPanelLayout } from './effects/panelLayout';
import { applyPosterText } from './effects/posterText';
import { applyPatternDither } from './effects/patternDither';
import { applyPixelSort } from './effects/pixelSort';
import { applyPsx } from './effects/psx';
import { applyRegionalPalette } from './effects/regionalPalette';
import { applyScanlines } from './effects/scanlines';
import { applySignalWaves } from './effects/signalWaves';
import { applyMotionSmear } from './effects/motionSmear';
import type { EffectValues } from './effectTypes';
import {
  createSeededRandom,
  deriveSeed
} from './utils/random';

type RgbColor = {
  r: number;
  g: number;
  b: number;
};

type RandomGenerator = () => number;

type GlitchStrip = {
  active: boolean;
  widthPct: number;
  leftPct: number;
};

export type ProcessImageOptions = {
  canvas: HTMLCanvasElement;
  tempCanvas: HTMLCanvasElement | null;
  setTempCanvas: (canvas: HTMLCanvasElement) => void;
  originalImage: HTMLImageElement;
  showOriginal: boolean;
  activeSeed: number;
  values: EffectValues;
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

const applyPaletteByBrightness = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: RgbColor[]
) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const lastIndex = palette.length - 1;

  for (let i = 0; i < data.length; i += 4) {
    const brightness =
      getBrightness(data[i], data[i + 1], data[i + 2]) / 255;

    const paletteIndex = Math.max(
      0,
      Math.min(
        lastIndex,
        Math.round(brightness * lastIndex)
      )
    );

    const color = palette[paletteIndex];

    data[i] = color.r;
    data[i + 1] = color.g;
    data[i + 2] = color.b;
  }

  ctx.putImageData(imageData, 0, 0);
};

const calcStrips = (
  chaosLevel: number,
  widthSetting: number,
  random: RandomGenerator
): GlitchStrip[] => {
  return Array.from({ length: 30 }, () => {
    const active =
      chaosLevel === 0
        ? true
        : random() * 100 < chaosLevel;

    const widthPct =
      widthSetting === 100
        ? 1
        : 0.3 + random() * (widthSetting / 100 - 0.1);

    const maxLeft = 1 - widthPct;

    const leftPct =
      widthSetting === 100 ? 0 : random() * maxLeft;

    return {
      active,
      widthPct: Math.min(1, Math.max(0.1, widthPct)),
      leftPct
    };
  });
};

export function processImage({
  canvas,
  tempCanvas,
  setTempCanvas,
  originalImage,
  showOriginal,
  activeSeed,
  values
}: ProcessImageOptions) {
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  const width = originalImage.width;
  const height = originalImage.height;

  canvas.width = width;
  canvas.height = height;

  ctx.imageSmoothingEnabled = false;

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(originalImage, 0, 0, width, height);

  if (showOriginal) return;

  if (values.usePixelation && values.pixelSize > 1) {
    const smallWidth = Math.max(
      1,
      Math.floor(width / values.pixelSize)
    );
    const smallHeight = Math.max(
      1,
      Math.floor(height / values.pixelSize)
    );

    let workingCanvas = tempCanvas;

    if (!workingCanvas) {
      workingCanvas = document.createElement('canvas');
      setTempCanvas(workingCanvas);
    }

    const tempCtx = workingCanvas.getContext('2d');

    if (tempCtx) {
      workingCanvas.width = smallWidth;
      workingCanvas.height = smallHeight;

      tempCtx.imageSmoothingEnabled = false;
      ctx.imageSmoothingEnabled = false;

      tempCtx.drawImage(canvas, 0, 0, smallWidth, smallHeight);

      ctx.clearRect(0, 0, width, height);

      ctx.drawImage(
        workingCanvas,
        0,
        0,
        smallWidth,
        smallHeight,
        0,
        0,
        width,
        height
      );
    }
  }

  if (values.usePsx) {
    applyPsx(ctx, width, height, {
      resolutionScale: values.psxResolutionScale,
      colorLevels: values.psxColorLevels,
      warpAmount: values.psxWarpAmount,
      jitterAmount: values.psxJitterAmount,
      ditherStrength: values.psxDitherStrength,
      blockSize: values.psxBlockSize,
      compositeBlur: values.psxCompositeBlur,
      chromaBleed: values.psxChromaBleed,
      random: createSeededRandom(activeSeed, 'psx')
    });
  }

  if (values.usePixelSort) {
    const beforePixelSort = values.useArtifactMask
      ? ctx.getImageData(0, 0, width, height)
      : null;

    applyPixelSort(ctx, width, height, {
      direction: values.pixelSortDirection,
      mode: values.pixelSortMode,
      threshold: values.pixelSortThreshold,
      amount: values.pixelSortAmount
    });

    if (beforePixelSort) {
      applyArtifactMask(ctx, width, height, {
        mode: values.artifactMaskMode,
        threshold: values.artifactMaskThreshold,
        seed: deriveSeed(activeSeed, 'artifact-mask-pixel-sort'),
        source: beforePixelSort
      });
    }
  }

  const prePaletteCopy = ctx.getImageData(0, 0, width, height);

  const palette = values.usePalette
    ? generatePalette(
        values.swapPaletteColors
          ? values.colorEnd
          : values.colorStart,
        values.swapPaletteColors
          ? values.colorStart
          : values.colorEnd,
        values.steps
      )
    : [
        { r: 0, g: 0, b: 0 },
        { r: 255, g: 255, b: 255 }
      ];

  if (values.useRegionalPalette) {
    applyRegionalPalette(ctx, width, height, {
      mode: values.regionalPaletteMode,
      zones: values.regionalPaletteZones,
      panelLayoutMode: values.panelLayoutMode,
      panelLayoutGap: values.panelLayoutGap,
      randomizeZones: values.regionalPaletteRandomizeZones,
      randomCellSize: values.regionalPaletteRandomCellSize,
      randomZoneChaos: values.regionalPaletteZoneChaos,
      randomSeed: deriveSeed(
        activeSeed,
        `regional-palette-${values.regionalPaletteZoneSeed}`
      )
    });
  } else {
    if (values.usePalette && !values.useDither) {
      applyPaletteByBrightness(
        ctx,
        width,
        height,
        palette
      );
    }

    if (values.useDither) {
      applyDithering(
        ctx,
        width,
        height,
        values.threshold,
        palette,
        values.ditherMode
      );
    }
  }

  const processedCopy = ctx.getImageData(0, 0, width, height);
  const beforeDistortionCopy = values.useArtifactMask
    ? ctx.getImageData(0, 0, width, height)
    : null;

  if (values.useGlitch && values.glitch > 0) {
    const glitchRandom = createSeededRandom(activeSeed, 'glitch');
    const target = ctx.getImageData(0, 0, width, height);

    const source = values.glitchOverrideDither
      ? prePaletteCopy
      : processedCopy;

    const strips = calcStrips(
      values.glitchChaos,
      values.glitchWidth,
      glitchRandom
    );

    const stripHeight = Math.max(
      1,
      Math.floor(height / strips.length)
    );

    for (let s = 0; s < strips.length; s++) {
      const strip = strips[s];

      if (!strip.active) continue;

      const yStart = s * stripHeight;
      const yEnd = Math.min(height, yStart + stripHeight);

      const xStart = Math.floor(strip.leftPct * width);
      const xWidth = Math.floor(strip.widthPct * width);
      const xEnd = Math.min(width, xStart + xWidth);

      const shift = Math.round(
        (glitchRandom() - 0.5) * values.glitch * 8
      );

      for (let y = yStart; y < yEnd; y++) {
        for (let x = xStart; x < xEnd; x++) {
          const srcX = Math.max(
            0,
            Math.min(width - 1, x + shift)
          );

          const targetIndex = (y * width + x) * 4;
          const sourceIndex = (y * width + srcX) * 4;

          let shouldAffect = true;

          if (values.edgeGlitchOnly) {
            const currentBrightness = getBrightness(
              processedCopy.data[targetIndex],
              processedCopy.data[targetIndex + 1],
              processedCopy.data[targetIndex + 2]
            );

            const compareX = Math.max(
              0,
              Math.min(width - 1, x + 1)
            );

            const compareIndex = (y * width + compareX) * 4;

            const compareBrightness = getBrightness(
              processedCopy.data[compareIndex],
              processedCopy.data[compareIndex + 1],
              processedCopy.data[compareIndex + 2]
            );

            shouldAffect =
              Math.abs(currentBrightness - compareBrightness) > 18;
          }

          if (!shouldAffect) continue;

          target.data[targetIndex] = source.data[sourceIndex];

          target.data[targetIndex + 1] = values.glitchOverrideDither
            ? Math.round(
                (target.data[targetIndex + 1] +
                  source.data[sourceIndex + 1]) /
                  2
              )
            : source.data[sourceIndex + 1];

          target.data[targetIndex + 2] =
            source.data[sourceIndex + 2];
        }
      }
    }

    ctx.putImageData(target, 0, 0);
  }

  if (
    values.useCodecDamage &&
    values.codecDamageAmount > 0
  ) {
    applyCodecDamage(ctx, width, height, {
      blockSize: values.codecDamageBlockSize,
      amount: values.codecDamageAmount,
      chromaShift: values.codecDamageChromaShift,
      colorDepth: values.codecDamageColorDepth,
      random: createSeededRandom(activeSeed, 'codec-damage')
    });
  }

  if (
    values.useChannelPacketLoss &&
    values.channelPacketLossAmount > 0
  ) {
    applyChannelPacketLoss(ctx, width, height, {
      channel: values.channelPacketLossChannel,
      blockSize: values.channelPacketLossBlockSize,
      amount: values.channelPacketLossAmount,
      shift: values.channelPacketLossShift,
      random: createSeededRandom(
        activeSeed,
        'channel-packet-loss'
      )
    });
  }

  if (values.useFrameEcho && values.frameEchoDecay > 0) {
    applyFrameEcho(ctx, width, height, {
      mode: values.frameEchoMode,
      copies: values.frameEchoCopies,
      offset: values.frameEchoOffset,
      decay: values.frameEchoDecay,
      jitter: values.frameEchoJitter,
      random: createSeededRandom(activeSeed, 'frame-echo')
    });
  }

  if (
    values.useMotionSmear &&
    values.motionSmearLength > 0
  ) {
    applyMotionSmear(ctx, width, height, {
      direction: values.motionSmearDirection,
      length: values.motionSmearLength,
      decay: values.motionSmearDecay,
      threshold: values.motionSmearThreshold,
      random: createSeededRandom(activeSeed, 'motion-smear')
    });
  }

  if (values.useChromatic && values.chromaticOffset > 0) {
    applyChromatic(ctx, width, height, {
      amount: values.chromaticOffset
    });
  }

  if (values.useAscii) {
    applyAscii(ctx, width, height, {
      cellSize: values.asciiCellSize,
      opacity: values.asciiOpacity,
      mode: values.asciiMode,
      color: values.asciiColor
    });
  }

  if (values.usePatternDither) {
    applyPatternDither(ctx, width, height, {
      shape: values.patternDitherShape,
      scale: values.patternDitherScale,
      density: values.patternDitherDensity,
      opacity: values.patternDitherOpacity,
      color: values.patternDitherColor,
      backgroundColor: values.patternDitherBackgroundColor,
      invert: values.patternDitherInvert,
      replaceImage: values.patternDitherReplaceImage
    });
  }

  if (values.useSignalWaves) {
    applySignalWaves(ctx, width, height, {
      mode: values.signalWavesMode,
      frequency: values.signalWavesFrequency,
      amplitude: values.signalWavesAmplitude,
      density: values.signalWavesDensity,
      opacity: values.signalWavesOpacity,
      color: values.signalWavesColor,
      backgroundColor: values.signalWavesBackgroundColor,
      replaceImage: values.signalWavesReplaceImage,
      reactToImage: values.signalWavesReactToImage
    });
  }

  if (values.usePanelLayout) {
    applyPanelLayout(ctx, width, height, {
      mode: values.panelLayoutMode,
      gap: values.panelLayoutGap,
      borderWidth: values.panelLayoutBorderWidth,
      borderColor: values.panelLayoutBorderColor,
      backgroundColor: values.panelLayoutBackgroundColor,
      panelOpacity: values.panelLayoutPanelOpacity,
      randomCrop: values.panelLayoutRandomCrop,
      cropIntensity: values.panelLayoutCropIntensity,
      panX: values.panelLayoutPanX,
      panY: values.panelLayoutPanY,
      mirrorAlternate: values.panelLayoutMirrorAlternate,
      seed: deriveSeed(activeSeed, 'panel-layout')
    });
  }

  if (values.useNoise && values.noiseAmount > 0) {
    applyNoise(
      ctx,
      width,
      height,
      values.noiseAmount,
      createSeededRandom(activeSeed, 'noise')
    );
  }

  if (values.useScanlines && values.scanlineIntensity > 0) {
    applyScanlines(
      ctx,
      width,
      height,
      values.scanlineIntensity
    );
  }

  if (beforeDistortionCopy) {
    applyArtifactMask(ctx, width, height, {
      mode: values.artifactMaskMode,
      threshold: values.artifactMaskThreshold,
      seed: deriveSeed(activeSeed, 'artifact-mask-distortion'),
      source: beforeDistortionCopy
    });
  }

  if (values.useDataOverlay) {
    applyDataOverlay(ctx, width, height, {
      mode: values.dataOverlayMode,
      density: values.dataOverlayDensity,
      fontSize: values.dataOverlayFontSize,
      opacity: values.dataOverlayOpacity,
      color: values.dataOverlayColor,
      customText: values.dataOverlayCustomText,
      seed: deriveSeed(activeSeed, 'data-overlay')
    });
  }

  if (values.usePosterText) {
    applyPosterText(ctx, width, height, {
      text: values.posterTextContent,
      x: values.posterTextX,
      y: values.posterTextY,
      vertical: values.posterTextVertical,
      font: values.posterTextFont,
      weight: values.posterTextWeight,
      size: values.posterTextSize,
      tracking: values.posterTextTracking,
      opacity: values.posterTextOpacity,
      color: values.posterTextColor,
      glitch: values.posterTextGlitch,
      mode: values.posterTextMode,
      seed: deriveSeed(activeSeed, 'poster-text')
    });
  }

  if (values.useHudFrame) {
    applyHudFrame(ctx, width, height, {
      style: values.hudFrameStyle,
      opacity: values.hudFrameOpacity,
      color: values.hudFrameColor,
      showGrid: values.hudFrameShowGrid,
      showLabels: values.hudFrameShowLabels,
      showCornerMarks: values.hudFrameShowCornerMarks,
      safeArea: values.hudFrameSafeArea
    });
  }
}
