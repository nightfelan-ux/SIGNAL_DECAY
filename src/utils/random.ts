export type RandomGenerator = () => number;

export function createRandom(seed: number): RandomGenerator {
  let value = seed >>> 0;

  return function random() {
    value += 0x6d2b79f5;

    let t = value;

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function deriveSeed(
  baseSeed: number,
  salt: string | number
) {
  const text = String(salt);
  let value = baseSeed >>> 0;

  for (let i = 0; i < text.length; i++) {
    value ^= text.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }

  return value >>> 0;
}

export function createSeededRandom(
  baseSeed: number,
  salt: string | number
) {
  return createRandom(deriveSeed(baseSeed, salt));
}

export function createSeed() {
  return Math.floor(Math.random() * 999999999);
}
