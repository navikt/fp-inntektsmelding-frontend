import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Alert, Button, Heading } from "@navikt/ds-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";

import { useAgiSkjema } from "~/features/arbeidsgiverinitiert/AgiSkjemaState.tsx";
import { useAgiOpplysninger } from "~/features/arbeidsgiverinitiert/useAgiOpplysninger.tsx";
import { InntektsmeldingSkjemaState } from "~/features/inntektsmelding/InntektsmeldingSkjemaState.tsx";
import { UtbetalingOgRefusjon } from "~/features/skjema-moduler/UtbetalingOgRefusjon.tsx";
import { useDocumentTitle } from "~/features/useDocumentTitle.tsx";
import { formatYtelsesnavn } from "~/utils.ts";
import {AgiFremgangsindikator} from "~/features/arbeidsgiverinitiert/AgiFremgangsindikator.tsx";

export type RefusjonForm = Pick<
  InntektsmeldingSkjemaState,
  "refusjon" | "skalRefunderes"
>;

export function Steg3Refusjon() {
  const opplysninger = useAgiOpplysninger();
  useDocumentTitle(
    `Refusjon – inntektsmelding for ${formatYtelsesnavn(opplysninger.ytelse)}`,
  );

  const { agiSkjemaState, setAgiSkjemaState } = useAgiSkjema();

  const defaultInntekt = opplysninger.inntektsopplysninger.gjennomsnittLønn;

  const formMethods = useForm<RefusjonForm>({
    defaultValues: {
      skalRefunderes: agiSkjemaState.skalRefunderes,
      refusjon:
        agiSkjemaState.refusjon.length === 0
          ? [
              { fom: opplysninger.førsteUttaksdato, beløp: defaultInntekt },
              { fom: undefined, beløp: 0 },
            ]
          : agiSkjemaState.refusjon.length === 1
            ? [...agiSkjemaState.refusjon, { fom: undefined, beløp: 0 }]
            : agiSkjemaState.refusjon,
    },
  });

  const { handleSubmit, watch } = formMethods;
  const navigate = useNavigate();

  const onSubmit = handleSubmit((skjemadata) => {
    const { refusjon, skalRefunderes } = skjemadata;

    setAgiSkjemaState((prev) => ({
      ...prev,
      inntekt: refusjon[0].beløp,
      refusjon,
      skalRefunderes,
    }));
    navigate({
      from: "/agi/refusjon",
      to: "../oppsummering",
      search: true,
    });
  });

  const harValgtNeiTilRefusjon = watch("skalRefunderes") === "NEI";

  return (
    <FormProvider {...formMethods}>
      <section className="mt-2">
        <form
          className="bg-bg-default px-5 py-6 rounded-md flex gap-6 flex-col"
          onSubmit={onSubmit}
        >
          <Heading level="3" size="large">
            Refusjon
          </Heading>
          <AgiFremgangsindikator aktivtSteg={3} />
          <UtbetalingOgRefusjon opplysninger={opplysninger} />
          {harValgtNeiTilRefusjon && (
            <Alert variant="warning">
              <Heading level="2" size="small">
                Inntektsmelding kan ikke sendes inn
              </Heading>
              Det er ikke nødvendig å sende inn inntektsmelding dersom du ikke
              krever refusjon for den nyansatte.
            </Alert>
          )}
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
              disabled={harValgtNeiTilRefusjon}
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
