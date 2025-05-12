import { createFileRoute, getRouteApi, Navigate } from "@tanstack/react-router";

import { mapInntektsmeldingResponseTilValidAgiState } from "~/api/queries.ts";
import {
  AGI_OPPLYSNINGER_UUID,
  AGI_NYANSATT_SKJEMA_ID,
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
      eksisterendeInntektsmeldinger[0].arbeidsgiverinitiertÅrsak === "NYANSATT";

    if (erAgiNyansattInntektsmelding) {
      // TODO: forklar
      sessionStorage.setItem(
        AGI_OPPLYSNINGER_UUID,
        JSON.stringify(opplysninger),
      );

      sessionStorage.setItem(
        AGI_NYANSATT_SKJEMA_ID,
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
