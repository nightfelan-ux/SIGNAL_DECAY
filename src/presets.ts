import type { DitherMode } from './effects/dither';
import type { PatternDitherShape } from './effects/patternDither';
import type { DataOverlayMode } from './effects/dataOverlay';
import type { HudFrameStyle } from './effects/hudFrame';
import type { SignalWavesMode } from './effects/signalWaves';

export interface EffectPreset {
  name: string;

  usePixelation: boolean;
  pixelSize: number;

  usePsx: boolean;
  psxResolutionScale: number;
  psxColorLevels: number;
  psxWarpAmount: number;
  psxJitterAmount: number;
  psxDitherStrength: number;
  psxBlockSize: number;
  psxCompositeBlur: number;
  psxChromaBleed: number;

  usePixelSort: boolean;
  pixelSortDirection: 'horizontal' | 'vertical';
  pixelSortMode: 'bright' | 'dark' | 'all';
  pixelSortThreshold: number;
  pixelSortAmount: number;

  usePalette: boolean;
  colorStart: string;
  colorEnd: string;
  steps: number;
  swapPaletteColors: boolean;

  useDither: boolean;
  ditherMode: DitherMode;
  threshold: number;

  useGlitch: boolean;
  glitch: number;
  glitchChaos: number;
  glitchWidth: number;
  glitchOverrideDither: boolean;
  edgeGlitchOnly: boolean;

  useChromatic: boolean;
  chromaticOffset: number;

  useAscii: boolean;
  asciiCellSize: number;
  asciiOpacity: number;
  asciiMode: 'overlay' | 'replace';
  asciiColor: string;

  usePatternDither: boolean;
  patternDitherShape: PatternDitherShape;
  patternDitherScale: number;
  patternDitherDensity: number;
  patternDitherOpacity: number;
  patternDitherColor: string;
  patternDitherBackgroundColor: string;
  patternDitherInvert: boolean;
  patternDitherReplaceImage: boolean;

  useSignalWaves: boolean;
  signalWavesMode: SignalWavesMode;
  signalWavesFrequency: number;
  signalWavesAmplitude: number;
  signalWavesDensity: number;
  signalWavesOpacity: number;
  signalWavesColor: string;
  signalWavesBackgroundColor: string;
  signalWavesReplaceImage: boolean;
  signalWavesReactToImage: boolean;

  useDataOverlay: boolean;
  dataOverlayMode: DataOverlayMode;
  dataOverlayDensity: number;
  dataOverlayFontSize: number;
  dataOverlayOpacity: number;
  dataOverlayColor: string;
  dataOverlayCustomText: string;

  useHudFrame: boolean;
  hudFrameStyle: HudFrameStyle;
  hudFrameOpacity: number;
  hudFrameColor: string;
  hudFrameShowGrid: boolean;
  hudFrameShowLabels: boolean;
  hudFrameShowCornerMarks: boolean;
  hudFrameSafeArea: number;

  useNoise: boolean;
  noiseAmount: number;

  useScanlines: boolean;
  scanlineIntensity: number;
}

const DEFAULT_PRESET: Omit<EffectPreset, 'name'> = {
  usePixelation: false,
  pixelSize: 4,

  usePsx: false,
  psxResolutionScale: 4,
  psxColorLevels: 8,
  psxWarpAmount: 2,
  psxJitterAmount: 2,
  psxDitherStrength: 0.45,
  psxBlockSize: 12,
  psxCompositeBlur: 0.8,
  psxChromaBleed: 1,

  usePixelSort: false,
  pixelSortDirection: 'horizontal',
  pixelSortMode: 'bright',
  pixelSortThreshold: 160,
  pixelSortAmount: 0.75,

  usePalette: false,
  colorStart: '#000000',
  colorEnd: '#00ff00',
  steps: 4,
  swapPaletteColors: false,

  useDither: false,
  ditherMode: 'floyd-steinberg',
  threshold: 255,

  useGlitch: false,
  glitch: 0,
  glitchChaos: 0,
  glitchWidth: 100,
  glitchOverrideDither: false,
  edgeGlitchOnly: true,

  useChromatic: false,
  chromaticOffset: 3,

  useAscii: false,
  asciiCellSize: 12,
  asciiOpacity: 0.5,
  asciiMode: 'overlay',
  asciiColor: '#00ff99',

  usePatternDither: false,
  patternDitherShape: 'dot',
  patternDitherScale: 12,
  patternDitherDensity: 100,
  patternDitherOpacity: 0.9,
  patternDitherColor: '#00ff99',
  patternDitherBackgroundColor: '#050505',
  patternDitherInvert: false,
  patternDitherReplaceImage: false,

  useSignalWaves: false,
  signalWavesMode: 'horizontal',
  signalWavesFrequency: 12,
  signalWavesAmplitude: 26,
  signalWavesDensity: 18,
  signalWavesOpacity: 0.65,
  signalWavesColor: '#00ff99',
  signalWavesBackgroundColor: '#050505',
  signalWavesReplaceImage: false,
  signalWavesReactToImage: true,

  useDataOverlay: false,
  dataOverlayMode: 'random-codes',
  dataOverlayDensity: 18,
  dataOverlayFontSize: 11,
  dataOverlayOpacity: 0.45,
  dataOverlayColor: '#00ff99',
  dataOverlayCustomText: 'SIGNAL UNSTABLE',

  useHudFrame: false,
  hudFrameStyle: 'scan-frame',
  hudFrameOpacity: 0.75,
  hudFrameColor: '#00ff99',
  hudFrameShowGrid: true,
  hudFrameShowLabels: true,
  hudFrameShowCornerMarks: true,
  hudFrameSafeArea: 3,

  useNoise: false,
  noiseAmount: 15,

  useScanlines: false,
  scanlineIntensity: 0.2
};

