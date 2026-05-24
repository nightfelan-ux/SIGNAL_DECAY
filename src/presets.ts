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

    useNoise: true,
    noiseAmount: 10,

    useScanlines: true,
    scanlineIntensity: 0.25
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

    useNoise: true,
    noiseAmount: 12,

    useScanlines: true,
    scanlineIntensity: 0.22
  }
];