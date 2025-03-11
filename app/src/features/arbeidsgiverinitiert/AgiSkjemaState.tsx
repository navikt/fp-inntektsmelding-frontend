import { type ReactNode } from "@tanstack/react-router";
import type { Dispatch, SetStateAction } from "react";
import { createContext, useContext } from "react";
import { z, ZodError } from "zod";

import { ARBEIDSGIVER_INITERT_SKJEMA_ID } from "~/features/arbeidsgiverinitiert/AgiRot.tsx";
import { useSessionStorageState } from "~/features/usePersistedState.tsx";
import { beløpSchema, logDev } from "~/utils.ts";

/**
 * Minst streng skjema-state. Denne brukes underveis der mange av feltene er optional fordi de ikke er utfylt enda.
 */
export const AgiSkjemaStateSchema = z.object({
  agiÅrsak: z
    .union([
      z.literal("NY_ANSATT"),
      z.literal("UNNTATT_AAREGISTER"),
      z.literal("ANNEN_ÅRSAK"),
    ])
    .optional(),
  kontaktperson: z
    .object({
      navn: z.string(),
      telefonnummer: z.string(),
    })
    .optional(),
  skalRefunderes: z
    .union([
      z.literal("JA_LIK_REFUSJON"),
      z.literal("JA_VARIERENDE_REFUSJON"),
      z.literal("NEI"),
    ])
    .optional(),
  refusjon: z.array(
    z.object({
      fom: z.string().optional(),
      beløp: beløpSchema,
    }),
  ),
});

/**
 * En strengere skjema state. Her er alle verdiene validert mot skjema-logikken.
 */
export const AgiSkjemaStateSchemaValidated = z.object({
  agiÅrsak: z.union([
    z.literal("NY_ANSATT"),
    z.literal("UNNTATT_AAREGISTER"),
    z.literal("ANNEN_ÅRSAK"),
  ]),
  kontaktperson: z.object({
    navn: z.string(),
    telefonnummer: z.string(),
  }),

  skalRefunderes: z.union([
    z.literal("JA_LIK_REFUSJON"),
    z.literal("JA_VARIERENDE_REFUSJON"),
    z.literal("NEI"),
  ]),
  refusjon: z.array(
    z.object({
      fom: z.string().optional(),
      beløp: beløpSchema,
    }),
  ),
});

export type AgiSkjemaState = z.infer<typeof AgiSkjemaStateSchema>;
export type AgiSkjemaStateValid = z.infer<typeof AgiSkjemaStateSchemaValidated>;

type AgiSkjemaStateContextType = {
  gyldigAgiSkjemaState?: AgiSkjemaStateValid;
  agiSkjemaStateError?: ZodError;
  agiSkjemaState: AgiSkjemaState;
  setAgiSkjemaState: Dispatch<SetStateAction<AgiSkjemaState>>;
};
const AgiSkjemaStateContext = createContext<AgiSkjemaStateContextType | null>(
  null,
);

type AgiSkjemaStateProviderProps = {
  children: ReactNode;
};

const defaultSkjemaState = {
  refusjon: [],
} satisfies AgiSkjemaState;

export const AgiSkjemaStateProvider = ({
  children,
}: AgiSkjemaStateProviderProps) => {
  const [state, setState] = useSessionStorageState<AgiSkjemaState>(
    ARBEIDSGIVER_INITERT_SKJEMA_ID,
    defaultSkjemaState,
    AgiSkjemaStateSchema,
  );

  const gyldigAgiSkjemaState = AgiSkjemaStateSchemaValidated.safeParse(state);

  if (!gyldigAgiSkjemaState.success) {
    logDev("error", gyldigAgiSkjemaState.error);
  }

  return (
    <AgiSkjemaStateContext.Provider
      value={{
        agiSkjemaState: state,
        gyldigAgiSkjemaState: gyldigAgiSkjemaState.data,
        agiSkjemaStateError: gyldigAgiSkjemaState.error,
        setAgiSkjemaState: setState,
      }}
    >
      {children}
    </AgiSkjemaStateContext.Provider>
  );
};

/** Henter ut global skjematilstand, og lar deg manipulere den */
export const useAgiSkjema = () => {
  const context = useContext(AgiSkjemaStateContext);
  if (!context) {
    throw new Error("useAgiSkjema må brukes inne i en AgiSkjemaStateProvider");
  }

  return context;
};
