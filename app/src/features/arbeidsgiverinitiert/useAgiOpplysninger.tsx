import { ARBEIDSGIVER_INITERT_ID } from "~/features/arbeidsgiverinitiert/AgiRot.tsx";
import { parseStorageItem } from "~/features/usePersistedState.tsx";
import { OpplysningerDto, opplysningerSchema } from "~/types/api-models.ts";

export const useAgiOpplysninger = () => {
  const opplysninger = parseStorageItem(
    sessionStorage,
    ARBEIDSGIVER_INITERT_ID,
    opplysningerSchema,
  );
  if (!opplysninger) {
    throw new Error("Finner ikke arbeidsgiverinitierte opplysninger");
  }
  return opplysninger as OpplysningerDto;
};

export const useOptionalAgiOpplysninger = () => {
  const opplysninger = parseStorageItem(
    sessionStorage,
    ARBEIDSGIVER_INITERT_ID,
    opplysningerSchema,
  );
  if (!opplysninger) {
    return;
  }
  return opplysninger as OpplysningerDto;
};
