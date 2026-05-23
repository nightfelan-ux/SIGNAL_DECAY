import { useRef, useState, useEffect } from 'react';

import { applyDithering } from './effects/dither';
import { applyScanlines } from './effects/scanlines';
import { applyNoise } from './effects/noise';
import { applyChromaticAberration } from './effects/chromatic';

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

interface GlitchStrip {
  active: boolean;
  widthPct: number;
  leftPct: number;
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [zoom, setZoom] = useState(1);

  const [threshold, setThreshold] = useState(255);

  const [originalImage, setOriginalImage] =
    useState<HTMLImageElement | null>(null);

  const [colorStart, setColorStart] =
    useState('#000000');

  const [colorEnd, setColorEnd] =
    useState('#00FF00');

  const [steps, setSteps] = useState(4);

  // PIXELATION

  const [usePixelation, setUsePixelation] =
    useState(false);

  const [pixelSize, setPixelSize] = useState(4);

  // PALETTE / DITHER / GLITCH

  const [usePalette, setUsePalette] =
    useState(false);

  const [useDither, setUseDither] =
    useState(false);

  const [useGlitch, setUseGlitch] =
    useState(false);

  // GLITCH SETTINGS

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

  const [useChromatic, setUseChromatic] =
    useState(false);

  const [chromaticOffset, setChromaticOffset] =
    useState(3);

  // NOISE

  const [useNoise, setUseNoise] =
    useState(false);

  const [noiseAmount, setNoiseAmount] =
    useState(15);

  // SCANLINES

  const [useScanlines, setUseScanlines] =
    useState(false);

  const [scanlineIntensity, setScanlineIntensity] =
    useState(0.2);

  // ORIGINAL VIEW

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

  const calcStrips = (
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
  };

  const processImage = () => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const width = originalImage.width;
    const height = originalImage.height;

    ctx.imageSmoothingEnabled = false;

    // =====================================
    // ALWAYS DRAW TRUE ORIGINAL FIRST
    // =====================================

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(originalImage, 0, 0);

    // REAL ORIGINAL VIEW

    if (showOriginal) return;

    // =====================================
    // PIXELATION
    // =====================================

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

      const tempCtx = tempCanvas.getContext('2d')!;

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

    // =====================================
    // PALETTE
    // =====================================

    const palette = usePalette
      ? generatePalette(
          colorStart,
          colorEnd,
          steps
        )
      : [
          { r: 0, g: 0, b: 0 },
          { r: 255, g: 255, b: 255 }
        ];

    if (usePalette && !useDither) {
      const imageData = ctx.getImageData(
        0,
        0,
        width,
        height
      );

      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        let bestColor = palette[0];
        let minDistance = Infinity;

        for (let j = 0; j < palette.length; j++) {
          const dist =
            (r - palette[j].r) ** 2 +
            (g - palette[j].g) ** 2 +
            (b - palette[j].b) ** 2;

          if (dist < minDistance) {
            minDistance = dist;
            bestColor = palette[j];
          }
        }

        data[i] = bestColor.r;
        data[i + 1] = bestColor.g;
        data[i + 2] = bestColor.b;
      }

