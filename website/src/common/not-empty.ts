export const notEmpty = <T>(value: T | null | undefined): value is T => {
  if (value === null || value === undefined) return false;
  const _: T = value;
  return true;
};
