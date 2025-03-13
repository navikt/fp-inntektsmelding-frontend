import { Heading, Radio, RadioGroup, VStack } from "@navikt/ds-react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import type { InntektOgRefusjonForm } from "~/features/inntektsmelding/Steg2InntektOgRefusjon.tsx";
import {
  HvaVilDetSiÅHaRefusjon,
  LikRefusjon,
  REFUSJON_RADIO_VALG,
  VarierendeRefusjon,
} from "~/features/skjema-moduler/UtbetalingOgRefusjon.tsx";
import { OpplysningerDto } from "~/types/api-models.ts";

type ImRefusjonProps = {
  opplysninger: OpplysningerDto;
};
export const ImRefusjon = ({ opplysninger }: ImRefusjonProps) => {
  const { register, formState, watch, setValue } =
    useFormContext<InntektOgRefusjonForm>();
  const { name, ...radioGroupProps } = register("skalRefunderes", {
    required: "Du må svare på dette spørsmålet",
  });
  const korrigertInntekt = watch("korrigertInntekt");
  useEffect(() => {
    if (korrigertInntekt) {
      setValue("refusjon.0.beløp", korrigertInntekt);
    }
  }, [korrigertInntekt]);

  // Denne bolken er kun relevant hvis A-inntekt er nede. Da vil bruker endre på inntekts-feltet.
  // I alle andre tilfeller er det korrigertInntekt de vil endre.
  // Dette fordi når A-inntekt er nede forventer vi ingen endringsårsak da bruker ikke fikk noen foreslått inntekt til å begynne med
  const inntekt = watch("inntekt");
  useEffect(() => {
    if (inntekt) {
      setValue("refusjon.0.beløp", inntekt);
    }
  }, [inntekt]);

  const skalRefunderes = watch("skalRefunderes");

  return (
    <VStack gap="4">
      <hr />
      <Heading id="refusjon" level="4" size="medium">
        Utbetaling og refusjon
      </Heading>
      <HvaVilDetSiÅHaRefusjon opplysninger={opplysninger} />
      <RadioGroup
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
      {skalRefunderes === "JA_LIK_REFUSJON" ? (
        <LikRefusjon opplysninger={opplysninger} />
      ) : undefined}
      {skalRefunderes === "JA_VARIERENDE_REFUSJON" ? (
        <VarierendeRefusjon opplysninger={opplysninger} />
      ) : undefined}
    </VStack>
  );
};
