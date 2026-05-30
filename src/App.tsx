import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type CSSProperties
} from 'react';

import {
  applyDithering,
  type DitherMode
} from './effects/dither';

import { applyScanlines } from './effects/scanlines';
import { applyNoise } from './effects/noise';
import { applyChromatic } from './effects/chromatic';
import { applyAscii } from './effects/ascii';
import { applyPsx } from './effects/psx';
import { applyPixelSort } from './effects/pixelSort';

import {
  applyDataOverlay,
  type DataOverlayMode
} from './effects/dataOverlay';

import {
  applyHudFrame,
  type HudFrameStyle
} from './effects/hudFrame';

import {
  applyPatternDither,
  type PatternDitherShape
} from './effects/patternDither';

import {
  applySignalWaves,
  type SignalWavesMode
} from './effects/signalWaves';

import {
  applyPanelLayout,
  type PanelLayoutMode
} from './effects/panelLayout';

import {
  applyRegionalPalette,
  type RegionalPaletteMode,
  type RegionalPaletteZone
} from './effects/regionalPalette';

import { PRESETS, type EffectPreset } from './presets';
import { createRandom, createSeed } from './utils/random';

import { UiCheckbox } from './components/UiCheckbox';
import { UiSlider } from './components/UiSlider';
import { UiSelect } from './components/UiSelect';
import { UiColorInput } from './components/UiColorInput';

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

type ExportFormat = 'png' | 'jpeg';
type ExportDpi = 72 | 150 | 300;

type PanelPresetFields = {
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
};

type RegionalPresetFields = {
  useRegionalPalette: boolean;
  regionalPaletteMode: RegionalPaletteMode;
  regionalPaletteZones: RegionalPaletteZone[];
  regionalPaletteRandomizeZones: boolean;
  regionalPaletteRandomCellSize: number;
  regionalPaletteZoneChaos: number;
  regionalPaletteZoneSeed: number;
};

type EffectsSnapshot = {
  selectedPresetName: string;

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
};

