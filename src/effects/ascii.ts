type AsciiMode = 'overlay' | 'replace';

type AsciiOptions = {
  cellSize: number;
  opacity: number;
  mode: AsciiMode;
  color: string;
};

const ASCII_CHARS = ' .:-=+*#%@';

export function applyAscii(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: AsciiOptions
) {
  const cellSize = Math.max(4, options.cellSize);
  const opacity = Math.max(0, Math.min(1, options.opacity));

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  if (options.mode === 'replace') {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.save();

  ctx.font = `${cellSize}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = opacity;
  ctx.fillStyle = options.color;

  for (let y = 0; y < height; y += cellSize) {
    for (let x = 0; x < width; x += cellSize) {
      const sampleX = Math.min(width - 1, x + Math.floor(cellSize / 2));
      const sampleY = Math.min(height - 1, y + Math.floor(cellSize / 2));

      const i = (sampleY * width + sampleX) * 4;

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const brightness =
        0.299 * r +
        0.587 * g +
        0.114 * b;

      const normalized = brightness / 255;

      const charIndex = Math.floor(
        normalized * (ASCII_CHARS.length - 1)
      );

      const char = ASCII_CHARS[charIndex];

      if (char.trim() === '') continue;

      ctx.fillText(
        char,
        x + cellSize / 2,
        y + cellSize / 2
      );
    }
  }

  ctx.restore();
}