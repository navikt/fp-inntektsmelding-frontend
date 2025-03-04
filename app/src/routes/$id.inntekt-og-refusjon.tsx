import { createFileRoute, getRouteApi } from "@tanstack/react-router";

import { Steg2Refusjon } from "~/features/arbeidsgiverinitiert/Steg2Refusjon.tsx";
import { HjelpetekstToggle } from "~/features/Hjelpetekst.tsx";
import { Steg2InntektOgRefusjon } from "~/features/inntektsmelding/Steg2InntektOgRefusjon";
import { ARBEIDSGIVER_INITERT_ID } from "~/routes/opprett.tsx";

const route = getRouteApi("/$id");

export const Route = createFileRoute("/$id/inntekt-og-refusjon")({
  component: () => {
    const { id } = route.useParams();
    return (
      <>
        <HjelpetekstToggle />
        {id === ARBEIDSGIVER_INITERT_ID ? (
          <Steg2Refusjon />
        ) : (
          <Steg2InntektOgRefusjon />
        )}
      </>
    );
  },
});
