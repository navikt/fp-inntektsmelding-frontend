import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Button, Heading } from "@navikt/ds-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";

import { useOpplysninger } from "~/features/inntektsmelding/useOpplysninger.tsx";
import {
  InntektsmeldingSkjemaState,
  useInntektsmeldingSkjema,
} from "~/features/InntektsmeldingSkjemaState.tsx";
import { Fremgangsindikator } from "~/features/skjema-moduler/Fremgangsindikator.tsx";
import { UtbetalingOgRefusjon } from "~/features/skjema-moduler/UtbetalingOgRefusjon.tsx";
import { useDocumentTitle } from "~/features/useDocumentTitle.tsx";
import { formatYtelsesnavn } from "~/utils.ts";

export type RefusjonForm = {
  skalRefunderes: "JA_LIK_REFUSJON" | "JA_VARIERENDE_REFUSJON";
} & Pick<InntektsmeldingSkjemaState, "refusjon">;

export function Steg3Refusjon() {
  const opplysninger = useOpplysninger();
  useDocumentTitle(
    `Refusjon – inntektsmelding for ${formatYtelsesnavn(opplysninger.ytelse)}`,
  );

  const { inntektsmeldingSkjemaState, setInntektsmeldingSkjemaState } =
    useInntektsmeldingSkjema();

  const defaultInntekt =
    inntektsmeldingSkjemaState.inntekt ||
    opplysninger.inntektsopplysninger.gjennomsnittLønn;

  const formMethods = useForm<RefusjonForm>({
    defaultValues: {
      skalRefunderes:
        inntektsmeldingSkjemaState.skalRefunderes === "NEI"
          ? undefined
          : inntektsmeldingSkjemaState.skalRefunderes,
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

  const { handleSubmit } = formMethods;
  const navigate = useNavigate();

  const onSubmit = handleSubmit((skjemadata) => {
    const { refusjon, skalRefunderes } = skjemadata;

    setInntektsmeldingSkjemaState((prev) => ({
      ...prev,
      inntekt: refusjon[0].beløp,
      endringAvInntektÅrsaker: [],
      misterNaturalytelser: false,
      refusjon,
      skalRefunderes,
      bortfaltNaturalytelsePerioder: [],
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
          <UtbetalingOgRefusjon />
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
