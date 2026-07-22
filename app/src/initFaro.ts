import { init } from "@nais/apm";

interface StackFrame {
  filename?: string;
  function?: string;
}

type ExceptionPayload = {
  type?: string;
  value?: string;
  stacktrace?: {
    frames?: StackFrame[];
  };
};

type FaroItem = {
  type?: string;
  payload?: ExceptionPayload;
};

type ExceptionItem = FaroItem & {
  type: "exception";
  payload: ExceptionPayload;
};

const FEIL_VI_VIL_LUKE_BORT = ["personbruker/decorator-next"];

const DISTRIBUTOR_PATTERN = /Request timeout \S*Distributor\.\S+/;

const DOM_OVERSETTELSE_FEIL =
  /(removeChild|insertBefore)[\s\S]*not a child of this node/i;

const HAS_FOCUS_FEIL =
  /\b(window|globalThis|self)\.hasFocus is not a function/i;

export const initFaro = () => {
  if (import.meta.env.MODE === "development") {
    return;
  }

  init({
    beforeSend: (item) => {
      if (!erExceptionItem(item)) {
        return item;
      }

      if (feilVarSomFølgeAvEn401Handling(item)) {
        return null;
      }

      if (feilUtenOpprinnelseIVårKode(item)) {
        return null;
      }

      if (feilFraBrowserExtensions(item)) {
        return null;
      }

      if (feilFraDomOversettelse(item)) {
        return null;
      }

      if (feilFraHasFocus(item)) {
        return null;
      }

      return item;
    },
  });
};

/**
 * 401 skaper mye støy da det er naturlig at folk sine sesjoner utløper.
 * De blir da automatisk redirected til login, og ser ikke feilen engang.
 *
 * @nais/apm eksponerer ikke breadcrumbs i beforeSend, så vi sjekker feilmeldingstype og -verdi direkte.
 */
const feilVarSomFølgeAvEn401Handling = (item: ExceptionItem): boolean => {
  const { type, value } = item.payload;

  const unauthorizedPattern = /\b401\b|unauthorized/i;

  return (
    (type ? unauthorizedPattern.test(type) : false) ||
    (value ? unauthorizedPattern.test(value) : false)
  );
};

/**
 * Sjekker om exception har stacktrace uten opprinnelse i vår kode.
 */
const feilUtenOpprinnelseIVårKode = (item: ExceptionItem): boolean => {
  const frames = item.payload.stacktrace?.frames;
  return frames ? harUtenforstaendeKodeOpprinnelse(frames) : false;
};

/**
 * Sjekker om stackframes mangler opprinnelse i vår kode.
 *
 * Logikk: Hvis en frame er fra et asset (`/assets/*.js`) og matcher
 * FEIL_VI_VIL_LUKE_BORT, er det en uønsket asset-frame → filtrer.
 * Hvis framen er fra våre egne assets → ikke filtrer.
 * Hvis framen ikke er et asset (ikke fra vår bundle) → filtrer.
 */
const harUtenforstaendeKodeOpprinnelse = (frames: StackFrame[]): boolean => {
  return frames.some((frame) => {
    const assetFrame =
      frame.filename && /\/assets\/.*\.js$/.test(frame.filename);

    if (assetFrame) {
      const erUønsketAssetFrame = FEIL_VI_VIL_LUKE_BORT.some((feil) =>
        frame.filename?.includes(feil),
      );
      return erUønsketAssetFrame;
    }
    return true;
  });
};

/**
 * Nettleserutvidelser som f.eks. taleassistenter (Speech Assist) genererer mange
 * "Request timeout ...Distributor.getValue"-feil. Disse er ikke våre feil.
 */
const feilFraBrowserExtensions = (item: ExceptionItem): boolean => {
  const { type, value, stacktrace } = item.payload;

  if (
    (type && DISTRIBUTOR_PATTERN.test(type)) ||
    (value && DISTRIBUTOR_PATTERN.test(value))
  ) {
    return true;
  }

  return stacktrace?.frames
    ? stacktrace.frames.some(
        (frame) =>
          (frame.filename && DISTRIBUTOR_PATTERN.test(frame.filename)) ||
          (frame.function && DISTRIBUTOR_PATTERN.test(frame.function)),
      )
    : false;
};

const feilFraDomOversettelse = (item: ExceptionItem): boolean => {
  return item.payload.value
    ? DOM_OVERSETTELSE_FEIL.test(item.payload.value)
    : false;
};

const feilFraHasFocus = (item: ExceptionItem): boolean => {
  return item.payload.value ? HAS_FOCUS_FEIL.test(item.payload.value) : false;
};

const erExceptionItem = (item: unknown): item is ExceptionItem => {
  if (!item || typeof item !== "object") {
    return false;
  }

  const faroItem = item as FaroItem;
  return faroItem.type === "exception";
};
