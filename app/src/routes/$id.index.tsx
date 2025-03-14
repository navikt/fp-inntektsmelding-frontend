import { createFileRoute, getRouteApi, Navigate } from "@tanstack/react-router";

import { mapInntektsmeldingResponseTilValidAgiState } from "~/api/queries.ts";
import {
  ARBEIDSGIVER_INITERT_ID,
  ARBEIDSGIVER_INITERT_SKJEMA_ID,
} from "~/features/arbeidsgiverinitiert/AgiRot.tsx";

const route = getRouteApi("/$id");

export const Route = createFileRoute("/$id/")({
  component: () => {
    const params = route.useParams();
    const { eksisterendeInntektsmeldinger, opplysninger } =
      route.useLoaderData();
    if (eksisterendeInntektsmeldinger[0] === undefined) {
      return <Navigate params={params} replace to={"/$id/dine-opplysninger"} />;
    }
    const erAgiNyansattInntektsmelding =
      eksisterendeInntektsmeldinger[0].agiÅrsak === "NYANSATT";

    if (erAgiNyansattInntektsmelding) {
      // TODO: forklar
      sessionStorage.setItem(
        ARBEIDSGIVER_INITERT_ID,
        JSON.stringify(opplysninger),
      );

      sessionStorage.setItem(
        ARBEIDSGIVER_INITERT_SKJEMA_ID,
        JSON.stringify(
          mapInntektsmeldingResponseTilValidAgiState(
            eksisterendeInntektsmeldinger[0],
          ),
        ),
      );

      return (
        <Navigate
          params={params}
          replace
          search={{ ytelseType: eksisterendeInntektsmeldinger[0].ytelse }}
          to={"/agi/vis"}
        />
      );
    }

    return <Navigate params={params} replace to={"/$id/vis"} />;
  },
});
