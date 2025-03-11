import { InntektsmeldingSkjemaStateProvider } from "~/features/InntektsmeldingSkjemaState";
import { SkjemaRotLayout } from "~/features/rot-layout/SkjemaRotLayout.tsx";

export const ARBEIDSGIVER_INITERT_ID = "agi";

export const AgiRot = () => {
  return (
    <InntektsmeldingSkjemaStateProvider skjemaId={ARBEIDSGIVER_INITERT_ID}>
      <SkjemaRotLayout ytelse="SVA" />
    </InntektsmeldingSkjemaStateProvider>
  );
};
