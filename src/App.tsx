import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type CSSProperties
} from 'react';

import { PRESETS, type EffectPreset } from './presets';
import {
  applyEffectPreset,
  clearEffectSettings,
  createEffectsSnapshot as buildEffectsSnapshot,
  DEFAULT_REGIONAL_PALETTE_ZONES,
  restoreEffectsSnapshot as applyEffectsSnapshot
} from './effectState';
import type {
  EffectSetters,
  EffectStateSetters,
  EffectValues,
  EffectsSnapshot,
  AsciiMode,
  PixelSortDirection,
  PixelSortMode
} from './effectTypes';
import type { ChannelPacketLossChannel } from './effects/channelPacketLoss';
import type { DitherMode } from './effects/dither';
import type { DataOverlayMode } from './effects/dataOverlay';
import type { FrameEchoMode } from './effects/frameEcho';
import type { ArtifactMaskMode } from './effects/artifactMask';
import type { HudFrameStyle } from './effects/hudFrame';
import type { LumaDisplacementMode } from './effects/lumaDisplacement';
import type { MotionSmearDirection } from './effects/motionSmear';
import type { PanelLayoutMode } from './effects/panelLayout';
import type {
  PosterTextFont,
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
import { processImage as processCanvasImage } from './imageProcessing';
import { createSeed } from './utils/random';

import { UiCheckbox } from './components/UiCheckbox';
import { UiSlider } from './components/UiSlider';
import { UiSelect } from './components/UiSelect';
import { UiColorInput } from './components/UiColorInput';

type ExportFormat = 'png' | 'jpeg';
type ExportDpi = 72 | 150 | 300;
type ExportScale = 1 | 2 | 3 | 4;

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewAreaRef = useRef<HTMLDivElement>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  const [originalImage, setOriginalImage] =
    useState<HTMLImageElement | null>(null);

  const [selectedFileName, setSelectedFileName] = useState('');

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [canPanPreview, setCanPanPreview] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const [selectedPresetName, setSelectedPresetName] =
    useState('CUSTOM');

  const [lastEffectsSnapshot, setLastEffectsSnapshot] =
    useState<EffectsSnapshot | null>(null);

  const [useSeed, setUseSeed] = useState(false);
  const [seed, setSeed] = useState(123456);
  const [liveSeed, setLiveSeed] = useState(createSeed());

  const [exportFormat, setExportFormat] =
    useState<ExportFormat>('png');

  const [exportDpi, setExportDpi] =
    useState<ExportDpi>(72);
  const [exportScale, setExportScale] =
    useState<ExportScale>(1);
  const [
    exportTransparentBackground,
    setExportTransparentBackground
  ] = useState(false);

  const [usePixelation, setUsePixelation] = useState(false);
  const [pixelSize, setPixelSize] = useState(4);

  const [usePsx, setUsePsx] = useState(false);
  const [psxResolutionScale, setPsxResolutionScale] =
    useState(4);
  const [psxColorLevels, setPsxColorLevels] = useState(8);
  const [psxWarpAmount, setPsxWarpAmount] = useState(2);
  const [psxJitterAmount, setPsxJitterAmount] = useState(2);
  const [psxDitherStrength, setPsxDitherStrength] =
    useState(0.45);
  const [psxBlockSize, setPsxBlockSize] = useState(12);
  const [psxCompositeBlur, setPsxCompositeBlur] =
    useState(0.8);
  const [psxChromaBleed, setPsxChromaBleed] = useState(1);

  const [usePixelSort, setUsePixelSort] = useState(false);
  const [pixelSortDirection, setPixelSortDirection] =
    useState<PixelSortDirection>('horizontal');
  const [pixelSortMode, setPixelSortMode] =
    useState<PixelSortMode>('bright');
  const [pixelSortThreshold, setPixelSortThreshold] =
    useState(160);
  const [pixelSortAmount, setPixelSortAmount] =
    useState(0.75);

  const [usePalette, setUsePalette] = useState(false);
  const [colorStart, setColorStart] = useState('#000000');
  const [colorEnd, setColorEnd] = useState('#00ff00');
  const [steps, setSteps] = useState(4);
  const [swapPaletteColors, setSwapPaletteColors] =
    useState(false);

  const [useRegionalPalette, setUseRegionalPalette] =
    useState(false);

  const [
    regionalPaletteMode,
    setRegionalPaletteMode
  ] = useState<RegionalPaletteMode>('random-zones');

  const [
    regionalPaletteZones,
    setRegionalPaletteZones
  ] = useState<RegionalPaletteZone[]>(
    DEFAULT_REGIONAL_PALETTE_ZONES.map((zone) => ({
      ...zone
    }))
  );
  const [
    regionalPaletteRandomizeZones,
    setRegionalPaletteRandomizeZones
  ] = useState(false);

  const [
    regionalPaletteRandomCellSize,
    setRegionalPaletteRandomCellSize
  ] = useState(180);

  const [
    regionalPaletteZoneChaos,
    setRegionalPaletteZoneChaos
  ] = useState(55);

  const [
    regionalPaletteZoneSeed,
    setRegionalPaletteZoneSeed
  ] = useState(12345);

  const updateRegionalPaletteZone = useCallback(
    (
      index: number,
      patch: Partial<RegionalPaletteZone>
    ) => {
      setRegionalPaletteZones((current) =>
        current.map((zone, i) =>
          i === index
            ? {
                ...zone,
                ...patch
              }
            : zone
        )
      );
    },
    []
  );
 const randomizeRegionalPaletteZoneMap = useCallback(() => {
    setRegionalPaletteZoneSeed(createSeed());
  }, []);

  const [useDither, setUseDither] = useState(false);
  const [ditherMode, setDitherMode] =
    useState<DitherMode>('floyd-steinberg');
  const [threshold, setThreshold] = useState(255);

  const [useArtifactMask, setUseArtifactMask] =
    useState(false);
  const [artifactMaskMode, setArtifactMaskMode] =
    useState<ArtifactMaskMode>('all');
  const [
    artifactMaskThreshold,
    setArtifactMaskThreshold
  ] = useState(128);

  const [useGlitch, setUseGlitch] = useState(false);
  const [glitch, setGlitch] = useState(0);
  const [glitchChaos, setGlitchChaos] = useState(0);
  const [glitchWidth, setGlitchWidth] = useState(100);
  const [glitchOverrideDither, setGlitchOverrideDither] =
    useState(false);
  const [edgeGlitchOnly, setEdgeGlitchOnly] = useState(true);

  const [useCodecDamage, setUseCodecDamage] =
    useState(false);
  const [
    codecDamageBlockSize,
    setCodecDamageBlockSize
  ] = useState(18);
  const [codecDamageAmount, setCodecDamageAmount] =
    useState(0.35);
  const [
    codecDamageChromaShift,
    setCodecDamageChromaShift
  ] = useState(3);
  const [
    codecDamageColorDepth,
    setCodecDamageColorDepth
  ] = useState(8);

  const [
    useChannelPacketLoss,
    setUseChannelPacketLoss
  ] = useState(false);
  const [
    channelPacketLossChannel,
    setChannelPacketLossChannel
  ] = useState<ChannelPacketLossChannel>('rgb');
  const [
    channelPacketLossBlockSize,
    setChannelPacketLossBlockSize
  ] = useState(20);
  const [
    channelPacketLossAmount,
    setChannelPacketLossAmount
  ] = useState(0.35);
  const [
    channelPacketLossShift,
    setChannelPacketLossShift
  ] = useState(12);

  const [useFrameEcho, setUseFrameEcho] = useState(false);
  const [frameEchoMode, setFrameEchoMode] =
    useState<FrameEchoMode>('horizontal');
  const [frameEchoCopies, setFrameEchoCopies] = useState(3);
  const [frameEchoOffset, setFrameEchoOffset] = useState(18);
  const [frameEchoDecay, setFrameEchoDecay] = useState(0.55);
  const [frameEchoJitter, setFrameEchoJitter] = useState(4);

  const [
    useLumaDisplacement,
    setUseLumaDisplacement
  ] = useState(false);
  const [
    lumaDisplacementMode,
    setLumaDisplacementMode
  ] = useState<LumaDisplacementMode>('split');
  const [
    lumaDisplacementAmount,
    setLumaDisplacementAmount
  ] = useState(18);
  const [
    lumaDisplacementThreshold,
    setLumaDisplacementThreshold
  ] = useState(128);
  const [
    lumaDisplacementJitter,
    setLumaDisplacementJitter
  ] = useState(3);

  const [useScanDrift, setUseScanDrift] =
    useState(false);
  const [scanDriftDirection, setScanDriftDirection] =
    useState<ScanDriftDirection>('horizontal');
  const [scanDriftAmount, setScanDriftAmount] =
    useState(18);
  const [scanDriftBandSize, setScanDriftBandSize] =
    useState(18);
  const [scanDriftChaos, setScanDriftChaos] =
    useState(0.35);

  const [useMotionSmear, setUseMotionSmear] =
    useState(false);
  const [
    motionSmearDirection,
    setMotionSmearDirection
  ] = useState<MotionSmearDirection>('horizontal');
  const [motionSmearLength, setMotionSmearLength] =
    useState(28);
  const [motionSmearDecay, setMotionSmearDecay] =
    useState(0.55);
  const [
    motionSmearThreshold,
    setMotionSmearThreshold
  ] = useState(128);

  const [useChromatic, setUseChromatic] = useState(false);
  const [chromaticOffset, setChromaticOffset] = useState(3);

  const [useAscii, setUseAscii] = useState(false);
  const [asciiCellSize, setAsciiCellSize] = useState(12);
  const [asciiOpacity, setAsciiOpacity] = useState(0.5);
  const [asciiMode, setAsciiMode] =
    useState<'overlay' | 'replace'>('overlay');
  const [asciiColor, setAsciiColor] = useState('#00ff99');

  const [usePatternDither, setUsePatternDither] =
    useState(false);
  const [patternDitherShape, setPatternDitherShape] =
    useState<PatternDitherShape>('dot');
  const [patternDitherScale, setPatternDitherScale] =
    useState(12);
  const [patternDitherDensity, setPatternDitherDensity] =
    useState(100);
  const [patternDitherOpacity, setPatternDitherOpacity] =
    useState(0.9);
  const [patternDitherColor, setPatternDitherColor] =
    useState('#00ff99');
  const [
    patternDitherBackgroundColor,
    setPatternDitherBackgroundColor
  ] = useState('#050505');
  const [patternDitherInvert, setPatternDitherInvert] =
    useState(false);
  const [
    patternDitherReplaceImage,
    setPatternDitherReplaceImage
  ] = useState(false);

  const [useDataOverlay, setUseDataOverlay] =
    useState(false);
  const [dataOverlayMode, setDataOverlayMode] =
    useState<DataOverlayMode>('random-codes');
  const [dataOverlayDensity, setDataOverlayDensity] =
    useState(18);
  const [dataOverlayFontSize, setDataOverlayFontSize] =
    useState(11);
  const [dataOverlayOpacity, setDataOverlayOpacity] =
    useState(0.45);
  const [dataOverlayColor, setDataOverlayColor] =
    useState('#00ff99');
  const [dataOverlayCustomText, setDataOverlayCustomText] =
    useState('SIGNAL UNSTABLE');

  const [usePosterText, setUsePosterText] = useState(false);
  const [posterTextContent, setPosterTextContent] =
    useState('SIGNAL DECAY');
  const [posterTextX, setPosterTextX] = useState(50);
  const [posterTextY, setPosterTextY] = useState(50);
  const [posterTextVertical, setPosterTextVertical] =
    useState(false);
  const [posterTextFont, setPosterTextFont] =
    useState<PosterTextFont>('consolas');
  const [posterTextWeight, setPosterTextWeight] =
    useState(700);
  const [posterTextSize, setPosterTextSize] = useState(88);
  const [posterTextTracking, setPosterTextTracking] =
    useState(4);
  const [posterTextOpacity, setPosterTextOpacity] =
    useState(0.75);
  const [posterTextColor, setPosterTextColor] =
    useState('#00ff99');
  const [posterTextGlitch, setPosterTextGlitch] =
    useState(false);
  const [posterTextMode, setPosterTextMode] =
    useState<PosterTextMode>('blend');
  const [
    posterTextPanelAnchor,
    setPosterTextPanelAnchor
  ] = useState<PosterTextPanelAnchor>('free');

  const [useHudFrame, setUseHudFrame] = useState(false);
  const [hudFrameStyle, setHudFrameStyle] =
    useState<HudFrameStyle>('scan-frame');
  const [hudFrameOpacity, setHudFrameOpacity] =
    useState(0.75);
  const [hudFrameColor, setHudFrameColor] =
    useState('#00ff99');
  const [hudFrameShowGrid, setHudFrameShowGrid] =
    useState(true);
  const [hudFrameShowLabels, setHudFrameShowLabels] =
    useState(true);
  const [
    hudFrameShowCornerMarks,
    setHudFrameShowCornerMarks
  ] = useState(true);
  const [hudFrameSafeArea, setHudFrameSafeArea] =
    useState(3);

  const [useSignalWaves, setUseSignalWaves] =
    useState(false);
  const [signalWavesMode, setSignalWavesMode] =
    useState<SignalWavesMode>('horizontal');
  const [signalWavesFrequency, setSignalWavesFrequency] =
    useState(12);
  const [signalWavesAmplitude, setSignalWavesAmplitude] =
    useState(26);
  const [signalWavesDensity, setSignalWavesDensity] =
    useState(18);
  const [signalWavesOpacity, setSignalWavesOpacity] =
    useState(0.65);
  const [signalWavesColor, setSignalWavesColor] =
    useState('#00ff99');
  const [
    signalWavesBackgroundColor,
    setSignalWavesBackgroundColor
  ] = useState('#050505');
  const [
    signalWavesReplaceImage,
    setSignalWavesReplaceImage
  ] = useState(false);
  const [
    signalWavesReactToImage,
    setSignalWavesReactToImage
  ] = useState(true);

  const [usePanelLayout, setUsePanelLayout] =
    useState(false);
  const [panelLayoutMode, setPanelLayoutMode] =
    useState<PanelLayoutMode>('side-panel');
  const [panelLayoutGap, setPanelLayoutGap] = useState(10);
  const [
    panelLayoutBorderWidth,
    setPanelLayoutBorderWidth
  ] = useState(1);
  const [
    panelLayoutBorderColor,
    setPanelLayoutBorderColor
  ] = useState('#00ff99');
  const [
    panelLayoutBackgroundColor,
    setPanelLayoutBackgroundColor
  ] = useState('#050505');
  const [
    panelLayoutPanelOpacity,
    setPanelLayoutPanelOpacity
  ] = useState(1);
  const [
    panelLayoutRandomCrop,
    setPanelLayoutRandomCrop
  ] = useState(true);
  const [
    panelLayoutCropIntensity,
    setPanelLayoutCropIntensity
  ] = useState(55);
  const [panelLayoutPanX, setPanelLayoutPanX] = useState(0);
  const [panelLayoutPanY, setPanelLayoutPanY] = useState(0);
  const [
    panelLayoutMirrorAlternate,
    setPanelLayoutMirrorAlternate
  ] = useState(false);

  const [useNoise, setUseNoise] = useState(false);
  const [noiseAmount, setNoiseAmount] = useState(15);

  const [useScanlines, setUseScanlines] = useState(false);
  const [scanlineIntensity, setScanlineIntensity] =
    useState(0.2);

  const sectionStyle = useMemo(
    () => ({
      marginTop: 14,
      padding: 12,
      background: '#090909',
      border: '1px solid #1c1c1c',
      borderRadius: 0
    }),
    []
  );

  const sliderLabelStyle = useMemo<CSSProperties>(
    () => ({
      marginTop: 18,
      marginBottom: 6,
      fontSize: 11,
      letterSpacing: 2,
      color: '#7c7c7c',
      lineHeight: '14px',
      position: 'relative',
      zIndex: 1
    }),
    []
  );

  const buttonStyle = useMemo(
    () => ({
      background: '#07140d',
      color: '#00ff99',
      border: '1px solid #164d34',
      padding: 10,
      cursor: 'pointer',
      fontFamily: "'Datatype', monospace",
      borderRadius: 0
    }),
    []
  );

  const activeButtonStyle = useMemo(
    () => ({
      background: '#00ff99',
      color: '#050505',
      border: '1px solid #00ff99',
      padding: 10,
      cursor: 'pointer',
      fontFamily: "'Datatype', monospace",
      borderRadius: 0,
      fontWeight: 700
    }),
    []
  );

  const imageSizeInfo = useMemo(() => {
    if (!originalImage) return null;

    const scale = (exportDpi / 72) * exportScale;

    return {
      sourceWidth: originalImage.width,
      sourceHeight: originalImage.height,
      exportWidth: Math.round(originalImage.width * scale),
      exportHeight: Math.round(originalImage.height * scale)
    };
  }, [originalImage, exportDpi, exportScale]);

  const activeSeed = useSeed ? seed : liveSeed;

  const effectValues = useMemo<EffectValues>(
    () => ({
      usePixelation,
      pixelSize,

      usePsx,
      psxResolutionScale,
      psxColorLevels,
      psxWarpAmount,
      psxJitterAmount,
      psxDitherStrength,
      psxBlockSize,
      psxCompositeBlur,
      psxChromaBleed,

      usePixelSort,
      pixelSortDirection,
      pixelSortMode,
      pixelSortThreshold,
      pixelSortAmount,

      usePalette,
      colorStart,
      colorEnd,
      steps,
      swapPaletteColors,

      useRegionalPalette,
      regionalPaletteMode,
      regionalPaletteZones,
      regionalPaletteRandomizeZones,
      regionalPaletteRandomCellSize,
      regionalPaletteZoneChaos,
      regionalPaletteZoneSeed,

      useDither,
      ditherMode,
      threshold,

      useArtifactMask,
      artifactMaskMode,
      artifactMaskThreshold,

      useGlitch,
      glitch,
      glitchChaos,
      glitchWidth,
      glitchOverrideDither,
      edgeGlitchOnly,

      useCodecDamage,
      codecDamageBlockSize,
      codecDamageAmount,
      codecDamageChromaShift,
      codecDamageColorDepth,

      useChannelPacketLoss,
      channelPacketLossChannel,
      channelPacketLossBlockSize,
      channelPacketLossAmount,
      channelPacketLossShift,

      useFrameEcho,
      frameEchoMode,
      frameEchoCopies,
      frameEchoOffset,
      frameEchoDecay,
      frameEchoJitter,

      useLumaDisplacement,
      lumaDisplacementMode,
      lumaDisplacementAmount,
      lumaDisplacementThreshold,
      lumaDisplacementJitter,

      useScanDrift,
      scanDriftDirection,
      scanDriftAmount,
      scanDriftBandSize,
      scanDriftChaos,

      useMotionSmear,
      motionSmearDirection,
      motionSmearLength,
      motionSmearDecay,
      motionSmearThreshold,

      useChromatic,
      chromaticOffset,

      useAscii,
      asciiCellSize,
      asciiOpacity,
      asciiMode,
      asciiColor,

      usePatternDither,
      patternDitherShape,
      patternDitherScale,
      patternDitherDensity,
      patternDitherOpacity,
      patternDitherColor,
      patternDitherBackgroundColor,
      patternDitherInvert,
      patternDitherReplaceImage,

      useSignalWaves,
      signalWavesMode,
      signalWavesFrequency,
      signalWavesAmplitude,
      signalWavesDensity,
      signalWavesOpacity,
      signalWavesColor,
      signalWavesBackgroundColor,
      signalWavesReplaceImage,
      signalWavesReactToImage,

      usePanelLayout,
      panelLayoutMode,
      panelLayoutGap,
      panelLayoutBorderWidth,
      panelLayoutBorderColor,
      panelLayoutBackgroundColor,
      panelLayoutPanelOpacity,
      panelLayoutRandomCrop,
      panelLayoutCropIntensity,
      panelLayoutPanX,
      panelLayoutPanY,
      panelLayoutMirrorAlternate,

      useNoise,
      noiseAmount,

      useScanlines,
      scanlineIntensity,

      useDataOverlay,
      dataOverlayMode,
      dataOverlayDensity,
      dataOverlayFontSize,
      dataOverlayOpacity,
      dataOverlayColor,
      dataOverlayCustomText,

      usePosterText,
      posterTextContent,
      posterTextX,
      posterTextY,
      posterTextVertical,
      posterTextFont,
      posterTextWeight,
      posterTextSize,
      posterTextTracking,
      posterTextOpacity,
      posterTextColor,
      posterTextGlitch,
      posterTextMode,
      posterTextPanelAnchor,

      useHudFrame,
      hudFrameStyle,
      hudFrameOpacity,
      hudFrameColor,
      hudFrameShowGrid,
      hudFrameShowLabels,
      hudFrameShowCornerMarks,
      hudFrameSafeArea
    }),
    [
      usePixelation,
      pixelSize,
      usePsx,
      psxResolutionScale,
      psxColorLevels,
      psxWarpAmount,
      psxJitterAmount,
      psxDitherStrength,
      psxBlockSize,
      psxCompositeBlur,
      psxChromaBleed,
      usePixelSort,
      pixelSortDirection,
      pixelSortMode,
      pixelSortThreshold,
      pixelSortAmount,
      usePalette,
      colorStart,
      colorEnd,
      steps,
      swapPaletteColors,
      useRegionalPalette,
      regionalPaletteMode,
      regionalPaletteZones,
      regionalPaletteRandomizeZones,
      regionalPaletteRandomCellSize,
      regionalPaletteZoneChaos,
      regionalPaletteZoneSeed,
      useDither,
      ditherMode,
      threshold,
      useArtifactMask,
      artifactMaskMode,
      artifactMaskThreshold,
      useGlitch,
      glitch,
      glitchChaos,
      glitchWidth,
      glitchOverrideDither,
      edgeGlitchOnly,
      useCodecDamage,
      codecDamageBlockSize,
      codecDamageAmount,
      codecDamageChromaShift,
      codecDamageColorDepth,
      useChannelPacketLoss,
      channelPacketLossChannel,
      channelPacketLossBlockSize,
      channelPacketLossAmount,
      channelPacketLossShift,
      useFrameEcho,
      frameEchoMode,
      frameEchoCopies,
      frameEchoOffset,
      frameEchoDecay,
      frameEchoJitter,
      useLumaDisplacement,
      lumaDisplacementMode,
      lumaDisplacementAmount,
      lumaDisplacementThreshold,
      lumaDisplacementJitter,
      useScanDrift,
      scanDriftDirection,
      scanDriftAmount,
      scanDriftBandSize,
      scanDriftChaos,
      useMotionSmear,
      motionSmearDirection,
      motionSmearLength,
      motionSmearDecay,
      motionSmearThreshold,
      useChromatic,
      chromaticOffset,
      useAscii,
      asciiCellSize,
      asciiOpacity,
      asciiMode,
      asciiColor,
      usePatternDither,
      patternDitherShape,
      patternDitherScale,
      patternDitherDensity,
      patternDitherOpacity,
      patternDitherColor,
      patternDitherBackgroundColor,
      patternDitherInvert,
      patternDitherReplaceImage,
      useSignalWaves,
      signalWavesMode,
      signalWavesFrequency,
      signalWavesAmplitude,
      signalWavesDensity,
      signalWavesOpacity,
      signalWavesColor,
      signalWavesBackgroundColor,
      signalWavesReplaceImage,
      signalWavesReactToImage,
      usePanelLayout,
      panelLayoutMode,
      panelLayoutGap,
      panelLayoutBorderWidth,
      panelLayoutBorderColor,
      panelLayoutBackgroundColor,
      panelLayoutPanelOpacity,
      panelLayoutRandomCrop,
      panelLayoutCropIntensity,
      panelLayoutPanX,
      panelLayoutPanY,
      panelLayoutMirrorAlternate,
      useNoise,
      noiseAmount,
      useScanlines,
      scanlineIntensity,
      useDataOverlay,
      dataOverlayMode,
      dataOverlayDensity,
      dataOverlayFontSize,
      dataOverlayOpacity,
      dataOverlayColor,
      dataOverlayCustomText,
      usePosterText,
      posterTextContent,
      posterTextX,
      posterTextY,
      posterTextVertical,
      posterTextFont,
      posterTextWeight,
      posterTextSize,
      posterTextTracking,
      posterTextOpacity,
      posterTextColor,
      posterTextGlitch,
      posterTextMode,
      posterTextPanelAnchor,
      useHudFrame,
      hudFrameStyle,
      hudFrameOpacity,
      hudFrameColor,
      hudFrameShowGrid,
      hudFrameShowLabels,
      hudFrameShowCornerMarks,
      hudFrameSafeArea
    ]
  );

  const effectSetters = useMemo<EffectStateSetters>(
    () => ({
      setSelectedPresetName,

      setUsePixelation,
      setPixelSize,

      setUsePsx,
      setPsxResolutionScale,
      setPsxColorLevels,
      setPsxWarpAmount,
      setPsxJitterAmount,
      setPsxDitherStrength,
      setPsxBlockSize,
      setPsxCompositeBlur,
      setPsxChromaBleed,

      setUsePixelSort,
      setPixelSortDirection,
      setPixelSortMode,
      setPixelSortThreshold,
      setPixelSortAmount,

      setUsePalette,
      setColorStart,
      setColorEnd,
      setSteps,
      setSwapPaletteColors,

      setUseRegionalPalette,
      setRegionalPaletteMode,
      setRegionalPaletteZones,
      updateRegionalPaletteZone,
      setRegionalPaletteRandomizeZones,
      setRegionalPaletteRandomCellSize,
      setRegionalPaletteZoneChaos,
      setRegionalPaletteZoneSeed,
      randomizeRegionalPaletteZoneMap,

      setUseDither,
      setDitherMode,
      setThreshold,

      setUseArtifactMask,
      setArtifactMaskMode,
      setArtifactMaskThreshold,

      setUseGlitch,
      setGlitch,
      setGlitchChaos,
      setGlitchWidth,
      setGlitchOverrideDither,
      setEdgeGlitchOnly,

      setUseCodecDamage,
      setCodecDamageBlockSize,
      setCodecDamageAmount,
      setCodecDamageChromaShift,
      setCodecDamageColorDepth,

      setUseChannelPacketLoss,
      setChannelPacketLossChannel,
      setChannelPacketLossBlockSize,
      setChannelPacketLossAmount,
      setChannelPacketLossShift,

      setUseFrameEcho,
      setFrameEchoMode,
      setFrameEchoCopies,
      setFrameEchoOffset,
      setFrameEchoDecay,
      setFrameEchoJitter,

      setUseLumaDisplacement,
      setLumaDisplacementMode,
      setLumaDisplacementAmount,
      setLumaDisplacementThreshold,
      setLumaDisplacementJitter,

      setUseScanDrift,
      setScanDriftDirection,
      setScanDriftAmount,
      setScanDriftBandSize,
      setScanDriftChaos,

      setUseMotionSmear,
      setMotionSmearDirection,
      setMotionSmearLength,
      setMotionSmearDecay,
      setMotionSmearThreshold,

      setUseChromatic,
      setChromaticOffset,

      setUseAscii,
      setAsciiCellSize,
      setAsciiOpacity,
      setAsciiMode,
      setAsciiColor,

      setUsePatternDither,
      setPatternDitherShape,
      setPatternDitherScale,
      setPatternDitherDensity,
      setPatternDitherOpacity,
      setPatternDitherColor,
      setPatternDitherBackgroundColor,
      setPatternDitherInvert,
      setPatternDitherReplaceImage,

      setUseSignalWaves,
      setSignalWavesMode,
      setSignalWavesFrequency,
      setSignalWavesAmplitude,
      setSignalWavesDensity,
      setSignalWavesOpacity,
      setSignalWavesColor,
      setSignalWavesBackgroundColor,
      setSignalWavesReplaceImage,
      setSignalWavesReactToImage,

      setUsePanelLayout,
      setPanelLayoutMode,
      setPanelLayoutGap,
      setPanelLayoutBorderWidth,
      setPanelLayoutBorderColor,
      setPanelLayoutBackgroundColor,
      setPanelLayoutPanelOpacity,
      setPanelLayoutRandomCrop,
      setPanelLayoutCropIntensity,
      setPanelLayoutPanX,
      setPanelLayoutPanY,
      setPanelLayoutMirrorAlternate,

      setUseNoise,
      setNoiseAmount,

      setUseScanlines,
      setScanlineIntensity,

      setUseDataOverlay,
      setDataOverlayMode,
      setDataOverlayDensity,
      setDataOverlayFontSize,
      setDataOverlayOpacity,
      setDataOverlayColor,
      setDataOverlayCustomText,

      setUsePosterText,
      setPosterTextContent,
      setPosterTextX,
      setPosterTextY,
      setPosterTextVertical,
      setPosterTextFont,
      setPosterTextWeight,
      setPosterTextSize,
      setPosterTextTracking,
      setPosterTextOpacity,
      setPosterTextColor,
      setPosterTextGlitch,
      setPosterTextMode,
      setPosterTextPanelAnchor,

      setUseHudFrame,
      setHudFrameStyle,
      setHudFrameOpacity,
      setHudFrameColor,
      setHudFrameShowGrid,
      setHudFrameShowLabels,
      setHudFrameShowCornerMarks,
      setHudFrameSafeArea
    }),
    [
      randomizeRegionalPaletteZoneMap,
      updateRegionalPaletteZone
    ]
  );

  const markAsCustom = useCallback(() => {
    setSelectedPresetName('CUSTOM');
  }, []);

  const createEffectsSnapshot = useCallback((): EffectsSnapshot => {
    return buildEffectsSnapshot(
      selectedPresetName,
      effectValues
    );
  }, [effectValues, selectedPresetName]);

  const restoreEffectsSnapshot = useCallback(
    (snapshot: EffectsSnapshot) => {
      applyEffectsSnapshot(snapshot, effectSetters);
    },
    [effectSetters]
  );

  const clearEffects = useCallback(() => {
    setLastEffectsSnapshot(createEffectsSnapshot());
    clearEffectSettings(effectSetters);
  }, [createEffectsSnapshot, effectSetters]);

  const fockGoBack = useCallback(() => {
    if (!lastEffectsSnapshot) return;

    restoreEffectsSnapshot(lastEffectsSnapshot);
    setLastEffectsSnapshot(null);
  }, [lastEffectsSnapshot, restoreEffectsSnapshot]);

  const saveImage = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const scale = (exportDpi / 72) * exportScale;

    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d');

    if (!exportCtx) return;

    exportCanvas.width = Math.round(canvas.width * scale);
    exportCanvas.height = Math.round(canvas.height * scale);

    exportCtx.imageSmoothingEnabled = false;

    if (
      exportFormat === 'jpeg' ||
      !exportTransparentBackground
    ) {
      exportCtx.fillStyle = '#050505';
      exportCtx.fillRect(
        0,
        0,
        exportCanvas.width,
        exportCanvas.height
      );
    }

    exportCtx.drawImage(
      canvas,
      0,
      0,
      canvas.width,
      canvas.height,
      0,
      0,
      exportCanvas.width,
      exportCanvas.height
    );

    const mimeType =
      exportFormat === 'png' ? 'image/png' : 'image/jpeg';

    const extension = exportFormat === 'png' ? 'png' : 'jpg';

    const quality =
      exportFormat === 'jpeg' ? 0.95 : undefined;

    const link = document.createElement('a');
    const presetSlug = selectedPresetName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'custom';

    link.download = `signal-decay-${presetSlug}-${exportDpi}dpi-${exportScale}x-${Date.now()}.${extension}`;
    link.href =
      quality === undefined
        ? exportCanvas.toDataURL(mimeType)
        : exportCanvas.toDataURL(mimeType, quality);

    link.click();
  }, [
    exportDpi,
    exportFormat,
    exportScale,
    exportTransparentBackground,
    selectedPresetName
  ]);

  const applyPreset = useCallback((preset: EffectPreset) => {
    applyEffectPreset(preset, effectSetters);
    setLastEffectsSnapshot(null);
  }, [effectSetters]);

  const processImage = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas || !originalImage) return;

    processCanvasImage({
      canvas,
      tempCanvas: tempCanvasRef.current,
      setTempCanvas: (canvasElement) => {
        tempCanvasRef.current = canvasElement;
      },
      originalImage,
      showOriginal,
      activeSeed,
      values: effectValues
    });
  }, [
    activeSeed,
    effectValues,
    originalImage,
    showOriginal
  ]);

  const loadImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;

    setSelectedFileName(file.name);

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        setOriginalImage(image);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setShowOriginal(false);
        setLiveSeed(createSeed());
        setLastEffectsSnapshot(null);
      };

      image.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  }, []);

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) return;

      loadImageFile(file);
      event.target.value = '';
    },
    [loadImageFile]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const file = Array.from(event.dataTransfer.files).find((item) =>
        item.type.startsWith('image/')
      );

      if (!file) return;

      loadImageFile(file);
    },
    [loadImageFile]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
    },
    []
  );

  const canPanPreviewImage = useCallback(() => {
    const previewArea = previewAreaRef.current;
    const canvas = canvasRef.current;

    if (!previewArea || !canvas) return false;

    const previewRect = previewArea.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    return (
      canvasRect.width > previewRect.width ||
      canvasRect.height > previewRect.height
    );
  }, []);

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (!originalImage) return;

      event.preventDefault();

      const delta = event.deltaY > 0 ? -0.1 : 0.1;

      setZoom((currentZoom) => {
        const nextZoom = currentZoom + delta;

        return Math.max(
          0.2,
          Math.min(6, Number(nextZoom.toFixed(2)))
        );
      });
    },
    [originalImage]
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (
        !originalImage ||
        event.button !== 0 ||
        !canPanPreviewImage()
      ) {
        return;
      }

      setIsPanning(true);

      dragStartRef.current = {
        x: event.clientX,
        y: event.clientY
      };

      panStartRef.current = {
        x: pan.x,
        y: pan.y
      };
    },
    [canPanPreviewImage, originalImage, pan]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!isPanning) return;

      const dx = event.clientX - dragStartRef.current.x;
      const dy = event.clientY - dragStartRef.current.y;

      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy
      });
    },
    [isPanning]
  );

  const stopPanning = useCallback(() => {
    setIsPanning(false);
  }, []);

  const changeSeed = useCallback((delta: number) => {
    setSeed((prev) => prev + delta);
  }, []);

  useEffect(() => {
    if (originalImage) {
      processImage();
    }
  }, [originalImage, processImage]);

  useEffect(() => {
    if (!originalImage) {
      setCanPanPreview(false);
      return;
    }

    let frame = 0;

    const syncCanPanPreview = () => {
      cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        const nextCanPan = canPanPreviewImage();

        setCanPanPreview(nextCanPan);

        if (!nextCanPan) {
          setPan({ x: 0, y: 0 });
          setIsPanning(false);
        }
      });
    };

    syncCanPanPreview();
    window.addEventListener('resize', syncCanPanPreview);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', syncCanPanPreview);
    };
  }, [
    canPanPreviewImage,
    originalImage,
    showOriginal,
    zoom
  ]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        background: '#050505',
        color: '#00ff99',
        fontFamily: "'Datatype', monospace",
        overflow: 'hidden'
      }}
    >
      <div
        ref={previewAreaRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopPanning}
        onMouseLeave={stopPanning}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          flex: 1,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background:
            'radial-gradient(circle at center, #0b1510 0%, #050505 65%)',
          cursor: originalImage && canPanPreview
            ? isPanning
              ? 'grabbing'
              : 'grab'
            : 'default'
        }}
      >
        {originalImage && (
          <button
            onClick={(event) => {
              event.stopPropagation();
              setShowOriginal((value) => !value);
            }}
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
            style={{
              ...buttonStyle,
              position: 'absolute',
              top: 24,
              right: 24,
              zIndex: 10,
              background: showOriginal ? '#00ff99' : '#07140d',
              color: showOriginal ? '#050505' : '#00ff99'
            }}
          >
            {showOriginal ? 'SHOW EFFECTS' : 'ORIGINAL'}
          </button>
        )}

        {originalImage ? (
          <canvas
            ref={canvasRef}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center',
              imageRendering: 'pixelated',
              maxWidth: '90%',
              maxHeight: '90%',
              border: '1px solid #123322',
              boxShadow: '0 0 40px rgba(0, 255, 153, 0.08)',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
        ) : (
          <div
            style={{
              color: '#32634c',
              letterSpacing: 3
            }}
          >
            DROP IMAGE / LOAD IMAGE
          </div>
        )}
      </div>

      <div
        className="app-side-panel"
        style={{
          width: 405,
          height: '100vh',
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: 30,
          background: '#050505',
          borderLeft: '1px solid #123322'
        }}
      >
        <h1
          style={{
            margin: 0,
            letterSpacing: 8,
            fontSize: 28,
            color: '#00ff99'
          }}
        >
          SIGNAL DECAY
        </h1>

        <div
          style={{
            color: '#777',
            marginTop: 8,
            letterSpacing: 1
          }}
        >
          GENERATIVE IMAGE ENGINE
        </div>

        <div style={{ marginTop: 28 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />

          <button
            onClick={() => {
              fileInputRef.current?.click();
            }}
            style={{
              ...activeButtonStyle,
              width: '100%'
            }}
          >
            {originalImage ? 'CHANGE IMAGE' : 'LOAD IMAGE'}
          </button>

          {selectedFileName && (
            <div
              style={{
                marginTop: 8,
                color: '#777',
                fontSize: 12,
                wordBreak: 'break-all'
              }}
            >
              {selectedFileName}
            </div>
          )}
        </div>

        <div style={sectionStyle}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 2,
              color: '#7c7c7c'
            }}
          >
            PRESET
          </div>

          <UiSelect
            value={selectedPresetName}
            options={[
              {
                value: 'CUSTOM',
                label: 'CUSTOM'
              },
              ...PRESETS.map((preset) => ({
                value: preset.name,
                label: preset.name
              }))
            ]}
            onChange={(value) => {
              if (value === selectedPresetName) {
                return;
              }

              if (value === 'CUSTOM') {
                setSelectedPresetName('CUSTOM');
                return;
              }

              const preset = PRESETS.find(
                (item) => item.name === value
              );

              if (!preset) {
                return;
              }

              applyPreset(preset);
            }}
          />
        </div>

        <div style={sectionStyle}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 2,
              color: '#7c7c7c'
            }}
          >
            SYSTEM
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              marginTop: 10
            }}
          >
            <button
              onClick={clearEffects}
              style={{
                ...buttonStyle,
                flex: 1,
                padding: 8
              }}
            >
              CLEAR EFFECTS
            </button>

            <button
              onClick={fockGoBack}
              disabled={!lastEffectsSnapshot}
              style={{
                ...buttonStyle,
                flex: 1,
                padding: 8,
                opacity: lastEffectsSnapshot ? 1 : 0.35,
                cursor: lastEffectsSnapshot
                  ? 'pointer'
                  : 'not-allowed'
              }}
            >
              FOCK GO BACK
            </button>
          </div>
        </div>

        <div style={sectionStyle}>
          <UiCheckbox
            checked={useSeed}
            onChange={(checked) => {
              markAsCustom();
              setUseSeed(checked);
            }}
            label="Use Seed"
          />

          {useSeed && (
            <>
              <div style={sliderLabelStyle}>SEED</div>

              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  marginTop: 6
                }}
              >
                <div className="ui-number-wrap">
                  <input
                    className="ui-number-input"
                    type="number"
                    value={seed}
                    onChange={(event) => {
                      markAsCustom();
                      setSeed(Number(event.target.value));
                    }}
                  />

                  <div className="ui-stepper">
                    <button
                      type="button"
                      className="ui-stepper-btn"
                      onClick={() => {
                        markAsCustom();
                        changeSeed(1);
                      }}
                    >
                      <span className="ui-stepper-triangle-up" />
                    </button>

                    <button
                      type="button"
                      className="ui-stepper-btn"
                      onClick={() => {
                        markAsCustom();
                        changeSeed(-1);
                      }}
                    >
                      <span className="ui-stepper-triangle-down" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    markAsCustom();
                    setSeed(createSeed());
                  }}
                  style={{
                    ...buttonStyle,
                    padding: '8px 10px'
                  }}
                >
                  RANDOM
                </button>
              </div>
            </>
          )}
        </div>

        <EffectSections
          sectionStyle={sectionStyle}
          sliderLabelStyle={sliderLabelStyle}
          markAsCustom={markAsCustom}
          values={effectValues}
          setters={effectSetters}
        />

        <div style={sectionStyle}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 2,
              color: '#7c7c7c'
            }}
          >
            FORMAT
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              marginTop: 10
            }}
          >
            {(['png', 'jpeg'] as ExportFormat[]).map((format) => (
              <button
                key={format}
                onClick={() => {
                  setExportFormat(format);
                }}
                style={{
                  ...(exportFormat === format
                    ? activeButtonStyle
                    : buttonStyle),
                  flex: 1,
                  padding: 8
                }}
              >
                {format.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={sliderLabelStyle}>DPI</div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              marginTop: 10
            }}
          >
            {([72, 150, 300] as ExportDpi[]).map((dpi) => (
              <button
                key={dpi}
                onClick={() => {
                  setExportDpi(dpi);
                }}
                style={{
                  ...(exportDpi === dpi
                    ? activeButtonStyle
                    : buttonStyle),
                  flex: 1,
                  padding: 8
                }}
              >
                {dpi}
              </button>
            ))}
          </div>

          <div style={sliderLabelStyle}>SCALE</div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              marginTop: 10
            }}
          >
            {([1, 2, 3, 4] as ExportScale[]).map((scale) => (
              <button
                key={scale}
                onClick={() => {
                  setExportScale(scale);
                }}
                style={{
                  ...(exportScale === scale
                    ? activeButtonStyle
                    : buttonStyle),
                  flex: 1,
                  padding: 8
                }}
              >
                {scale}X
              </button>
            ))}
          </div>

          {exportFormat === 'png' && (
            <div style={{ marginTop: 12 }}>
              <UiCheckbox
                checked={exportTransparentBackground}
                onChange={(checked) => {
                  setExportTransparentBackground(checked);
                }}
                label="Transparent PNG"
              />
            </div>
          )}

          {imageSizeInfo && (
            <div
              style={{
                marginTop: 14,
                paddingTop: 12,
                borderTop: '1px solid #164d34',
                color: '#7c7c7c',
                fontSize: 11,
                letterSpacing: 1,
                lineHeight: 1.8
              }}
            >
              <div>
                SOURCE:{' '}
                <span style={{ color: '#00ff99' }}>
                  {imageSizeInfo.sourceWidth}×
                  {imageSizeInfo.sourceHeight}
                </span>
              </div>

              <div>
                EXPORT:{' '}
                <span style={{ color: '#00ff99' }}>
                  {imageSizeInfo.exportWidth}×
                  {imageSizeInfo.exportHeight}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={saveImage}
            style={{
              ...activeButtonStyle,
              width: '100%',
              marginTop: 16
            }}
          >
            EXPORT
          </button>
        </div>
      </div>
    </div>
  );
}

