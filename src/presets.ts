import type { ArtifactMaskMode } from './effects/artifactMask';
import type { ChannelPacketLossChannel } from './effects/channelPacketLoss';
import type { CodecDamageMode } from './effects/codecDamage';
import type { DitherMode } from './effects/dither';
import type { FrameEchoMode } from './effects/frameEcho';
import type { PatternDitherShape } from './effects/patternDither';
import type { DataOverlayMode } from './effects/dataOverlay';
import type { HudFrameStyle } from './effects/hudFrame';
import type { LumaDisplacementMode } from './effects/lumaDisplacement';
import type { MachineViewMode } from './effects/machineView';
import type { MotionSmearDirection } from './effects/motionSmear';
import type { SignalWavesMode } from './effects/signalWaves';
import type { PanelLayoutMode } from './effects/panelLayout';
import type {
  PosterTextFont,
  PosterTextLayout,
  PosterTextMode,
  PosterTextPanelAnchor,
} from './effects/posterText';
import type {
  RegionalPaletteMode,
  RegionalPaletteZone
} from './effects/regionalPalette';
import type { ArtifactMaskTarget } from './effectTypes';
import type { ScanDriftDirection } from './effects/scanDrift';

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

  useRegionalPalette: boolean;
  regionalPaletteMode: RegionalPaletteMode;
  regionalPaletteZones: RegionalPaletteZone[];
  regionalPaletteRandomizeZones: boolean;
  regionalPaletteRandomCellSize: number;
  regionalPaletteZoneChaos: number;
  regionalPaletteZoneSeed: number;

  useDither: boolean;
  ditherMode: DitherMode;
  threshold: number;

  useArtifactMask: boolean;
  artifactMaskMode: ArtifactMaskMode;
  artifactMaskTarget: ArtifactMaskTarget;
  artifactMaskThreshold: number;

  useGlitch: boolean;
  glitch: number;
  glitchChaos: number;
  glitchWidth: number;
  glitchOverrideDither: boolean;
  edgeGlitchOnly: boolean;

  useCodecDamage: boolean;
  codecDamageMode: CodecDamageMode;
  codecDamageBlockSize: number;
  codecDamageAmount: number;
  codecDamageChromaShift: number;
  codecDamageColorDepth: number;

  useChannelPacketLoss: boolean;
  channelPacketLossChannel: ChannelPacketLossChannel;
  channelPacketLossBlockSize: number;
  channelPacketLossAmount: number;
  channelPacketLossShift: number;

  useFrameEcho: boolean;
  frameEchoMode: FrameEchoMode;
  frameEchoCopies: number;
  frameEchoOffset: number;
  frameEchoDecay: number;
  frameEchoJitter: number;

  useLumaDisplacement: boolean;
  lumaDisplacementMode: LumaDisplacementMode;
  lumaDisplacementAmount: number;
  lumaDisplacementThreshold: number;
  lumaDisplacementJitter: number;

  useScanDrift: boolean;
  scanDriftDirection: ScanDriftDirection;
  scanDriftAmount: number;
  scanDriftBandSize: number;
  scanDriftChaos: number;

  useMotionSmear: boolean;
  motionSmearDirection: MotionSmearDirection;
  motionSmearLength: number;
  motionSmearDecay: number;
  motionSmearThreshold: number;

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

  useMachineView: boolean;
  machineViewMode: MachineViewMode;
  machineViewCount: number;
  machineViewSensitivity: number;
  machineViewOpacity: number;
  machineViewColor: string;
  machineViewShowLabels: boolean;

  usePosterText: boolean;
  posterTextContent: string;
  posterTextSubtitle: string;
  posterTextCaption: string;
  posterTextLayout: PosterTextLayout;
  posterTextX: number;
  posterTextY: number;
  posterTextVertical: boolean;
  posterTextFont: PosterTextFont;
  posterTextWeight: number;
  posterTextSize: number;
  posterTextTracking: number;
  posterTextOpacity: number;
  posterTextColor: string;
  posterTextGlitch: boolean;
  posterTextMode: PosterTextMode;
  posterTextPanelAnchor: PosterTextPanelAnchor;

  useHudFrame: boolean;
  hudFrameStyle: HudFrameStyle;
  hudFrameOpacity: number;
  hudFrameColor: string;
  hudFrameShowGrid: boolean;
  hudFrameShowLabels: boolean;
  hudFrameShowCornerMarks: boolean;
  hudFrameSafeArea: number;

  usePanelLayout: boolean;
  panelLayoutMode: PanelLayoutMode;
  panelLayoutGap: number;
  panelLayoutBorderWidth: number;
  panelLayoutBorderColor: string;
  panelLayoutBackgroundColor: string;
  panelLayoutPanelOpacity: number;
  panelLayoutRandomCrop: boolean;
  panelLayoutCropIntensity: number;
  panelLayoutPanX: number;
  panelLayoutPanY: number;
  panelLayoutMirrorAlternate: boolean;

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

  useRegionalPalette: false,
  regionalPaletteMode: 'random-zones',
  regionalPaletteZones: [
    {
      startColor: '#000000',
      endColor: '#00ff99',
      steps: 4,
      invert: false
    }
  ],
  regionalPaletteRandomizeZones: false,
  regionalPaletteRandomCellSize: 180,
  regionalPaletteZoneChaos: 55,
  regionalPaletteZoneSeed: 12345,

  useDither: false,
  ditherMode: 'floyd-steinberg',
  threshold: 255,

  useArtifactMask: false,
  artifactMaskMode: 'all',
  artifactMaskTarget: 'all-distortion',
  artifactMaskThreshold: 128,

  useGlitch: false,
  glitch: 0,
  glitchChaos: 0,
  glitchWidth: 100,
  glitchOverrideDither: false,
  edgeGlitchOnly: true,

  useCodecDamage: false,
  codecDamageMode: 'blocks',
  codecDamageBlockSize: 18,
  codecDamageAmount: 0.35,
  codecDamageChromaShift: 3,
  codecDamageColorDepth: 8,

  useChannelPacketLoss: false,
  channelPacketLossChannel: 'rgb',
  channelPacketLossBlockSize: 20,
  channelPacketLossAmount: 0.35,
  channelPacketLossShift: 12,

  useFrameEcho: false,
  frameEchoMode: 'horizontal',
  frameEchoCopies: 3,
  frameEchoOffset: 18,
  frameEchoDecay: 0.55,
  frameEchoJitter: 4,

  useLumaDisplacement: false,
  lumaDisplacementMode: 'split',
  lumaDisplacementAmount: 18,
  lumaDisplacementThreshold: 128,
  lumaDisplacementJitter: 3,

  useScanDrift: false,
  scanDriftDirection: 'horizontal',
  scanDriftAmount: 18,
  scanDriftBandSize: 18,
  scanDriftChaos: 0.35,

  useMotionSmear: false,
  motionSmearDirection: 'horizontal',
  motionSmearLength: 28,
  motionSmearDecay: 0.55,
  motionSmearThreshold: 128,

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

  useMachineView: false,
  machineViewMode: 'tracking',
  machineViewCount: 4,
  machineViewSensitivity: 0.35,
  machineViewOpacity: 0.72,
  machineViewColor: '#00ff99',
  machineViewShowLabels: true,

  usePosterText: false,
  posterTextContent: 'SIGNAL DECAY',
  posterTextSubtitle: 'TRANSMISSION ERROR',
  posterTextCaption: 'ARCHIVE INDEX 00',
  posterTextLayout: 'single',
  posterTextX: 50,
  posterTextY: 50,
  posterTextVertical: false,
  posterTextFont: 'consolas',
  posterTextWeight: 700,
  posterTextSize: 88,
  posterTextTracking: 4,
  posterTextOpacity: 0.75,
  posterTextColor: '#00ff99',
  posterTextGlitch: false,
  posterTextMode: 'blend',
  posterTextPanelAnchor: 'free',

  useHudFrame: false,
  hudFrameStyle: 'scan-frame',
  hudFrameOpacity: 0.75,
  hudFrameColor: '#00ff99',
  hudFrameShowGrid: true,
  hudFrameShowLabels: true,
  hudFrameShowCornerMarks: true,
  hudFrameSafeArea: 3,

  usePanelLayout: false,
  panelLayoutMode: 'side-panel',
  panelLayoutGap: 10,
  panelLayoutBorderWidth: 1,
  panelLayoutBorderColor: '#00ff99',
  panelLayoutBackgroundColor: '#050505',
  panelLayoutPanelOpacity: 1,
  panelLayoutRandomCrop: true,
  panelLayoutCropIntensity: 55,
  panelLayoutPanX: 0,
  panelLayoutPanY: 0,
  panelLayoutMirrorAlternate: false,

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
    signalWavesMode: 'field-lines',
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
    signalWavesMode: 'depth-scan',
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
    signalWavesMode: 'field-lines',
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
    signalWavesMode: 'contour-pulse',
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
    signalWavesMode: 'depth-scan',
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
    signalWavesMode: 'field-lines',
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
    signalWavesMode: 'contour-pulse',
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
  }),
    createPreset('SECTOR MAP', {
    usePanelLayout: true,
    panelLayoutMode: 'diagnostic-wall',
    panelLayoutGap: 10,
    panelLayoutBorderWidth: 1,
    panelLayoutBorderColor: '#00ff99',
    panelLayoutBackgroundColor: '#050505',
    panelLayoutPanelOpacity: 1,
    panelLayoutRandomCrop: true,
    panelLayoutCropIntensity: 72,
    panelLayoutMirrorAlternate: false,

    usePalette: true,
    colorStart: '#020402',
    colorEnd: '#00ff99',
    steps: 5,

    useDither: true,
    ditherMode: 'ordered-bayer',
    threshold: 155,

    useDataOverlay: true,
    dataOverlayMode: 'coordinates',
    dataOverlayDensity: 22,
    dataOverlayFontSize: 9,
    dataOverlayOpacity: 0.36,
    dataOverlayColor: '#00ff99',

    useHudFrame: true,
    hudFrameStyle: 'archive-frame',
    hudFrameOpacity: 0.72,
    hudFrameColor: '#00ff99',
    hudFrameShowGrid: true,
    hudFrameShowLabels: true,
    hudFrameShowCornerMarks: true,

    useScanlines: true,
    scanlineIntensity: 0.22,

    useNoise: true,
    noiseAmount: 10
  }),

  createPreset('FAULT GRID', {
    usePanelLayout: true,
    panelLayoutMode: 'grid-2x2',
    panelLayoutGap: 12,
    panelLayoutBorderWidth: 1,
    panelLayoutBorderColor: '#ff003c',
    panelLayoutBackgroundColor: '#050000',
    panelLayoutPanelOpacity: 1,
    panelLayoutRandomCrop: true,
    panelLayoutCropIntensity: 68,
    panelLayoutMirrorAlternate: true,

    usePalette: true,
    colorStart: '#070000',
    colorEnd: '#ff003c',
    steps: 4,

    useGlitch: true,
    glitch: 14,
    glitchChaos: 58,
    glitchWidth: 72,
    glitchOverrideDither: false,
    edgeGlitchOnly: true,

    useChromatic: true,
    chromaticOffset: 6,

    useDataOverlay: true,
    dataOverlayMode: 'warning',
    dataOverlayDensity: 20,
    dataOverlayFontSize: 10,
    dataOverlayOpacity: 0.38,
    dataOverlayColor: '#ff003c',

    useHudFrame: true,
    hudFrameStyle: 'corrupted-ui',
    hudFrameOpacity: 0.68,
    hudFrameColor: '#ff003c',

    useNoise: true,
    noiseAmount: 18
  }),

  createPreset('LUMA RIFT', {
    usePalette: true,
    colorStart: '#020208',
    colorEnd: '#00c8ff',
    steps: 6,

    useSignalWaves: true,
    signalWavesMode: 'vertical',
    signalWavesFrequency: 28,
    signalWavesAmplitude: 34,
    signalWavesDensity: 14,
    signalWavesOpacity: 0.58,
    signalWavesColor: '#00c8ff',
    signalWavesBackgroundColor: '#050505',
    signalWavesReplaceImage: false,
    signalWavesReactToImage: true,

    usePixelSort: true,
    pixelSortDirection: 'vertical',
    pixelSortMode: 'bright',
    pixelSortThreshold: 110,
    pixelSortAmount: 0.62,

    useDither: true,
    ditherMode: 'atkinson',
    threshold: 145,

    useHudFrame: true,
    hudFrameStyle: 'minimal',
    hudFrameOpacity: 0.48,
    hudFrameColor: '#00c8ff',
    hudFrameShowGrid: false,
    hudFrameShowLabels: true,
    hudFrameShowCornerMarks: true,

    useScanlines: true,
    scanlineIntensity: 0.18
  }),

  createPreset('NULL TOPOGRAPHY', {
    usePalette: true,
    colorStart: '#030306',
    colorEnd: '#d6ff00',
    steps: 5,

    useSignalWaves: true,
    signalWavesMode: 'field-lines',
    signalWavesFrequency: 12,
    signalWavesAmplitude: 38,
    signalWavesDensity: 16,
    signalWavesOpacity: 0.68,
    signalWavesColor: '#d6ff00',
    signalWavesBackgroundColor: '#050505',
    signalWavesReplaceImage: false,
    signalWavesReactToImage: true,

    usePatternDither: true,
    patternDitherShape: 'line',
    patternDitherScale: 18,
    patternDitherDensity: 76,
    patternDitherOpacity: 0.46,
    patternDitherColor: '#d6ff00',
    patternDitherBackgroundColor: '#050505',
    patternDitherInvert: false,
    patternDitherReplaceImage: false,

    useDataOverlay: true,
    dataOverlayMode: 'image-info',
    dataOverlayDensity: 12,
    dataOverlayFontSize: 10,
    dataOverlayOpacity: 0.32,
    dataOverlayColor: '#d6ff00',

    useNoise: true,
    noiseAmount: 12
  }),

  createPreset('RELAY STRIPS', {
    usePanelLayout: true,
    panelLayoutMode: 'vertical-strips',
    panelLayoutGap: 6,
    panelLayoutBorderWidth: 1,
    panelLayoutBorderColor: '#ff00cc',
    panelLayoutBackgroundColor: '#070007',
    panelLayoutPanelOpacity: 1,
    panelLayoutRandomCrop: true,
    panelLayoutCropIntensity: 62,
    panelLayoutMirrorAlternate: true,

    usePalette: true,
    colorStart: '#070007',
    colorEnd: '#ff00cc',
    steps: 5,

    usePixelSort: true,
    pixelSortDirection: 'vertical',
    pixelSortMode: 'bright',
    pixelSortThreshold: 118,
    pixelSortAmount: 0.72,

    useSignalWaves: true,
    signalWavesMode: 'vertical',
    signalWavesFrequency: 34,
    signalWavesAmplitude: 18,
    signalWavesDensity: 10,
    signalWavesOpacity: 0.42,
    signalWavesColor: '#ff00cc',

    useChromatic: true,
    chromaticOffset: 7,

    useNoise: true,
    noiseAmount: 16
  }),

  createPreset('ARCHIVE CONTACT SHEET', {
    usePanelLayout: true,
    panelLayoutMode: 'diagnostic-wall',
    panelLayoutGap: 8,
    panelLayoutBorderWidth: 1,
    panelLayoutBorderColor: '#b8f7ff',
    panelLayoutBackgroundColor: '#020406',
    panelLayoutPanelOpacity: 1,
    panelLayoutRandomCrop: true,
    panelLayoutCropIntensity: 78,
    panelLayoutMirrorAlternate: false,

    usePalette: true,
    colorStart: '#020406',
    colorEnd: '#b8f7ff',
    steps: 4,

    useDither: true,
    ditherMode: 'ordered-bayer',
    threshold: 148,

    useHudFrame: true,
    hudFrameStyle: 'archive-frame',
    hudFrameOpacity: 0.76,
    hudFrameColor: '#b8f7ff',
    hudFrameShowGrid: true,
    hudFrameShowLabels: true,
    hudFrameShowCornerMarks: true,

    useDataOverlay: true,
    dataOverlayMode: 'image-info',
    dataOverlayDensity: 18,
    dataOverlayFontSize: 9,
    dataOverlayOpacity: 0.34,
    dataOverlayColor: '#b8f7ff',

    useScanlines: true,
    scanlineIntensity: 0.18,

    useNoise: true,
    noiseAmount: 9
  }),

  createPreset('BLACKBOX TITLE CARD', {
    usePanelLayout: true,
    panelLayoutMode: 'center-diagnostics',
    panelLayoutGap: 8,
    panelLayoutBorderWidth: 1,
    panelLayoutBorderColor: '#00ff99',
    panelLayoutBackgroundColor: '#020805',
    panelLayoutPanelOpacity: 1,
    panelLayoutRandomCrop: true,
    panelLayoutCropIntensity: 58,

    usePalette: true,
    colorStart: '#020805',
    colorEnd: '#00ff99',
    steps: 5,

    usePosterText: true,
    posterTextContent: 'BLACKBOX',
    posterTextX: 50,
    posterTextY: 50,
    posterTextFont: 'bahnschrift',
    posterTextWeight: 800,
    posterTextSize: 96,
    posterTextTracking: 8,
    posterTextOpacity: 0.74,
    posterTextColor: '#00ff99',
    posterTextGlitch: true,
    posterTextMode: 'blend',
    posterTextPanelAnchor: 'center',

    useDataOverlay: true,
    dataOverlayMode: 'random-codes',
    dataOverlayDensity: 18,
    dataOverlayFontSize: 9,
    dataOverlayOpacity: 0.28,
    dataOverlayColor: '#00ff99',

    useHudFrame: true,
    hudFrameStyle: 'scan-frame',
    hudFrameOpacity: 0.62,
    hudFrameColor: '#00ff99',

    useNoise: true,
    noiseAmount: 12,

    useScanlines: true,
    scanlineIntensity: 0.18
  }),

  createPreset('CONTACT FAILURE', {
    usePanelLayout: true,
    panelLayoutMode: 'contact-sheet',
    panelLayoutGap: 7,
    panelLayoutBorderWidth: 1,
    panelLayoutBorderColor: '#b8f7ff',
    panelLayoutBackgroundColor: '#010305',
    panelLayoutPanelOpacity: 1,
    panelLayoutRandomCrop: true,
    panelLayoutCropIntensity: 82,
    panelLayoutMirrorAlternate: true,

    useRegionalPalette: true,
    regionalPaletteMode: 'panel-layout-sync',
    regionalPaletteRandomizeZones: true,
    regionalPaletteRandomCellSize: 170,
    regionalPaletteZoneChaos: 68,
    regionalPaletteZones: [
      {
        startColor: '#020406',
        endColor: '#b8f7ff',
        steps: 4,
        invert: false
      },
      {
        startColor: '#050000',
        endColor: '#ff003c',
        steps: 4,
        invert: false
      },
      {
        startColor: '#000707',
        endColor: '#00ff99',
        steps: 4,
        invert: false
      },
      {
        startColor: '#080006',
        endColor: '#ff00cc',
        steps: 4,
        invert: false
      }
    ],

    usePixelSort: true,
    pixelSortDirection: 'horizontal',
    pixelSortMode: 'bright',
    pixelSortThreshold: 126,
    pixelSortAmount: 0.48,

    useCodecDamage: true,
    codecDamageBlockSize: 22,
    codecDamageAmount: 0.46,
    codecDamageChromaShift: 5,
    codecDamageColorDepth: 7,

    useDataOverlay: true,
    dataOverlayMode: 'image-info',
    dataOverlayDensity: 24,
    dataOverlayFontSize: 8,
    dataOverlayOpacity: 0.34,
    dataOverlayColor: '#b8f7ff',

    useNoise: true,
    noiseAmount: 14
  }),

  createPreset('DATAMOSH BROADSIDE', {
    usePanelLayout: true,
    panelLayoutMode: 'broken-archive-wall',
    panelLayoutGap: 10,
    panelLayoutBorderWidth: 1,
    panelLayoutBorderColor: '#ff00cc',
    panelLayoutBackgroundColor: '#070007',
    panelLayoutPanelOpacity: 1,
    panelLayoutRandomCrop: true,
    panelLayoutCropIntensity: 88,
    panelLayoutMirrorAlternate: true,

    usePalette: true,
    colorStart: '#050006',
    colorEnd: '#ff00cc',
    steps: 5,

    useGlitch: true,
    glitch: 22,
    glitchChaos: 76,
    glitchWidth: 64,
    glitchOverrideDither: false,
    edgeGlitchOnly: false,

    useCodecDamage: true,
    codecDamageBlockSize: 28,
    codecDamageAmount: 0.62,
    codecDamageChromaShift: 9,
    codecDamageColorDepth: 5,

    useChannelPacketLoss: true,
    channelPacketLossChannel: 'rgb',
    channelPacketLossBlockSize: 24,
    channelPacketLossAmount: 0.42,
    channelPacketLossShift: 28,

    useFrameEcho: true,
    frameEchoMode: 'horizontal',
    frameEchoCopies: 4,
    frameEchoOffset: 22,
    frameEchoDecay: 0.5,
    frameEchoJitter: 12,

    useMotionSmear: true,
    motionSmearDirection: 'horizontal',
    motionSmearLength: 72,
    motionSmearDecay: 0.68,
    motionSmearThreshold: 96,

    usePosterText: true,
    posterTextContent: 'DECAY',
    posterTextX: 50,
    posterTextY: 82,
    posterTextFont: 'arial-black',
    posterTextWeight: 900,
    posterTextSize: 112,
    posterTextTracking: 2,
    posterTextOpacity: 0.64,
    posterTextColor: '#ff00cc',
    posterTextGlitch: true,
    posterTextMode: 'blend',
    posterTextPanelAnchor: 'bottom',

    useChromatic: true,
    chromaticOffset: 8,

    useNoise: true,
    noiseAmount: 22
  }),

  createPreset('ORBITAL FILM STRIP', {
    usePanelLayout: true,
    panelLayoutMode: 'film-strip',
    panelLayoutGap: 6,
    panelLayoutBorderWidth: 1,
    panelLayoutBorderColor: '#d6ff00',
    panelLayoutBackgroundColor: '#050605',
    panelLayoutPanelOpacity: 1,
    panelLayoutRandomCrop: true,
    panelLayoutCropIntensity: 74,

    useSignalWaves: true,
    signalWavesMode: 'field-lines',
    signalWavesFrequency: 18,
    signalWavesAmplitude: 32,
    signalWavesDensity: 16,
    signalWavesOpacity: 0.58,
    signalWavesColor: '#d6ff00',
    signalWavesReactToImage: true,

    usePatternDither: true,
    patternDitherShape: 'circle',
    patternDitherScale: 18,
    patternDitherDensity: 64,
    patternDitherOpacity: 0.44,
    patternDitherColor: '#d6ff00',

    usePosterText: true,
    posterTextContent: 'ORBITAL',
    posterTextX: 50,
    posterTextY: 18,
    posterTextFont: 'consolas',
    posterTextWeight: 700,
    posterTextSize: 54,
    posterTextTracking: 12,
    posterTextOpacity: 0.56,
    posterTextColor: '#d6ff00',
    posterTextGlitch: false,
    posterTextPanelAnchor: 'top',

    useHudFrame: true,
    hudFrameStyle: 'targeting-frame',
    hudFrameOpacity: 0.58,
    hudFrameColor: '#d6ff00'
  }),

  createPreset('CROSSFEED MONITOR', {
    usePanelLayout: true,
    panelLayoutMode: 'cross-layout',
    panelLayoutGap: 9,
    panelLayoutBorderWidth: 1,
    panelLayoutBorderColor: '#00c8ff',
    panelLayoutBackgroundColor: '#020407',
    panelLayoutPanelOpacity: 1,
    panelLayoutRandomCrop: true,
    panelLayoutCropIntensity: 66,

    usePalette: true,
    colorStart: '#020407',
    colorEnd: '#00c8ff',
    steps: 6,

    usePixelSort: true,
    pixelSortDirection: 'vertical',
    pixelSortMode: 'dark',
    pixelSortThreshold: 92,
    pixelSortAmount: 0.42,

    useMotionSmear: true,
    motionSmearDirection: 'vertical',
    motionSmearLength: 48,
    motionSmearDecay: 0.48,
    motionSmearThreshold: 108,

    usePosterText: true,
    posterTextContent: 'CROSSFEED',
    posterTextX: 12,
    posterTextY: 50,
    posterTextVertical: true,
    posterTextFont: 'lucida-console',
    posterTextWeight: 700,
    posterTextSize: 44,
    posterTextTracking: 6,
    posterTextOpacity: 0.72,
    posterTextColor: '#00c8ff',
    posterTextGlitch: true,
    posterTextPanelAnchor: 'left',

    useDataOverlay: true,
    dataOverlayMode: 'coordinates',
    dataOverlayDensity: 16,
    dataOverlayFontSize: 9,
    dataOverlayOpacity: 0.28,
    dataOverlayColor: '#00c8ff',

    useScanlines: true,
    scanlineIntensity: 0.16
  }),

  createPreset('LUMA TEAR', {
    usePalette: true,
    colorStart: '#020103',
    colorEnd: '#d6ff00',
    steps: 5,

    useDither: true,
    ditherMode: 'ordered-bayer',
    threshold: 146,

    useLumaDisplacement: true,
    lumaDisplacementMode: 'split',
    lumaDisplacementAmount: 42,
    lumaDisplacementThreshold: 118,
    lumaDisplacementJitter: 11,

    useScanDrift: true,
    scanDriftDirection: 'horizontal',
    scanDriftAmount: 28,
    scanDriftBandSize: 14,
    scanDriftChaos: 0.48,

    useChromatic: true,
    chromaticOffset: 5,

    useNoise: true,
    noiseAmount: 18,

    useScanlines: true,
    scanlineIntensity: 0.2
  }),

  createPreset('SYNC SLIP', {
    usePsx: true,
    psxResolutionScale: 5,
    psxColorLevels: 7,
    psxWarpAmount: 3,
    psxJitterAmount: 4,
    psxDitherStrength: 0.52,
    psxBlockSize: 14,
    psxCompositeBlur: 1,
    psxChromaBleed: 2,

    useScanDrift: true,
    scanDriftDirection: 'vertical',
    scanDriftAmount: 52,
    scanDriftBandSize: 22,
    scanDriftChaos: 0.62,

    useFrameEcho: true,
    frameEchoMode: 'vertical',
    frameEchoCopies: 3,
    frameEchoOffset: 16,
    frameEchoDecay: 0.42,
    frameEchoJitter: 8,

    useDataOverlay: true,
    dataOverlayMode: 'warning',
    dataOverlayDensity: 18,
    dataOverlayFontSize: 10,
    dataOverlayOpacity: 0.32,
    dataOverlayColor: '#ff003c',

    useHudFrame: true,
    hudFrameStyle: 'corrupted-ui',
    hudFrameOpacity: 0.5,
    hudFrameColor: '#ff003c',
    hudFrameShowGrid: false,
    hudFrameShowLabels: true,
    hudFrameShowCornerMarks: true
  }),

  createPreset('PACKET GHOST', {
    usePalette: true,
    colorStart: '#000707',
    colorEnd: '#00c8ff',
    steps: 6,

    useCodecDamage: true,
    codecDamageBlockSize: 18,
    codecDamageAmount: 0.48,
    codecDamageChromaShift: 7,
    codecDamageColorDepth: 6,

    useChannelPacketLoss: true,
    channelPacketLossChannel: 'blue',
    channelPacketLossBlockSize: 18,
    channelPacketLossAmount: 0.56,
    channelPacketLossShift: 38,

    useFrameEcho: true,
    frameEchoMode: 'diagonal',
    frameEchoCopies: 5,
    frameEchoOffset: 18,
    frameEchoDecay: 0.46,
    frameEchoJitter: 16,

    useLumaDisplacement: true,
    lumaDisplacementMode: 'horizontal',
    lumaDisplacementAmount: 24,
    lumaDisplacementThreshold: 138,
    lumaDisplacementJitter: 6,

    usePosterText: true,
    posterTextContent: 'PACKET LOSS',
    posterTextX: 50,
    posterTextY: 12,
    posterTextFont: 'lucida-console',
    posterTextWeight: 700,
    posterTextSize: 44,
    posterTextTracking: 8,
    posterTextOpacity: 0.54,
    posterTextColor: '#00c8ff',
    posterTextGlitch: true,
    posterTextMode: 'blend'
  }),

  createPreset('BLACKBOX ECHO', {
    usePanelLayout: true,
    panelLayoutMode: 'center-diagnostics',
    panelLayoutGap: 8,
    panelLayoutBorderWidth: 1,
    panelLayoutBorderColor: '#00ff99',
    panelLayoutBackgroundColor: '#020403',
    panelLayoutPanelOpacity: 1,
    panelLayoutRandomCrop: true,
    panelLayoutCropIntensity: 64,
    panelLayoutMirrorAlternate: false,

    useSignalWaves: true,
    signalWavesMode: 'contour-pulse',
    signalWavesFrequency: 16,
    signalWavesAmplitude: 24,
    signalWavesDensity: 20,
    signalWavesOpacity: 0.44,
    signalWavesColor: '#00ff99',
    signalWavesReactToImage: true,

    useLumaDisplacement: true,
    lumaDisplacementMode: 'vertical',
    lumaDisplacementAmount: 28,
    lumaDisplacementThreshold: 104,
    lumaDisplacementJitter: 8,

    useMotionSmear: true,
    motionSmearDirection: 'horizontal',
    motionSmearLength: 42,
    motionSmearDecay: 0.46,
    motionSmearThreshold: 116,

    useDataOverlay: true,
    dataOverlayMode: 'image-info',
    dataOverlayDensity: 20,
    dataOverlayFontSize: 8,
    dataOverlayOpacity: 0.3,
    dataOverlayColor: '#00ff99',

    useHudFrame: true,
    hudFrameStyle: 'archive-frame',
    hudFrameOpacity: 0.64,
    hudFrameColor: '#00ff99'
  }),

  createPreset('SILHOUETTE CURRENT', {
    usePanelLayout: true,
    panelLayoutMode: 'broken-archive-wall',
    panelLayoutGap: 7,
    panelLayoutBorderWidth: 1,
    panelLayoutBorderColor: '#6ad8ff',
    panelLayoutBackgroundColor: '#010408',
    panelLayoutPanelOpacity: 1,
    panelLayoutRandomCrop: true,
    panelLayoutCropIntensity: 76,
    panelLayoutMirrorAlternate: true,

    usePalette: true,
    colorStart: '#010408',
    colorEnd: '#6ad8ff',
    steps: 6,

    useSignalWaves: true,
    signalWavesMode: 'contour-pulse',
    signalWavesFrequency: 28,
    signalWavesAmplitude: 54,
    signalWavesDensity: 11,
    signalWavesOpacity: 0.68,
    signalWavesColor: '#6ad8ff',
    signalWavesReactToImage: true,

    useLumaDisplacement: true,
    lumaDisplacementMode: 'split',
    lumaDisplacementAmount: 24,
    lumaDisplacementThreshold: 126,
    lumaDisplacementJitter: 7,

    useChannelPacketLoss: true,
    channelPacketLossChannel: 'blue',
    channelPacketLossBlockSize: 16,
    channelPacketLossAmount: 0.28,
    channelPacketLossShift: 20,

    usePosterText: true,
    posterTextContent: 'CURRENT',
    posterTextX: 50,
    posterTextY: 82,
    posterTextFont: 'bahnschrift',
    posterTextWeight: 900,
    posterTextSize: 92,
    posterTextTracking: 5,
    posterTextOpacity: 0.66,
    posterTextColor: '#6ad8ff',
    posterTextGlitch: true,
    posterTextMode: 'blend',
    posterTextPanelAnchor: 'bottom',

    useDataOverlay: true,
    dataOverlayMode: 'image-info',
    dataOverlayDensity: 18,
    dataOverlayFontSize: 8,
    dataOverlayOpacity: 0.26,
    dataOverlayColor: '#6ad8ff',

    useHudFrame: true,
    hudFrameStyle: 'archive-frame',
    hudFrameOpacity: 0.5,
    hudFrameColor: '#6ad8ff',

    useNoise: true,
    noiseAmount: 10
  }),

  createPreset('MAGNETIC CONTACT', {
    usePanelLayout: true,
    panelLayoutMode: 'center-diagnostics',
    panelLayoutGap: 10,
    panelLayoutBorderWidth: 1,
    panelLayoutBorderColor: '#d6ff00',
    panelLayoutBackgroundColor: '#050704',
    panelLayoutPanelOpacity: 1,
    panelLayoutRandomCrop: true,
    panelLayoutCropIntensity: 68,

    useSignalWaves: true,
    signalWavesMode: 'field-lines',
    signalWavesFrequency: 36,
    signalWavesAmplitude: 46,
    signalWavesDensity: 12,
    signalWavesOpacity: 0.64,
    signalWavesColor: '#d6ff00',
    signalWavesReactToImage: true,

    usePixelSort: true,
    pixelSortDirection: 'vertical',
    pixelSortMode: 'bright',
    pixelSortThreshold: 134,
    pixelSortAmount: 0.34,

    usePatternDither: true,
    patternDitherShape: 'dot',
    patternDitherScale: 13,
    patternDitherDensity: 52,
    patternDitherOpacity: 0.26,
    patternDitherColor: '#d6ff00',

    usePosterText: true,
    posterTextContent: 'CONTACT',
    posterTextX: 50,
    posterTextY: 14,
    posterTextFont: 'consolas',
    posterTextWeight: 800,
    posterTextSize: 50,
    posterTextTracking: 12,
    posterTextOpacity: 0.7,
    posterTextColor: '#d6ff00',
    posterTextGlitch: true,
    posterTextMode: 'blend',
    posterTextPanelAnchor: 'main',

    useDataOverlay: true,
    dataOverlayMode: 'coordinates',
    dataOverlayDensity: 20,
    dataOverlayFontSize: 9,
    dataOverlayOpacity: 0.3,
    dataOverlayColor: '#d6ff00',

    useHudFrame: true,
    hudFrameStyle: 'targeting-frame',
    hudFrameOpacity: 0.54,
    hudFrameColor: '#d6ff00',

    useScanlines: true,
    scanlineIntensity: 0.14
  }),

  createPreset('NULL DEPTH CHART', {
    usePanelLayout: true,
    panelLayoutMode: 'contact-sheet',
    panelLayoutGap: 6,
    panelLayoutBorderWidth: 1,
    panelLayoutBorderColor: '#ff00cc',
    panelLayoutBackgroundColor: '#070007',
    panelLayoutPanelOpacity: 1,
    panelLayoutRandomCrop: true,
    panelLayoutCropIntensity: 84,
    panelLayoutMirrorAlternate: true,

    usePalette: true,
    colorStart: '#050006',
    colorEnd: '#ff00cc',
    steps: 5,

    useSignalWaves: true,
    signalWavesMode: 'depth-scan',
    signalWavesFrequency: 22,
    signalWavesAmplitude: 58,
    signalWavesDensity: 10,
    signalWavesOpacity: 0.7,
    signalWavesColor: '#ff00cc',
    signalWavesReactToImage: true,

    useLumaDisplacement: true,
    lumaDisplacementMode: 'split',
    lumaDisplacementAmount: 34,
    lumaDisplacementThreshold: 96,
    lumaDisplacementJitter: 12,

    useFrameEcho: true,
    frameEchoMode: 'diagonal',
    frameEchoCopies: 3,
    frameEchoOffset: 14,
    frameEchoDecay: 0.38,
    frameEchoJitter: 10,

    usePosterText: true,
    posterTextContent: 'NULL\nDEPTH',
    posterTextX: 50,
    posterTextY: 50,
    posterTextVertical: true,
    posterTextFont: 'arial-black',
    posterTextWeight: 900,
    posterTextSize: 46,
    posterTextTracking: 4,
    posterTextOpacity: 0.62,
    posterTextColor: '#ff00cc',
    posterTextGlitch: true,
    posterTextMode: 'blend',
    posterTextPanelAnchor: 'left',

    useScanlines: true,
    scanlineIntensity: 0.22,

    useNoise: true,
    noiseAmount: 18
  })
];
