import { useRef, useState, useEffect } from 'react';
import { applyDithering } from './dither';

const hexToRgb = (hex: string) => {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16)
  };
};

const generatePalette = (start: string, end: string, count: number) => {
  const s = hexToRgb(start);
  const e = hexToRgb(end);
  return Array.from({ length: count }, (_, i) => {
    const ratio = count > 1 ? i / (count - 1) : 0;
    return {
      r: Math.round(s.r + (e.r - s.r) * ratio),
      g: Math.round(s.g + (e.g - s.g) * ratio),
      b: Math.round(s.b + (e.b - s.b) * ratio),
    };
  });
};

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [threshold, setThreshold] = useState(128);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [colorStart, setColorStart] = useState('#000000');
  const [colorEnd, setColorEnd] = useState('#00FF00');
  const [steps, setSteps] = useState(4);
  const [glitch, setGlitch] = useState(0);

  const processImage = () => {
    if (!originalImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(originalImage, 0, 0);

    if (glitch > 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const copy = new Uint8ClampedArray(data);
      const shift = glitch * 4;
      for (let i = 0; i < data.length; i += 4) {
        if (i + shift < data.length) data[i] = copy[i + shift];
        if (i - shift >= 0) data[i + 2] = copy[i - shift + 2];
      }
      ctx.putImageData(imageData, 0, 0);
    }
    
    const palette = generatePalette(colorStart, colorEnd, steps);
    applyDithering(ctx, canvas.width, canvas.height, threshold, palette);
  };

  useEffect(() => {
    if (originalImage) processImage();
  }, [threshold, originalImage, colorStart, colorEnd, steps, glitch]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#121212', color: '#00FF00', fontFamily: 'monospace' }}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'auto' }}>
        <div style={{ transform: `scale(${zoom})` }}>
          {!originalImage && <p>Загрузите изображение</p>}
          <canvas ref={canvasRef} style={{ display: originalImage ? 'block' : 'none', border: '1px solid #00FF00' }} />
        </div>
      </div>
      <div style={{ width: '300px', borderLeft: '1px solid #333', padding: '20px' }}>
        <h2>Инструменты</h2>
        <input type="file" onChange={handleImageUpload} />
        <div style={{ marginTop: '20px' }}>
          <label>Порог: {threshold}</label>
          <input type="range" min="0" max="255" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: '20px' }}>
          <label>Масштаб: {zoom.toFixed(1)}x</label>
          <input type="range" min="0.5" max="5" step="0.1" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: '20px' }}>
          <label>Начальный: </label><input type="color" value={colorStart} onChange={(e) => setColorStart(e.target.value)} />
          <label> Конечный: </label><input type="color" value={colorEnd} onChange={(e) => setColorEnd(e.target.value)} />
          <label> Цветов: {steps}</label>
          <input type="range" min="2" max="16" value={steps} onChange={(e) => setSteps(Number(e.target.value))} style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: '20px' }}>
          <label>Глитч: {glitch}px</label>
          <input type="range" min="0" max="20" value={glitch} onChange={(e) => setGlitch(Number(e.target.value))} style={{ width: '100%' }} />
        </div>
      </div>
    </div>
  );
}

export default App;