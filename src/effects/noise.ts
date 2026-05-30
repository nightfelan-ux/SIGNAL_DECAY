export function applyNoise(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number,
  random: () => number = Math.random
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // amount может приходить как 0–100 из UI.
  // Превращаем его в нормальный диапазон 0–1.
  const strength = Math.max(0, Math.min(1, amount / 100));

  // Максимальная амплитуда шума.
  // Даже на 100% это не полностью уничтожает изображение.
  const maxNoise = 120 * strength;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (random() - 0.5) * maxNoise;

    data[i] = clamp(data[i] + noise);
    data[i + 1] = clamp(data[i + 1] + noise);
    data[i + 2] = clamp(data[i + 2] + noise);
  }

  ctx.putImageData(imageData, 0, 0);
}

function clamp(value: number) {
  return Math.max(0, Math.min(255, value));
}
