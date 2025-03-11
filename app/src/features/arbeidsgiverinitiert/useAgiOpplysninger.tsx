import { ARBEIDSGIVER_INITERT_ID } from "~/features/arbeidsgiverinitiert/AgiRot.tsx";
import { parseStorageItem } from "~/features/usePersistedState.tsx";
import { opplysningerSchema } from "~/types/api-models.ts";

export const useAgiOpplysninger = () => {
  const opplysninger = parseStorageItem(
    sessionStorage,
    ARBEIDSGIVER_INITERT_ID,
    opplysningerSchema,
  );
  console.log("opplysninger", opplysninger);
  if (!opplysninger) {
    throw new Error("Finner ikke arbeidsgiverinitierte opplysninger");
  }
  return opplysninger;
};
