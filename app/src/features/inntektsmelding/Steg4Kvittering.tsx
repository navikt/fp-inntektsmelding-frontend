import { useInntektsmeldingSkjema } from "~/features/inntektsmelding/InntektsmeldingSkjemaState.tsx";
import { Kvittering } from "~/features/Kvittering.tsx";
import { useDocumentTitle } from "~/features/useDocumentTitle";
import { formatYtelsesnavn } from "~/utils";

import { useOpplysninger } from "./useOpplysninger";

export const Steg4Kvittering = () => {
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
