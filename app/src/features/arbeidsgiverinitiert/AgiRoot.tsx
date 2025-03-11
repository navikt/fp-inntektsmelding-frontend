import { InntektsmeldingSkjemaStateProvider } from "~/features/InntektsmeldingSkjemaState";
import { SkjemaRotLayout } from "~/features/rot-layout/SkjemaRotLayout.tsx";

export const ARBEIDSGIVER_INITERT_ID = "agi";

export const AgiRoot = () => {
  return (
    <InntektsmeldingSkjemaStateProvider skjemaId={ARBEIDSGIVER_INITERT_ID}>
      <SkjemaRotLayout ytelse="SVA" />
    </InntektsmeldingSkjemaStateProvider>
  );
};
