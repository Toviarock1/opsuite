import { useEffect, useState } from "react";

// Holds back a fast-changing value until it settles,
// so the search box doesn't hit the API on every keystroke.
export function useDebouncedValue(value: string, delayMs = 300): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value.trim()), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
