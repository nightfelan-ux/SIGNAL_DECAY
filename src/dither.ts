export const applyDithering = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    threshold: number,
    palette: {r: number, g: number, b: number}[]
) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    const getClosestColor = (r: number, g: number, b: number) => {
        let bestColor = palette[0];
        let minDistance = Infinity;
        for (const color of palette) {
            const distance = (r - color.r)**2 + (g - color.g)**2 + (b - color.b)**2;
            if (distance < minDistance) {
                minDistance = distance;
                bestColor = color;
            }
        }
        return bestColor;
    };

    for (let i = 0; i < data.length; i += 4) {
        const best = getClosestColor(data[i], data[i+1], data[i+2]);
        data[i] = best.r;
        data[i + 1] = best.g;
        data[i + 2] = best.b;
    }
    ctx.putImageData(imageData, 0, 0);
};