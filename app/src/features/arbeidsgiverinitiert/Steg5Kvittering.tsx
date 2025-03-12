import { useAgiSkjema } from "~/features/arbeidsgiverinitiert/AgiSkjemaState.tsx";
import { useAgiOpplysninger } from "~/features/arbeidsgiverinitiert/useAgiOpplysninger.tsx";
import { Kvittering } from "~/features/Kvittering.tsx";
import { useDocumentTitle } from "~/features/useDocumentTitle";
import { formatYtelsesnavn } from "~/utils";

export const Steg5Kvittering = () => {
  const opplysninger = useAgiOpplysninger();
  const { gyldigAgiSkjemaState } = useAgiSkjema();
  useDocumentTitle(
    `Kvittering – inntektsmelding for ${formatYtelsesnavn(opplysninger.ytelse)}`,
  );
  const erRefusjon = gyldigAgiSkjemaState?.skalRefunderes !== "NEI";
  const inntektsmeldingsId = gyldigAgiSkjemaState?.id;

  return (
    <Kvittering
      erRefusjon={erRefusjon}
      inntektsmeldingId={inntektsmeldingsId}
      opplysninger={opplysninger}
    />
  );
};
