type SortDirection = 'ascending' | 'descending' | undefined;

export function sortByNumericField<
  T extends Record<string, unknown>,
  U extends string,
>(data: T[], field: U, direction: SortDirection) {
  if (!direction) {
    return data;
  }
  return [...data].sort((a, b) => {
    const aValue = a[field] as number;
    const bValue = b[field] as number;
    return direction === 'ascending' ? aValue - bValue : bValue - aValue;
  });
}

export function sortByStringField<
  T extends Record<string, unknown>,
  U extends string,
>(data: T[], field: U, direction: SortDirection) {
  if (!direction) {
    return data;
  }
  return [...data].sort((a, b) => {
    const aValue = a[field] as string;
    const bValue = b[field] as string;
    return direction === 'ascending'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });
}