const createPreset = (
  name: string,
  values: Partial<Omit<EffectPreset, 'name'>>
): EffectPreset => {
  return {
    name,
    ...DEFAULT_PRESET,
    ...values
  };
};

export const PRESETS: EffectPreset[] = [
  createPreset('CRT TERMINAL', {
    usePixelation: true,
    pixelSize: 3,

    usePalette: true,
    colorStart: '#001108',
    colorEnd: '#00ff99',
    steps: 5,

    useDither: true,
    ditherMode: 'ordered-bayer',
    threshold: 180,

    usePatternDither: true,
    patternDitherShape: 'dot',
    patternDitherScale: 9,
    patternDitherDensity: 65,
    patternDitherOpacity: 0.35,
    patternDitherColor: '#00ff99',

    useGlitch: true,
    glitch: 4,
    glitchChaos: 18,
    glitchWidth: 90,

    useChromatic: true,
    chromaticOffset: 2,

    useDataOverlay: true,
    dataOverlayMode: 'image-info',
    dataOverlayDensity: 10,
    dataOverlayFontSize: 10,
    dataOverlayOpacity: 0.35,

    useHudFrame: true,
    hudFrameStyle: 'scan-frame',
    hudFrameOpacity: 0.45,
    hudFrameSafeArea: 4,

    useNoise: true,
    noiseAmount: 8,

    useScanlines: true,
    scanlineIntensity: 0.28
  }),

  createPreset('TOXIC SCAN', {
    usePixelation: true,
    pixelSize: 4,

    usePalette: true,
    colorStart: '#050500',
    colorEnd: '#baff00',
    steps: 4,

    useDither: true,
    ditherMode: 'floyd-steinberg',
    threshold: 210,

    useSignalWaves: true,
    signalWavesMode: 'horizontal',
    signalWavesFrequency: 18,
    signalWavesAmplitude: 22,
    signalWavesDensity: 15,
    signalWavesOpacity: 0.35,
    signalWavesColor: '#baff00',

    useDataOverlay: true,
    dataOverlayMode: 'warning',
    dataOverlayDensity: 14,
    dataOverlayFontSize: 10,
    dataOverlayOpacity: 0.35,
    dataOverlayColor: '#baff00',

    useGlitch: true,
    glitch: 7,
    glitchChaos: 35,
    glitchWidth: 80,

    useChromatic: true,
    chromaticOffset: 4,

    useNoise: true,
    noiseAmount: 16,

    useScanlines: true,
    scanlineIntensity: 0.22
  }),

  createPreset('BROKEN CAMERA', {
    usePixelation: true,
    pixelSize: 2,

    usePsx: true,
    psxResolutionScale: 3,
    psxColorLevels: 10,
    psxWarpAmount: 4,
    psxJitterAmount: 7,
    psxDitherStrength: 0.35,
    psxBlockSize: 14,
    psxCompositeBlur: 1.2,
    psxChromaBleed: 3,

    useGlitch: true,
    glitch: 12,
    glitchChaos: 55,
    glitchWidth: 100,
    edgeGlitchOnly: false,

    useChromatic: true,
    chromaticOffset: 7,

    useHudFrame: true,
    hudFrameStyle: 'corrupted-ui',
    hudFrameOpacity: 0.35,
    hudFrameShowGrid: false,
    hudFrameShowLabels: false,

    useNoise: true,
    noiseAmount: 22,

    useScanlines: true,
    scanlineIntensity: 0.18
  }),

  createPreset('LOW BIT POSTER', {
    usePixelation: true,
    pixelSize: 5,

    usePalette: true,
    colorStart: '#120014',
    colorEnd: '#ffcc00',
    steps: 5,

    useDither: true,
    ditherMode: 'ordered-bayer',
    threshold: 160,

    usePatternDither: true,
    patternDitherShape: 'square',
    patternDitherScale: 18,
    patternDitherDensity: 80,
    patternDitherOpacity: 0.25,
    patternDitherColor: '#ffcc00'
  }),

  createPreset('SIGNAL DECAY', {
    usePixelation: true,
    pixelSize: 3,

    usePsx: true,
    psxResolutionScale: 4,
    psxColorLevels: 8,
    psxWarpAmount: 5,
    psxJitterAmount: 5,
    psxDitherStrength: 0.45,
    psxBlockSize: 12,
    psxCompositeBlur: 1.4,
    psxChromaBleed: 4,

    usePixelSort: true,
    pixelSortDirection: 'horizontal',
    pixelSortMode: 'bright',
    pixelSortThreshold: 170,
    pixelSortAmount: 0.45,

    usePalette: true,
    colorStart: '#050505',
    colorEnd: '#00ff99',
    steps: 6,

    useDither: true,
    ditherMode: 'floyd-steinberg',
    threshold: 170,

    useSignalWaves: true,
    signalWavesMode: 'horizontal',
    signalWavesFrequency: 24,
    signalWavesAmplitude: 34,
    signalWavesDensity: 18,
    signalWavesOpacity: 0.4,
    signalWavesColor: '#00ff99',

    useDataOverlay: true,
    dataOverlayMode: 'random-codes',
    dataOverlayDensity: 22,
    dataOverlayFontSize: 10,
    dataOverlayOpacity: 0.42,

    useHudFrame: true,
    hudFrameStyle: 'corrupted-ui',
    hudFrameOpacity: 0.55,
    hudFrameSafeArea: 3,

    useGlitch: true,
    glitch: 10,
    glitchChaos: 40,
    glitchWidth: 85,
    glitchOverrideDither: true,

    useChromatic: true,
    chromaticOffset: 5,

    useNoise: true,
    noiseAmount: 18,

    useScanlines: true,
    scanlineIntensity: 0.22
  }),

  createPreset('ASCII MONITOR', {
    usePixelation: true,
    pixelSize: 4,

    usePalette: true,
    colorStart: '#000000',
    colorEnd: '#00ff99',
    steps: 4,

    useDither: true,
    ditherMode: 'ordered-bayer',
    threshold: 130,

    useAscii: true,
    asciiCellSize: 10,
    asciiOpacity: 0.55,
    asciiColor: '#00ff99',

    useDataOverlay: true,
    dataOverlayMode: 'coordinates',
    dataOverlayDensity: 8,
    dataOverlayFontSize: 9,
    dataOverlayOpacity: 0.3,

    useHudFrame: true,
    hudFrameStyle: 'archive-frame',
    hudFrameOpacity: 0.4,
    hudFrameSafeArea: 5,

    useNoise: true,
    noiseAmount: 5,

    useScanlines: true,
    scanlineIntensity: 0.18
  }),

  createPreset('SURVEILLANCE FEED', {
    usePixelation: true,
    pixelSize: 2,

    usePsx: true,
    psxResolutionScale: 3,
    psxColorLevels: 12,
    psxWarpAmount: 2,
    psxJitterAmount: 3,
    psxDitherStrength: 0.25,
    psxBlockSize: 16,
    psxCompositeBlur: 0.8,
    psxChromaBleed: 2,

    usePalette: true,
    colorStart: '#030807',
    colorEnd: '#7affc4',
    steps: 7,

    useDither: true,
    ditherMode: 'atkinson',
    threshold: 90,

    useDataOverlay: true,
    dataOverlayMode: 'image-info',
    dataOverlayDensity: 16,
    dataOverlayFontSize: 10,
    dataOverlayOpacity: 0.38,
    dataOverlayColor: '#7affc4',

    useHudFrame: true,
    hudFrameStyle: 'targeting-frame',
    hudFrameOpacity: 0.6,
    hudFrameColor: '#7affc4',

    useGlitch: true,
    glitch: 5,
    glitchChaos: 25,
    glitchWidth: 100,

    useChromatic: true,
    chromaticOffset: 2,

    useNoise: true,
    noiseAmount: 12,

    useScanlines: true,
    scanlineIntensity: 0.3
  }),

  createPreset('PS1 PORTRAIT', {
    usePixelation: true,
    pixelSize: 2,

    usePsx: true,
    psxResolutionScale: 5,
    psxColorLevels: 9,
    psxWarpAmount: 2,
    psxJitterAmount: 1,
    psxDitherStrength: 0.55,
    psxBlockSize: 18,
    psxCompositeBlur: 0.4,
    psxChromaBleed: 1,

    useChromatic: true,
    chromaticOffset: 1,

    useNoise: true,
    noiseAmount: 6
  }),

  createPreset('PSX SURVEILLANCE', {
    usePixelation: true,
    pixelSize: 3,

    usePsx: true,
    psxResolutionScale: 6,
    psxColorLevels: 7,
    psxWarpAmount: 5,
    psxJitterAmount: 4,
    psxDitherStrength: 0.5,
    psxBlockSize: 20,
    psxCompositeBlur: 1,
    psxChromaBleed: 2,

    usePixelSort: true,
    pixelSortDirection: 'horizontal',
    pixelSortMode: 'bright',
    pixelSortThreshold: 185,
    pixelSortAmount: 0.3,

    usePalette: true,
    colorStart: '#050505',
    colorEnd: '#90ffb8',
    steps: 5,

    useDither: true,
    ditherMode: 'ordered-bayer',
    threshold: 120,

    useHudFrame: true,
    hudFrameStyle: 'targeting-frame',
    hudFrameOpacity: 0.5,
    hudFrameColor: '#90ffb8',

    useDataOverlay: true,
    dataOverlayMode: 'coordinates',
    dataOverlayDensity: 12,
    dataOverlayFontSize: 9,
    dataOverlayOpacity: 0.32,
    dataOverlayColor: '#90ffb8',

    useGlitch: true,
    glitch: 6,
    glitchChaos: 32,
    glitchWidth: 75,
    glitchOverrideDither: true,

    useChromatic: true,
    chromaticOffset: 3,

    useNoise: true,
    noiseAmount: 14,

    useScanlines: true,
    scanlineIntensity: 0.24
  }),

  createPreset('LOW POLY MEMORY', {
    usePixelation: true,
    pixelSize: 8,

    usePsx: true,
    psxResolutionScale: 8,
    psxColorLevels: 6,
    psxWarpAmount: 1,
    psxJitterAmount: 1,
    psxDitherStrength: 0.4,
    psxBlockSize: 28,
    psxCompositeBlur: 0,
    psxChromaBleed: 0,

    usePalette: true,
    colorStart: '#170f1f',
    colorEnd: '#7cf7ff',
    steps: 6,

    useDither: true,
    ditherMode: 'ordered-bayer',
    threshold: 100,

    usePatternDither: true,
    patternDitherShape: 'circle',
    patternDitherScale: 24,
    patternDitherDensity: 70,
    patternDitherOpacity: 0.22,
    patternDitherColor: '#7cf7ff'
  }),

  createPreset('DATA MELT', {
    usePixelation: true,
    pixelSize: 2,

    usePixelSort: true,
    pixelSortDirection: 'vertical',
    pixelSortMode: 'bright',
    pixelSortThreshold: 135,
    pixelSortAmount: 0.85,

    usePalette: true,
    colorStart: '#020008',
    colorEnd: '#ff00aa',
    steps: 5,

    useSignalWaves: true,
    signalWavesMode: 'vertical',
    signalWavesFrequency: 32,
    signalWavesAmplitude: 42,
    signalWavesDensity: 12,
    signalWavesOpacity: 0.28,
    signalWavesColor: '#ff00aa',

    useGlitch: true,
    glitch: 10,
    glitchChaos: 48,
    glitchWidth: 100,
    edgeGlitchOnly: false,

    useChromatic: true,
    chromaticOffset: 6,

    useNoise: true,
    noiseAmount: 10
  }),

  createPreset('CORRUPTED SCAN', {
    usePixelation: true,
    pixelSize: 3,

    usePsx: true,
    psxResolutionScale: 4,
    psxColorLevels: 9,
    psxWarpAmount: 7,
    psxJitterAmount: 8,
    psxDitherStrength: 0.4,
    psxBlockSize: 10,
    psxCompositeBlur: 1.6,
    psxChromaBleed: 5,

    usePixelSort: true,
    pixelSortDirection: 'horizontal',
    pixelSortMode: 'all',
    pixelSortThreshold: 120,
    pixelSortAmount: 0.35,

    useHudFrame: true,
    hudFrameStyle: 'corrupted-ui',
    hudFrameOpacity: 0.5,
    hudFrameShowGrid: true,
    hudFrameShowLabels: false,

    useDataOverlay: true,
    dataOverlayMode: 'warning',
    dataOverlayDensity: 18,
    dataOverlayFontSize: 10,
    dataOverlayOpacity: 0.38,

    useGlitch: true,
    glitch: 16,
    glitchChaos: 65,
    glitchWidth: 85,
    edgeGlitchOnly: false,

    useChromatic: true,
    chromaticOffset: 9,

    useNoise: true,
    noiseAmount: 28,

    useScanlines: true,
    scanlineIntensity: 0.2
  }),

  createPreset('VHS GHOST', {
    usePixelation: true,
    pixelSize: 2,

    usePsx: true,
    psxResolutionScale: 3,
    psxColorLevels: 14,
    psxWarpAmount: 8,
    psxJitterAmount: 6,
    psxDitherStrength: 0.2,
    psxBlockSize: 22,
    psxCompositeBlur: 2.2,
    psxChromaBleed: 6,

    usePalette: true,
    colorStart: '#0b0714',
    colorEnd: '#b6ffee',
    steps: 8,

    useDither: true,
    ditherMode: 'atkinson',
    threshold: 75,

    useSignalWaves: true,
    signalWavesMode: 'horizontal',
    signalWavesFrequency: 9,
    signalWavesAmplitude: 18,
    signalWavesDensity: 9,
    signalWavesOpacity: 0.2,
    signalWavesColor: '#b6ffee',

    useGlitch: true,
    glitch: 8,
    glitchChaos: 45,
    glitchWidth: 100,
    edgeGlitchOnly: false,

    useChromatic: true,
    chromaticOffset: 8,

    useNoise: true,
    noiseAmount: 18,

    useScanlines: true,
    scanlineIntensity: 0.34
  }),

  createPreset('ACID TERMINAL', {
    usePixelation: true,
    pixelSize: 4,

    usePixelSort: true,
    pixelSortDirection: 'vertical',
    pixelSortMode: 'dark',
    pixelSortThreshold: 80,
    pixelSortAmount: 0.55,

    usePalette: true,
    colorStart: '#0a0000',
    colorEnd: '#ccff00',
    steps: 4,

    useDither: true,
    ditherMode: 'ordered-bayer',
    threshold: 210,

    useAscii: true,
    asciiCellSize: 14,
    asciiOpacity: 0.25,
    asciiColor: '#ccff00',

    useDataOverlay: true,
    dataOverlayMode: 'random-codes',
    dataOverlayDensity: 22,
    dataOverlayFontSize: 9,
    dataOverlayOpacity: 0.45,
    dataOverlayColor: '#ccff00',

    useHudFrame: true,
    hudFrameStyle: 'archive-frame',
    hudFrameOpacity: 0.45,
    hudFrameColor: '#ccff00',

    useGlitch: true,
    glitch: 6,
    glitchChaos: 38,
    glitchWidth: 60,
    glitchOverrideDither: true,

    useChromatic: true,
    chromaticOffset: 3,

    useNoise: true,
    noiseAmount: 12,

    useScanlines: true,
    scanlineIntensity: 0.26
  }),

  createPreset('MARS RELAY', {
    usePixelation: true,
    pixelSize: 3,

    usePsx: true,
    psxResolutionScale: 5,
    psxColorLevels: 7,
    psxWarpAmount: 3,
    psxJitterAmount: 2,
    psxDitherStrength: 0.45,
    psxBlockSize: 18,
    psxCompositeBlur: 0.6,
    psxChromaBleed: 1,

    usePalette: true,
    colorStart: '#160600',
    colorEnd: '#ff7a1a',
    steps: 6,

    useDither: true,
    ditherMode: 'atkinson',
    threshold: 135,

    useSignalWaves: true,
    signalWavesMode: 'radar',
    signalWavesFrequency: 10,
    signalWavesAmplitude: 28,
    signalWavesDensity: 22,
    signalWavesOpacity: 0.28,
    signalWavesColor: '#ff7a1a',

    useDataOverlay: true,
    dataOverlayMode: 'image-info',
    dataOverlayDensity: 9,
    dataOverlayFontSize: 10,
    dataOverlayOpacity: 0.32,
    dataOverlayColor: '#ff7a1a',

    useGlitch: true,
    glitch: 4,
    glitchChaos: 22,
    glitchWidth: 80,

    useChromatic: true,
    chromaticOffset: 2,

    useNoise: true,
    noiseAmount: 14,

    useScanlines: true,
    scanlineIntensity: 0.16
  }),

  createPreset('GOTHIC FAX', {
    usePixelation: true,
    pixelSize: 2,

    usePalette: true,
    colorStart: '#000000',
    colorEnd: '#f2f2f2',
    steps: 2,

    useDither: true,
    ditherMode: 'floyd-steinberg',
    threshold: 255,

    usePatternDither: true,
    patternDitherShape: 'cross',
    patternDitherScale: 10,
    patternDitherDensity: 40,
    patternDitherOpacity: 0.25,
    patternDitherColor: '#f2f2f2',

    useGlitch: true,
    glitch: 3,
    glitchChaos: 20,
    glitchWidth: 100,

    useNoise: true,
    noiseAmount: 20
  }),

  createPreset('NEON AUTOPSY', {
    usePixelation: true,
    pixelSize: 3,

    usePsx: true,
    psxResolutionScale: 4,
    psxColorLevels: 8,
    psxWarpAmount: 6,
    psxJitterAmount: 5,
    psxDitherStrength: 0.5,
    psxBlockSize: 16,
    psxCompositeBlur: 1,
    psxChromaBleed: 5,

    usePixelSort: true,
    pixelSortDirection: 'vertical',
    pixelSortMode: 'bright',
    pixelSortThreshold: 150,
    pixelSortAmount: 0.65,

    usePalette: true,
    colorStart: '#05000c',
    colorEnd: '#00eaff',
    steps: 5,

    useDither: true,
    ditherMode: 'ordered-bayer',
    threshold: 145,

    useSignalWaves: true,
    signalWavesMode: 'topographic',
    signalWavesFrequency: 18,
    signalWavesAmplitude: 38,
    signalWavesDensity: 14,
    signalWavesOpacity: 0.38,
    signalWavesColor: '#00eaff',

    useHudFrame: true,
    hudFrameStyle: 'targeting-frame',
    hudFrameOpacity: 0.42,
    hudFrameColor: '#00eaff',

    useGlitch: true,
    glitch: 11,
    glitchChaos: 52,
    glitchWidth: 70,
    glitchOverrideDither: true,
    edgeGlitchOnly: false,

    useChromatic: true,
    chromaticOffset: 8,

    useNoise: true,
    noiseAmount: 12,

    useScanlines: true,
    scanlineIntensity: 0.18
  }),

  createPreset('BLUEPRINT ERROR', {
    usePixelation: true,
    pixelSize: 4,

    usePixelSort: true,
    pixelSortDirection: 'horizontal',
    pixelSortMode: 'dark',
    pixelSortThreshold: 100,
    pixelSortAmount: 0.25,

    usePalette: true,
    colorStart: '#001224',
    colorEnd: '#6ad8ff',
    steps: 4,

    useDither: true,
    ditherMode: 'ordered-bayer',
    threshold: 170,

    useAscii: true,
    asciiCellSize: 16,
    asciiOpacity: 0.18,
    asciiColor: '#6ad8ff',

    useSignalWaves: true,
    signalWavesMode: 'topographic',
    signalWavesFrequency: 12,
    signalWavesAmplitude: 24,
    signalWavesDensity: 18,
    signalWavesOpacity: 0.45,
    signalWavesColor: '#6ad8ff',

    useHudFrame: true,
    hudFrameStyle: 'minimal',
    hudFrameOpacity: 0.5,
    hudFrameColor: '#6ad8ff',

    useGlitch: true,
    glitch: 5,
    glitchChaos: 25,
    glitchWidth: 65,

    useNoise: true,
    noiseAmount: 6
  }),

  createPreset('BLOOD SIGNAL', {
    usePixelation: true,
    pixelSize: 3,

    usePsx: true,
    psxResolutionScale: 4,
    psxColorLevels: 6,
    psxWarpAmount: 4,
    psxJitterAmount: 5,
    psxDitherStrength: 0.35,
    psxBlockSize: 14,
    psxCompositeBlur: 0.8,
    psxChromaBleed: 3,

    usePixelSort: true,
    pixelSortDirection: 'horizontal',
    pixelSortMode: 'bright',
    pixelSortThreshold: 145,
    pixelSortAmount: 0.4,

    usePalette: true,
    colorStart: '#050000',
    colorEnd: '#ff003c',
    steps: 5,

    useDither: true,
    ditherMode: 'atkinson',
    threshold: 130,

    useDataOverlay: true,
    dataOverlayMode: 'warning',
    dataOverlayDensity: 14,
    dataOverlayFontSize: 10,
    dataOverlayOpacity: 0.35,
    dataOverlayColor: '#ff003c',

    useSignalWaves: true,
    signalWavesMode: 'radar',
    signalWavesFrequency: 16,
    signalWavesAmplitude: 35,
    signalWavesDensity: 20,
    signalWavesOpacity: 0.3,
    signalWavesColor: '#ff003c',

    useGlitch: true,
    glitch: 9,
    glitchChaos: 44,
    glitchWidth: 95,

    useChromatic: true,
    chromaticOffset: 4,

    useNoise: true,
    noiseAmount: 18,

    useScanlines: true,
    scanlineIntensity: 0.2
  }),

  createPreset('COLD ARCHIVE', {
    usePixelation: true,
    pixelSize: 2,

    usePsx: true,
    psxResolutionScale: 3,
    psxColorLevels: 11,
    psxWarpAmount: 1,
    psxJitterAmount: 1,
    psxDitherStrength: 0.25,
    psxBlockSize: 18,
    psxCompositeBlur: 0.3,
    psxChromaBleed: 1,

    usePalette: true,
    colorStart: '#02060a',
    colorEnd: '#bfe8ff',
    steps: 8,

    useDither: true,
    ditherMode: 'atkinson',
    threshold: 80,

    useHudFrame: true,
    hudFrameStyle: 'archive-frame',
    hudFrameOpacity: 0.5,
    hudFrameColor: '#bfe8ff',
    hudFrameSafeArea: 6,

    useDataOverlay: true,
    dataOverlayMode: 'image-info',
    dataOverlayDensity: 8,
    dataOverlayFontSize: 9,
    dataOverlayOpacity: 0.25,
    dataOverlayColor: '#bfe8ff',

    useChromatic: true,
    chromaticOffset: 1,

    useNoise: true,
    noiseAmount: 7,

    useScanlines: true,
    scanlineIntensity: 0.12
  }),

  createPreset('VOID NEWSPAPER', {
    usePixelation: true,
    pixelSize: 2,

    usePalette: true,
    colorStart: '#050505',
    colorEnd: '#d6d6c8',
    steps: 3,

    useDither: true,
    ditherMode: 'floyd-steinberg',
    threshold: 230,

    useAscii: true,
    asciiCellSize: 9,
    asciiOpacity: 0.22,
    asciiColor: '#d6d6c8',

    usePatternDither: true,
    patternDitherShape: 'dot',
    patternDitherScale: 6,
    patternDitherDensity: 55,
    patternDitherOpacity: 0.18,
    patternDitherColor: '#d6d6c8',

    useNoise: true,
    noiseAmount: 12
  }),

  createPreset('CYBERPUNK RAIN', {
    usePixelation: true,
    pixelSize: 3,

    usePsx: true,
    psxResolutionScale: 4,
    psxColorLevels: 10,
    psxWarpAmount: 3,
    psxJitterAmount: 3,
    psxDitherStrength: 0.3,
    psxBlockSize: 18,
    psxCompositeBlur: 0.7,
    psxChromaBleed: 3,

    usePixelSort: true,
    pixelSortDirection: 'vertical',
    pixelSortMode: 'bright',
    pixelSortThreshold: 170,
    pixelSortAmount: 0.72,

    usePalette: true,
    colorStart: '#030014',
    colorEnd: '#00ffcc',
    steps: 7,

    useDither: true,
    ditherMode: 'ordered-bayer',
    threshold: 110,

    useSignalWaves: true,
    signalWavesMode: 'vertical',
    signalWavesFrequency: 28,
    signalWavesAmplitude: 24,
    signalWavesDensity: 10,
    signalWavesOpacity: 0.35,
    signalWavesColor: '#00ffcc',

    useDataOverlay: true,
    dataOverlayMode: 'random-codes',
    dataOverlayDensity: 12,
    dataOverlayFontSize: 9,
    dataOverlayOpacity: 0.25,
    dataOverlayColor: '#00ffcc',

    useGlitch: true,
    glitch: 5,
    glitchChaos: 30,
    glitchWidth: 55,
    glitchOverrideDither: true,

    useChromatic: true,
    chromaticOffset: 5,

    useNoise: true,
    noiseAmount: 10,

    useScanlines: true,
    scanlineIntensity: 0.16
  }),

  createPreset('TAU CETI FIELD', {
    usePixelation: true,
    pixelSize: 3,

    usePalette: true,
    colorStart: '#06130f',
    colorEnd: '#c8ff2e',
    steps: 6,

    useDither: true,
    ditherMode: 'ordered-bayer',
    threshold: 145,

    useSignalWaves: true,
    signalWavesMode: 'topographic',
    signalWavesFrequency: 14,
    signalWavesAmplitude: 44,
    signalWavesDensity: 16,
    signalWavesOpacity: 0.42,
    signalWavesColor: '#c8ff2e',

    useHudFrame: true,
    hudFrameStyle: 'scan-frame',
    hudFrameOpacity: 0.5,
    hudFrameColor: '#c8ff2e',

    useDataOverlay: true,
    dataOverlayMode: 'coordinates',
    dataOverlayDensity: 15,
    dataOverlayFontSize: 9,
    dataOverlayOpacity: 0.34,
    dataOverlayColor: '#c8ff2e',

    useGlitch: true,
    glitch: 5,
    glitchChaos: 28,
    glitchWidth: 80,

    useChromatic: true,
    chromaticOffset: 3,

    useNoise: true,
    noiseAmount: 10,

    useScanlines: true,
    scanlineIntensity: 0.15
  }),

  createPreset('RUNNER DIAGNOSTIC', {
    usePixelation: true,
    pixelSize: 2,

    usePsx: true,
    psxResolutionScale: 4,
    psxColorLevels: 9,
    psxWarpAmount: 3,
    psxJitterAmount: 3,
    psxDitherStrength: 0.38,
    psxBlockSize: 16,
    psxCompositeBlur: 0.8,
    psxChromaBleed: 2,

    usePalette: true,
    colorStart: '#020505',
    colorEnd: '#00f5ff',
    steps: 6,

    useDither: true,
    ditherMode: 'atkinson',
    threshold: 115,

    useHudFrame: true,
    hudFrameStyle: 'targeting-frame',
    hudFrameOpacity: 0.65,
    hudFrameColor: '#00f5ff',
    hudFrameShowGrid: true,
    hudFrameShowLabels: true,

    useDataOverlay: true,
    dataOverlayMode: 'image-info',
    dataOverlayDensity: 18,
    dataOverlayFontSize: 9,
    dataOverlayOpacity: 0.4,
    dataOverlayColor: '#00f5ff',

    useSignalWaves: true,
    signalWavesMode: 'radar',
    signalWavesFrequency: 18,
    signalWavesAmplitude: 26,
    signalWavesDensity: 24,
    signalWavesOpacity: 0.24,
    signalWavesColor: '#00f5ff',

    useGlitch: true,
    glitch: 6,
    glitchChaos: 36,
    glitchWidth: 70,
    glitchOverrideDither: true,

    useChromatic: true,
    chromaticOffset: 4,

    useNoise: true,
    noiseAmount: 12,

    useScanlines: true,
    scanlineIntensity: 0.2
  }),

  createPreset('ORBITAL TOPOGRAPHY', {
    usePixelation: true,
    pixelSize: 4,

    usePalette: true,
    colorStart: '#010808',
    colorEnd: '#e4ff7a',
    steps: 5,

    usePatternDither: true,
    patternDitherShape: 'line',
    patternDitherScale: 15,
    patternDitherDensity: 75,
    patternDitherOpacity: 0.3,
    patternDitherColor: '#e4ff7a',

    useSignalWaves: true,
    signalWavesMode: 'topographic',
    signalWavesFrequency: 22,
    signalWavesAmplitude: 55,
    signalWavesDensity: 12,
    signalWavesOpacity: 0.55,
    signalWavesColor: '#e4ff7a',
    signalWavesReplaceImage: true,
    signalWavesBackgroundColor: '#010808',

    useHudFrame: true,
    hudFrameStyle: 'archive-frame',
    hudFrameOpacity: 0.42,
    hudFrameColor: '#e4ff7a',

    useDataOverlay: true,
    dataOverlayMode: 'coordinates',
    dataOverlayDensity: 8,
    dataOverlayFontSize: 9,
    dataOverlayOpacity: 0.3,
    dataOverlayColor: '#e4ff7a'
  }),

  createPreset('BLACKBOX RECORDER', {
    usePixelation: true,
    pixelSize: 3,

    usePalette: true,
    colorStart: '#050505',
    colorEnd: '#ffcc00',
    steps: 4,

    useDither: true,
    ditherMode: 'ordered-bayer',
    threshold: 190,

    useDataOverlay: true,
    dataOverlayMode: 'warning',
    dataOverlayDensity: 26,
    dataOverlayFontSize: 10,
    dataOverlayOpacity: 0.55,
    dataOverlayColor: '#ffcc00',

    useHudFrame: true,
    hudFrameStyle: 'corrupted-ui',
    hudFrameOpacity: 0.6,
    hudFrameColor: '#ffcc00',
    hudFrameShowGrid: false,

    useSignalWaves: true,
    signalWavesMode: 'horizontal',
    signalWavesFrequency: 36,
    signalWavesAmplitude: 20,
    signalWavesDensity: 11,
    signalWavesOpacity: 0.32,
    signalWavesColor: '#ffcc00',

    useGlitch: true,
    glitch: 13,
    glitchChaos: 58,
    glitchWidth: 100,
    edgeGlitchOnly: false,

    useNoise: true,
    noiseAmount: 24,

    useScanlines: true,
    scanlineIntensity: 0.25
  })
];