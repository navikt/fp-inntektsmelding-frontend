import { getRouteApi } from "@tanstack/react-router";

import { AgiSkjemaStateProvider } from "~/features/arbeidsgiverinitiert/AgiSkjemaState.tsx";
import { SkjemaRotLayout } from "~/features/rot-layout/SkjemaRotLayout.tsx";

export const ARBEIDSGIVER_INITERT_ID = "agi";
export const ARBEIDSGIVER_INITERT_SKJEMA_ID = "skjemadata-agi";

const route = getRouteApi("/agi");

export const AgiRot = () => {
  const { ytelseType } = route.useSearch();
  return (
    <AgiSkjemaStateProvider>
      <SkjemaRotLayout ytelse={ytelseType} />
    </AgiSkjemaStateProvider>
  );
};
