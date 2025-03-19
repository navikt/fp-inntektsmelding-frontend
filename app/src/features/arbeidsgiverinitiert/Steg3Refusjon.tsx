import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import {
  Alert,
  Button,
  Heading,
  HStack,
  Radio,
  RadioGroup,
  Stack,
  VStack,
} from "@navikt/ds-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import { AgiFremgangsindikator } from "~/features/arbeidsgiverinitiert/AgiFremgangsindikator.tsx";
import { useAgiSkjema } from "~/features/arbeidsgiverinitiert/AgiSkjemaState.tsx";
import { useAgiOpplysninger } from "~/features/arbeidsgiverinitiert/useAgiOpplysninger.tsx";
import { InntektsmeldingSkjemaState } from "~/features/inntektsmelding/InntektsmeldingSkjemaState.tsx";
import { DatePickerWrapped } from "~/features/react-hook-form-wrappers/DatePickerWrapped.tsx";
import { FormattertTallTextField } from "~/features/react-hook-form-wrappers/FormattertTallTextField.tsx";
import {
  HvaVilDetSiÅHaRefusjon,
  Over6GAlert,
  REFUSJON_RADIO_VALG,
  VarierendeRefusjon,
} from "~/features/skjema-moduler/UtbetalingOgRefusjon.tsx";
import { useDocumentTitle } from "~/features/useDocumentTitle.tsx";
import { OpplysningerDto } from "~/types/api-models.ts";
import { formatYtelsesnavn } from "~/utils.ts";

export type RefusjonForm = Pick<
  InntektsmeldingSkjemaState,
  "refusjon" | "skalRefunderes"
> & { førsteFraværsdag: string };

export function Steg3Refusjon() {
  const opplysninger = useAgiOpplysninger();
  useDocumentTitle(
    `Refusjon – inntektsmelding for ${formatYtelsesnavn(opplysninger.ytelse)}`,
  );

  const { agiSkjemaState, setAgiSkjemaState } = useAgiSkjema();

  const formMethods = useForm<RefusjonForm>({
    defaultValues: {
      skalRefunderes: agiSkjemaState.skalRefunderes,
      førsteFraværsdag: agiSkjemaState.førsteFraværsdag,
      refusjon:
        agiSkjemaState.refusjon.length === 0
          ? [
              { fom: opplysninger.førsteUttaksdato, beløp: 0 },
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
          <FørsteFraværsdag />
          <AgiRefusjon opplysninger={opplysninger} />
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
              search
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

const AgiRefusjon = ({ opplysninger }: { opplysninger: OpplysningerDto }) => {
  const { register, formState, watch } = useFormContext<RefusjonForm>();
  const { name, ...radioGroupProps } = register("skalRefunderes", {
    required: "Du må svare på dette spørsmålet",
  });

  const skalRefunderes = watch("skalRefunderes");

  return (
    <VStack gap="4">
      <hr />
      <RadioGroup
        description={<HvaVilDetSiÅHaRefusjon opplysninger={opplysninger} />}
        error={formState.errors.skalRefunderes?.message}
        legend="Betaler dere lønn under fraværet og krever refusjon?"
        name={name}
      >
        <Radio value="JA_LIK_REFUSJON" {...radioGroupProps}>
          {REFUSJON_RADIO_VALG["JA_LIK_REFUSJON"]}
        </Radio>
        <Radio value="JA_VARIERENDE_REFUSJON" {...radioGroupProps}>
          {REFUSJON_RADIO_VALG["JA_VARIERENDE_REFUSJON"]}
        </Radio>
        <Radio value="NEI" {...radioGroupProps}>
          {REFUSJON_RADIO_VALG["NEI"]}
        </Radio>
      </RadioGroup>
      {skalRefunderes === "JA_LIK_REFUSJON" ? <LikRefusjon /> : undefined}
      {skalRefunderes === "JA_VARIERENDE_REFUSJON" ? (
        <VarierendeRefusjon opplysninger={opplysninger} />
      ) : undefined}
    </VStack>
  );
};

const LikRefusjon = () => {
  return (
    <Stack gap="4">
      <HStack gap="4">
        <FormattertTallTextField
          autoFocus
          label="Refusjonsbeløp per måned"
          min={1}
          name="refusjon.0.beløp"
        />
      </HStack>
      <Over6GAlert />
    </Stack>
  );
};

const FørsteFraværsdag = () => {
  // TODO: valider opp mot nytt datafelt i opplysninger
  return (
    <DatePickerWrapped
      label="Første fraværsdag med refusjon"
      name="førsteFraværsdag"
      rules={{ required: "Må oppgis" }}
    />
  );
};
