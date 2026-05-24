export const applyDithering = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  threshold: number,
  palette: { r: number; g: number; b: number }[]
) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const palLen = palette.length;

  if (palLen === 0) return;

  // Быстрый доступ к каналам палитры
  const pr = new Uint8Array(palLen);
  const pg = new Uint8Array(palLen);
  const pb = new Uint8Array(palLen);

  for (let j = 0; j < palLen; j++) {
    pr[j] = palette[j].r;
    pg[j] = palette[j].g;
    pb[j] = palette[j].b;
  }

  // threshold = 0..255
  // 0   -> без распределения ошибки
  // 255 -> полная сила Флойда-Стейнберга
  const errMult = threshold / 255;
  const lastPaletteIndex = palLen - 1;

  const getBrightness = (r: number, g: number, b: number) =>
    0.299 * r + 0.587 * g + 0.114 * b;

  const getPaletteIndexByBrightness = (
    r: number,
    g: number,
    b: number
  ) => {
    const brightness = getBrightness(r, g, b);
    const normalized = brightness / 255;
    return Math.max(
      0,
      Math.min(
        lastPaletteIndex,
        Math.round(normalized * lastPaletteIndex)
      )
    );
  };

  const distributeError = (
    x: number,
    y: number,
    errR: number,
    errG: number,
    errB: number,
    ratio: number
  ) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;

    const idx = (y * width + x) * 4;

    data[idx] += errR * ratio;
    data[idx + 1] += errG * ratio;
    data[idx + 2] += errB * ratio;
  };

  // Floyd–Steinberg dithering
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;

      const oldR = data[i];
      const oldG = data[i + 1];
      const oldB = data[i + 2];

      // ВАЖНО:
      // Цвет выбирается по яркости и порядку палитры,
      // а не по ближайшему RGB-цвету.
      // Поэтому Swap Colors теперь реально работает.
      const palIndex = getPaletteIndexByBrightness(
        oldR,
        oldG,
        oldB
      );

      const newR = pr[palIndex];
      const newG = pg[palIndex];
      const newB = pb[palIndex];

      data[i] = newR;
      data[i + 1] = newG;
      data[i + 2] = newB;

      if (errMult > 0) {
        const errR = (oldR - newR) * errMult;
        const errG = (oldG - newG) * errMult;
        const errB = (oldB - newB) * errMult;

        distributeError(x + 1, y, errR, errG, errB, 7 / 16);
        distributeError(x - 1, y + 1, errR, errG, errB, 3 / 16);
        distributeError(x, y + 1, errR, errG, errB, 5 / 16);
        distributeError(x + 1, y + 1, errR, errG, errB, 1 / 16);
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
};