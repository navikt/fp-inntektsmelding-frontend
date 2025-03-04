import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Button, Heading } from "@navikt/ds-react";
import { Link, useLoaderData, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";

import { InntektOgRefusjonForm } from "~/features/inntektsmelding/Steg2InntektOgRefusjon.tsx";
import { useOpplysninger } from "~/features/inntektsmelding/useOpplysninger.tsx";
import {
  InntektsmeldingSkjemaState,
  useInntektsmeldingSkjema,
} from "~/features/inntektsmelding/InntektsmeldingSkjemaState.tsx";
import { Fremgangsindikator } from "~/features/skjema-moduler/Fremgangsindikator.tsx";
import {
  ENDRINGSÅRSAK_TEMPLATE,
  Inntekt,
} from "~/features/skjema-moduler/Inntekt.tsx";
import {
  NATURALYTELSE_SOM_MISTES_TEMPLATE,
  Naturalytelser,
} from "~/features/skjema-moduler/Naturalytelser.tsx";
import { UtbetalingOgRefusjon } from "~/features/skjema-moduler/UtbetalingOgRefusjon.tsx";
import { useDocumentTitle } from "~/features/useDocumentTitle.tsx";
import { ARBEIDSGIVER_INITERT_ID } from "~/routes/opprett.tsx";
import { formatYtelsesnavn } from "~/utils.ts";

export type RefusjonForm = {
  skalRefunderes: "JA_LIK_REFUSJON" | "JA_VARIERENDE_REFUSJON";
} & Pick<InntektsmeldingSkjemaState, "refusjon">;

export function Steg2InntektOgRefusjon() {
  const opplysninger = useOpplysninger();
  useDocumentTitle(
    `Inntekt og refusjon – inntektsmelding for ${formatYtelsesnavn(opplysninger.ytelse)}`,
  );

  const { inntektsmeldingSkjemaState, setInntektsmeldingSkjemaState } =
    useInntektsmeldingSkjema();

  const { eksisterendeInntektsmeldinger } = useLoaderData({ from: "/$id" });
  const harEksisterendeInntektsmeldinger =
    eksisterendeInntektsmeldinger.length > 0;

  const defaultInntekt =
    inntektsmeldingSkjemaState.inntekt ||
    opplysninger.inntektsopplysninger.gjennomsnittLønn;

  const formMethods = useForm<RefusjonForm>({
    defaultValues: {
      skalRefunderes: inntektsmeldingSkjemaState.skalRefunderes,
      refusjon:
        inntektsmeldingSkjemaState.refusjon.length === 0
          ? [
              { fom: opplysninger.førsteUttaksdato, beløp: defaultInntekt },
              { fom: undefined, beløp: 0 },
            ]
          : inntektsmeldingSkjemaState.refusjon.length === 1
            ? [
                ...inntektsmeldingSkjemaState.refusjon,
                { fom: undefined, beløp: 0 },
              ]
            : inntektsmeldingSkjemaState.refusjon,
    },
  });

  const { handleSubmit, watch } = formMethods;
  const navigate = useNavigate();

  const onSubmit = handleSubmit((skjemadata) => {
    const { refusjon, skalRefunderes, inntekt, korrigertInntekt } = skjemadata;

    const misterNaturalytelser = skjemadata.misterNaturalytelser === "ja";
    const bortfaltNaturalytelsePerioder = misterNaturalytelser
      ? skjemadata.bortfaltNaturalytelsePerioder.map((naturalYtelse) => ({
          ...naturalYtelse,
          inkluderTom: naturalYtelse.inkluderTom === "ja",
        }))
      : [];
    const endringAvInntektÅrsaker = korrigertInntekt
      ? skjemadata.endringAvInntektÅrsaker
      : [];

    setInntektsmeldingSkjemaState((prev) => ({
      ...prev,
      inntekt,
      korrigertInntekt,
      endringAvInntektÅrsaker,
      refusjon,
      skalRefunderes,
      misterNaturalytelser,
      bortfaltNaturalytelsePerioder,
    }));
    navigate({
      from: "/$id/inntekt-og-refusjon",
      to: "../oppsummering",
    });
  });

  return (
    <FormProvider {...formMethods}>
      <section className="mt-2">
        <form
          className="bg-bg-default px-5 py-6 rounded-md flex gap-6 flex-col"
          onSubmit={onSubmit}
        >
          <Heading level="3" size="large">
            Inntekt og refusjon
          </Heading>
          <Fremgangsindikator aktivtSteg={2} />
          <Ytelsesperiode />
          <Inntekt
            harEksisterendeInntektsmeldinger={harEksisterendeInntektsmeldinger}
            opplysninger={opplysninger}
          />
          <UtbetalingOgRefusjon />
          <Naturalytelser opplysninger={opplysninger} />
          <div className="flex gap-4 justify-center">
            <Button
              as={Link}
              icon={<ArrowLeftIcon />}
              to="../dine-opplysninger"
              variant="secondary"
            >
              Forrige steg
            </Button>
            <Button
              disabled={
                watch("skalRefunderes") === "NEI" &&
                opplysninger.forespørselUuid === ARBEIDSGIVER_INITERT_ID
              }
              icon={<ArrowRightIcon />}
              iconPosition="right"
              type="submit"
              variant="primary"
            >
              Neste steg
            </Button>
          </div>
        </form>
      </section>
    </FormProvider>
  );
}
