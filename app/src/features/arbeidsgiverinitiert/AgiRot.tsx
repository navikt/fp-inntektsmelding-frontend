import { getRouteApi } from "@tanstack/react-router";

import { AgiSkjemaStateProvider } from "~/features/arbeidsgiverinitiert/AgiSkjemaState.tsx";
import { useOptionalAgiOpplysninger } from "~/features/arbeidsgiverinitiert/useAgiOpplysninger.tsx";
import { SkjemaRotLayout } from "~/features/rot-layout/SkjemaRotLayout.tsx";

export const AGI_OPPLYSNINGER_UUID = "agi-opplysninger-uuid";
export const AGI_UREGISTRERT_RUTE_ID = "agi-uregistrert";
export const AGI_NYANSATT_SKJEMA_ID = "agi-nyansatt-skjema-id";

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
  const opplysninger = useOptionalAgiOpplysninger();
  return (
    <AgiSkjemaStateProvider>
      <SkjemaRotLayout
        organisasjonNavn={opplysninger?.arbeidsgiver.organisasjonNavn}
        organisasjonNummer={opplysninger?.arbeidsgiver.organisasjonNummer}
        ytelse={ytelseType}
      />
    </AgiSkjemaStateProvider>
  );
};
