import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { applyAscii } from './effects/ascii';
import { applyDithering } from './effects/dither';
import { applyScanlines } from './effects/scanlines';
import { applyNoise } from './effects/noise';
import { applyChromatic } from './effects/chromatic';
import { applyPsx } from './effects/psx';
import { PRESETS, type EffectPreset } from './presets';

const hexToRgb = (hex: string) => {
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
) => {
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

const applyPaletteByBrightness = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: { r: number; g: number; b: number }[]
) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const lastIndex = palette.length - 1;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const brightness =
      0.299 * r +
      0.587 * g +
      0.114 * b;

    const normalized = brightness / 255;

    const paletteIndex = Math.round(
      normalized * lastIndex
    );

    const color = palette[paletteIndex];

    data[i] = color.r;
    data[i + 1] = color.g;
    data[i + 2] = color.b;
  }

  ctx.putImageData(imageData, 0, 0);
};

interface GlitchStrip {
  active: boolean;
  widthPct: number;
  leftPct: number;
}

function App() {
  const [useAscii, setUseAscii] =
  useState(false);

const [asciiCellSize, setAsciiCellSize] =
  useState(10);

const [asciiOpacity, setAsciiOpacity] =
  useState(0.8);

const [asciiMode, setAsciiMode] =
  useState<'overlay' | 'replace'>('overlay');

const [asciiColor, setAsciiColor] =
  useState('#00ff99');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [zoom, setZoom] = useState(1);

  const [selectedPresetName, setSelectedPresetName] =
    useState('');

  const [threshold, setThreshold] = useState(255);

  const [originalImage, setOriginalImage] =
    useState<HTMLImageElement | null>(null);

  const [colorStart, setColorStart] =
    useState('#000000');

  const [colorEnd, setColorEnd] =
    useState('#00FF00');

  const [steps, setSteps] = useState(4);

  const [swapPaletteColors, setSwapPaletteColors] =
    useState(false);

  // PIXELATION

  const [usePixelation, setUsePixelation] =
    useState(false);

  const [pixelSize, setPixelSize] = useState(4);

  // EFFECTS

  const [usePalette, setUsePalette] =
    useState(false);

  const [useDither, setUseDither] =
    useState(false);

  const [useGlitch, setUseGlitch] =
    useState(false);

  const [useChromatic, setUseChromatic] =
    useState(false);

  const [useNoise, setUseNoise] =
    useState(false);

  const [useScanlines, setUseScanlines] =
    useState(false);

  // GLITCH

  const [glitch, setGlitch] = useState(0);

  const [glitchChaos, setGlitchChaos] =
    useState(0);

  const [glitchWidth, setGlitchWidth] =
    useState(100);

  const [glitchOverrideDither, setGlitchOverrideDither] =
    useState(false);

  const [edgeGlitchOnly, setEdgeGlitchOnly] =
    useState(true);

  // CHROMATIC

  const [chromaticOffset, setChromaticOffset] =
    useState(3);

  // NOISE

  const [noiseAmount, setNoiseAmount] =
    useState(15);

  // SCANLINES

  const [scanlineIntensity, setScanlineIntensity] =
    useState(0.2);

  // ORIGINAL

  const [showOriginal, setShowOriginal] =
    useState(false);

  const [glitchStrips, setGlitchStrips] =
    useState<GlitchStrip[]>(
      Array(30)
        .fill(null)
        .map(() => ({
          active: true,
          widthPct: 1,
          leftPct: 0
        }))
    );
    const [usePsx, setUsePsx] = useState(false);
    const [psxResolutionScale, setPsxResolutionScale] = useState(4);
    const [psxColorLevels, setPsxColorLevels] = useState(8);
    const [psxWarpAmount, setPsxWarpAmount] = useState(2);
    const [psxJitterAmount, setPsxJitterAmount] = useState(2);
    const [psxDitherStrength, setPsxDitherStrength] = useState(0.45);

    const [psxBlockSize, setPsxBlockSize] =
      useState(12);

    const [psxCompositeBlur, setPsxCompositeBlur] =
      useState(0.8);

    const [psxChromaBleed, setPsxChromaBleed] =
      useState(1);
      
  const markAsCustom = useCallback(() => {
    setSelectedPresetName('');
  }, []);

  const calcStrips = useCallback(
    (
      chaosLevel: number,
      widthSetting: number
    ): GlitchStrip[] => {
      return Array.from({ length: 30 }, () => {
        const active =
          chaosLevel === 0
            ? true
            : Math.random() * 100 < chaosLevel;

        const wPct =
          widthSetting === 100
            ? 1
            : 0.3 +
              Math.random() *
                (widthSetting / 100 - 0.1);

        const maxLeft = 1 - wPct;

        const lPct =
          widthSetting === 100
            ? 0
            : Math.random() * maxLeft;

        return {
          active,
          widthPct: Math.min(1, Math.max(0.1, wPct)),
          leftPct: lPct
        };
      });
    },
    []
  );

  const applyPreset = useCallback(
    (preset: EffectPreset) => {
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

      setUsePalette(preset.usePalette);
      setColorStart(preset.colorStart);
      setColorEnd(preset.colorEnd);
      setSteps(preset.steps);
      setSwapPaletteColors(preset.swapPaletteColors);

      setUseDither(preset.useDither);
      setThreshold(preset.threshold);

      setUseGlitch(preset.useGlitch);
      setGlitch(preset.glitch);
      setGlitchChaos(preset.glitchChaos);
      setGlitchWidth(preset.glitchWidth);
      setGlitchOverrideDither(preset.glitchOverrideDither);
      setEdgeGlitchOnly(preset.edgeGlitchOnly);

      setGlitchStrips(
        calcStrips(
          preset.glitchChaos,
          preset.glitchWidth
        )
      );

      setUseChromatic(preset.useChromatic);
      setChromaticOffset(preset.chromaticOffset);

      setUseAscii(preset.useAscii);
      setAsciiCellSize(preset.asciiCellSize);
      setAsciiOpacity(preset.asciiOpacity);
      setAsciiMode(preset.asciiMode);
      setAsciiColor(preset.asciiColor);

      setUseNoise(preset.useNoise);
      setNoiseAmount(preset.noiseAmount);

      setUseScanlines(preset.useScanlines);
      setScanlineIntensity(preset.scanlineIntensity);
    },
    [calcStrips]
  );

  const saveImage = useCallback(() => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');

    link.download = `signal-decay-${Date.now()}.png`;

    link.href = canvasRef.current.toDataURL(
      'image/png'
    );

    link.click();
  }, []);

  const processImage = useCallback(() => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const width = originalImage.width;
    const height = originalImage.height;

    ctx.imageSmoothingEnabled = false;

    // TRUE ORIGINAL

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(originalImage, 0, 0);

    if (showOriginal) return;

    // PIXELATION

    if (usePixelation && pixelSize > 1) {
      const smallWidth = Math.max(
        1,
        Math.floor(width / pixelSize)
      );

      const smallHeight = Math.max(
        1,
        Math.floor(height / pixelSize)
      );

      if (!tempCanvasRef.current) {
        tempCanvasRef.current =
          document.createElement('canvas');
      }

      const tempCanvas = tempCanvasRef.current;

      tempCanvas.width = smallWidth;
      tempCanvas.height = smallHeight;

      const tempCtx = tempCanvas.getContext('2d');

      if (!tempCtx) return;

      tempCtx.imageSmoothingEnabled = false;

      tempCtx.clearRect(
        0,
        0,
        smallWidth,
        smallHeight
      );

      tempCtx.drawImage(
        originalImage,
        0,
        0,
        smallWidth,
        smallHeight
      );

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


    // PSX LOOK

if (usePsx) {
  applyPsx(ctx, width, height, {
    resolutionScale: psxResolutionScale,
    colorLevels: psxColorLevels,
    warpAmount: psxWarpAmount,
    jitterAmount: psxJitterAmount,
    ditherStrength: psxDitherStrength,
    blockSize: psxBlockSize,
    compositeBlur: psxCompositeBlur,
    chromaBleed: psxChromaBleed
  });
}

    // SAVE PRE-PALETTE IMAGE FOR GLITCH OVERRIDE

    const prePaletteImageData = ctx.getImageData(
      0,
      0,
      width,
      height
    );

    const prePaletteCopy = new Uint8ClampedArray(
      prePaletteImageData.data
    );
    
    

    // PALETTE

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

    if (usePalette && !useDither) {
      applyPaletteByBrightness(
        ctx,
        width,
        height,
        palette
      );
    }

    // DITHER

    if (useDither) {
      applyDithering(
        ctx,
        width,
        height,
        threshold,
        palette
      );
    }

    // GLITCH

    if (useGlitch && glitch > 0) {
      const imageData = ctx.getImageData(
        0,
        0,
        width,
        height
      );

      const data = imageData.data;

      const processedCopy = new Uint8ClampedArray(data);

      const glitchSource = glitchOverrideDither
        ? prePaletteCopy
        : processedCopy;

      const shift = glitch * 4;

      const sliceCount = 30;
      const sliceHeight = height / sliceCount;

      const brightness = (
        arr: Uint8ClampedArray,
        i: number
      ) =>
        0.299 * arr[i] +
        0.587 * arr[i + 1] +
        0.114 * arr[i + 2];

      const edgeSensitivity = 35;

      for (let i = 0; i < data.length; i += 4) {
        const x = (i / 4) % width;
        const y = Math.floor(i / 4 / width);

        const sliceIdx = Math.floor(
          y / sliceHeight
        );

        const strip = glitchStrips[sliceIdx];

        if (!strip || !strip.active) continue;

        const startX = Math.floor(
          strip.leftPct * width
        );

        const endX = Math.floor(
          (strip.leftPct + strip.widthPct) *
            width
        );

        if (x < startX || x > endX) continue;

        // EDGE ONLY

        if (edgeGlitchOnly) {
          if (x < width - 1 && y < height - 1) {
            const rightIdx =
              (y * width + (x + 1)) * 4;

            const bottomIdx =
              ((y + 1) * width + x) * 4;

            const diffX = Math.abs(
              brightness(processedCopy, i) -
                brightness(processedCopy, rightIdx)
            );

            const diffY = Math.abs(
              brightness(processedCopy, i) -
                brightness(processedCopy, bottomIdx)
            );

            const edgeStrength = diffX + diffY;

            if (edgeStrength < edgeSensitivity) {
              continue;
            }
          }
        }

        const rIdx = i + shift;
        const bIdx = i - shift;

        if (rIdx < data.length) {
          if (glitchOverrideDither) {
            data[i] = glitchSource[rIdx];
          } else {
            const shiftedR = Math.max(
              glitchSource[rIdx],
              glitchSource[rIdx + 1],
              glitchSource[rIdx + 2]
            );

            data[i] = shiftedR;
          }
        }

        if (bIdx >= 0) {
          if (glitchOverrideDither) {
            data[i + 2] = glitchSource[bIdx + 2];
          } else {
            const shiftedB = Math.max(
              glitchSource[bIdx],
              glitchSource[bIdx + 1],
              glitchSource[bIdx + 2]
            );

            data[i + 2] = shiftedB;
          }
        }

        if (glitchOverrideDither) {
          data[i + 1] = Math.round(
            data[i + 1] * 0.45 +
              glitchSource[i + 1] * 0.55
          );
        }
      }

      ctx.putImageData(imageData, 0, 0);
    }

    // CHROMATIC

    if (useChromatic) {
      applyChromatic(ctx, width, height, {
        amount: chromaticOffset
      });
    }

    // ASCII

    if (useAscii) {
      applyAscii(ctx, width, height, {
        cellSize: asciiCellSize,
        opacity: asciiOpacity,
        mode: asciiMode,
        color: asciiColor
      });
    }

    // NOISE

    if (useNoise) {
      applyNoise(
        ctx,
        width,
        height,
        noiseAmount
      );
    }

    // SCANLINES

    if (useScanlines) {
      applyScanlines(
        ctx,
        width,
        height,
        scanlineIntensity
      );
    }
  }, [
    originalImage,
    showOriginal,

    usePixelation,
    pixelSize,

    usePalette,
    colorStart,
    colorEnd,
    steps,
    swapPaletteColors,

    useDither,
    threshold,

    useGlitch,
    glitch,
    glitchStrips,
    glitchOverrideDither,
    edgeGlitchOnly,

    useChromatic,
    chromaticOffset,

    useAscii,
    asciiCellSize,
    asciiOpacity,
    asciiMode,
    asciiColor,

    useNoise,
    noiseAmount,

    useScanlines,
    scanlineIntensity,

    usePsx,
    psxResolutionScale,
    psxColorLevels,
    psxWarpAmount,
    psxJitterAmount,
    psxDitherStrength,
    psxBlockSize,
    psxCompositeBlur,
    psxChromaBleed,
  ]);

  useEffect(() => {
    if (originalImage) {
      processImage();
    }
  }, [originalImage, processImage]);

  const handleImageUpload = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = e.target.files?.[0];

      if (!file) return;

      const reader = new FileReader();

      reader.onload = (ev) => {
        const img = new Image();

        img.onload = () => {
          if (canvasRef.current) {
            canvasRef.current.width = img.width;
            canvasRef.current.height = img.height;

            setOriginalImage(img);
          }
        };

        img.src = ev.target?.result as string;
      };

      reader.readAsDataURL(file);
    },
    []
  );

  const sectionStyle = useMemo(
    () => ({
      marginTop: '18px',
      border: '1px solid #222',
      borderRadius: '10px',
      padding: '12px',
      background: '#111'
    }),
    []
  );

  const sliderStyle = useMemo(
    () => ({
      width: '100%',
      marginTop: '10px'
    }),
    []
  );

  const sliderLabelStyle = useMemo(
    () => ({
      fontSize: '12px',
      color: '#666',
      marginBottom: '4px',
      marginTop: '12px',
      letterSpacing: '1px'
    }),
    []
  );

  return (
    <div
      style={{
        display: 'flex',
        height: '100dvh',
        overflow: 'hidden',
        background:
          'linear-gradient(to bottom, #050505, #0b0b0b)',
        color: '#00ff99',
        fontFamily:
          'Inter, Arial, sans-serif'
      }}
    >
      {/* CANVAS AREA */}

      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'auto',
          position: 'relative',
          padding: '30px'
        }}
      >
        {originalImage && (
          <div
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              display: 'flex',
              gap: '10px',
              zIndex: 10
            }}
          >
            <button
              onMouseDown={() =>
                setShowOriginal(true)
              }
              onMouseUp={() =>
                setShowOriginal(false)
              }
              onMouseLeave={() =>
                setShowOriginal(false)
              }
              style={{
                background: '#111',
                border: '1px solid #00ff99',
                color: '#00ff99',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              ORIGINAL
            </button>

            <button
              onClick={saveImage}
              style={{
                background: '#00ff99',
                border: 'none',
                color: '#000',
                padding: '10px 16px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              EXPORT PNG
            </button>
          </div>
        )}

        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        >
          {!originalImage && (
            <div
              style={{
                border: '1px dashed #333',
                padding: '60px',
                borderRadius: '12px',
                color: '#666'
              }}
            >
              Upload image
            </div>
          )}

          <canvas
            ref={canvasRef}
            style={{
              display: originalImage
                ? 'block'
                : 'none',
              border: '1px solid #1f1f1f',
              borderRadius: '12px',
              boxShadow:
                '0 0 60px rgba(0,255,120,0.08)',
              maxWidth: '100%',
              height: 'auto'
            }}
          />
        </div>
      </div>

      {/* UI PANEL */}

      <div
        style={{
          width: '340px',
          height: '100%',
          overflowY: 'auto',
          borderLeft: '1px solid #181818',
          background: '#090909',
          padding: '24px',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            marginBottom: '24px'
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: '24px',
              letterSpacing: '2px'
            }}
          >
            SIGNAL DECAY
          </h1>

          <div
            style={{
              color: '#555',
              marginTop: '6px',
              fontSize: '12px'
            }}
          >
            GENERATIVE IMAGE ENGINE
          </div>
        </div>

        <input
          type="file"
          onChange={(e) => {
            markAsCustom();
            handleImageUpload(e);
          }}
          style={{
            width: '100%',
            marginBottom: '20px'
          }}
        />

        {/* PRESETS */}

        <div style={sectionStyle}>
          <div
            style={{
              fontSize: '12px',
              color: '#666',
              marginBottom: '10px',
              letterSpacing: '1px'
            }}
          >
            PRESET
          </div>

          <select
            value={selectedPresetName}
            onChange={(e) => {
              const presetName = e.target.value;

              setSelectedPresetName(presetName);

              const preset = PRESETS.find(
                (item) => item.name === presetName
              );

              if (preset) {
                applyPreset(preset);
              }
            }}
            style={{
              width: '100%',
              background: '#0a0a0a',
              color: '#00ff99',
              border: '1px solid #222',
              borderRadius: '8px',
              padding: '10px',
              cursor: 'pointer',
              fontSize: '12px',
              letterSpacing: '1px',
              outline: 'none'
            }}
          >
            <option value="">CUSTOM</option>

            {PRESETS.map((preset) => (
              <option key={preset.name} value={preset.name}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>

        {/* ZOOM */}

        <div style={sectionStyle}>
          <label>
            Zoom: {zoom.toFixed(1)}x
          </label>

          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={zoom}
            onChange={(e) => {
              markAsCustom();
              setZoom(Number(e.target.value));
            }}
            style={sliderStyle}
          />
        </div>

        {/* PIXELATION */}

        <div style={sectionStyle}>
          <label>
            <input
              type="checkbox"
              checked={usePixelation}
              onChange={(e) => {
                markAsCustom();
                setUsePixelation(
                  e.target.checked
                );
              }}
            />
            {'  '}
            Pixelation
          </label>

          {usePixelation && (
            <>
              <div style={sliderLabelStyle}>
                PIXEL SIZE
              </div>

              <input
                type="range"
                min="1"
                max="32"
                value={pixelSize}
                onChange={(e) => {
                  markAsCustom();
                  setPixelSize(
                    Number(e.target.value)
                  );
                }}
                style={sliderStyle}
              />
            </>
          )}
        </div>

          {/* PSX LOOK */}

<div style={sectionStyle}>
  <label>
    <input
      type="checkbox"
      checked={usePsx}
      onChange={(e) => {
        markAsCustom();
        setUsePsx(e.target.checked);
      }}
    />
    {'  '}
    PS1 Look
  </label>

  {usePsx && (
    <>
      <div style={sliderLabelStyle}>
        RESOLUTION SCALE
      </div>

      <input
        type="range"
        min="1"
        max="12"
        step="1"
        value={psxResolutionScale}
        onChange={(e) => {
          markAsCustom();
          setPsxResolutionScale(
            Number(e.target.value)
          );
        }}
        style={sliderStyle}
      />

      <div style={sliderLabelStyle}>
        COLOR LEVELS
      </div>

      <input
        type="range"
        min="2"
        max="32"
        step="1"
        value={psxColorLevels}
        onChange={(e) => {
          markAsCustom();
          setPsxColorLevels(
            Number(e.target.value)
          );
        }}
        style={sliderStyle}
      />

      <div style={sliderLabelStyle}>
        TEXTURE WARP
      </div>

      <input
        type="range"
        min="0"
        max="20"
        step="1"
        value={psxWarpAmount}
        onChange={(e) => {
          markAsCustom();
          setPsxWarpAmount(
            Number(e.target.value)
          );
        }}
        style={sliderStyle}
      />

      <div style={sliderLabelStyle}>
        JITTER
      </div>

      <input
        type="range"
        min="0"
        max="20"
        step="1"
        value={psxJitterAmount}
        onChange={(e) => {
          markAsCustom();
          setPsxJitterAmount(
            Number(e.target.value)
          );
        }}
        style={sliderStyle}
      />

      <div style={sliderLabelStyle}>
        BLOCK SIZE
      </div>

      <input
        type="range"
        min="4"
        max="48"
        step="1"
        value={psxBlockSize}
        onChange={(e) => {
          markAsCustom();
          setPsxBlockSize(
            Number(e.target.value)
          );
        }}
        style={sliderStyle}
      />

      <div style={sliderLabelStyle}>
        DITHER
      </div>

      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={psxDitherStrength}
        onChange={(e) => {
          markAsCustom();
          setPsxDitherStrength(
            Number(e.target.value)
          );
        }}
        style={sliderStyle}
      />

      <div style={sliderLabelStyle}>
        COMPOSITE BLUR
      </div>

      <input
        type="range"
        min="0"
        max="6"
        step="0.1"
        value={psxCompositeBlur}
        onChange={(e) => {
          markAsCustom();
          setPsxCompositeBlur(
            Number(e.target.value)
          );
        }}
        style={sliderStyle}
      />

      <div style={sliderLabelStyle}>
        CHROMA BLEED
      </div>

      <input
        type="range"
        min="0"
        max="8"
        step="1"
        value={psxChromaBleed}
        onChange={(e) => {
          markAsCustom();
          setPsxChromaBleed(
            Number(e.target.value)
          );
        }}
        style={sliderStyle}
      />
    </>
  )}
</div>
        {/* PALETTE */}

        <div style={sectionStyle}>
          <label>
            <input
              type="checkbox"
              checked={usePalette}
              onChange={(e) => {
                markAsCustom();
                setUsePalette(
                  e.target.checked
                );
              }}
            />
            {'  '}
            Palette
          </label>

          {usePalette && (
            <>
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '12px',
                  alignItems: 'center'
                }}
              >
                <input
                  type="color"
                  value={colorStart}
                  onChange={(e) => {
                    markAsCustom();
                    setColorStart(
                      e.target.value
                    );
                  }}
                  style={{
                    width: '42px',
                    height: '28px',
                    padding: 0,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    cursor: 'pointer'
                  }}
                />

                <input
                  type="color"
                  value={colorEnd}
                  onChange={(e) => {
                    markAsCustom();
                    setColorEnd(
                      e.target.value
                    );
                  }}
                  style={{
                    width: '42px',
                    height: '28px',
                    padding: 0,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    cursor: 'pointer'
                  }}
                />
              </div>

              <div style={sliderLabelStyle}>
                COLOR STEPS
              </div>

              <input
                type="range"
                min="2"
                max="16"
                value={steps}
                onChange={(e) => {
                  markAsCustom();
                  setSteps(
                    Number(e.target.value)
                  );
                }}
                style={sliderStyle}
              />

              <label
                style={{
                  display: 'block',
                  marginTop: '12px'
                }}
              >
                <input
                  type="checkbox"
                  checked={swapPaletteColors}
                  onChange={(e) => {
                    markAsCustom();
                    setSwapPaletteColors(
                      e.target.checked
                    );
                  }}
                />
                {'  '}
                Swap Colors
              </label>
            </>
          )}
        </div>

        {/* DITHER */}

        <div style={sectionStyle}>
          <label>
            <input
              type="checkbox"
              checked={useDither}
              onChange={(e) => {
                markAsCustom();
                setUseDither(
                  e.target.checked
                );
              }}
            />
            {'  '}
            Dither
          </label>

          {useDither && (
            <>
              <div style={sliderLabelStyle}>
                INTENSITY
              </div>

              <input
                type="range"
                min="0"
                max="255"
                value={threshold}
                onChange={(e) => {
                  markAsCustom();
                  setThreshold(
                    Number(e.target.value)
                  );
                }}
                style={sliderStyle}
              />
            </>
          )}
        </div>

        {/* GLITCH */}

        <div style={sectionStyle}>
          <label>
            <input
              type="checkbox"
              checked={useGlitch}
              onChange={(e) => {
                markAsCustom();
                setUseGlitch(e.target.checked);
              }}
            />
            {'  '}
            Glitch
          </label>

          {useGlitch && (
            <div style={{ marginTop: '12px' }}>
              {/* SHIFT */}

              <div style={{ marginBottom: '16px' }}>
                <div style={sliderLabelStyle}>
                  SHIFT
                </div>

                <input
                  type="range"
                  min="0"
                  max="20"
                  value={glitch}
                  onChange={(e) => {
                    markAsCustom();
                    setGlitch(Number(e.target.value));
                  }}
                  style={sliderStyle}
                />
              </div>

              {/* WIDTH */}

              <div style={{ marginBottom: '16px' }}>
                <div style={sliderLabelStyle}>
                  WIDTH
                </div>

                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={glitchWidth}
                  onChange={(e) => {
                    markAsCustom();

                    const w = Number(e.target.value);

                    setGlitchWidth(w);

                    setGlitchStrips(
                      calcStrips(glitchChaos, w)
                    );
                  }}
                  style={sliderStyle}
                />
              </div>

              {/* CHAOS */}

              <div style={{ marginBottom: '16px' }}>
                <div style={sliderLabelStyle}>
                  CHAOS
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                  }}
                >
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={glitchChaos}
                    onChange={(e) => {
                      markAsCustom();

                      const val = Number(e.target.value);

                      setGlitchChaos(val);

                      setGlitchStrips(
                        calcStrips(
                          val,
                          glitchWidth
                        )
                      );
                    }}
                    style={{
                      ...sliderStyle,
                      marginTop: 0
                    }}
                  />

                  <button
                    onClick={() => {
                      markAsCustom();

                      setGlitchStrips(
                        calcStrips(
                          glitchChaos,
                          glitchWidth
                        )
                      );
                    }}
                    disabled={glitchChaos === 0}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      border: '1px solid #222',
                      background: '#111',
                      color: '#00ff99',
                      cursor:
                        glitchChaos === 0
                          ? 'not-allowed'
                          : 'pointer',
                      opacity:
                        glitchChaos === 0
                          ? 0.3
                          : 1
                    }}
                  >
                    🎲
                  </button>
                </div>
              </div>

              {/* MODES */}

              <div
                style={{
                  borderTop: '1px solid #1a1a1a',
                  paddingTop: '14px'
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '10px',
                    letterSpacing: '1px'
                  }}
                >
                  MODES
                </div>

                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={edgeGlitchOnly}
                    onChange={(e) => {
                      markAsCustom();

                      setEdgeGlitchOnly(
                        e.target.checked
                      );
                    }}
                  />
                  {'  '}
                  Edge Only
                </label>

                <label
                  style={{
                    display: 'block'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={glitchOverrideDither}
                    onChange={(e) => {
                      markAsCustom();

                      setGlitchOverrideDither(
                        e.target.checked
                      );
                    }}
                  />
                  {'  '}
                  Override Palette
                </label>
              </div>
            </div>
          )}
        </div>

        {/* CHROMATIC */}

        <div style={sectionStyle}>
          <label>
            <input
              type="checkbox"
              checked={useChromatic}
              onChange={(e) => {
                markAsCustom();

                setUseChromatic(
                  e.target.checked
                );
              }}
            />
            {'  '}
            Chromatic
          </label>

          {useChromatic && (
            <>
              <div style={sliderLabelStyle}>
                RGB OFFSET
              </div>

              <input
                type="range"
                min="0"
                max="20"
                value={chromaticOffset}
                onChange={(e) => {
                  markAsCustom();

                  setChromaticOffset(
                    Number(e.target.value)
                  );
                }}
                style={sliderStyle}
              />
            </>
          )}
        </div>

          {/* ASCII */}

<div style={sectionStyle}>
  <label>
    <input
      type="checkbox"
      checked={useAscii}
      onChange={(e) => {
        markAsCustom();
        setUseAscii(e.target.checked);
      }}
    />
    {'  '}
    ASCII
  </label>

  {useAscii && (
    <>
      <div style={sliderLabelStyle}>
        CELL SIZE
      </div>

      <input
        type="range"
        min="4"
        max="32"
        step="1"
        value={asciiCellSize}
        onChange={(e) => {
          markAsCustom();
          setAsciiCellSize(Number(e.target.value));
        }}
        style={sliderStyle}
      />

      <div style={sliderLabelStyle}>
        OPACITY
      </div>

      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={asciiOpacity}
        onChange={(e) => {
          markAsCustom();
          setAsciiOpacity(Number(e.target.value));
        }}
        style={sliderStyle}
      />

      <div style={sliderLabelStyle}>
        MODE
      </div>

      <select
        value={asciiMode}
        onChange={(e) => {
          markAsCustom();
          setAsciiMode(e.target.value as 'overlay' | 'replace');
        }}
        style={{
          width: '100%',
          background: '#0a0a0a',
          color: '#00ff99',
          border: '1px solid #222',
          borderRadius: '8px',
          padding: '10px',
          cursor: 'pointer',
          fontSize: '12px',
          letterSpacing: '1px',
          outline: 'none'
        }}
      >
        <option value="overlay">OVERLAY</option>
        <option value="replace">REPLACE</option>
      </select>

      <div style={sliderLabelStyle}>
        COLOR
      </div>

      <input
        type="color"
        value={asciiColor}
        onChange={(e) => {
          markAsCustom();
          setAsciiColor(e.target.value);
        }}
        style={{
          width: '42px',
          height: '28px',
          padding: 0,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          cursor: 'pointer'
        }}
      />
    </>
  )}
</div>

        {/* NOISE */}

        <div style={sectionStyle}>
          <label>
            <input
              type="checkbox"
              checked={useNoise}
              onChange={(e) => {
                markAsCustom();

                setUseNoise(
                  e.target.checked
                );
              }}
            />
            {'  '}
            Noise
          </label>

          {useNoise && (
            <>
              <div style={sliderLabelStyle}>
                AMOUNT
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={noiseAmount}
                onChange={(e) => {
                  markAsCustom();

                  setNoiseAmount(
                    Number(e.target.value)
                  );
                }}
                style={sliderStyle}
              />
            </>
          )}
        </div>

        {/* SCANLINES */}

        <div style={sectionStyle}>
          <label>
            <input
              type="checkbox"
              checked={useScanlines}
              onChange={(e) => {
                markAsCustom();

                setUseScanlines(
                  e.target.checked
                );
              }}
            />
            {'  '}
            Scanlines
          </label>

          {useScanlines && (
            <>
              <div style={sliderLabelStyle}>
                INTENSITY
              </div>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={scanlineIntensity}
                onChange={(e) => {
                  markAsCustom();

                  setScanlineIntensity(
                    Number(e.target.value)
                  );
                }}
                style={sliderStyle}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;