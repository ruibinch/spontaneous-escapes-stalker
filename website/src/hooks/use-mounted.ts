import { useEffect, useState } from 'react';

/**
 * Use to only render components on client-side to prevent hydration mismatches.
 */
export function useMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}
