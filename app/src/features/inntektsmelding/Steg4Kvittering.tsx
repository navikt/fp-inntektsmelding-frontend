import { getRouteApi } from "@tanstack/react-router";

import { useInntektsmeldingSkjema } from "~/features/InntektsmeldingSkjemaState";
import { Kvittering } from "~/features/Kvittering.tsx";
import { useDocumentTitle } from "~/features/useDocumentTitle";
import { formatYtelsesnavn } from "~/utils";

import { useOpplysninger } from "./useOpplysninger";

const route = getRouteApi("/$id");

export const Steg4Kvittering = () => {
  const { id } = route.useParams();
  const opplysninger = useOpplysninger();
  const { gyldigInntektsmeldingSkjemaState } = useInntektsmeldingSkjema();
  useDocumentTitle(
    `Kvittering – inntektsmelding for ${formatYtelsesnavn(opplysninger.ytelse)}`,
  );
  const erRefusjon = gyldigInntektsmeldingSkjemaState?.skalRefunderes !== "NEI";
  const inntektsmeldingsId = gyldigInntektsmeldingSkjemaState?.id;

  return (
    <Kvittering
      erRefusjon={erRefusjon}
      inntektsmeldingId={inntektsmeldingsId}
      opplysninger={opplysninger}
    />
  );
};