type EffectSectionsProps = {
  sectionStyle: CSSProperties;
  sliderLabelStyle: CSSProperties;
  markAsCustom: () => void;
  values: EffectValues;
  setters: EffectSetters;
};

type EffectGroup =
  | 'source'
  | 'tonal'
  | 'distortion'
  | 'structure'
  | 'overlay';

const EFFECT_GROUP_STORAGE_KEY =
  'signal-decay-effect-groups';

const DEFAULT_EFFECT_GROUPS: Record<EffectGroup, boolean> = {
  source: true,
  tonal: false,
  distortion: false,
  structure: false,
  overlay: false
};

const ALL_OPEN_EFFECT_GROUPS: Record<EffectGroup, boolean> = {
  source: true,
  tonal: true,
  distortion: true,
  structure: true,
  overlay: true
};

const ALL_CLOSED_EFFECT_GROUPS: Record<EffectGroup, boolean> = {
  source: false,
  tonal: false,
  distortion: false,
  structure: false,
  overlay: false
};

function getInitialEffectGroups() {
  try {
    const saved = window.localStorage.getItem(
      EFFECT_GROUP_STORAGE_KEY
    );

    if (!saved) {
      return DEFAULT_EFFECT_GROUPS;
    }

    return {
      ...DEFAULT_EFFECT_GROUPS,
      ...(JSON.parse(saved) as Partial<Record<EffectGroup, boolean>>)
    };
  } catch {
    return DEFAULT_EFFECT_GROUPS;
  }
}

