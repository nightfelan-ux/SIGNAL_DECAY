export type ChannelPacketLossChannel =
  | 'rgb'
  | 'red'
  | 'green'
  | 'blue';

export type ChannelPacketLossOptions = {
  channel: ChannelPacketLossChannel;
  blockSize: number;
  amount: number;
  shift: number;
  random: () => number;
};

const CHANNEL_INDEXES: Record<
  ChannelPacketLossChannel,
  number[]
> = {
  rgb: [0, 1, 2],
  red: [0],
  green: [1],
  blue: [2]
};

export function applyChannelPacketLoss(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: ChannelPacketLossOptions
) {
  const blockSize = Math.max(
    2,
    Math.round(options.blockSize)
  );
  const amount = clamp(options.amount, 0, 1);
  const shift = Math.round(clamp(options.shift, 0, 96));

  if (amount <= 0) return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const source = new Uint8ClampedArray(imageData.data);
  const data = imageData.data;
  const channels = CHANNEL_INDEXES[options.channel];

  for (let by = 0; by < height; by += blockSize) {
    for (let bx = 0; bx < width; bx += blockSize) {
      if (options.random() > amount) continue;

      const blockWidth = Math.min(
        width - bx,
        Math.max(
          1,
          Math.round(blockSize * (0.55 + options.random() * 2.2))
        )
      );
      const blockHeight = Math.min(
        height - by,
        Math.max(
          1,
          Math.round(blockSize * (0.35 + options.random() * 1.4))
        )
      );
      const direction = options.random() > 0.5 ? 1 : -1;
      const baseShiftX =
        shift === 0
          ? 0
          : Math.round(
              direction * (1 + options.random() * shift)
            );
      const baseShiftY =
        shift === 0
          ? 0
          : Math.round(
              (options.random() - 0.5) * shift * 0.35
            );
      const dropout = options.random() < amount * 0.45;
      const freeze = options.random() < 0.35;

      for (let y = 0; y < blockHeight; y++) {
        for (let x = 0; x < blockWidth; x++) {
          const targetX = bx + x;
          const targetY = by + y;
          const targetIndex = (targetY * width + targetX) * 4;

          channels.forEach((channel, channelOrder) => {
            const channelShift =
              options.channel === 'rgb'
                ? baseShiftX +
                  Math.round((channelOrder - 1) * shift * 0.35)
                : baseShiftX;
            const sourceX = clampIndex(
              freeze ? bx : targetX + channelShift,
              width
            );
            const sourceY = clampIndex(
              freeze ? by : targetY + baseShiftY,
              height
            );
            const sourceIndex = (sourceY * width + sourceX) * 4;

            data[targetIndex + channel] = dropout
              ? Math.round(
                  source[targetIndex + channel] *
                    (0.12 + options.random() * 0.18)
                )
              : source[sourceIndex + channel];
          });
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(min, Math.min(max, value));
}

function clampIndex(value: number, max: number) {
  return Math.max(0, Math.min(max - 1, value));
}