      ctx.putImageData(imageData, 0, 0);
    }

    // =====================================
    // DITHER
    // =====================================

    if (useDither) {
      applyDithering(
        ctx,
        width,
        height,
        threshold,
        palette
      );
    }

    // =====================================
    // GLITCH
    // =====================================

    if (useGlitch && glitch > 0) {
      const imageData = ctx.getImageData(
        0,
        0,
        width,
        height
      );

      const data = imageData.data;

      const copy = new Uint8ClampedArray(data);

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

      const sensitivity = 30;

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

        if (edgeGlitchOnly) {
          if (x < width - 1 && y < height - 1) {
            const rightIdx =
              (y * width + (x + 1)) * 4;

            const bottomIdx =
              ((y + 1) * width + x) * 4;

            const diffX = Math.abs(
              brightness(copy, i) -
                brightness(copy, rightIdx)
            );

            const diffY = Math.abs(
              brightness(copy, i) -
                brightness(copy, bottomIdx)
            );

            if (
              diffX < sensitivity &&
              diffY < sensitivity
            ) {
              continue;
            }
          }
        }

        const rIdx = i + shift;
        const bIdx = i - shift;

        if (rIdx < data.length) {
          if (glitchOverrideDither) {
            data[i] = copy[rIdx];
          } else {
            const shiftIntensityR = Math.max(
              copy[rIdx],
              copy[rIdx + 1],
              copy[rIdx + 2]
            );

            data[i] = shiftIntensityR;
          }
        }

        if (bIdx >= 0) {
          if (glitchOverrideDither) {
            data[i + 2] = copy[bIdx + 2];
          } else {
            const shiftIntensityB = Math.max(
              copy[bIdx],
              copy[bIdx + 1],
              copy[bIdx + 2]
            );

            data[i + 2] = shiftIntensityB;
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
    }

    // =====================================
    // CHROMATIC
    // =====================================

    if (useChromatic) {
      applyChromaticAberration(
        ctx,
        width,
        height,
        chromaticOffset
      );
    }

    // =====================================
    // NOISE
    // =====================================

    if (useNoise) {
      applyNoise(
        ctx,
        width,
        height,
        noiseAmount
      );
    }

    // =====================================
    // SCANLINES
    // =====================================

    if (useScanlines) {
      applyScanlines(
        ctx,
        width,
        height,
        scanlineIntensity,
        2
      );
    }
  };

  useEffect(() => {
    if (originalImage) {
      processImage();
    }
  }, [
    threshold,
    originalImage,
    colorStart,
    colorEnd,
    steps,

    usePixelation,
    pixelSize,

    usePalette,
    useDither,

    useGlitch,
    glitch,
    glitchChaos,
    glitchWidth,
    glitchStrips,
    glitchOverrideDither,
    edgeGlitchOnly,

    useChromatic,
    chromaticOffset,

    useNoise,
    noiseAmount,

    useScanlines,
    scanlineIntensity,

    showOriginal
  ]);

  const handleImageUpload = (
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
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: '#121212',
        color: '#00FF00',
        fontFamily: 'monospace'
      }}
    >
      {/* LEFT */}

      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'auto',
          position: 'relative'
        }}
      >
        {originalImage && (
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
              position: 'absolute',
              top: 20,
              right: 20,
              zIndex: 10,
              background: '#333',
              color: '#00FF00',
              border: '1px solid #00FF00',
              padding: '10px',
              cursor: 'pointer'
            }}
          >
            👁️ Оригинал
          </button>
        )}

        <div style={{ transform: `scale(${zoom})` }}>
          {!originalImage && (
            <p>Загрузите изображение</p>
          )}

          <canvas
            ref={canvasRef}
            style={{
              display: originalImage
                ? 'block'
                : 'none',
              border: '1px solid #00FF00'
            }}
          />
        </div>
      </div>

      {/* RIGHT */}

      <div
        style={{
          width: '320px',
          borderLeft: '1px solid #333',
          padding: '20px',
          overflowY: 'auto'
        }}
      >
        <h2>Инструменты</h2>

        <input
          type="file"
          onChange={handleImageUpload}
        />

        {/* ZOOM */}

        <div style={{ marginTop: '20px' }}>
          <label>
            Масштаб: {zoom.toFixed(1)}x
          </label>

          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={zoom}
            onChange={(e) =>
              setZoom(Number(e.target.value))
            }
            style={{ width: '100%' }}
          />
        </div>

        {/* PIXELATION */}

        <div
          style={{
            marginTop: '20px',
            borderTop: '1px dotted #555',
            paddingTop: '10px'
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={usePixelation}
              onChange={(e) =>
                setUsePixelation(
                  e.target.checked
                )
              }
            />
            Pixelation
          </label>

          {usePixelation && (
            <div style={{ marginTop: '10px' }}>
              <label>
                Размер пикселя:{' '}
                {pixelSize}px
              </label>

              <input
                type="range"
                min="1"
                max="32"
                step="1"
                value={pixelSize}
                onChange={(e) =>
                  setPixelSize(
                    Number(e.target.value)
                  )
                }
                style={{ width: '100%' }}
              />
            </div>
          )}
        </div>

        {/* PALETTE */}

        <div
          style={{
            marginTop: '20px',
            borderTop: '1px dotted #555',
            paddingTop: '10px'
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={usePalette}
              onChange={(e) =>
                setUsePalette(
                  e.target.checked
                )
              }
            />
            Palette
          </label>

          {usePalette && (
            <div style={{ marginTop: '10px' }}>
              <label>Нач: </label>

              <input
                type="color"
                value={colorStart}
                onChange={(e) =>
                  setColorStart(
                    e.target.value
                  )
                }
              />

              <label> Кон: </label>

              <input
                type="color"
                value={colorEnd}
                onChange={(e) =>
                  setColorEnd(
                    e.target.value
                  )
                }
              />

              <div style={{ marginTop: '10px' }}>
                <label>
                  Шагов палитры: {steps}
                </label>

                <input
                  type="range"
                  min="2"
                  max="16"
                  value={steps}
                  onChange={(e) =>
                    setSteps(
                      Number(e.target.value)
                    )
                  }
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* DITHER */}

        <div
          style={{
            marginTop: '20px',
            borderTop: '1px dotted #555',
            paddingTop: '10px'
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={useDither}
              onChange={(e) =>
                setUseDither(
                  e.target.checked
                )
              }
            />
            Dither
          </label>

          {useDither && (
            <div style={{ marginTop: '10px' }}>
              <label>
                Интенсивность: {threshold}
              </label>

              <input
                type="range"
                min="0"
                max="255"
                value={threshold}
                onChange={(e) =>
                  setThreshold(
                    Number(e.target.value)
                  )
                }
                style={{ width: '100%' }}
              />
            </div>
          )}
        </div>

        {/* GLITCH */}

        <div
          style={{
            marginTop: '20px',
            borderTop: '1px dotted #555',
            paddingTop: '10px'
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={useGlitch}
              onChange={(e) =>
                setUseGlitch(
                  e.target.checked
                )
              }
            />
            Glitch
          </label>

          {useGlitch && (
            <div style={{ marginTop: '10px' }}>
              <label>
                Глитч-сдвиг: {glitch}px
              </label>

              <input
                type="range"
                min="0"
                max="20"
                value={glitch}
                onChange={(e) =>
                  setGlitch(
                    Number(e.target.value)
                  )
                }
                style={{ width: '100%' }}
              />

              <label>
                Глитч-хаос: {glitchChaos}
              </label>

              <input
                type="range"
                min="0"
                max="100"
                value={glitchChaos}
                onChange={(e) => {
                  const val = Number(
                    e.target.value
                  );

                  setGlitchChaos(val);

                  setGlitchStrips(
                    calcStrips(
                      val,
                      glitchWidth
                    )
                  );
                }}
                style={{ width: '100%' }}
              />

              <label>
                Ширина полос: {glitchWidth}%
              </label>

              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={glitchWidth}
                onChange={(e) => {
                  const w = Number(
                    e.target.value
                  );

                  setGlitchWidth(w);

                  setGlitchStrips(
                    calcStrips(
                      glitchChaos,
                      w
                    )
                  );
                }}
                style={{ width: '100%' }}
              />

              <div style={{ marginTop: '10px' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={edgeGlitchOnly}
                    onChange={(e) =>
                      setEdgeGlitchOnly(
                        e.target.checked
                      )
                    }
                  />
                  Чистый глитч
                </label>
              </div>

              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={
                      glitchOverrideDither
                    }
                    onChange={(e) =>
                      setGlitchOverrideDither(
                        e.target.checked
                      )
                    }
                  />
                  Полосы поверх палитры
                </label>
              </div>
            </div>
          )}
        </div>

        {/* CHROMATIC */}

        <div
          style={{
            marginTop: '20px',
            borderTop: '1px dotted #555',
            paddingTop: '10px'
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={useChromatic}
              onChange={(e) =>
                setUseChromatic(
                  e.target.checked
                )
              }
            />
            Chromatic Aberration
          </label>

          {useChromatic && (
            <input
              type="range"
              min="0"
              max="20"
              value={chromaticOffset}
              onChange={(e) =>
                setChromaticOffset(
                  Number(e.target.value)
                )
              }
              style={{
                width: '100%',
                marginTop: '10px'
              }}
            />
          )}
        </div>

        {/* NOISE */}

        <div
          style={{
            marginTop: '20px',
            borderTop: '1px dotted #555',
            paddingTop: '10px'
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={useNoise}
              onChange={(e) =>
                setUseNoise(
                  e.target.checked
                )
              }
            />
            Noise
          </label>

          {useNoise && (
            <input
              type="range"
              min="0"
              max="100"
              value={noiseAmount}
              onChange={(e) =>
                setNoiseAmount(
                  Number(e.target.value)
                )
              }
              style={{
                width: '100%',
                marginTop: '10px'
              }}
            />
          )}
        </div>

        {/* SCANLINES */}

        <div
          style={{
            marginTop: '20px',
            borderTop: '1px dotted #555',
            paddingTop: '10px'
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={useScanlines}
              onChange={(e) =>
                setUseScanlines(
                  e.target.checked
                )
              }
            />
            Scanlines
          </label>

          {useScanlines && (
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={scanlineIntensity}
              onChange={(e) =>
                setScanlineIntensity(
                  Number(e.target.value)
                )
              }
              style={{
                width: '100%',
                marginTop: '10px'
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;