function EffectSections({
  sectionStyle,
  sliderLabelStyle,
  markAsCustom,
  values,
  setters
}: EffectSectionsProps) {
  const [isDitherPanelOpen, setIsDitherPanelOpen] =
    useState(values.useDither || values.usePatternDither);
  const [openEffectGroups, setOpenEffectGroups] = useState<
    Record<EffectGroup, boolean>
  >(getInitialEffectGroups);

  useEffect(() => {
    if (values.useDither || values.usePatternDither) {
      setIsDitherPanelOpen(true);
    }
  }, [values.useDither, values.usePatternDither]);

  useEffect(() => {
    window.localStorage.setItem(
      EFFECT_GROUP_STORAGE_KEY,
      JSON.stringify(openEffectGroups)
    );
  }, [openEffectGroups]);

  const runWithoutPanelJump = (callback: () => void) => {
    const panel = document.querySelector(
      '.app-side-panel'
    ) as HTMLDivElement | null;

    const scrollTop = panel?.scrollTop ?? 0;

    markAsCustom();
    callback();

    requestAnimationFrame(() => {
      if (!panel) return;

      panel.scrollTop = scrollTop;

      requestAnimationFrame(() => {
        panel.scrollTop = scrollTop;
      });
    });
  };

  const toggleEffectGroup = (group: EffectGroup) => {
    setOpenEffectGroups((current) => ({
      ...current,
      [group]: !current[group]
    }));
  };

  const orderedSectionStyle = (
    order: number,
    group: EffectGroup
  ): CSSProperties => ({
    ...sectionStyle,
    order,
    display: openEffectGroups[group] ? undefined : 'none'
  });

  const effectGroupHeaderStyle = (
    order: number
  ): CSSProperties => ({
    order,
    marginTop: 18,
    padding: '8px 0 6px',
    fontSize: 11,
    letterSpacing: 2,
    color: '#00ff99',
    border: 'none',
    borderBottom: '1px solid #164d34',
    background: 'transparent',
    fontFamily: "'Datatype', monospace",
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  });

  const getActiveGroupCount = (group: EffectGroup) => {
    if (group === 'source') {
      return [
        values.useDither || values.usePatternDither,
        values.usePixelation,
        values.usePsx
      ].filter(Boolean).length;
    }

    if (group === 'tonal') {
      return [
        values.usePalette,
        values.useRegionalPalette
      ].filter(Boolean).length;
    }

    if (group === 'distortion') {
      return [
        values.useArtifactMask,
        values.usePixelSort,
        values.useGlitch,
        values.useCodecDamage,
        values.useChannelPacketLoss,
        values.useFrameEcho,
        values.useLumaDisplacement,
        values.useScanDrift,
        values.useMotionSmear,
        values.useChromatic,
        values.useNoise,
        values.useScanlines
      ].filter(Boolean).length;
    }

    if (group === 'structure') {
      return [
        values.usePanelLayout,
        values.useSignalWaves
      ].filter(Boolean).length;
    }

    return [
      values.useAscii,
      values.useDataOverlay,
      values.usePosterText,
      values.useHudFrame
    ].filter(Boolean).length;
  };

  const renderActiveGroupMarks = (count: number) => (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }}
    >
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          style={{
            width: 6,
            height: 6,
            background: '#00ff99',
            boxShadow: '0 0 8px rgba(0, 255, 153, 0.55)'
          }}
        />
      ))}
    </span>
  );

  const renderGroupHeader = (
    order: number,
    group: EffectGroup,
    label: string
  ) => {
    const activeCount = getActiveGroupCount(group);

    return (
      <button
        type="button"
        style={effectGroupHeaderStyle(order)}
        onClick={() => {
          toggleEffectGroup(group);
        }}
      >
        <span>{label}</span>

        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          {renderActiveGroupMarks(activeCount)}
          <span>{openEffectGroups[group] ? '-' : '+'}</span>
        </span>
      </button>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div
        style={{
          order: 0,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginTop: 8
        }}
      >
        <button
          type="button"
          onClick={() => {
            setOpenEffectGroups(ALL_OPEN_EFFECT_GROUPS);
          }}
          style={{
            background: '#07140d',
            color: '#00ff99',
            border: '1px solid #164d34',
            padding: '7px 8px',
            cursor: 'pointer',
            fontFamily: "'Datatype', monospace",
            fontSize: 11,
            letterSpacing: 1,
            borderRadius: 0
          }}
        >
          EXPAND ALL
        </button>

        <button
          type="button"
          onClick={() => {
            setOpenEffectGroups(ALL_CLOSED_EFFECT_GROUPS);
          }}
          style={{
            background: '#07140d',
            color: '#00ff99',
            border: '1px solid #164d34',
            padding: '7px 8px',
            cursor: 'pointer',
            fontFamily: "'Datatype', monospace",
            fontSize: 11,
            letterSpacing: 1,
            borderRadius: 0
          }}
        >
          COLLAPSE ALL
        </button>
      </div>

      {renderGroupHeader(10, 'source', 'SOURCE / BASE')}
      {renderGroupHeader(20, 'tonal', 'TONAL / COLOR')}
      {renderGroupHeader(30, 'distortion', 'DISTORTION')}
      {renderGroupHeader(40, 'structure', 'STRUCTURE')}
      {renderGroupHeader(
        50,
        'overlay',
        'TEXT / INTERFACE OVERLAY'
      )}

      <div style={orderedSectionStyle(12, 'source')}>
        <UiCheckbox
          checked={values.usePixelation}
          onChange={(checked) => {
            runWithoutPanelJump(() => {
              setters.setUsePixelation(checked);
            });
          }}
          label="Pixelation"
        />

        {values.usePixelation && (
          <>
            <div style={sliderLabelStyle}>PIXEL SIZE</div>

            <UiSlider
              min={1}
              max={32}
              step={1}
              value={values.pixelSize}
              onChange={(value) => {
                markAsCustom();
                setters.setPixelSize(value);
              }}
            />
          </>
        )}
      </div>

      <div style={orderedSectionStyle(13, 'source')}>
        <UiCheckbox
          checked={values.usePsx}
          onChange={(checked) => {
            runWithoutPanelJump(() => {
              setters.setUsePsx(checked);
            });
          }}
          label="PS1 Look"
        />

        {values.usePsx && (
          <>
            <div style={sliderLabelStyle}>RESOLUTION SCALE</div>

            <UiSlider
              min={1}
              max={12}
              step={1}
              value={values.psxResolutionScale}
              onChange={(value) => {
                markAsCustom();
                setters.setPsxResolutionScale(value);
              }}
            />

            <div style={sliderLabelStyle}>COLOR LEVELS</div>

            <UiSlider
              min={2}
              max={32}
              step={1}
              value={values.psxColorLevels}
              onChange={(value) => {
                markAsCustom();
                setters.setPsxColorLevels(value);
              }}
            />

            <div style={sliderLabelStyle}>TEXTURE WARP</div>

            <UiSlider
              min={0}
              max={20}
              step={1}
              value={values.psxWarpAmount}
              onChange={(value) => {
                markAsCustom();
                setters.setPsxWarpAmount(value);
              }}
            />

            <div style={sliderLabelStyle}>JITTER</div>

            <UiSlider
              min={0}
              max={20}
              step={1}
              value={values.psxJitterAmount}
              onChange={(value) => {
                markAsCustom();
                setters.setPsxJitterAmount(value);
              }}
            />

            <div style={sliderLabelStyle}>BLOCK SIZE</div>

            <UiSlider
              min={4}
              max={48}
              step={1}
              value={values.psxBlockSize}
              onChange={(value) => {
                markAsCustom();
                setters.setPsxBlockSize(value);
              }}
            />

            <div style={sliderLabelStyle}>DITHER</div>

            <UiSlider
              min={0}
              max={1}
              step={0.05}
              value={values.psxDitherStrength}
              onChange={(value) => {
                markAsCustom();
                setters.setPsxDitherStrength(value);
              }}
            />

            <div style={sliderLabelStyle}>COMPOSITE BLUR</div>

            <UiSlider
              min={0}
              max={6}
              step={0.1}
              value={values.psxCompositeBlur}
              onChange={(value) => {
                markAsCustom();
                setters.setPsxCompositeBlur(value);
              }}
            />

            <div style={sliderLabelStyle}>CHROMA BLEED</div>

            <UiSlider
              min={0}
              max={8}
              step={1}
              value={values.psxChromaBleed}
              onChange={(value) => {
                markAsCustom();
                setters.setPsxChromaBleed(value);
              }}
            />
          </>
        )}
      </div>

      <div style={orderedSectionStyle(30, 'distortion')}>
        <UiCheckbox
          checked={values.useArtifactMask}
          onChange={(checked) => {
            runWithoutPanelJump(() => {
              setters.setUseArtifactMask(checked);
            });
          }}
          label="Artifact Mask"
        />

        {values.useArtifactMask && (
          <>
            <div style={sliderLabelStyle}>MODE</div>

            <UiSelect
              value={values.artifactMaskMode}
              options={[
                { value: 'all', label: 'ALL AREAS' },
                { value: 'bright', label: 'BRIGHT AREAS' },
                { value: 'dark', label: 'DARK AREAS' },
                { value: 'edges', label: 'EDGES' },
                { value: 'random-zones', label: 'RANDOM ZONES' },
                { value: 'center', label: 'CENTER' },
                { value: 'borders', label: 'BORDERS' }
              ]}
              onChange={(value) => {
                markAsCustom();
                setters.setArtifactMaskMode(
                  value as ArtifactMaskMode
                );
              }}
            />

            <div style={sliderLabelStyle}>THRESHOLD</div>

            <UiSlider
              min={0}
              max={255}
              step={1}
              value={values.artifactMaskThreshold}
              onChange={(value) => {
                markAsCustom();
                setters.setArtifactMaskThreshold(value);
              }}
            />
          </>
        )}
      </div>

      <div style={orderedSectionStyle(31, 'distortion')}>
        <UiCheckbox
          checked={values.usePixelSort}
          onChange={(checked) => {
            runWithoutPanelJump(() => {
              setters.setUsePixelSort(checked);
            });
          }}
          label="Pixel Sorting"
        />

        {values.usePixelSort && (
          <>
            <div style={sliderLabelStyle}>DIRECTION</div>

            <UiSelect
              value={values.pixelSortDirection}
              options={[
                { value: 'horizontal', label: 'HORIZONTAL' },
                { value: 'vertical', label: 'VERTICAL' }
              ]}
              onChange={(value) => {
                markAsCustom();
                setters.setPixelSortDirection(
                  value as 'horizontal' | 'vertical'
                );
              }}
            />

            <div style={sliderLabelStyle}>MODE</div>

            <UiSelect
              value={values.pixelSortMode}
              options={[
                { value: 'bright', label: 'BRIGHT AREAS' },
                { value: 'dark', label: 'DARK AREAS' },
                { value: 'all', label: 'ALL PIXELS' }
              ]}
              onChange={(value) => {
                markAsCustom();
                setters.setPixelSortMode(value as PixelSortMode);
              }}
            />

            <div style={sliderLabelStyle}>THRESHOLD</div>

            <UiSlider
              min={0}
              max={255}
              step={1}
              value={values.pixelSortThreshold}
              onChange={(value) => {
                markAsCustom();
                setters.setPixelSortThreshold(value);
              }}
            />

            <div style={sliderLabelStyle}>AMOUNT</div>

            <UiSlider
              min={0}
              max={1}
              step={0.05}
              value={values.pixelSortAmount}
              onChange={(value) => {
                markAsCustom();
                setters.setPixelSortAmount(value);
              }}
            />
          </>
        )}
      </div>

      <div style={orderedSectionStyle(21, 'tonal')}>
        <UiCheckbox
          checked={values.usePalette}
          onChange={(checked) => {
            runWithoutPanelJump(() => {
              setters.setUsePalette(checked);
            });
          }}
          label="Palette"
        />

        {values.usePalette && (
          <>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                marginTop: 12
              }}
            >
              <UiColorInput
                label="START COLOR"
                value={values.colorStart}
                onChange={(value) => {
                  markAsCustom();
                  setters.setColorStart(value);
                }}
              />

              <UiColorInput
                label="END COLOR"
                value={values.colorEnd}
                onChange={(value) => {
                  markAsCustom();
                  setters.setColorEnd(value);
                }}
              />
            </div>

            <div style={sliderLabelStyle}>STEPS</div>

            <UiSlider
              min={2}
              max={16}
              step={1}
              value={values.steps}
              onChange={(value) => {
                markAsCustom();
                setters.setSteps(value);
              }}
            />

            <div style={{ marginTop: 12 }}>
              <UiCheckbox
                checked={values.swapPaletteColors}
                onChange={(checked) => {
                  markAsCustom();
                  setters.setSwapPaletteColors(checked);
                }}
                label="Swap Colors"
              />
            </div>
          </>
        )}
      </div>

      <div style={orderedSectionStyle(22, 'tonal')}>
        <UiCheckbox
          checked={values.useRegionalPalette}
          onChange={(checked) => {
            runWithoutPanelJump(() => {
              setters.setUseRegionalPalette(checked);
            });
          }}
          label="Regional Palette"
        />

        {values.useRegionalPalette && (
          <>
            <div style={sliderLabelStyle}>MODE</div>

            <UiSelect
              value={values.regionalPaletteMode}
              options={[
                { value: 'random-zones', label: 'RANDOM ZONES' },
                { value: 'random-cells', label: 'RANDOM CELLS' },
                { value: 'vertical-split', label: 'VERTICAL SPLIT' },
                { value: 'horizontal-split', label: 'HORIZONTAL SPLIT' },
                { value: 'grid-2x2', label: 'GRID 2X2' },
                { value: 'panel-layout-sync', label: 'PANEL SYNC' }
              ]}
              onChange={(value) => {
                markAsCustom();
                setters.setRegionalPaletteMode(
                  value as RegionalPaletteMode
                );
              }}
            />

            <div style={sliderLabelStyle}>ZONE SIZE</div>

            <UiSlider
              min={64}
              max={520}
              step={1}
              value={values.regionalPaletteRandomCellSize}
              onChange={(value) => {
                markAsCustom();
                setters.setRegionalPaletteRandomCellSize(value);
              }}
            />

            <div style={sliderLabelStyle}>ZONE CHAOS</div>

            <UiSlider
              min={0}
              max={100}
              step={1}
              value={values.regionalPaletteZoneChaos}
              onChange={(value) => {
                markAsCustom();
                setters.setRegionalPaletteZoneChaos(value);
              }}
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 12,
                marginTop: 12
              }}
            >
              {values.regionalPaletteZones.map(
                (zone: RegionalPaletteZone, index: number) => (
                  <div
                    key={index}
                    style={{
                      borderTop:
                        index === 0
                          ? 'none'
                          : '1px solid #1c1c1c',
                      paddingTop: index === 0 ? 0 : 12
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        letterSpacing: 2,
                        color: '#7c7c7c',
                        marginBottom: 8
                      }}
                    >
                      ZONE {index + 1}
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 10
                      }}
                    >
                      <UiColorInput
                        label="DARK"
                        value={zone.startColor}
                        onChange={(value) => {
                          markAsCustom();
                          setters.updateRegionalPaletteZone(index, {
                            startColor: value
                          });
                        }}
                      />

                      <UiColorInput
                        label="LIGHT"
                        value={zone.endColor}
                        onChange={(value) => {
                          markAsCustom();
                          setters.updateRegionalPaletteZone(index, {
                            endColor: value
                          });
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        markAsCustom();
                        setters.updateRegionalPaletteZone(index, {
                          startColor: zone.endColor,
                          endColor: zone.startColor
                        });
                      }}
                      style={{
                        width: '100%',
                        marginTop: 8,
                        background: '#07140d',
                        color: '#00ff99',
                        border: '1px solid #164d34',
                        padding: '7px 10px',
                        cursor: 'pointer',
                        fontFamily: "'Datatype', monospace",
                        fontSize: 11,
                        letterSpacing: 2,
                        borderRadius: 0
                      }}
                    >
                      SWAP COLORS
                    </button>
                  </div>
                )
              )}
            </div>

            <div style={{ marginTop: 12 }}>
              <UiCheckbox
                checked={values.regionalPaletteRandomizeZones}
                onChange={(checked) => {
                  markAsCustom();
                  setters.setRegionalPaletteRandomizeZones(checked);
                }}
                label="Shuffle Zones"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                markAsCustom();
                setters.randomizeRegionalPaletteZoneMap();
              }}
              style={{
                width: '100%',
                marginTop: 12,
                background: '#07140d',
                color: '#00ff99',
                border: '1px solid #164d34',
                padding: 10,
                cursor: 'pointer',
                fontFamily: "'Datatype', monospace",
                borderRadius: 0
              }}
            >
              RANDOMIZE MAP
            </button>
          </>
        )}
      </div>

      <div style={orderedSectionStyle(11, 'source')}>
        <UiCheckbox
          checked={isDitherPanelOpen}
          onChange={(checked) => {
            runWithoutPanelJump(() => {
              setIsDitherPanelOpen(checked);

              if (!checked) {
                setters.setUseDither(false);
                setters.setUsePatternDither(false);
              }
            });
          }}
          label="Dither"
        />

        {isDitherPanelOpen && (
          <>
            <div style={{ marginTop: 12 }}>
              <UiCheckbox
                checked={values.useDither}
                onChange={(checked) => {
                  runWithoutPanelJump(() => {
                    setters.setUseDither(checked);
                  });
                }}
                label="Classic Dither"
              />
            </div>

            {values.useDither && (
              <div style={{ marginTop: 12 }}>
                <div style={sliderLabelStyle}>MODE</div>

                <UiSelect
                  value={values.ditherMode}
                  options={[
                    {
                      value: 'floyd-steinberg',
                      label: 'FLOYD-STEINBERG'
                    },
                    {
                      value: 'ordered-bayer',
                      label: 'ORDERED BAYER'
                    },
                    {
                      value: 'atkinson',
                      label: 'ATKINSON'
                    }
                  ]}
                  onChange={(value) => {
                    markAsCustom();
                    setters.setDitherMode(value as DitherMode);
                  }}
                />

                <div style={sliderLabelStyle}>THRESHOLD</div>

                <UiSlider
                  min={0}
                  max={255}
                  step={1}
                  value={values.threshold}
                  onChange={(value) => {
                    markAsCustom();
                    setters.setThreshold(value);
                  }}
                />
              </div>
            )}

            <div
              style={{
                marginTop: values.useDither ? 16 : 12,
                paddingTop: values.useDither ? 12 : 0,
                borderTop: values.useDither
                  ? '1px solid #1c1c1c'
                  : 'none'
              }}
            >
              <UiCheckbox
                checked={values.usePatternDither}
                onChange={(checked) => {
                  runWithoutPanelJump(() => {
                    setters.setUsePatternDither(checked);
                  });
                }}
                label="Pattern Dither"
              />
            </div>

            {values.usePatternDither && (
              <div style={{ marginTop: 12 }}>
                <div style={sliderLabelStyle}>SHAPE</div>

                <UiSelect
                  value={values.patternDitherShape}
                  options={[
                    { value: 'dot', label: 'DOT MATRIX' },
                    { value: 'circle', label: 'CIRCLE HALFTONE' },
                    { value: 'square', label: 'SQUARE GRID' },
                    { value: 'line', label: 'LINE FIELD' },
                    { value: 'cross', label: 'CROSS GRID' },
                    { value: 'ascii', label: 'ASCII FIELD' }
                  ]}
                  onChange={(value) => {
                    markAsCustom();
                    setters.setPatternDitherShape(
                      value as PatternDitherShape
                    );
                  }}
                />

                <div style={sliderLabelStyle}>SCALE</div>

                <UiSlider
                  min={4}
                  max={80}
                  step={1}
                  value={values.patternDitherScale}
                  onChange={(value) => {
                    markAsCustom();
                    setters.setPatternDitherScale(value);
                  }}
                />

                <div style={sliderLabelStyle}>DENSITY</div>

                <UiSlider
                  min={0}
                  max={100}
                  step={1}
                  value={values.patternDitherDensity}
                  onChange={(value) => {
                    markAsCustom();
                    setters.setPatternDitherDensity(value);
                  }}
                />

                <div style={sliderLabelStyle}>OPACITY</div>

                <UiSlider
                  min={0}
                  max={1}
                  step={0.05}
                  value={values.patternDitherOpacity}
                  onChange={(value) => {
                    markAsCustom();
                    setters.setPatternDitherOpacity(value);
                  }}
                />

                <div style={{ marginTop: 12 }}>
                  <UiColorInput
                    label="COLOR"
                    value={values.patternDitherColor}
                    onChange={(value) => {
                      markAsCustom();
                      setters.setPatternDitherColor(value);
                    }}
                  />
                </div>

                <div style={{ marginTop: 12 }}>
                  <UiColorInput
                    label="BACKGROUND"
                    value={values.patternDitherBackgroundColor}
                    onChange={(value) => {
                      markAsCustom();
                      setters.setPatternDitherBackgroundColor(value);
                    }}
                  />
                </div>

                <div style={{ marginTop: 12 }}>
                  <UiCheckbox
                    checked={values.patternDitherInvert}
                    onChange={(checked) => {
                      markAsCustom();
                      setters.setPatternDitherInvert(checked);
                    }}
                    label="Invert"
                  />
                </div>

                <div style={{ marginTop: 12 }}>
                  <UiCheckbox
                    checked={values.patternDitherReplaceImage}
                    onChange={(checked) => {
                      markAsCustom();
                      setters.setPatternDitherReplaceImage(checked);
                    }}
                    label="Replace Image"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div style={orderedSectionStyle(42, 'structure')}>
        <UiCheckbox
          checked={values.useSignalWaves}
          onChange={(checked) => {
            runWithoutPanelJump(() => {
              setters.setUseSignalWaves(checked);
            });
          }}
          label="Signal Waves"
        />

        {values.useSignalWaves && (
          <>
            <div style={sliderLabelStyle}>MODE</div>

            <UiSelect
              value={values.signalWavesMode}
              options={[
                {
                  value: 'horizontal',
                  label: 'HORIZONTAL WAVES'
                },
                {
                  value: 'vertical',
                  label: 'VERTICAL WAVES'
                },
                {
                  value: 'topographic',
                  label: 'TOPOGRAPHIC'
                },
                {
                  value: 'contour',
                  label: 'OBJECT CONTOUR'
                },
                {
                  value: 'contour-pulse',
                  label: 'CONTOUR PULSE'
                },
                {
                  value: 'depth-scan',
                  label: 'DEPTH SCAN'
                },
                {
                  value: 'field-lines',
                  label: 'FIELD LINES'
                }
              ]}
              onChange={(value) => {
                markAsCustom();
                setters.setSignalWavesMode(
                  value as SignalWavesMode
                );
              }}
            />

            <div style={sliderLabelStyle}>FREQUENCY</div>

            <UiSlider
              min={1}
              max={80}
              step={1}
              value={values.signalWavesFrequency}
              onChange={(value) => {
                markAsCustom();
                setters.setSignalWavesFrequency(value);
              }}
            />

            <div style={sliderLabelStyle}>AMPLITUDE</div>

            <UiSlider
              min={0}
              max={120}
              step={1}
              value={values.signalWavesAmplitude}
              onChange={(value) => {
                markAsCustom();
                setters.setSignalWavesAmplitude(value);
              }}
            />

            <div style={sliderLabelStyle}>DENSITY</div>

            <UiSlider
              min={4}
              max={80}
              step={1}
              value={values.signalWavesDensity}
              onChange={(value) => {
                markAsCustom();
                setters.setSignalWavesDensity(value);
              }}
            />

            <div style={sliderLabelStyle}>OPACITY</div>

            <UiSlider
              min={0}
              max={1}
              step={0.05}
              value={values.signalWavesOpacity}
              onChange={(value) => {
                markAsCustom();
                setters.setSignalWavesOpacity(value);
              }}
            />

            <div style={{ marginTop: 12 }}>
              <UiColorInput
                label="COLOR"
                value={values.signalWavesColor}
                onChange={(value) => {
                  markAsCustom();
                  setters.setSignalWavesColor(value);
                }}
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <UiColorInput
                label="BACKGROUND"
                value={values.signalWavesBackgroundColor}
                onChange={(value) => {
                  markAsCustom();
                  setters.setSignalWavesBackgroundColor(value);
                }}
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <UiCheckbox
                checked={values.signalWavesReactToImage}
                onChange={(checked) => {
                  markAsCustom();
                  setters.setSignalWavesReactToImage(checked);
                }}
                label="React To Image"
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <UiCheckbox
                checked={values.signalWavesReplaceImage}
                onChange={(checked) => {
                  markAsCustom();
                  setters.setSignalWavesReplaceImage(checked);
                }}
                label="Replace Image"
              />
            </div>
          </>
        )}
      </div>

      <div style={orderedSectionStyle(41, 'structure')}>
        <UiCheckbox
          checked={values.usePanelLayout}
          onChange={(checked) => {
            runWithoutPanelJump(() => {
              setters.setUsePanelLayout(checked);
            });
          }}
          label="Panel Layout"
        />

        {values.usePanelLayout && (
          <>
            <div style={sliderLabelStyle}>MODE</div>

            <UiSelect
              value={values.panelLayoutMode}
              options={[
                {
                  value: 'side-panel',
                  label: 'SIDE PANEL'
                },
                {
                  value: 'grid-2x2',
                  label: 'GRID 2×2'
                },
                {
                  value: 'vertical-strips',
                  label: 'VERTICAL STRIPS'
                },
                {
                  value: 'diagnostic-wall',
                  label: 'DIAGNOSTIC WALL'
                },
                {
                  value: 'split-scan',
                  label: 'SPLIT SCAN'
                },
                {
                  value: 'film-strip',
                  label: 'FILM STRIP'
                },
                {
                  value: 'contact-sheet',
                  label: 'CONTACT SHEET'
                },
                {
                  value: 'center-diagnostics',
                  label: 'CENTER DIAGNOSTICS'
                },
                {
                  value: 'cross-layout',
                  label: 'CROSS LAYOUT'
                },
                {
                  value: 'broken-archive-wall',
                  label: 'BROKEN ARCHIVE WALL'
                }
              ]}
              onChange={(value) => {
                markAsCustom();
                setters.setPanelLayoutMode(
                  value as PanelLayoutMode
                );
              }}
            />

            <div style={sliderLabelStyle}>GAP</div>

            <UiSlider
              min={0}
              max={80}
              step={1}
              value={values.panelLayoutGap}
              onChange={(value) => {
                markAsCustom();
                setters.setPanelLayoutGap(value);
              }}
            />

            <div style={sliderLabelStyle}>BORDER WIDTH</div>

            <UiSlider
              min={0}
              max={20}
              step={1}
              value={values.panelLayoutBorderWidth}
              onChange={(value) => {
                markAsCustom();
                setters.setPanelLayoutBorderWidth(value);
              }}
            />

            <div style={sliderLabelStyle}>PANEL OPACITY</div>

            <UiSlider
              min={0}
              max={1}
              step={0.05}
              value={values.panelLayoutPanelOpacity}
              onChange={(value) => {
                markAsCustom();
                setters.setPanelLayoutPanelOpacity(value);
              }}
            />

            <div style={sliderLabelStyle}>CROP INTENSITY</div>

            <UiSlider
              min={0}
              max={100}
              step={1}
              value={values.panelLayoutCropIntensity}
              onChange={(value) => {
                markAsCustom();
                setters.setPanelLayoutCropIntensity(value);
              }}
            />

            <div style={sliderLabelStyle}>PAN X</div>

            <UiSlider
              min={-100}
              max={100}
              step={1}
              value={values.panelLayoutPanX}
              onChange={(value) => {
                markAsCustom();
                setters.setPanelLayoutPanX(value);
              }}
            />

            <div style={sliderLabelStyle}>PAN Y</div>

            <UiSlider
              min={-100}
              max={100}
              step={1}
              value={values.panelLayoutPanY}
              onChange={(value) => {
                markAsCustom();
                setters.setPanelLayoutPanY(value);
              }}
            />

            <div style={{ marginTop: 12 }}>
              <UiColorInput
                label="BORDER COLOR"
                value={values.panelLayoutBorderColor}
                onChange={(value) => {
                  markAsCustom();
                  setters.setPanelLayoutBorderColor(value);
                }}
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <UiColorInput
                label="BACKGROUND"
                value={values.panelLayoutBackgroundColor}
                onChange={(value) => {
                  markAsCustom();
                  setters.setPanelLayoutBackgroundColor(value);
                }}
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <UiCheckbox
                checked={values.panelLayoutRandomCrop}
                onChange={(checked) => {
                  markAsCustom();
                  setters.setPanelLayoutRandomCrop(checked);
                }}
                label="Random Crop"
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <UiCheckbox
                checked={values.panelLayoutMirrorAlternate}
                onChange={(checked) => {
                  markAsCustom();
                  setters.setPanelLayoutMirrorAlternate(checked);
                }}
                label="Mirror Alternate"
              />
            </div>
          </>
        )}
      </div>

      <div style={orderedSectionStyle(32, 'distortion')}>
        <UiCheckbox
          checked={values.useGlitch}
          onChange={(checked) => {
            runWithoutPanelJump(() => {
              setters.setUseGlitch(checked);
            });
          }}
          label="Glitch"
        />

        {values.useGlitch && (
          <>
            <div style={{ marginTop: 12 }}>
              <UiCheckbox
                checked={values.edgeGlitchOnly}
                onChange={(checked) => {
                  markAsCustom();
                  setters.setEdgeGlitchOnly(checked);
                }}
                label="Edge Only"
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <UiCheckbox
                checked={values.glitchOverrideDither}
                onChange={(checked) => {
                  markAsCustom();
                  setters.setGlitchOverrideDither(checked);
                }}
                label="Override Palette"
              />
            </div>

            <div style={sliderLabelStyle}>WIDTH</div>

            <UiSlider
              min={10}
              max={100}
              step={1}
              value={values.glitchWidth}
              onChange={(value) => {
                markAsCustom();
                setters.setGlitchWidth(value);
              }}
            />

            <div style={sliderLabelStyle}>SHIFT</div>

            <UiSlider
              min={0}
              max={30}
              step={1}
              value={values.glitch}
              onChange={(value) => {
                markAsCustom();
                setters.setGlitch(value);
              }}
            />

            <div style={sliderLabelStyle}>CHAOS</div>

            <UiSlider
              min={0}
              max={100}
              step={1}
              value={values.glitchChaos}
              onChange={(value) => {
                markAsCustom();
                setters.setGlitchChaos(value);
              }}
            />
          </>
        )}
      </div>

      <div style={orderedSectionStyle(33, 'distortion')}>
        <UiCheckbox
          checked={values.useCodecDamage}
          onChange={(checked) => {
            runWithoutPanelJump(() => {
              setters.setUseCodecDamage(checked);
            });
          }}
          label="Codec Damage"
        />

        {values.useCodecDamage && (
          <>
            <div style={sliderLabelStyle}>BLOCK SIZE</div>

            <UiSlider
              min={4}
              max={96}
              step={1}
              value={values.codecDamageBlockSize}
              onChange={(value) => {
                markAsCustom();
                setters.setCodecDamageBlockSize(value);
              }}
            />

            <div style={sliderLabelStyle}>AMOUNT</div>

            <UiSlider
              min={0}
              max={1}
              step={0.05}
              value={values.codecDamageAmount}
              onChange={(value) => {
                markAsCustom();
                setters.setCodecDamageAmount(value);
              }}
            />

            <div style={sliderLabelStyle}>CHROMA SHIFT</div>

            <UiSlider
              min={0}
              max={24}
              step={1}
              value={values.codecDamageChromaShift}
              onChange={(value) => {
                markAsCustom();
                setters.setCodecDamageChromaShift(value);
              }}
            />

            <div style={sliderLabelStyle}>COLOR DEPTH</div>

            <UiSlider
              min={2}
              max={32}
              step={1}
              value={values.codecDamageColorDepth}
              onChange={(value) => {
                markAsCustom();
                setters.setCodecDamageColorDepth(value);
              }}
            />
          </>
        )}
      </div>

      <div style={orderedSectionStyle(34, 'distortion')}>
        <UiCheckbox
          checked={values.useChannelPacketLoss}
          onChange={(checked) => {
            runWithoutPanelJump(() => {
              setters.setUseChannelPacketLoss(checked);
            });
          }}
          label="Channel Packet Loss"
        />

        {values.useChannelPacketLoss && (
          <>
            <div style={sliderLabelStyle}>CHANNEL</div>

            <UiSelect
              value={values.channelPacketLossChannel}
              options={[
                { value: 'rgb', label: 'RGB' },
                { value: 'red', label: 'RED' },
                { value: 'green', label: 'GREEN' },
                { value: 'blue', label: 'BLUE' }
              ]}
              onChange={(value) => {
                markAsCustom();
                setters.setChannelPacketLossChannel(
                  value as ChannelPacketLossChannel
                );
              }}
            />

            <div style={sliderLabelStyle}>BLOCK SIZE</div>

            <UiSlider
              min={4}
              max={128}
              step={1}
              value={values.channelPacketLossBlockSize}
              onChange={(value) => {
                markAsCustom();
                setters.setChannelPacketLossBlockSize(value);
              }}
            />

            <div style={sliderLabelStyle}>LOSS</div>

            <UiSlider
              min={0}
              max={1}
              step={0.05}
              value={values.channelPacketLossAmount}
              onChange={(value) => {
                markAsCustom();
                setters.setChannelPacketLossAmount(value);
              }}
            />

            <div style={sliderLabelStyle}>SHIFT</div>

            <UiSlider
              min={0}
              max={96}
              step={1}
              value={values.channelPacketLossShift}
              onChange={(value) => {
                markAsCustom();
                setters.setChannelPacketLossShift(value);
              }}
            />
          </>
        )}
      </div>

      <div style={orderedSectionStyle(35, 'distortion')}>
        <UiCheckbox
          checked={values.useFrameEcho}
          onChange={(checked) => {
            runWithoutPanelJump(() => {
              setters.setUseFrameEcho(checked);
            });
          }}
          label="Frame Echo"
        />

        {values.useFrameEcho && (
          <>
            <div style={sliderLabelStyle}>MODE</div>

            <UiSelect
              value={values.frameEchoMode}
              options={[
                { value: 'horizontal', label: 'HORIZONTAL' },
                { value: 'vertical', label: 'VERTICAL' },
                { value: 'diagonal', label: 'DIAGONAL' }
              ]}
              onChange={(value) => {
                markAsCustom();
                setters.setFrameEchoMode(value as FrameEchoMode);
              }}
            />

            <div style={sliderLabelStyle}>COPIES</div>

            <UiSlider
              min={1}
              max={8}
              step={1}
              value={values.frameEchoCopies}
              onChange={(value) => {
                markAsCustom();
                setters.setFrameEchoCopies(value);
              }}
            />

            <div style={sliderLabelStyle}>OFFSET</div>

            <UiSlider
              min={0}
              max={128}
              step={1}
              value={values.frameEchoOffset}
              onChange={(value) => {
                markAsCustom();
                setters.setFrameEchoOffset(value);
              }}
            />

            <div style={sliderLabelStyle}>DECAY</div>

            <UiSlider
              min={0}
              max={1}
              step={0.05}
              value={values.frameEchoDecay}
              onChange={(value) => {
                markAsCustom();
                setters.setFrameEchoDecay(value);
              }}
            />

            <div style={sliderLabelStyle}>JITTER</div>

            <UiSlider
              min={0}
              max={64}
              step={1}
              value={values.frameEchoJitter}
              onChange={(value) => {
                markAsCustom();
                setters.setFrameEchoJitter(value);
              }}
            />
          </>
        )}
      </div>

      <div style={orderedSectionStyle(36, 'distortion')}>
        <UiCheckbox
          checked={values.useLumaDisplacement}
          onChange={(checked) => {
            runWithoutPanelJump(() => {
              setters.setUseLumaDisplacement(checked);
            });
          }}
          label="Luma Displacement"
        />

        {values.useLumaDisplacement && (
          <>
            <div style={sliderLabelStyle}>MODE</div>

            <UiSelect
              value={values.lumaDisplacementMode}
              options={[
                { value: 'horizontal', label: 'HORIZONTAL' },
                { value: 'vertical', label: 'VERTICAL' },
                { value: 'split', label: 'SPLIT' }
              ]}
              onChange={(value) => {
                markAsCustom();
                setters.setLumaDisplacementMode(
                  value as LumaDisplacementMode
                );
              }}
            />

            <div style={sliderLabelStyle}>AMOUNT</div>

            <UiSlider
              min={0}
              max={96}
              step={1}
              value={values.lumaDisplacementAmount}
              onChange={(value) => {
                markAsCustom();
                setters.setLumaDisplacementAmount(value);
              }}
            />

            <div style={sliderLabelStyle}>THRESHOLD</div>

            <UiSlider
              min={0}
              max={255}
              step={1}
              value={values.lumaDisplacementThreshold}
              onChange={(value) => {
                markAsCustom();
                setters.setLumaDisplacementThreshold(value);
              }}
            />

            <div style={sliderLabelStyle}>JITTER</div>

            <UiSlider
              min={0}
              max={48}
              step={1}
              value={values.lumaDisplacementJitter}
              onChange={(value) => {
                markAsCustom();
                setters.setLumaDisplacementJitter(value);
              }}
            />
          </>
        )}
      </div>

      <div style={orderedSectionStyle(37, 'distortion')}>
        <UiCheckbox
          checked={values.useScanDrift}
          onChange={(checked) => {
            runWithoutPanelJump(() => {
              setters.setUseScanDrift(checked);
            });
          }}
          label="Scan Drift"
        />

        {values.useScanDrift && (
          <>
            <div style={sliderLabelStyle}>DIRECTION</div>

            <UiSelect
              value={values.scanDriftDirection}
              options={[
                { value: 'horizontal', label: 'HORIZONTAL' },
                { value: 'vertical', label: 'VERTICAL' }
              ]}
              onChange={(value) => {
                markAsCustom();
                setters.setScanDriftDirection(
                  value as ScanDriftDirection
                );
              }}
            />

            <div style={sliderLabelStyle}>AMOUNT</div>

            <UiSlider
              min={0}
              max={128}
              step={1}
              value={values.scanDriftAmount}
              onChange={(value) => {
                markAsCustom();
                setters.setScanDriftAmount(value);
              }}
            />

            <div style={sliderLabelStyle}>BAND SIZE</div>

            <UiSlider
              min={1}
              max={160}
              step={1}
              value={values.scanDriftBandSize}
              onChange={(value) => {
                markAsCustom();
                setters.setScanDriftBandSize(value);
              }}
            />

            <div style={sliderLabelStyle}>CHAOS</div>

            <UiSlider
              min={0}
              max={1}
              step={0.05}
              value={values.scanDriftChaos}
              onChange={(value) => {
                markAsCustom();
                setters.setScanDriftChaos(value);
              }}
            />
          </>
        )}
      </div>

      <div style={orderedSectionStyle(38, 'distortion')}>
        <UiCheckbox
          checked={values.useMotionSmear}
          onChange={(checked) => {
            runWithoutPanelJump(() => {
              setters.setUseMotionSmear(checked);
            });
          }}
          label="Motion Smear"
        />

        {values.useMotionSmear && (
          <>
            <div style={sliderLabelStyle}>DIRECTION</div>

            <UiSelect
              value={values.motionSmearDirection}
              options={[
                { value: 'horizontal', label: 'HORIZONTAL' },
                { value: 'vertical', label: 'VERTICAL' }
              ]}
              onChange={(value) => {
                markAsCustom();
                setters.setMotionSmearDirection(
                  value as MotionSmearDirection
                );
              }}
            />

            <div style={sliderLabelStyle}>LENGTH</div>

            <UiSlider
              min={1}
              max={160}
              step={1}
              value={values.motionSmearLength}
              onChange={(value) => {
                markAsCustom();
                setters.setMotionSmearLength(value);
              }}
            />

            <div style={sliderLabelStyle}>DECAY</div>

            <UiSlider
              min={0}
              max={1}
              step={0.05}
              value={values.motionSmearDecay}
              onChange={(value) => {
                markAsCustom();
                setters.setMotionSmearDecay(value);
              }}
            />

            <div style={sliderLabelStyle}>THRESHOLD</div>

            <UiSlider
              min={0}
              max={255}
              step={1}
              value={values.motionSmearThreshold}
              onChange={(value) => {
                markAsCustom();
                setters.setMotionSmearThreshold(value);
              }}
            />
          </>
        )}
      </div>

      <div style={orderedSectionStyle(39, 'distortion')}>
        <UiCheckbox
          checked={values.useChromatic}
          onChange={(checked) => {
            runWithoutPanelJump(() => {
              setters.setUseChromatic(checked);
            });
          }}
          label="Chromatic"
        />

        {values.useChromatic && (
          <>
            <div style={sliderLabelStyle}>OFFSET</div>

            <UiSlider
              min={0}
              max={20}
              step={1}
              value={values.chromaticOffset}
              onChange={(value) => {
                markAsCustom();
                setters.setChromaticOffset(value);
              }}
            />
          </>
        )}
      </div>

      <div style={orderedSectionStyle(51, 'overlay')}>
        <UiCheckbox
          checked={values.useAscii}
          onChange={(checked) => {
            runWithoutPanelJump(() => {
              setters.setUseAscii(checked);
            });
          }}
          label="ASCII"
        />

        {values.useAscii && (
          <>
            <div style={sliderLabelStyle}>CELL SIZE</div>

            <UiSlider
              min={4}
              max={32}
              step={1}
              value={values.asciiCellSize}
              onChange={(value) => {
                markAsCustom();
                setters.setAsciiCellSize(value);
              }}
            />

            <div style={sliderLabelStyle}>OPACITY</div>

            <UiSlider
              min={0}
              max={1}
              step={0.05}
              value={values.asciiOpacity}
              onChange={(value) => {
                markAsCustom();
                setters.setAsciiOpacity(value);
              }}
            />

            <div style={sliderLabelStyle}>MODE</div>

            <UiSelect
              value={values.asciiMode}
              options={[
                { value: 'overlay', label: 'OVERLAY' },
                { value: 'replace', label: 'REPLACE' }
              ]}
              onChange={(value) => {
                markAsCustom();
                setters.setAsciiMode(value as AsciiMode);
              }}
            />

            <div style={{ marginTop: 9 }}>
              <UiColorInput
                label="COLOR"
                value={values.asciiColor}
                onChange={(value) => {
                  markAsCustom();
                  setters.setAsciiColor(value);
                }}
              />
            </div>
          </>
        )}
      </div>

      <div style={orderedSectionStyle(40, 'distortion')}>
        <UiCheckbox
          checked={values.useNoise}
          onChange={(checked) => {
            runWithoutPanelJump(() => {
              setters.setUseNoise(checked);
            });
          }}
          label="Noise"
        />

        {values.useNoise && (
          <>
            <div style={sliderLabelStyle}>AMOUNT</div>

            <UiSlider
              min={0}
              max={100}
              step={1}
              value={values.noiseAmount}
              onChange={(value) => {
                markAsCustom();
                setters.setNoiseAmount(value);
              }}
            />
          </>
        )}
      </div>

      <div style={orderedSectionStyle(41, 'distortion')}>
        <UiCheckbox
          checked={values.useScanlines}
          onChange={(checked) => {
            runWithoutPanelJump(() => {
              setters.setUseScanlines(checked);
            });
          }}
          label="Scanlines"
        />

        {values.useScanlines && (
          <>
            <div style={sliderLabelStyle}>INTENSITY</div>

            <UiSlider
              min={0}
              max={1}
              step={0.05}
              value={values.scanlineIntensity}
              onChange={(value) => {
                markAsCustom();
                setters.setScanlineIntensity(value);
              }}
            />
          </>
        )}
      </div>

      <div style={orderedSectionStyle(52, 'overlay')}>
        <UiCheckbox
          checked={values.useDataOverlay}
          onChange={(checked) => {
            runWithoutPanelJump(() => {
              setters.setUseDataOverlay(checked);
            });
          }}
          label="Data Overlay"
        />

        {values.useDataOverlay && (
          <>
            <div style={sliderLabelStyle}>MODE</div>

            <UiSelect
              value={values.dataOverlayMode}
              options={[
                { value: 'random-codes', label: 'RANDOM CODES' },
                { value: 'coordinates', label: 'COORDINATES' },
                { value: 'image-info', label: 'IMAGE INFO' },
                { value: 'warning', label: 'WARNING TEXT' },
                { value: 'custom', label: 'CUSTOM TEXT' }
              ]}
              onChange={(value) => {
                markAsCustom();
                setters.setDataOverlayMode(
                  value as DataOverlayMode
                );
              }}
            />

            {values.dataOverlayMode === 'custom' && (
              <>
                <div style={sliderLabelStyle}>TEXT</div>

                <input
                  className="ui-number-input"
                  value={values.dataOverlayCustomText}
                  onChange={(event) => {
                    markAsCustom();
                    setters.setDataOverlayCustomText(
                      event.target.value
                    );
                  }}
                  style={{
                    width: '100%',
                    marginTop: 6,
                    border: '1px solid #164d34'
                  }}
                  spellCheck={false}
                />
              </>
            )}

            <div style={sliderLabelStyle}>DENSITY</div>

            <UiSlider
              min={0}
              max={100}
              step={1}
              value={values.dataOverlayDensity}
              onChange={(value) => {
                markAsCustom();
                setters.setDataOverlayDensity(value);
              }}
            />

            <div style={sliderLabelStyle}>FONT SIZE</div>

            <UiSlider
              min={6}
              max={48}
              step={1}
              value={values.dataOverlayFontSize}
              onChange={(value) => {
                markAsCustom();
                setters.setDataOverlayFontSize(value);
              }}
            />

            <div style={sliderLabelStyle}>OPACITY</div>

            <UiSlider
              min={0}
              max={1}
              step={0.05}
              value={values.dataOverlayOpacity}
              onChange={(value) => {
                markAsCustom();
                setters.setDataOverlayOpacity(value);
              }}
            />

            <div style={{ marginTop: 12 }}>
              <UiColorInput
                label="COLOR"
                value={values.dataOverlayColor}
                onChange={(value) => {
                  markAsCustom();
                  setters.setDataOverlayColor(value);
                }}
              />
            </div>
          </>
        )}
      </div>

      <div style={orderedSectionStyle(53, 'overlay')}>
        <UiCheckbox
          checked={values.usePosterText}
          onChange={(checked) => {
            runWithoutPanelJump(() => {
              setters.setUsePosterText(checked);
            });
          }}
          label="Poster Text"
        />

        {values.usePosterText && (
          <>
            <div style={sliderLabelStyle}>TEXT</div>

            <input
              className="ui-number-input"
              value={values.posterTextContent}
              onChange={(event) => {
                markAsCustom();
                setters.setPosterTextContent(
                  event.target.value
                );
              }}
              style={{
                width: '100%',
                marginTop: 6,
                border: '1px solid #164d34'
              }}
              spellCheck={false}
            />

            <div style={sliderLabelStyle}>FONT</div>

            <UiSelect
              value={values.posterTextFont}
              options={[
                { value: 'consolas', label: 'CONSOLAS' },
                { value: 'lucida-console', label: 'LUCIDA CONSOLE' },
                { value: 'courier-new', label: 'COURIER NEW' },
                { value: 'bahnschrift', label: 'BAHNSCHRIFT' },
                { value: 'arial-black', label: 'ARIAL BLACK' }
              ]}
              onChange={(value) => {
                markAsCustom();
                setters.setPosterTextFont(
                  value as PosterTextFont
                );
              }}
            />

            <div style={sliderLabelStyle}>WEIGHT</div>

            <UiSlider
              min={100}
              max={900}
              step={100}
              value={values.posterTextWeight}
              onChange={(value) => {
                markAsCustom();
                setters.setPosterTextWeight(value);
              }}
            />

            <div style={sliderLabelStyle}>ORIENTATION</div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                marginTop: 8
              }}
            >
              <UiCheckbox
                checked={!values.posterTextVertical}
                onChange={(checked) => {
                  markAsCustom();
                  setters.setPosterTextVertical(!checked);
                }}
                label="Horizontal"
              />

              <UiCheckbox
                checked={values.posterTextVertical}
                onChange={(checked) => {
                  markAsCustom();
                  setters.setPosterTextVertical(checked);
                }}
                label="Vertical"
              />
            </div>

            <div style={sliderLabelStyle}>PANEL ANCHOR</div>

            <UiSelect
              value={values.posterTextPanelAnchor}
              options={[
                { value: 'free', label: 'FREE CANVAS' },
                { value: 'main', label: 'MAIN PANEL' },
                { value: 'center', label: 'CENTER PANEL' },
                { value: 'left', label: 'LEFT PANEL' },
                { value: 'right', label: 'RIGHT PANEL' },
                { value: 'top', label: 'TOP PANEL' },
                { value: 'bottom', label: 'BOTTOM PANEL' }
              ]}
              onChange={(value) => {
                markAsCustom();
                setters.setPosterTextPanelAnchor(
                  value as PosterTextPanelAnchor
                );
              }}
            />

            <div style={sliderLabelStyle}>X POSITION</div>

            <UiSlider
              min={0}
              max={100}
              step={1}
              value={values.posterTextX}
              onChange={(value) => {
                markAsCustom();
                setters.setPosterTextX(value);
              }}
            />

            <div style={sliderLabelStyle}>Y POSITION</div>

            <UiSlider
              min={0}
              max={100}
              step={1}
              value={values.posterTextY}
              onChange={(value) => {
                markAsCustom();
                setters.setPosterTextY(value);
              }}
            />

            <div style={sliderLabelStyle}>SIZE</div>

            <UiSlider
              min={12}
              max={220}
              step={1}
              value={values.posterTextSize}
              onChange={(value) => {
                markAsCustom();
                setters.setPosterTextSize(value);
              }}
            />

            <div style={sliderLabelStyle}>TRACKING</div>

            <UiSlider
              min={0}
              max={48}
              step={1}
              value={values.posterTextTracking}
              onChange={(value) => {
                markAsCustom();
                setters.setPosterTextTracking(value);
              }}
            />

            <div style={sliderLabelStyle}>OPACITY</div>

            <UiSlider
              min={0}
              max={1}
              step={0.05}
              value={values.posterTextOpacity}
              onChange={(value) => {
                markAsCustom();
                setters.setPosterTextOpacity(value);
              }}
            />

            <div style={sliderLabelStyle}>MODE</div>

            <UiSelect
              value={values.posterTextMode}
              options={[
                { value: 'blend', label: 'BLEND' },
                { value: 'replace', label: 'REPLACE' }
              ]}
              onChange={(value) => {
                markAsCustom();
                setters.setPosterTextMode(
                  value as PosterTextMode
                );
              }}
            />

            <div style={{ marginTop: 12 }}>
              <UiColorInput
                label="COLOR"
                value={values.posterTextColor}
                onChange={(value) => {
                  markAsCustom();
                  setters.setPosterTextColor(value);
                }}
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <UiCheckbox
                checked={values.posterTextGlitch}
                onChange={(checked) => {
                  markAsCustom();
                  setters.setPosterTextGlitch(checked);
                }}
                label="Glitch Text"
              />
            </div>
          </>
        )}
      </div>

      <div style={orderedSectionStyle(54, 'overlay')}>
        <UiCheckbox
          checked={values.useHudFrame}
          onChange={(checked) => {
            runWithoutPanelJump(() => {
              setters.setUseHudFrame(checked);
            });
          }}
          label="HUD Frame"
        />

        {values.useHudFrame && (
          <>
            <div style={sliderLabelStyle}>STYLE</div>

            <UiSelect
              value={values.hudFrameStyle}
              options={[
                { value: 'scan-frame', label: 'SCAN FRAME' },
                { value: 'archive-frame', label: 'ARCHIVE FRAME' },
                { value: 'targeting-frame', label: 'TARGETING FRAME' },
                { value: 'corrupted-ui', label: 'CORRUPTED UI' },
                { value: 'minimal', label: 'MINIMAL' }
              ]}
              onChange={(value) => {
                markAsCustom();
                setters.setHudFrameStyle(value as HudFrameStyle);
              }}
            />

            <div style={sliderLabelStyle}>OPACITY</div>

            <UiSlider
              min={0}
              max={1}
              step={0.05}
              value={values.hudFrameOpacity}
              onChange={(value) => {
                markAsCustom();
                setters.setHudFrameOpacity(value);
              }}
            />

            <div style={sliderLabelStyle}>SAFE AREA</div>

            <UiSlider
              min={0}
              max={20}
              step={1}
              value={values.hudFrameSafeArea}
              onChange={(value) => {
                markAsCustom();
                setters.setHudFrameSafeArea(value);
              }}
            />

            <div style={{ marginTop: 12 }}>
              <UiColorInput
                label="COLOR"
                value={values.hudFrameColor}
                onChange={(value) => {
                  markAsCustom();
                  setters.setHudFrameColor(value);
                }}
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <UiCheckbox
                checked={values.hudFrameShowGrid}
                onChange={(checked) => {
                  runWithoutPanelJump(() => {
                    setters.setHudFrameShowGrid(checked);
                  });
                }}
                label="Grid"
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <UiCheckbox
                checked={values.hudFrameShowLabels}
                onChange={(checked) => {
                  runWithoutPanelJump(() => {
                    setters.setHudFrameShowLabels(checked);
                  });
                }}
                label="Labels"
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <UiCheckbox
                checked={values.hudFrameShowCornerMarks}
                onChange={(checked) => {
                  runWithoutPanelJump(() => {
                    setters.setHudFrameShowCornerMarks(checked);
                  });
                }}
                label="Corner Marks"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
