export function applyScanlines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;

      data[i] *= 1 - intensity;
      data[i + 1] *= 1 - intensity;
      data[i + 2] *= 1 - intensity;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}