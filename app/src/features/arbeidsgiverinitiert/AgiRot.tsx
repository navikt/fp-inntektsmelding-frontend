import { getRouteApi } from "@tanstack/react-router";

import { AgiSkjemaStateProvider } from "~/features/arbeidsgiverinitiert/AgiSkjemaState.tsx";
import { useAgiOpplysninger } from "~/features/arbeidsgiverinitiert/useAgiOpplysninger.tsx";
import { SkjemaRotLayout } from "~/features/rot-layout/SkjemaRotLayout.tsx";

export const ARBEIDSGIVER_INITERT_ID = "agi";
export const ARBEIDSGIVER_INITERT_SKJEMA_ID = "skjemadata-agi";

const route = getRouteApi("/agi");

export const AgiRot = () => {
  return (
    <AgiSkjemaStateProvider>
      <AgiRotComponent />
    </AgiSkjemaStateProvider>
  );
};

const AgiRotComponent = () => {
  const { ytelseType } = route.useSearch();
  const opplysninger = useAgiOpplysninger();
  return (
    <AgiSkjemaStateProvider>
      <SkjemaRotLayout
        organisasjonNavn={opplysninger.arbeidsgiver.organisasjonNavn}
        organisasjonNummer={opplysninger.arbeidsgiver.organisasjonNummer}
        ytelse={ytelseType}
      />
    </AgiSkjemaStateProvider>
  );
};
