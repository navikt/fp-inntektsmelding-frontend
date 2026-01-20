import {
  ArrowUndoIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@navikt/aksel-icons";
import {
  Alert,
  BodyLong,
  Button,
  Heading,
  HGrid,
  HStack,
  Label,
  Stack,
  VStack,
} from "@navikt/ds-react";
import { useQuery } from "@tanstack/react-query";
import { isAfter } from "date-fns";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { hentGrunnbeløpOptions } from "~/api/queries.ts";
import { HjelpetekstReadMore } from "~/features/Hjelpetekst.tsx";
import type { InntektOgRefusjonForm } from "~/features/inntektsmelding/Steg2InntektOgRefusjon";
import { DatePickerWrapped } from "~/features/react-hook-form-wrappers/DatePickerWrapped.tsx";
import { OpplysningerDto } from "~/types/api-models.ts";
import { SkalRefunderesType } from "~/types/schema-models.ts";
import { formatKroner, formatStønadsnavn } from "~/utils.ts";

import { FormattertTallTextField } from "../react-hook-form-wrappers/FormattertTallTextField";

export const REFUSJON_RADIO_VALG = {
  JA_LIK_REFUSJON: "Ja, likt beløp i hele perioden",
  JA_VARIERENDE_REFUSJON:
    "Ja, men kun deler av perioden eller varierende beløp",
  NEI: "Nei",
} satisfies Record<SkalRefunderesType, string>;

const ENDRING_I_REFUSJON_TEMPLATE = {
  fom: undefined,
  beløp: 0,
};

type OpplysningerProps = {
  opplysninger: OpplysningerDto;
};
export function LikRefusjon({ opplysninger }: OpplysningerProps) {
  const { watch, resetField, setValue } =
    useFormContext<InntektOgRefusjonForm>();
  const [skalEndreBeløp, setSkalEndreBeløp] = useState(false);

  const refusjonsbeløpPerMåned = watch(`refusjon.0.beløp`);
  const korrigertInntekt = watch("korrigertInntekt");

  return (
    <>
      <div>
        {skalEndreBeløp ? (
          <Stack gap="space-16">
            <HStack gap="space-16">
              <FormattertTallTextField
                autoFocus
                label="Refusjonsbeløp per måned"
                min={0}
                name="refusjon.0.beløp"
              />
              <Button
                aria-label="Tilbakestill refusjonsbeløp"
                className="mt-8"
                icon={<ArrowUndoIcon aria-hidden />}
                onClick={() => {
                  // Hvis vi har korrigert inntekt så setter vi beløp tilbake til det. Hvis ikke sett til defaultValue
                  if (korrigertInntekt) {
                    setValue("refusjon.0.beløp", korrigertInntekt);
                  } else {
                    resetField("refusjon.0.beløp");
                  }
                  setSkalEndreBeløp(false);
                }}
                variant="tertiary"
              >
                Tilbakestill
              </Button>
            </HStack>
            <Over6GAlert />
          </Stack>
        ) : (
          <>
            <Label>Refusjonsbeløp per måned</Label>
            <BodyLong className="mb-2" size="medium">
              {formatKroner(refusjonsbeløpPerMåned)}
            </BodyLong>
            <Button
              className="w-fit"
              icon={<PencilIcon />}
              iconPosition="left"
              onClick={() => {
                setSkalEndreBeløp(true);
              }}
              size="medium"
              variant="secondary"
            >
              Endre refusjonsbeløp
            </Button>
          </>
        )}
      </div>
      <DelvisFraværHjelpetekst opplysninger={opplysninger} />
    </>
  );
}

export function VarierendeRefusjon({ opplysninger }: OpplysningerProps) {
  return (
    <>
      <VStack data-testid="varierende-refusjon">
        <Heading level="2" size="small">
          Refusjonsbeløp dere krever per periode
        </Heading>
        <Alert className="mb-4" variant="info">
          Hvis dere skal slutte å forskuttere lønn i perioden, skriver du 0,- i
          refusjonsbeløp fra den datoen dere ikke lengre forskutterer lønn.
        </Alert>
        <Refusjonsperioder />
        <Over6GAlert />
      </VStack>
      <VStack gap="space-8">
        <DelvisFraværHjelpetekst opplysninger={opplysninger} />
        <HjelpetekstReadMore header="Hvilke endringer må du informere Nav om?">
          <Stack gap="space-8">
            <BodyLong>
              Her skal du registrere endringer som påvirker refusjonen fra Nav.
              Dette kan være på grunn av endret stillingsprosent som gjør at
              lønnen dere forskutterer endrer seg i perioden.
            </BodyLong>
            <BodyLong>
              Hvis dere skal slutte å forskuttere lønn i perioden, registrerer
              du det som en endring her. Dette kan være fordi arbeidsforholdet
              opphører, eller fordi dere kun forskutterer en begrenset periode.
              Du skriver da 0,- i refusjon fra den datoen dere ikke lengre
              forskutterer lønn.
            </BodyLong>
            <BodyLong>
              Du trenger ikke å informere om endringer fordi den ansatte jobber
              mer eller mindre i en periode.
            </BodyLong>
          </Stack>
        </HjelpetekstReadMore>
      </VStack>
    </>
  );
}

function Refusjonsperioder() {
  const { control, watch } = useFormContext<InntektOgRefusjonForm>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "refusjon",
  });

  const tidligsteDato = watch(`refusjon.0.fom`) ?? "";

  return (
    <VStack className="py-4" gap={{ xs: "space-20", md: "space-12" }}>
      {fields.map((field, index) => (
        <HGrid
          className="px-4 border-l-4 border-bg-subtle"
          columns={{ xs: "1fr", md: "min-content 1fr 1fr" }}
          gap="space-24"
          key={field.id}
        >
          <DatePickerWrapped
            label="Fra og med"
            name={`refusjon.${index}.fom` as const}
            readOnly={index === 0}
            rules={{
              required: "Må oppgis",
              validate: (date: string) => {
                if (index === 0) {
                  return true;
                }
                if (!tidligsteDato) {
                  return "Fant ikke starttidspunkt";
                }
                return (
                  isAfter(date, tidligsteDato) || "Kan ikke være før startdato"
                );
              },
            }}
          />
          <div>
            <FormattertTallTextField
              inputMode="numeric"
              label="Refusjonsbeløp per måned"
              min={0}
              name={`refusjon.${index}.beløp` as const}
              required
              size="medium"
            />
          </div>
          {index >= 2 && (
            <div className="flex items-end">
              <Button
                aria-label="Fjern refusjonsendring"
                icon={<TrashIcon />}
                onClick={() => remove(index)}
                type="button"
                variant="tertiary"
              >
                Slett
              </Button>
            </div>
          )}
        </HGrid>
      ))}
      <Button
        className="w-fit col-span-2"
        icon={<PlusIcon />}
        iconPosition="left"
        onClick={() => append(ENDRING_I_REFUSJON_TEMPLATE)}
        size="medium"
        type="button"
        variant="secondary"
      >
        Legg til ny periode
      </Button>
    </VStack>
  );
}

