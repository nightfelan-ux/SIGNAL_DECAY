export const applyChromaticAberration = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    offset: number = 5
) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const copy = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;

            const rX = Math.min(width - 1, x + offset);
            const bX = Math.max(0, x - offset);

            const rIdx = (y * width + rX) * 4;
            const bIdx = (y * width + bX) * 4;

            data[i] = copy[rIdx];
            data[i + 2] = copy[bIdx + 2];
        }
    }

    ctx.putImageData(imageData, 0, 0);
};