const DEFAULT_REGIONAL_PALETTE_ZONES: RegionalPaletteZone[] = [
  {
    startColor: '#000000',
    endColor: '#00ff99',
    steps: 4,
    invert: false
  },
  {
    startColor: '#050505',
    endColor: '#d6ff00',
    steps: 4,
    invert: false
  },
  {
    startColor: '#000000',
    endColor: '#00c8ff',
    steps: 4,
    invert: false
  },
  {
    startColor: '#140014',
    endColor: '#ff00cc',
    steps: 4,
    invert: false
  }
];

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

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    useState<'horizontal' | 'vertical'>('horizontal');
  const [pixelSortMode, setPixelSortMode] =
    useState<'bright' | 'dark' | 'all'>('bright');
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

  const [useGlitch, setUseGlitch] = useState(false);
  const [glitch, setGlitch] = useState(0);
  const [glitchChaos, setGlitchChaos] = useState(0);
  const [glitchWidth, setGlitchWidth] = useState(100);
  const [glitchOverrideDither, setGlitchOverrideDither] =
    useState(false);
  const [edgeGlitchOnly, setEdgeGlitchOnly] = useState(true);

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

    const scale = exportDpi / 72;

    return {
      sourceWidth: originalImage.width,
      sourceHeight: originalImage.height,
      exportWidth: Math.round(originalImage.width * scale),
      exportHeight: Math.round(originalImage.height * scale)
    };
  }, [originalImage, exportDpi]);

  const activeSeed = useSeed ? seed : liveSeed;

  const markAsCustom = useCallback(() => {
    setSelectedPresetName('CUSTOM');
  }, []);

  const createEffectsSnapshot =
    useCallback((): EffectsSnapshot => {
      return {
        selectedPresetName,

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
        regionalPaletteZones:
          regionalPaletteZones.map((zone) => ({
            ...zone
          })),
        regionalPaletteRandomizeZones,
        regionalPaletteRandomCellSize,
        regionalPaletteZoneChaos,
        regionalPaletteZoneSeed,

        useDither,
        ditherMode,
        threshold,

        useGlitch,
        glitch,
        glitchChaos,
        glitchWidth,
        glitchOverrideDither,
        edgeGlitchOnly,

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

        useDataOverlay,
        dataOverlayMode,
        dataOverlayDensity,
        dataOverlayFontSize,
        dataOverlayOpacity,
        dataOverlayColor,
        dataOverlayCustomText,

        useHudFrame,
        hudFrameStyle,
        hudFrameOpacity,
        hudFrameColor,
        hudFrameShowGrid,
        hudFrameShowLabels,
        hudFrameShowCornerMarks,
        hudFrameSafeArea,

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
        scanlineIntensity
      };
    }, [
      selectedPresetName,

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

      useGlitch,
      glitch,
      glitchChaos,
      glitchWidth,
      glitchOverrideDither,
      edgeGlitchOnly,

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

      useDataOverlay,
      dataOverlayMode,
      dataOverlayDensity,
      dataOverlayFontSize,
      dataOverlayOpacity,
      dataOverlayColor,
      dataOverlayCustomText,

      useHudFrame,
      hudFrameStyle,
      hudFrameOpacity,
      hudFrameColor,
      hudFrameShowGrid,
      hudFrameShowLabels,
      hudFrameShowCornerMarks,
      hudFrameSafeArea,

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
      scanlineIntensity
    ]);

  const restoreEffectsSnapshot = useCallback(
    (snapshot: EffectsSnapshot) => {
      setSelectedPresetName(snapshot.selectedPresetName);

      setUsePixelation(snapshot.usePixelation);
      setPixelSize(snapshot.pixelSize);

      setUsePsx(snapshot.usePsx);
      setPsxResolutionScale(snapshot.psxResolutionScale);
      setPsxColorLevels(snapshot.psxColorLevels);
      setPsxWarpAmount(snapshot.psxWarpAmount);
      setPsxJitterAmount(snapshot.psxJitterAmount);
      setPsxDitherStrength(snapshot.psxDitherStrength);
      setPsxBlockSize(snapshot.psxBlockSize);
      setPsxCompositeBlur(snapshot.psxCompositeBlur);
      setPsxChromaBleed(snapshot.psxChromaBleed);

      setUsePixelSort(snapshot.usePixelSort);
      setPixelSortDirection(snapshot.pixelSortDirection);
      setPixelSortMode(snapshot.pixelSortMode);
      setPixelSortThreshold(snapshot.pixelSortThreshold);
      setPixelSortAmount(snapshot.pixelSortAmount);

      setUsePalette(snapshot.usePalette);
      setColorStart(snapshot.colorStart);
      setColorEnd(snapshot.colorEnd);
      setSteps(snapshot.steps);
      setSwapPaletteColors(snapshot.swapPaletteColors);

      setUseRegionalPalette(
        snapshot.useRegionalPalette
      );
      setRegionalPaletteMode(
        snapshot.regionalPaletteMode
      );
      setRegionalPaletteZones(
        snapshot.regionalPaletteZones.map((zone) => ({
          ...zone
        }))
      );

      setRegionalPaletteRandomizeZones(
        snapshot.regionalPaletteRandomizeZones
      );

      setRegionalPaletteRandomCellSize(
        snapshot.regionalPaletteRandomCellSize
      );

      setRegionalPaletteZoneChaos(
        snapshot.regionalPaletteZoneChaos
      );

      setRegionalPaletteZoneSeed(
        snapshot.regionalPaletteZoneSeed
      );

      setUseDither(snapshot.useDither);
      setDitherMode(snapshot.ditherMode);
      setThreshold(snapshot.threshold);

      setUseGlitch(snapshot.useGlitch);
      setGlitch(snapshot.glitch);
      setGlitchChaos(snapshot.glitchChaos);
      setGlitchWidth(snapshot.glitchWidth);
      setGlitchOverrideDither(snapshot.glitchOverrideDither);
      setEdgeGlitchOnly(snapshot.edgeGlitchOnly);

      setUseChromatic(snapshot.useChromatic);
      setChromaticOffset(snapshot.chromaticOffset);

      setUseAscii(snapshot.useAscii);
      setAsciiCellSize(snapshot.asciiCellSize);
      setAsciiOpacity(snapshot.asciiOpacity);
      setAsciiMode(snapshot.asciiMode);
      setAsciiColor(snapshot.asciiColor);

      setUsePatternDither(snapshot.usePatternDither);
      setPatternDitherShape(snapshot.patternDitherShape);
      setPatternDitherScale(snapshot.patternDitherScale);
      setPatternDitherDensity(snapshot.patternDitherDensity);
      setPatternDitherOpacity(snapshot.patternDitherOpacity);
      setPatternDitherColor(snapshot.patternDitherColor);
      setPatternDitherBackgroundColor(
        snapshot.patternDitherBackgroundColor
      );
      setPatternDitherInvert(snapshot.patternDitherInvert);
      setPatternDitherReplaceImage(
        snapshot.patternDitherReplaceImage
      );

      setUseDataOverlay(snapshot.useDataOverlay);
      setDataOverlayMode(snapshot.dataOverlayMode);
      setDataOverlayDensity(snapshot.dataOverlayDensity);
      setDataOverlayFontSize(snapshot.dataOverlayFontSize);
      setDataOverlayOpacity(snapshot.dataOverlayOpacity);
      setDataOverlayColor(snapshot.dataOverlayColor);
      setDataOverlayCustomText(snapshot.dataOverlayCustomText);

      setUseHudFrame(snapshot.useHudFrame);
      setHudFrameStyle(snapshot.hudFrameStyle);
      setHudFrameOpacity(snapshot.hudFrameOpacity);
      setHudFrameColor(snapshot.hudFrameColor);
      setHudFrameShowGrid(snapshot.hudFrameShowGrid);
      setHudFrameShowLabels(snapshot.hudFrameShowLabels);
      setHudFrameShowCornerMarks(
        snapshot.hudFrameShowCornerMarks
      );
      setHudFrameSafeArea(snapshot.hudFrameSafeArea);

      setUseSignalWaves(snapshot.useSignalWaves);
      setSignalWavesMode(snapshot.signalWavesMode);
      setSignalWavesFrequency(snapshot.signalWavesFrequency);
      setSignalWavesAmplitude(snapshot.signalWavesAmplitude);
      setSignalWavesDensity(snapshot.signalWavesDensity);
      setSignalWavesOpacity(snapshot.signalWavesOpacity);
      setSignalWavesColor(snapshot.signalWavesColor);
      setSignalWavesBackgroundColor(
        snapshot.signalWavesBackgroundColor
      );
      setSignalWavesReplaceImage(
        snapshot.signalWavesReplaceImage
      );
      setSignalWavesReactToImage(
        snapshot.signalWavesReactToImage
      );

      setUsePanelLayout(snapshot.usePanelLayout);
      setPanelLayoutMode(snapshot.panelLayoutMode);
      setPanelLayoutGap(snapshot.panelLayoutGap);
      setPanelLayoutBorderWidth(
        snapshot.panelLayoutBorderWidth
      );
      setPanelLayoutBorderColor(
        snapshot.panelLayoutBorderColor
      );
      setPanelLayoutBackgroundColor(
        snapshot.panelLayoutBackgroundColor
      );
      setPanelLayoutPanelOpacity(
        snapshot.panelLayoutPanelOpacity
      );
      setPanelLayoutRandomCrop(
        snapshot.panelLayoutRandomCrop
      );
      setPanelLayoutCropIntensity(
        snapshot.panelLayoutCropIntensity
      );
      setPanelLayoutPanX(snapshot.panelLayoutPanX);
      setPanelLayoutPanY(snapshot.panelLayoutPanY);
      setPanelLayoutMirrorAlternate(
        snapshot.panelLayoutMirrorAlternate
      );

      setUseNoise(snapshot.useNoise);
      setNoiseAmount(snapshot.noiseAmount);

      setUseScanlines(snapshot.useScanlines);
      setScanlineIntensity(snapshot.scanlineIntensity);
    },
    []
  );

  const clearEffects = useCallback(() => {
    setLastEffectsSnapshot(createEffectsSnapshot());

    setSelectedPresetName('CUSTOM');

    setUsePixelation(false);
    setPixelSize(4);

    setUsePsx(false);
    setPsxResolutionScale(4);
    setPsxColorLevels(8);
    setPsxWarpAmount(2);
    setPsxJitterAmount(2);
    setPsxDitherStrength(0.45);
    setPsxBlockSize(12);
    setPsxCompositeBlur(0.8);
    setPsxChromaBleed(1);

    setUsePixelSort(false);
    setPixelSortDirection('horizontal');
    setPixelSortMode('bright');
    setPixelSortThreshold(160);
    setPixelSortAmount(0.75);

    setUsePalette(false);
    setColorStart('#000000');
    setColorEnd('#00ff00');
    setSteps(4);
    setSwapPaletteColors(false);

     setUseRegionalPalette(false);
    setRegionalPaletteMode('random-zones');
    setRegionalPaletteZones(
      DEFAULT_REGIONAL_PALETTE_ZONES.map((zone) => ({
        ...zone
      }))
    );
    setRegionalPaletteRandomizeZones(false);
    setRegionalPaletteRandomCellSize(180);
    setRegionalPaletteZoneChaos(55);
    setRegionalPaletteZoneSeed(12345);

    setUseDither(false);
    setDitherMode('floyd-steinberg');
    setThreshold(255);

    setUseGlitch(false);
    setGlitch(0);
    setGlitchChaos(0);
    setGlitchWidth(100);
    setGlitchOverrideDither(false);
    setEdgeGlitchOnly(true);

    setUseChromatic(false);
    setChromaticOffset(3);

    setUseAscii(false);
    setAsciiCellSize(12);
    setAsciiOpacity(0.5);
    setAsciiMode('overlay');
    setAsciiColor('#00ff99');

    setUsePatternDither(false);
    setPatternDitherShape('dot');
    setPatternDitherScale(12);
    setPatternDitherDensity(100);
    setPatternDitherOpacity(0.9);
    setPatternDitherColor('#00ff99');
    setPatternDitherBackgroundColor('#050505');
    setPatternDitherInvert(false);
    setPatternDitherReplaceImage(false);

    setUseDataOverlay(false);
    setDataOverlayMode('random-codes');
    setDataOverlayDensity(18);
    setDataOverlayFontSize(11);
    setDataOverlayOpacity(0.45);
    setDataOverlayColor('#00ff99');
    setDataOverlayCustomText('SIGNAL UNSTABLE');

    setUseHudFrame(false);
    setHudFrameStyle('scan-frame');
    setHudFrameOpacity(0.75);
    setHudFrameColor('#00ff99');
    setHudFrameShowGrid(true);
    setHudFrameShowLabels(true);
    setHudFrameShowCornerMarks(true);
    setHudFrameSafeArea(3);

    setUseSignalWaves(false);
    setSignalWavesMode('horizontal');
    setSignalWavesFrequency(12);
    setSignalWavesAmplitude(26);
    setSignalWavesDensity(18);
    setSignalWavesOpacity(0.65);
    setSignalWavesColor('#00ff99');
    setSignalWavesBackgroundColor('#050505');
    setSignalWavesReplaceImage(false);
    setSignalWavesReactToImage(true);

    setUsePanelLayout(false);
    setPanelLayoutMode('side-panel');
    setPanelLayoutGap(10);
    setPanelLayoutBorderWidth(1);
    setPanelLayoutBorderColor('#00ff99');
    setPanelLayoutBackgroundColor('#050505');
    setPanelLayoutPanelOpacity(1);
    setPanelLayoutRandomCrop(true);
    setPanelLayoutCropIntensity(55);
    setPanelLayoutPanX(0);
    setPanelLayoutPanY(0);
    setPanelLayoutMirrorAlternate(false);

    setUseNoise(false);
    setNoiseAmount(15);

    setUseScanlines(false);
    setScanlineIntensity(0.2);
  }, [createEffectsSnapshot]);

  const fockGoBack = useCallback(() => {
    if (!lastEffectsSnapshot) return;

    restoreEffectsSnapshot(lastEffectsSnapshot);
    setLastEffectsSnapshot(null);
  }, [lastEffectsSnapshot, restoreEffectsSnapshot]);

  const calcStrips = useCallback(
    (
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
    },
    []
  );

  const saveImage = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const scale = exportDpi / 72;

    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d');

    if (!exportCtx) return;

    exportCanvas.width = Math.round(canvas.width * scale);
    exportCanvas.height = Math.round(canvas.height * scale);

    exportCtx.imageSmoothingEnabled = false;

    if (exportFormat === 'jpeg') {
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

    link.download = `entropy-engine-${exportDpi}dpi-${Date.now()}.${extension}`;
    link.href =
      quality === undefined
        ? exportCanvas.toDataURL(mimeType)
        : exportCanvas.toDataURL(mimeType, quality);

    link.click();
  }, [exportFormat, exportDpi]);

  const applyPreset = useCallback((preset: EffectPreset) => {
    const panelPreset =
      preset as EffectPreset & Partial<PanelPresetFields>;

    const regionalPreset =
      preset as EffectPreset & Partial<RegionalPresetFields>;

    setSelectedPresetName(preset.name);

    setUsePixelation(preset.usePixelation);
    setPixelSize(preset.pixelSize);

    setUsePsx(preset.usePsx);
    setPsxResolutionScale(preset.psxResolutionScale);
    setPsxColorLevels(preset.psxColorLevels);
    setPsxWarpAmount(preset.psxWarpAmount);
    setPsxJitterAmount(preset.psxJitterAmount);
    setPsxDitherStrength(preset.psxDitherStrength);
    setPsxBlockSize(preset.psxBlockSize);
    setPsxCompositeBlur(preset.psxCompositeBlur);
    setPsxChromaBleed(preset.psxChromaBleed);

    setUsePixelSort(preset.usePixelSort);
    setPixelSortDirection(preset.pixelSortDirection);
    setPixelSortMode(preset.pixelSortMode);
    setPixelSortThreshold(preset.pixelSortThreshold);
    setPixelSortAmount(preset.pixelSortAmount);

    setUsePalette(preset.usePalette);
    setColorStart(preset.colorStart);
    setColorEnd(preset.colorEnd);
    setSteps(preset.steps);
    setSwapPaletteColors(preset.swapPaletteColors);

    setUseRegionalPalette(
      regionalPreset.useRegionalPalette ?? false
    );
    setRegionalPaletteMode(
      regionalPreset.regionalPaletteMode ?? 'random-zones'
    );
    setRegionalPaletteZones(
      regionalPreset.regionalPaletteZones
        ? regionalPreset.regionalPaletteZones.map((zone) => ({
            ...zone
          }))
        : DEFAULT_REGIONAL_PALETTE_ZONES.map((zone) => ({
            ...zone
          }))
    );
    setRegionalPaletteRandomizeZones(
      regionalPreset.regionalPaletteRandomizeZones ?? false
    );
    setRegionalPaletteRandomCellSize(
      regionalPreset.regionalPaletteRandomCellSize ?? 180
    );
    setRegionalPaletteZoneChaos(
      regionalPreset.regionalPaletteZoneChaos ?? 55
    );
    setRegionalPaletteZoneSeed(
      regionalPreset.regionalPaletteZoneSeed ?? 12345
    );

    setUseDither(preset.useDither);
    setDitherMode(preset.ditherMode);
    setThreshold(preset.threshold);

    setUseGlitch(preset.useGlitch);
    setGlitch(preset.glitch);
    setGlitchChaos(preset.glitchChaos);
    setGlitchWidth(preset.glitchWidth);
    setGlitchOverrideDither(preset.glitchOverrideDither);
    setEdgeGlitchOnly(preset.edgeGlitchOnly);

    setUseChromatic(preset.useChromatic);
    setChromaticOffset(preset.chromaticOffset);

    setUseAscii(preset.useAscii);
    setAsciiCellSize(preset.asciiCellSize);
    setAsciiOpacity(preset.asciiOpacity);
    setAsciiMode(preset.asciiMode);
    setAsciiColor(preset.asciiColor);

    setUsePatternDither(preset.usePatternDither);
    setPatternDitherShape(preset.patternDitherShape);
    setPatternDitherScale(preset.patternDitherScale);
    setPatternDitherDensity(preset.patternDitherDensity);
    setPatternDitherOpacity(preset.patternDitherOpacity);
    setPatternDitherColor(preset.patternDitherColor);
    setPatternDitherBackgroundColor(
      preset.patternDitherBackgroundColor
    );
    setPatternDitherInvert(preset.patternDitherInvert);
    setPatternDitherReplaceImage(
      preset.patternDitherReplaceImage
    );

    setUseSignalWaves(preset.useSignalWaves);
    setSignalWavesMode(preset.signalWavesMode);
    setSignalWavesFrequency(preset.signalWavesFrequency);
    setSignalWavesAmplitude(preset.signalWavesAmplitude);
    setSignalWavesDensity(preset.signalWavesDensity);
    setSignalWavesOpacity(preset.signalWavesOpacity);
    setSignalWavesColor(preset.signalWavesColor);
    setSignalWavesBackgroundColor(
      preset.signalWavesBackgroundColor
    );
    setSignalWavesReplaceImage(
      preset.signalWavesReplaceImage
    );
    setSignalWavesReactToImage(
      preset.signalWavesReactToImage
    );

    setUseDataOverlay(preset.useDataOverlay);
    setDataOverlayMode(preset.dataOverlayMode);
    setDataOverlayDensity(preset.dataOverlayDensity);
    setDataOverlayFontSize(preset.dataOverlayFontSize);
    setDataOverlayOpacity(preset.dataOverlayOpacity);
    setDataOverlayColor(preset.dataOverlayColor);
    setDataOverlayCustomText(preset.dataOverlayCustomText);

    setUseHudFrame(preset.useHudFrame);
    setHudFrameStyle(preset.hudFrameStyle);
    setHudFrameOpacity(preset.hudFrameOpacity);
    setHudFrameColor(preset.hudFrameColor);
    setHudFrameShowGrid(preset.hudFrameShowGrid);
    setHudFrameShowLabels(preset.hudFrameShowLabels);
    setHudFrameShowCornerMarks(
      preset.hudFrameShowCornerMarks
    );
    setHudFrameSafeArea(preset.hudFrameSafeArea);

    setUsePanelLayout(panelPreset.usePanelLayout ?? false);
    setPanelLayoutMode(
      panelPreset.panelLayoutMode ?? 'side-panel'
    );
    setPanelLayoutGap(panelPreset.panelLayoutGap ?? 10);
    setPanelLayoutBorderWidth(
      panelPreset.panelLayoutBorderWidth ?? 1
    );
    setPanelLayoutBorderColor(
      panelPreset.panelLayoutBorderColor ?? '#00ff99'
    );
    setPanelLayoutBackgroundColor(
      panelPreset.panelLayoutBackgroundColor ?? '#050505'
    );
    setPanelLayoutPanelOpacity(
      panelPreset.panelLayoutPanelOpacity ?? 1
    );
    setPanelLayoutRandomCrop(
      panelPreset.panelLayoutRandomCrop ?? true
    );
    setPanelLayoutCropIntensity(
      panelPreset.panelLayoutCropIntensity ?? 55
    );
    setPanelLayoutPanX(panelPreset.panelLayoutPanX ?? 0);
    setPanelLayoutPanY(panelPreset.panelLayoutPanY ?? 0);
    setPanelLayoutMirrorAlternate(
      panelPreset.panelLayoutMirrorAlternate ?? false
    );

    setUseNoise(preset.useNoise);
    setNoiseAmount(preset.noiseAmount);

    setUseScanlines(preset.useScanlines);
    setScanlineIntensity(preset.scanlineIntensity);

    setLastEffectsSnapshot(null);
  }, []);

  const processImage = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas || !originalImage) return;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const random = createRandom(activeSeed);

    const width = originalImage.width;
    const height = originalImage.height;

    canvas.width = width;
    canvas.height = height;

    ctx.imageSmoothingEnabled = false;

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(originalImage, 0, 0, width, height);

    if (showOriginal) return;

    if (usePixelation && pixelSize > 1) {
      const smallWidth = Math.max(1, Math.floor(width / pixelSize));
      const smallHeight = Math.max(1, Math.floor(height / pixelSize));

      if (!tempCanvasRef.current) {
        tempCanvasRef.current = document.createElement('canvas');
      }

      const tempCanvas = tempCanvasRef.current;
      const tempCtx = tempCanvas.getContext('2d');

      if (tempCtx) {
        tempCanvas.width = smallWidth;
        tempCanvas.height = smallHeight;

        tempCtx.imageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;

        tempCtx.drawImage(canvas, 0, 0, smallWidth, smallHeight);

        ctx.clearRect(0, 0, width, height);

        ctx.drawImage(
          tempCanvas,
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

    if (usePsx) {
      applyPsx(ctx, width, height, {
        resolutionScale: psxResolutionScale,
        colorLevels: psxColorLevels,
        warpAmount: psxWarpAmount,
        jitterAmount: psxJitterAmount,
        ditherStrength: psxDitherStrength,
        blockSize: psxBlockSize,
        compositeBlur: psxCompositeBlur,
        chromaBleed: psxChromaBleed,
        random
      });
    }

    if (usePixelSort) {
      applyPixelSort(ctx, width, height, {
        direction: pixelSortDirection,
        mode: pixelSortMode,
        threshold: pixelSortThreshold,
        amount: pixelSortAmount
      });
    }

    const prePaletteCopy = ctx.getImageData(0, 0, width, height);

    const palette = usePalette
      ? generatePalette(
          swapPaletteColors ? colorEnd : colorStart,
          swapPaletteColors ? colorStart : colorEnd,
          steps
        )
      : [
          { r: 0, g: 0, b: 0 },
          { r: 255, g: 255, b: 255 }
        ];

    if (useRegionalPalette) {
        applyRegionalPalette(ctx, width, height, {
        mode: regionalPaletteMode,
        zones: regionalPaletteZones,
        panelLayoutMode,
        panelLayoutGap,
        randomizeZones: regionalPaletteRandomizeZones,
        randomCellSize: regionalPaletteRandomCellSize,
        randomZoneChaos: regionalPaletteZoneChaos,
        randomSeed: regionalPaletteZoneSeed
      });
    } else {
      if (usePalette && !useDither) {
        applyPaletteByBrightness(
          ctx,
          width,
          height,
          palette
        );
      }

      if (useDither) {
        applyDithering(
          ctx,
          width,
          height,
          threshold,
          palette,
          ditherMode
        );
      }
    }

    const processedCopy = ctx.getImageData(0, 0, width, height);

    if (useGlitch && glitch > 0) {
      const target = ctx.getImageData(0, 0, width, height);

      const source = glitchOverrideDither
        ? prePaletteCopy
        : processedCopy;

      const strips = calcStrips(glitchChaos, glitchWidth, random);

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

        const shift = Math.round((random() - 0.5) * glitch * 8);

        for (let y = yStart; y < yEnd; y++) {
          for (let x = xStart; x < xEnd; x++) {
            const srcX = Math.max(
              0,
              Math.min(width - 1, x + shift)
            );

            const targetIndex = (y * width + x) * 4;
            const sourceIndex = (y * width + srcX) * 4;

            let shouldAffect = true;

            if (edgeGlitchOnly) {
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

            target.data[targetIndex + 1] = glitchOverrideDither
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

    if (useChromatic && chromaticOffset > 0) {
      applyChromatic(ctx, width, height, {
        amount: chromaticOffset
      });
    }

    if (useAscii) {
      applyAscii(ctx, width, height, {
        cellSize: asciiCellSize,
        opacity: asciiOpacity,
        mode: asciiMode,
        color: asciiColor
      });
    }

    if (usePatternDither) {
      applyPatternDither(ctx, width, height, {
        shape: patternDitherShape,
        scale: patternDitherScale,
        density: patternDitherDensity,
        opacity: patternDitherOpacity,
        color: patternDitherColor,
        backgroundColor: patternDitherBackgroundColor,
        invert: patternDitherInvert,
        replaceImage: patternDitherReplaceImage
      });
    }

    if (useSignalWaves) {
      applySignalWaves(ctx, width, height, {
        mode: signalWavesMode,
        frequency: signalWavesFrequency,
        amplitude: signalWavesAmplitude,
        density: signalWavesDensity,
        opacity: signalWavesOpacity,
        color: signalWavesColor,
        backgroundColor: signalWavesBackgroundColor,
        replaceImage: signalWavesReplaceImage,
        reactToImage: signalWavesReactToImage
      });
    }

    if (usePanelLayout) {
      applyPanelLayout(ctx, width, height, {
        mode: panelLayoutMode,
        gap: panelLayoutGap,
        borderWidth: panelLayoutBorderWidth,
        borderColor: panelLayoutBorderColor,
        backgroundColor: panelLayoutBackgroundColor,
        panelOpacity: panelLayoutPanelOpacity,
        randomCrop: panelLayoutRandomCrop,
        cropIntensity: panelLayoutCropIntensity,
        panX: panelLayoutPanX,
        panY: panelLayoutPanY,
        mirrorAlternate: panelLayoutMirrorAlternate,
        seed: activeSeed
      });
    }

    if (useNoise && noiseAmount > 0) {
      applyNoise(ctx, width, height, noiseAmount, random);
    }

    if (useScanlines && scanlineIntensity > 0) {
      applyScanlines(ctx, width, height, scanlineIntensity);
    }

    if (useDataOverlay) {
      applyDataOverlay(ctx, width, height, {
        mode: dataOverlayMode,
        density: dataOverlayDensity,
        fontSize: dataOverlayFontSize,
        opacity: dataOverlayOpacity,
        color: dataOverlayColor,
        customText: dataOverlayCustomText,
        seed: activeSeed
      });
    }

    if (useHudFrame) {
      applyHudFrame(ctx, width, height, {
        style: hudFrameStyle,
        opacity: hudFrameOpacity,
        color: hudFrameColor,
        showGrid: hudFrameShowGrid,
        showLabels: hudFrameShowLabels,
        showCornerMarks: hudFrameShowCornerMarks,
        safeArea: hudFrameSafeArea
      });
    }
  }, [
    originalImage,
    showOriginal,
    activeSeed,

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

    useGlitch,
    glitch,
    glitchChaos,
    glitchWidth,
    glitchOverrideDither,
    edgeGlitchOnly,
    calcStrips,

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

    useHudFrame,
    hudFrameStyle,
    hudFrameOpacity,
    hudFrameColor,
    hudFrameShowGrid,
    hudFrameShowLabels,
    hudFrameShowCornerMarks,
    hudFrameSafeArea
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
      if (!originalImage || event.button !== 0) return;

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
    [originalImage, pan]
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
          cursor: originalImage
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
          values={{
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

            useGlitch,
            glitch,
            glitchChaos,
            glitchWidth,
            glitchOverrideDither,
            edgeGlitchOnly,

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

            useHudFrame,
            hudFrameStyle,
            hudFrameOpacity,
            hudFrameColor,
            hudFrameShowGrid,
            hudFrameShowLabels,
            hudFrameShowCornerMarks,
            hudFrameSafeArea
          }}
          setters={{
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
            updateRegionalPaletteZone,
            setRegionalPaletteRandomizeZones,
            setRegionalPaletteRandomCellSize,
            setRegionalPaletteZoneChaos,
            randomizeRegionalPaletteZoneMap,

            setUseDither,
            setDitherMode,
            setThreshold,

            setUseGlitch,
            setGlitch,
            setGlitchChaos,
            setGlitchWidth,
            setGlitchOverrideDither,
            setEdgeGlitchOnly,

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

            setUseHudFrame,
            setHudFrameStyle,
            setHudFrameOpacity,
            setHudFrameColor,
            setHudFrameShowGrid,
            setHudFrameShowLabels,
            setHudFrameShowCornerMarks,
            setHudFrameSafeArea
          }}
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
  values: any;
  setters: any;
};

function EffectSections({
  sectionStyle,
  sliderLabelStyle,
  markAsCustom,
  values,
  setters
}: EffectSectionsProps) {
  const [isDitherPanelOpen, setIsDitherPanelOpen] =
    useState(values.useDither || values.usePatternDither);

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

  return (
    <>
      <div style={sectionStyle}>
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

      <div style={sectionStyle}>
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

      <div style={sectionStyle}>
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
                setters.setPixelSortMode(value);
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

      <div style={sectionStyle}>
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

      <div style={sectionStyle}>
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
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                marginTop: 12
              }}
            >
              {values.regionalPaletteZones.map(
                (zone: RegionalPaletteZone, index: number) => (
                  <div key={index}>
                    <UiColorInput
                      label={`ZONE ${index + 1}`}
                      value={zone.endColor}
                      onChange={(value) => {
                        markAsCustom();
                        setters.updateRegionalPaletteZone(index, {
                          endColor: value
                        });
                      }}
                    />
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

      <div style={sectionStyle}>
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
                    setters.setDitherMode(value);
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
                    setters.setPatternDitherShape(value);
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

      <div style={sectionStyle}>
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
                  value: 'radar',
                  label: 'RADAR RIPPLES'
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

      <div style={sectionStyle}>
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

      <div style={sectionStyle}>
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

      <div style={sectionStyle}>
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

      <div style={sectionStyle}>
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
                setters.setAsciiMode(value);
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

      <div style={sectionStyle}>
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

      <div style={sectionStyle}>
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

      <div style={sectionStyle}>
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
                setters.setDataOverlayMode(value);
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

      <div style={sectionStyle}>
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
                setters.setHudFrameStyle(value);
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
    </>
  );
}

export default App;
