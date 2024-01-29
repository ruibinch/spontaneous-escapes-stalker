export const roundToDp = (num: number, dp: number) => {
  const factor = Math.pow(10, dp);
  // always round half-up
  return Math.round(num * factor) / factor;
};
