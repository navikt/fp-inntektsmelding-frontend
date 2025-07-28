import { useEffect, useState } from "react";
import type { output, ZodType } from "zod/v4";

/** En useState versjon som lagrer innholdet til session storage.
 *
 * Session storage er en måte å lagre data på i nettleseren, som varer til
 * nettleservinduet lukkes. Dataen deles ikke på tvers av tabs eller vinduer.
 *
 * @param key - Nøkkelen som brukes for å lagre dataen i session storage.
 * @param defaultValue - Standardverdien som brukes om det ikke finnes noe lagret data.
 *
 * @example
 * ```tsx
 * const [count, setCount] = useSessionStorageState("count", 0);
 * ```
 */
export function useSessionStorageState<Z extends ZodType>({
  key,
  schema,
  defaultValue,
}: {
  key: string;
  schema: Z;
  defaultValue: output<Z>;
}) {
  const [state, setState] = useState(
    () => parseStorageItem(sessionStorage, key, schema) ?? defaultValue,
  );
  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState] as const;
}

export function useLocalStorageState<Z extends ZodType>({
  key,
  schema,
  defaultValue,
}: {
  key: string;
  schema: Z;
  defaultValue: output<Z>;
}) {
  const [state, setState] = useState(
    () => parseStorageItem(localStorage, key, schema) ?? defaultValue,
  );
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState] as const;
}

export function parseStorageItem<Z extends ZodType>(
  storage: Storage,
  key: string,
  schema: Z,
) {
  const item = storage.getItem(key);

  if (item) {
    const { success, data } = schema.safeParse(JSON.parse(item));
    return success ? data : undefined;
  }
  return;
}
