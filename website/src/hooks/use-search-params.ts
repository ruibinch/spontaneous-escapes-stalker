import {
  useSearchParams as useNextSearchParams,
  usePathname,
} from 'next/navigation';
import { useCallback } from 'react';

export const useSearchParams = () => {
  const searchParams = useNextSearchParams();
  const pathname = usePathname();

  /**
   * Updates the query search params with the given key and value, and returns the updated query string.
   */
  const generateUrlWithUpdatedSearchParams = useCallback(
    (key: string, value: string): string => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      const paramsString = params.toString();
      return `${pathname}?${paramsString}`;
    },
    [searchParams, pathname],
  );

  return { searchParams, generateUrlWithUpdatedSearchParams };
};
