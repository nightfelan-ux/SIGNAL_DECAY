export const applyDithering = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    threshold: number,
    palette: {r: number, g: number, b: number}[]
) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const len = data.length;
    const palLen = palette.length;
    
    // Оптимизация: заранее извлекаем цвета для быстрого доступа в цикле
    const pr = new Uint8Array(palLen);
    const pg = new Uint8Array(palLen);
    const pb = new Uint8Array(palLen);
    for (let j = 0; j < palLen; j++) {
        pr[j] = palette[j].r;
        pg[j] = palette[j].g;
        pb[j] = palette[j].b;
    }

    const errMult = threshold / 255;

    // Распределение ошибки по Флойду-Стейнбергу
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;

            const oldR = data[i];
            const oldG = data[i + 1];
            const oldB = data[i + 2];

            // Находим ближайший цвет из оптимизированного массива палитры
            let bestIdx = 0;
            let minDistance = Infinity;
            for (let j = 0; j < palLen; j++) {
                const distance = (oldR - pr[j])**2 + (oldG - pg[j])**2 + (oldB - pb[j])**2;
                if (distance < minDistance) {
                    minDistance = distance;
                    bestIdx = j;
                }
            }

            const newR = pr[bestIdx];
            const newG = pg[bestIdx];
            const newB = pb[bestIdx];

            data[i] = newR;
            data[i + 1] = newG;
            data[i + 2] = newB;

            // Распределение ошибки
            if (errMult > 0) {
                const errR = (oldR - newR) * errMult;
                const errG = (oldG - newG) * errMult;
                const errB = (oldB - newB) * errMult;

                const distributeError = (ox: number, oy: number, ratio: number) => {
                    if (ox >= 0 && ox < width && oy >= 0 && oy < height) {
                        const idx = (oy * width + ox) * 4;
                        // ClampedInt8Array сам позаботится о границах 0-255
                        data[idx] += errR * ratio;
                        data[idx + 1] += errG * ratio;
                        data[idx + 2] += errB * ratio;
                    }
                };

                distributeError(x + 1, y, 7 / 16);
                distributeError(x - 1, y + 1, 3 / 16);
                distributeError(x, y + 1, 5 / 16);
                distributeError(x + 1, y + 1, 1 / 16);
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
};