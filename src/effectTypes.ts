import type {
  Dispatch,
  SetStateAction
} from 'react';

import type { ArtifactMaskMode } from './effects/artifactMask';
import type { ChannelPacketLossChannel } from './effects/channelPacketLoss';
import type { CodecDamageMode } from './effects/codecDamage';
import type { DitherMode } from './effects/dither';
import type { FrameEchoMode } from './effects/frameEcho';
import type { DataOverlayMode } from './effects/dataOverlay';
import type { HudFrameStyle } from './effects/hudFrame';
import type { LumaDisplacementMode } from './effects/lumaDisplacement';
import type { MachineViewMode } from './effects/machineView';
import type { MotionSmearDirection } from './effects/motionSmear';
import type { PanelLayoutMode } from './effects/panelLayout';
import type {
  PosterTextFont,
  PosterTextLayout,
  PosterTextMode,
  PosterTextPanelAnchor,
} from './effects/posterText';
import type { PatternDitherShape } from './effects/patternDither';
import type {
  RegionalPaletteMode,
  RegionalPaletteZone
} from './effects/regionalPalette';
import type { ScanDriftDirection } from './effects/scanDrift';
import type { SignalWavesMode } from './effects/signalWaves';

type Setter<T> = Dispatch<SetStateAction<T>>;

export type ArtifactMaskTarget =
  | 'all-distortion'
  | 'pixel-sort'
  | 'glitch'
  | 'signal-waves';

export type PixelSortDirection = 'horizontal' | 'vertical';
export type PixelSortMode = 'bright' | 'dark' | 'all';
export type AsciiMode = 'overlay' | 'replace';

export type EffectValues = {
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
  pixelSortDirection: PixelSortDirection;
  pixelSortMode: PixelSortMode;
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
  asciiMode: AsciiMode;
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
};

export type EffectsSnapshot = EffectValues & {
  selectedPresetName: string;
};

