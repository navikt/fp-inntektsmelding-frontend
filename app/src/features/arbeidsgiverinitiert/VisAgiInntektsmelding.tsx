import { DownloadIcon, PencilIcon } from "@navikt/aksel-icons";
import {
  Alert,
  BodyShort,
  Button,
  Detail,
  Heading,
  HStack,
  VStack,
} from "@navikt/ds-react";
import { Link } from "@tanstack/react-router";

import { hentInntektsmeldingPdfUrl } from "~/api/queries";
import { AgiSkjemaoppsummering } from "~/features/arbeidsgiverinitiert/AgiSkjemaoppsummering.tsx";
import { useAgiSkjema } from "~/features/arbeidsgiverinitiert/AgiSkjemaState.tsx";
import { useAgiOpplysninger } from "~/features/arbeidsgiverinitiert/useAgiOpplysninger.tsx";
import { formatDatoTidKort } from "~/utils.ts";

export const VisAgiInntektsmelding = () => {
  const opplysninger = useAgiOpplysninger();
  const { gyldigAgiSkjemaState } = useAgiSkjema();

  if (
    !gyldigAgiSkjemaState ||
    gyldigAgiSkjemaState.opprettetTidspunkt === undefined ||
    gyldigAgiSkjemaState.id === undefined
  ) {
    throw new Error("Ugyldig skjematilstand på visning av AGI inntektsmelding");
  }

  const endreKnapp = (
    <Button
      as={Link}
      className="w-fit"
      disabled={opplysninger.forespørselStatus === "UTGÅTT"}
      icon={<PencilIcon />}
      search
      to="../dine-opplysninger"
      variant="secondary"
    >
      Endre
    </Button>
  );

  return (
    <section className="mt-4">
      <VStack className="bg-bg-default px-5 py-6 rounded-md" gap="6">
        <HStack gap="2" justify="space-between">
          <VStack>
            <Heading level="1" size="medium">
              Innsendt inntektsmelding
            </Heading>
            <Detail uppercase>
              sendt inn{" "}
              {formatDatoTidKort(
                new Date(gyldigAgiSkjemaState.opprettetTidspunkt),
              )}
            </Detail>
          </VStack>
          {endreKnapp}
        </HStack>
        {opplysninger.forespørselStatus === "UTGÅTT" && (
          <Alert className="my-4" variant="warning">
            <BodyShort>
              Du kan ikke endre inntektsmeldingen når oppgaven den er knyttet
              til er utgått. Det kan skje når søkeren trekker søknaden sin etter
              man har sendt inn en inntektsmelding for den søknaden.
            </BodyShort>
          </Alert>
        )}
        <AgiSkjemaoppsummering
          opplysninger={opplysninger}
          skjemaState={gyldigAgiSkjemaState}
        />
        <HStack gap="4" justify="space-between">
          <HStack gap="4">
            {endreKnapp}

            <Button as="a" href="/min-side-arbeidsgiver" variant="tertiary">
              Lukk
            </Button>
          </HStack>
          <Button
            as="a"
            download={`inntektsmelding-${gyldigAgiSkjemaState.id}.pdf`}
            href={hentInntektsmeldingPdfUrl(gyldigAgiSkjemaState.id)}
            icon={<DownloadIcon />}
            variant="tertiary"
          >
            Last ned inntektsmeldingen
          </Button>
        </HStack>
      </VStack>
    </section>
  );
};
