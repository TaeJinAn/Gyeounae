export type FootProfileMm = {
  lengthMm: number;
  widthMm: number;
  heightMm: number;
};

export type FootMatchResult = {
  lengthMatch: number;
  widthMatch: number;
  heightMatch: number;
  totalMatch: number;
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

export const calcMatchPercent = (a: number, b: number) => {
  const maxValue = Math.max(a, b);
  if (maxValue <= 0) {
    return 0;
  }
  const raw = 100 - (Math.abs(a - b) / maxValue) * 100;
  return clampPercent(Math.round(raw));
};

export const calculateFootMatch = (user: FootProfileMm, seller: FootProfileMm) => {
  const lengthMatch = calcMatchPercent(user.lengthMm, seller.lengthMm);
  const widthMatch = calcMatchPercent(user.widthMm, seller.widthMm);
  const heightMatch = calcMatchPercent(user.heightMm, seller.heightMm);
  const totalMatch = Math.round((lengthMatch + widthMatch + heightMatch) / 3);
  return { lengthMatch, widthMatch, heightMatch, totalMatch };
};
