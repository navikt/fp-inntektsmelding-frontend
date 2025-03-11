import { AgiSkjemaStateProvider } from "~/features/arbeidsgiverinitiert/AgiSkjemaState.tsx";
import { SkjemaRotLayout } from "~/features/rot-layout/SkjemaRotLayout.tsx";

export const ARBEIDSGIVER_INITERT_ID = "agi";
export const ARBEIDSGIVER_INITERT_SKJEMA_ID = "skjemadata-agi";


export const AgiRot = () => {
  return (
    <AgiSkjemaStateProvider>
      <SkjemaRotLayout ytelse="SVA" />
    </AgiSkjemaStateProvider>
  );
};