export type EffectSetters = {
  setUsePixelation: Setter<boolean>;
  setPixelSize: Setter<number>;

  setUsePsx: Setter<boolean>;
  setPsxResolutionScale: Setter<number>;
  setPsxColorLevels: Setter<number>;
  setPsxWarpAmount: Setter<number>;
  setPsxJitterAmount: Setter<number>;
  setPsxDitherStrength: Setter<number>;
  setPsxBlockSize: Setter<number>;
  setPsxCompositeBlur: Setter<number>;
  setPsxChromaBleed: Setter<number>;

  setUsePixelSort: Setter<boolean>;
  setPixelSortDirection: Setter<PixelSortDirection>;
  setPixelSortMode: Setter<PixelSortMode>;
  setPixelSortThreshold: Setter<number>;
  setPixelSortAmount: Setter<number>;

  setUsePalette: Setter<boolean>;
  setColorStart: Setter<string>;
  setColorEnd: Setter<string>;
  setSteps: Setter<number>;
  setSwapPaletteColors: Setter<boolean>;

  setUseRegionalPalette: Setter<boolean>;
  setRegionalPaletteMode: Setter<RegionalPaletteMode>;
  updateRegionalPaletteZone: (
    index: number,
    patch: Partial<RegionalPaletteZone>
  ) => void;
  setRegionalPaletteRandomizeZones: Setter<boolean>;
  setRegionalPaletteRandomCellSize: Setter<number>;
  setRegionalPaletteZoneChaos: Setter<number>;
  randomizeRegionalPaletteZoneMap: () => void;

  setUseDither: Setter<boolean>;
  setDitherMode: Setter<DitherMode>;
  setThreshold: Setter<number>;

  setUseArtifactMask: Setter<boolean>;
  setArtifactMaskMode: Setter<ArtifactMaskMode>;
  setArtifactMaskTarget: Setter<ArtifactMaskTarget>;
  setArtifactMaskThreshold: Setter<number>;

  setUseGlitch: Setter<boolean>;
  setGlitch: Setter<number>;
  setGlitchChaos: Setter<number>;
  setGlitchWidth: Setter<number>;
  setGlitchOverrideDither: Setter<boolean>;
  setEdgeGlitchOnly: Setter<boolean>;

  setUseCodecDamage: Setter<boolean>;
  setCodecDamageMode: Setter<CodecDamageMode>;
  setCodecDamageBlockSize: Setter<number>;
  setCodecDamageAmount: Setter<number>;
  setCodecDamageChromaShift: Setter<number>;
  setCodecDamageColorDepth: Setter<number>;

  setUseChannelPacketLoss: Setter<boolean>;
  setChannelPacketLossChannel: Setter<ChannelPacketLossChannel>;
  setChannelPacketLossBlockSize: Setter<number>;
  setChannelPacketLossAmount: Setter<number>;
  setChannelPacketLossShift: Setter<number>;

  setUseFrameEcho: Setter<boolean>;
  setFrameEchoMode: Setter<FrameEchoMode>;
  setFrameEchoCopies: Setter<number>;
  setFrameEchoOffset: Setter<number>;
  setFrameEchoDecay: Setter<number>;
  setFrameEchoJitter: Setter<number>;

  setUseLumaDisplacement: Setter<boolean>;
  setLumaDisplacementMode: Setter<LumaDisplacementMode>;
  setLumaDisplacementAmount: Setter<number>;
  setLumaDisplacementThreshold: Setter<number>;
  setLumaDisplacementJitter: Setter<number>;

  setUseScanDrift: Setter<boolean>;
  setScanDriftDirection: Setter<ScanDriftDirection>;
  setScanDriftAmount: Setter<number>;
  setScanDriftBandSize: Setter<number>;
  setScanDriftChaos: Setter<number>;

  setUseMotionSmear: Setter<boolean>;
  setMotionSmearDirection: Setter<MotionSmearDirection>;
  setMotionSmearLength: Setter<number>;
  setMotionSmearDecay: Setter<number>;
  setMotionSmearThreshold: Setter<number>;

  setUseChromatic: Setter<boolean>;
  setChromaticOffset: Setter<number>;

  setUseAscii: Setter<boolean>;
  setAsciiCellSize: Setter<number>;
  setAsciiOpacity: Setter<number>;
  setAsciiMode: Setter<AsciiMode>;
  setAsciiColor: Setter<string>;

  setUsePatternDither: Setter<boolean>;
  setPatternDitherShape: Setter<PatternDitherShape>;
  setPatternDitherScale: Setter<number>;
  setPatternDitherDensity: Setter<number>;
  setPatternDitherOpacity: Setter<number>;
  setPatternDitherColor: Setter<string>;
  setPatternDitherBackgroundColor: Setter<string>;
  setPatternDitherInvert: Setter<boolean>;
  setPatternDitherReplaceImage: Setter<boolean>;

  setUseSignalWaves: Setter<boolean>;
  setSignalWavesMode: Setter<SignalWavesMode>;
  setSignalWavesFrequency: Setter<number>;
  setSignalWavesAmplitude: Setter<number>;
  setSignalWavesDensity: Setter<number>;
  setSignalWavesOpacity: Setter<number>;
  setSignalWavesColor: Setter<string>;
  setSignalWavesBackgroundColor: Setter<string>;
  setSignalWavesReplaceImage: Setter<boolean>;
  setSignalWavesReactToImage: Setter<boolean>;

  setUsePanelLayout: Setter<boolean>;
  setPanelLayoutMode: Setter<PanelLayoutMode>;
  setPanelLayoutGap: Setter<number>;
  setPanelLayoutBorderWidth: Setter<number>;
  setPanelLayoutBorderColor: Setter<string>;
  setPanelLayoutBackgroundColor: Setter<string>;
  setPanelLayoutPanelOpacity: Setter<number>;
  setPanelLayoutRandomCrop: Setter<boolean>;
  setPanelLayoutCropIntensity: Setter<number>;
  setPanelLayoutPanX: Setter<number>;
  setPanelLayoutPanY: Setter<number>;
  setPanelLayoutMirrorAlternate: Setter<boolean>;

  setUseNoise: Setter<boolean>;
  setNoiseAmount: Setter<number>;

  setUseScanlines: Setter<boolean>;
  setScanlineIntensity: Setter<number>;

  setUseDataOverlay: Setter<boolean>;
  setDataOverlayMode: Setter<DataOverlayMode>;
  setDataOverlayDensity: Setter<number>;
  setDataOverlayFontSize: Setter<number>;
  setDataOverlayOpacity: Setter<number>;
  setDataOverlayColor: Setter<string>;
  setDataOverlayCustomText: Setter<string>;

  setUseMachineView: Setter<boolean>;
  setMachineViewMode: Setter<MachineViewMode>;
  setMachineViewCount: Setter<number>;
  setMachineViewSensitivity: Setter<number>;
  setMachineViewOpacity: Setter<number>;
  setMachineViewColor: Setter<string>;
  setMachineViewShowLabels: Setter<boolean>;

  setUsePosterText: Setter<boolean>;
  setPosterTextContent: Setter<string>;
  setPosterTextSubtitle: Setter<string>;
  setPosterTextCaption: Setter<string>;
  setPosterTextLayout: Setter<PosterTextLayout>;
  setPosterTextX: Setter<number>;
  setPosterTextY: Setter<number>;
  setPosterTextVertical: Setter<boolean>;
  setPosterTextFont: Setter<PosterTextFont>;
  setPosterTextWeight: Setter<number>;
  setPosterTextSize: Setter<number>;
  setPosterTextTracking: Setter<number>;
  setPosterTextOpacity: Setter<number>;
  setPosterTextColor: Setter<string>;
  setPosterTextGlitch: Setter<boolean>;
  setPosterTextMode: Setter<PosterTextMode>;
  setPosterTextPanelAnchor: Setter<PosterTextPanelAnchor>;

  setUseHudFrame: Setter<boolean>;
  setHudFrameStyle: Setter<HudFrameStyle>;
  setHudFrameOpacity: Setter<number>;
  setHudFrameColor: Setter<string>;
  setHudFrameShowGrid: Setter<boolean>;
  setHudFrameShowLabels: Setter<boolean>;
  setHudFrameShowCornerMarks: Setter<boolean>;
  setHudFrameSafeArea: Setter<number>;
};

export type EffectStateSetters = EffectSetters & {
  setSelectedPresetName: Setter<string>;
  setRegionalPaletteZones: Setter<RegionalPaletteZone[]>;
  setRegionalPaletteZoneSeed: Setter<number>;
};
