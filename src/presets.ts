export interface EffectPreset {
  name: string;

  usePixelation: boolean;
  pixelSize: number;

  usePalette: boolean;
  colorStart: string;
  colorEnd: string;
  steps: number;
  swapPaletteColors: boolean;

  useDither: boolean;
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

  useNoise: boolean;
  noiseAmount: number;

  useScanlines: boolean;
  scanlineIntensity: number;
}

export const PRESETS: EffectPreset[] = [
  {
    name: 'CRT TERMINAL',

    usePixelation: false,
    pixelSize: 4,

    usePalette: true,
    colorStart: '#000000',
    colorEnd: '#00ff66',
    steps: 4,
    swapPaletteColors: false,

    useDither: true,
    threshold: 180,

    useGlitch: false,
    glitch: 0,
    glitchChaos: 0,
    glitchWidth: 100,
    glitchOverrideDither: false,
    edgeGlitchOnly: true,

    useChromatic: false,
    chromaticOffset: 0,

    useAscii: true,
    asciiCellSize: 12,
    asciiOpacity: 0.75,
    asciiMode: 'overlay',
    asciiColor: '#00ff66',

    useNoise: true,
    noiseAmount: 8,

    useScanlines: true,
    scanlineIntensity: 0.28
  },

  {
    name: 'TOXIC SCAN',

    usePixelation: true,
    pixelSize: 3,

    usePalette: true,
    colorStart: '#020202',
    colorEnd: '#aaff00',
    steps: 5,
    swapPaletteColors: false,

    useDither: true,
    threshold: 220,

    useGlitch: true,
    glitch: 8,
    glitchChaos: 35,
    glitchWidth: 70,
    glitchOverrideDither: true,
    edgeGlitchOnly: true,

    useChromatic: true,
    chromaticOffset: 3,

    useAscii: true,
    asciiCellSize: 10,
    asciiOpacity: 0.45,
    asciiMode: 'overlay',
    asciiColor: '#aaff00',

    useNoise: true,
    noiseAmount: 14,

    useScanlines: true,
    scanlineIntensity: 0.18
  },

  {
    name: 'BROKEN CAMERA',

    usePixelation: false,
    pixelSize: 4,

    usePalette: false,
    colorStart: '#000000',
    colorEnd: '#00ff00',
    steps: 4,
    swapPaletteColors: false,

    useDither: false,
    threshold: 0,

    useGlitch: true,
    glitch: 14,
    glitchChaos: 65,
    glitchWidth: 45,
    glitchOverrideDither: false,
    edgeGlitchOnly: false,

    useChromatic: true,
    chromaticOffset: 7,

    useAscii: false,
    asciiCellSize: 12,
    asciiOpacity: 0.6,
    asciiMode: 'overlay',
    asciiColor: '#ffffff',

    useNoise: true,
    noiseAmount: 18,

    useScanlines: true,
    scanlineIntensity: 0.12
  },

  {
    name: 'LOW BIT POSTER',

    usePixelation: true,
    pixelSize: 5,

    usePalette: true,
    colorStart: '#050505',
    colorEnd: '#00ccff',
    steps: 3,
    swapPaletteColors: false,

    useDither: false,
    threshold: 0,

    useGlitch: false,
    glitch: 0,
    glitchChaos: 0,
    glitchWidth: 100,
    glitchOverrideDither: false,
    edgeGlitchOnly: true,

    useChromatic: false,
    chromaticOffset: 0,

    useAscii: false,
    asciiCellSize: 14,
    asciiOpacity: 0.8,
    asciiMode: 'overlay',
    asciiColor: '#00ccff',

    useNoise: false,
    noiseAmount: 0,

    useScanlines: false,
    scanlineIntensity: 0
  },

  {
    name: 'SIGNAL DECAY',

    usePixelation: true,
    pixelSize: 2,

    usePalette: true,
    colorStart: '#000000',
    colorEnd: '#00ff99',
    steps: 6,
    swapPaletteColors: false,

    useDither: true,
    threshold: 160,

    useGlitch: true,
    glitch: 6,
    glitchChaos: 45,
    glitchWidth: 55,
    glitchOverrideDither: true,
    edgeGlitchOnly: true,

    useChromatic: true,
    chromaticOffset: 4,

    useAscii: true,
    asciiCellSize: 11,
    asciiOpacity: 0.35,
    asciiMode: 'overlay',
    asciiColor: '#00ff99',

    useNoise: true,
    noiseAmount: 12,

    useScanlines: true,
    scanlineIntensity: 0.22
  },

  {
    name: 'ASCII MONITOR',

    usePixelation: false,
    pixelSize: 4,

    usePalette: true,
    colorStart: '#000000',
    colorEnd: '#00ff99',
    steps: 5,
    swapPaletteColors: false,

    useDither: false,
    threshold: 0,

    useGlitch: false,
    glitch: 0,
    glitchChaos: 0,
    glitchWidth: 100,
    glitchOverrideDither: false,
    edgeGlitchOnly: true,

    useChromatic: false,
    chromaticOffset: 0,

    useAscii: true,
    asciiCellSize: 9,
    asciiOpacity: 1,
    asciiMode: 'replace',
    asciiColor: '#00ff99',

    useNoise: true,
    noiseAmount: 5,

    useScanlines: true,
    scanlineIntensity: 0.2
  },

  {
    name: 'SURVEILLANCE FEED',

    usePixelation: true,
    pixelSize: 2,

    usePalette: true,
    colorStart: '#010101',
    colorEnd: '#6affff',
    steps: 4,
    swapPaletteColors: false,

    useDither: true,
    threshold: 120,

    useGlitch: true,
    glitch: 4,
    glitchChaos: 25,
    glitchWidth: 65,
    glitchOverrideDither: false,
    edgeGlitchOnly: true,

    useChromatic: true,
    chromaticOffset: 2,

    useAscii: true,
    asciiCellSize: 14,
    asciiOpacity: 0.28,
    asciiMode: 'overlay',
    asciiColor: '#6affff',

    useNoise: true,
    noiseAmount: 10,

    useScanlines: true,
    scanlineIntensity: 0.3
  }
];