function DelvisFraværHjelpetekst({ opplysninger }: OpplysningerProps) {
  return (
    <HjelpetekstReadMore header="Har den ansatte delvis fravær i perioden?">
      <BodyLong>
        Hvis den ansatte skal kombinere{" "}
        {formatStønadsnavn({
          ytelsesnavn: opplysninger.ytelse,
          form: "ubestemt",
        })}{" "}
        fra Nav med arbeid, vil Nav redusere utbetalingen ut fra opplysningene
        fra den ansatte. Du oppgir derfor den månedslønnen dere utbetaler til
        den ansatte, uavhengig av hvor mye den ansatte skal jobbe.
      </BodyLong>
    </HjelpetekstReadMore>
  );
}

export function HvaVilDetSiÅHaRefusjon({ opplysninger }: OpplysningerProps) {
  return (
    <HjelpetekstReadMore header="Hva vil det si å ha refusjon?">
      <Stack gap="space-8">
        <BodyLong>
          Refusjon er når arbeidsgiver utbetaler lønn som vanlig til den
          ansatte, og får tilbakebetalt{" "}
          {formatStønadsnavn({
            ytelsesnavn: opplysninger.ytelse,
            form: "ubestemt",
          })}{" "}
          direkte fra Nav. Dette kalles ofte å forskuttere lønn, som man krever
          refundert fra Nav. Vi utbetaler da{" "}
          {formatStønadsnavn({
            ytelsesnavn: opplysninger.ytelse,
            form: "bestemt",
          })}{" "}
          til det kontonummeret som arbeidsgiver har registrert i Altinn.
        </BodyLong>
        <BodyLong>
          Noen arbeidsgivere er forpliktet til å forskuttere ut fra
          tariffavtaler, mens andre arbeidsgivere velger selv om de ønsker en
          slik ordning. Hvis dere velger å forskuttere lønn, er det viktig at
          dere har en god dialog med arbeidstakeren om utfallet av søknaden.
        </BodyLong>
      </Stack>
    </HjelpetekstReadMore>
  );
}
export function Over6GAlert() {
  const { watch } = useFormContext<InntektOgRefusjonForm>();
  const GRUNNBELØP = useQuery(hentGrunnbeløpOptions()).data;

  const refusjonsbeløpPerMåned = watch("refusjon")[0];
  const refusjonsbeløpPerMånedSomNummer = Number(refusjonsbeløpPerMåned);
  const erRefusjonOver6G =
    !Number.isNaN(refusjonsbeløpPerMånedSomNummer) &&
    refusjonsbeløpPerMånedSomNummer > 6 * GRUNNBELØP;

  if (erRefusjonOver6G) {
    return (
      <Alert variant="info">
        Nav utbetaler opptil 6G av årslønnen. Du skal likevel føre opp den
        lønnen dere utbetaler til den ansatte i sin helhet.
      </Alert>
    );
  }
  return null;
}
