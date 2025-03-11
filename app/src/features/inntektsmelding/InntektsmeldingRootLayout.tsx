import { getRouteApi } from "@tanstack/react-router";

import { InntektsmeldingSkjemaStateProvider } from "~/features/InntektsmeldingSkjemaState";
import { SkjemaRotLayout } from "~/features/rot-layout/SkjemaRotLayout.tsx";

import { useOpplysninger } from "./useOpplysninger";

const route = getRouteApi("/$id");

export const InntektsmeldingRootLayout = () => {
  const { id } = route.useParams();
  const opplysninger = useOpplysninger();

  return (
    <InntektsmeldingSkjemaStateProvider skjemaId={id}>
      <SkjemaRotLayout
        ytelse={opplysninger.ytelse}
        {...opplysninger.arbeidsgiver}
      />
    </InntektsmeldingSkjemaStateProvider>
  );
};
