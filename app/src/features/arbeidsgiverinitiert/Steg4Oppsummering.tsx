import { ArrowLeftIcon, PaperplaneIcon } from "@navikt/aksel-icons";
import { Alert, BodyLong, Button, Heading, Stack } from "@navikt/ds-react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import isEqual from "lodash/isEqual";

import { sendAgiInntektsmelding } from "~/api/mutations.ts";
import {
  hentEksisterendeInntektsmeldinger,
  mapInntektsmeldingResponseTilValidAgiState,
} from "~/api/queries.ts";
import { AgiFremgangsindikator } from "~/features/arbeidsgiverinitiert/AgiFremgangsindikator.tsx";
import { AGI_OPPLYSNINGER_UUID } from "~/features/arbeidsgiverinitiert/AgiRot.tsx";
import { AgiSkjemaoppsummering } from "~/features/arbeidsgiverinitiert/AgiSkjemaoppsummering.tsx";
import {
  AgiSkjemaStateValid,
  useAgiSkjema,
} from "~/features/arbeidsgiverinitiert/AgiSkjemaState.tsx";
import { useAgiOpplysninger } from "~/features/arbeidsgiverinitiert/useAgiOpplysninger.tsx";
import { useDocumentTitle } from "~/features/useDocumentTitle";
import {
  OpplysningerDto,
  SendAgiInntektsmeldingRequestDto,
} from "~/types/api-models.ts";
import {
  finnSenesteInntektsmelding,
  formatStrengTilTall,
  formatYtelsesnavn,
} from "~/utils";

export const Steg4Oppsummering = () => {
  const opplysninger = useAgiOpplysninger();
  useDocumentTitle(
    `Oppsummering – inntektsmelding for ${formatYtelsesnavn(opplysninger.ytelse)}`,
  );

  const { gyldigAgiSkjemaState, agiSkjemaStateError } = useAgiSkjema();

  if (!gyldigAgiSkjemaState) {
    // På dette punktet "skal" skjemaet være gyldig med mindre noe har gått galt. Logg error til Grafana for innsikt.
    // eslint-disable-next-line no-console
    console.error(
      "Ugyldig skjemaState på oppsummeringssiden for AGI",
      agiSkjemaStateError,
    );
    return (
      <Alert className="mt-4 mx-4 md:mx-0" variant="error">
        <Stack gap="4">
          <BodyLong>
            Noe gikk galt med utfyllingen av inntektsmeldingen din. Du må
            dessverre begynne på nytt.
          </BodyLong>
          <Button
            as={Link}
            search
            size="small"
            to="/agi"
            variant="secondary-neutral"
          >
            Start på nytt
          </Button>
        </Stack>
      </Alert>
    );
  }

  return (
    <section>
      <div className="bg-bg-default mt-4 px-5 py-6 rounded-md flex flex-col gap-6">
        <Heading level="2" size="large">
          Oppsummering
        </Heading>
        <AgiFremgangsindikator aktivtSteg={4} />
        <AgiSkjemaoppsummering
          opplysninger={opplysninger}
          skjemaState={gyldigAgiSkjemaState}
        />
        <SendInnInntektsmelding />
      </div>
    </section>
  );
};

function SendInnInntektsmelding() {
  const navigate = useNavigate();
  const opplysninger = useAgiOpplysninger();

  const { gyldigAgiSkjemaState, setAgiSkjemaState } = useAgiSkjema();

  const { mutate, error, isPending } = useMutation({
    mutationFn: async (skjemaState: AgiSkjemaStateValid) => {
      const inntektsmeldingRequest = lagSendInntektsmeldingRequest(
        skjemaState,
        opplysninger,
      );
      const forespørselUuid = opplysninger.forespørselUuid;
      const erEndring = opplysninger.forespørselUuid !== AGI_OPPLYSNINGER_UUID;

      if (erEndring && forespørselUuid) {
        // TODO: uoptimalt å hente dette on-demand her. Burde ta ibruk query-cachen.
        const eksisterendeInntektsmeldinger =
          await hentEksisterendeInntektsmeldinger(forespørselUuid);
        const sisteInntektsmelding = finnSenesteInntektsmelding(
          eksisterendeInntektsmeldinger,
        );

        if (sisteInntektsmelding) {
          const eksisterendeInntektsmelding = lagSendInntektsmeldingRequest(
            mapInntektsmeldingResponseTilValidAgiState(sisteInntektsmelding),
            opplysninger,
          );
          if (isEqual(inntektsmeldingRequest, eksisterendeInntektsmelding)) {
            throw new Error(
              "Du har ikke gjort noen endringer fra forrige innsendte inntektsmelding.",
            );
          }
        }
      }

      return sendAgiInntektsmelding(inntektsmeldingRequest);
    },
    onSuccess: (inntektsmeldingState) => {
      setAgiSkjemaState(inntektsmeldingState);
      navigate({
        from: "/agi/oppsummering",
        to: "../kvittering",
        search: true,
      });
    },
  });

  if (!gyldigAgiSkjemaState) {
    return null;
  }

  return (
    <>
      {error ? <Alert variant="error">{error.message}</Alert> : undefined}
      <div className="flex gap-4 justify-center">
        <Button
          as={Link}
          icon={<ArrowLeftIcon />}
          search
          to="../refusjon"
          variant="secondary"
        >
          Forrige steg
        </Button>
        <Button
          icon={<PaperplaneIcon />}
          iconPosition="right"
          loading={isPending}
          onClick={() => mutate(gyldigAgiSkjemaState)}
          variant="primary"
        >
          Send inn
        </Button>
      </div>
    </>
  );
}

function lagSendInntektsmeldingRequest(
  skjemaState: AgiSkjemaStateValid,
  opplysninger: OpplysningerDto,
) {
  const refusjon =
    skjemaState.skalRefunderes === "JA_LIK_REFUSJON"
      ? skjemaState.refusjon.slice(0, 1)
      : skjemaState.skalRefunderes === "JA_VARIERENDE_REFUSJON"
        ? skjemaState.refusjon
        : [];

  // Send kun med forespørselUuid ved endring. Ved opprinnelig innsendelse skal den være undefined.
  const forespørselUuid =
    opplysninger.forespørselUuid === AGI_OPPLYSNINGER_UUID
      ? undefined
      : opplysninger.forespørselUuid;

  return {
    foresporselUuid: forespørselUuid,
    arbeidsgiverinitiertÅrsak: skjemaState.arbeidsgiverinitiertÅrsak,
    aktorId: opplysninger.person.aktørId,
    ytelse: opplysninger.ytelse,
    arbeidsgiverIdent: opplysninger.arbeidsgiver.organisasjonNummer,
    kontaktperson: skjemaState.kontaktperson,
    startdato: skjemaState.førsteFraværsdag,
    refusjon: refusjon.map((r) => ({
      ...r,
      beløp: formatStrengTilTall(r.beløp),
    })),
    bortfaltNaturalytelsePerioder: [],
    endringAvInntektÅrsaker: [],
  } satisfies SendAgiInntektsmeldingRequestDto;
}
