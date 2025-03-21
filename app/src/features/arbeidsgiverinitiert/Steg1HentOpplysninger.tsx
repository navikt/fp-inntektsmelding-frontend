import { ArrowRightIcon } from "@navikt/aksel-icons";
import {
  Alert,
  BodyShort,
  Button,
  Heading,
  HStack,
  Label,
  Radio,
  RadioGroup,
  Select,
  TextField,
  VStack,
} from "@navikt/ds-react";
import { fnr } from "@navikt/fnrvalidator";
import { useMutation } from "@tanstack/react-query";
import {
  getRouteApi,
  Link as TanstackLink,
  useNavigate,
} from "@tanstack/react-router";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import { hentOpplysninger, hentPersonFraFnr } from "~/api/queries.ts";
import { AgiFremgangsindikator } from "~/features/arbeidsgiverinitiert/AgiFremgangsindikator.tsx";
import { ARBEIDSGIVER_INITERT_ID } from "~/features/arbeidsgiverinitiert/AgiRot.tsx";
import {
  AgiSkjemaState,
  useAgiSkjema,
} from "~/features/arbeidsgiverinitiert/AgiSkjemaState.tsx";
import { DatePickerWrapped } from "~/features/react-hook-form-wrappers/DatePickerWrapped.tsx";
import { useDocumentTitle } from "~/features/useDocumentTitle.tsx";
import {
  OpplysningerRequest,
  SlåOppArbeidstakerResponseDto,
} from "~/types/api-models.ts";
import { formatYtelsesnavn } from "~/utils.ts";

const route = getRouteApi("/agi/opprett");

type FormType = {
  fødselsnummer: string;
  organisasjonsnummer: string;
  arbeidsgiverinitiertÅrsak: AgiSkjemaState["arbeidsgiverinitiertÅrsak"];
  førsteFraværsdag: string;
};

export const Steg1HentOpplysninger = () => {
  const { ytelseType } = route.useSearch();
  const navigate = useNavigate();
  useDocumentTitle(
    `Opprett inntektsmelding for ${formatYtelsesnavn(ytelseType)}`,
  );
  const { agiSkjemaState, setAgiSkjemaState } = useAgiSkjema();

  const formMethods = useForm<FormType>({
    defaultValues: {
      fødselsnummer: "",
      arbeidsgiverinitiertÅrsak: agiSkjemaState.arbeidsgiverinitiertÅrsak,
      organisasjonsnummer: "",
    },
  });

  const { name, ...radioGroupProps } = formMethods.register(
    "arbeidsgiverinitiertÅrsak",
    {
      required: "Du må svare på dette spørsmålet",
    },
  );

  const opprettOpplysningerMutation = useMutation({
    mutationFn: async (opplysningerRequest: OpplysningerRequest) => {
      return hentOpplysninger(opplysningerRequest);
    },
    onSuccess: (opplysninger) => {
      if (
        opplysninger.forespørselUuid === undefined ||
        opplysninger.forespørselUuid === ARBEIDSGIVER_INITERT_ID
      ) {
        // 1. Finner på en ID
        // 2. lagrer opplysningene i sessionStorage
        // 3. redirecter til samme sti som før
        // 4. komponenten leser ID og avgjør om den skal hente opplysninger fra Backend eller sessionstorage.
        const opplysningerMedId = {
          ...opplysninger,
          forespørselUuid: ARBEIDSGIVER_INITERT_ID,
        };
        sessionStorage.setItem(
          ARBEIDSGIVER_INITERT_ID,
          JSON.stringify(opplysningerMedId),
        );
        const arbeidsgiverinitiertÅrsak = formMethods.watch(
          "arbeidsgiverinitiertÅrsak",
        );

        // Det er med intensjon at vi ikke tar med eksisterende verdier. Fra dette punktet ønsker vi alltid et blankt skjema
        setAgiSkjemaState({ arbeidsgiverinitiertÅrsak, refusjon: [] });
        return navigate({
          from: "/agi/opprett",
          to: "/agi/dine-opplysninger",
          search: true,
        });
      }

      // Hvis forespørsel finnes navigerer vi deg ut av AGI-flyten
      return navigate({
        to: "/$id",
        params: { id: opplysninger.forespørselUuid },
      });
    },
  });

  const hentPersonMutation = useMutation({
    mutationFn: async ({ fødselsnummer, førsteFraværsdag }: FormType) => {
      const personinfo = await hentPersonFraFnr(
        fødselsnummer,
        ytelseType,
        førsteFraværsdag,
      );
      if (ytelseType === "SVANGERSKAPSPENGER" && personinfo.kjønn === "MANN") {
        throw new Error("MENN_KAN_IKKE_SØKE_SVP");
      }

      return personinfo;
    },
    onSuccess: (data, { fødselsnummer, førsteFraværsdag }) => {
      if (data.arbeidsforhold.length === 1) {
        return opprettOpplysningerMutation.mutate({
          fødselsnummer,
          førsteFraværsdag,
          ytelseType,
          organisasjonsnummer: data.arbeidsforhold[0].organisasjonsnummer,
        });
      }
    },
  });

  const isPending =
    hentPersonMutation.isPending || opprettOpplysningerMutation.isPending;

  return (
    <FormProvider {...formMethods}>
      <section className="mt-2">
        <form
          onSubmit={formMethods.handleSubmit((values) =>
            hentPersonMutation.mutate(values),
          )}
        >
          <div className="bg-bg-default px-5 py-6 rounded-md flex flex-col gap-6">
            <Heading level="3" size="large">
              Opprett manuell inntektsmelding
            </Heading>
            <AgiFremgangsindikator aktivtSteg={1} />
            <RadioGroup
              error={
                formMethods.formState.errors.arbeidsgiverinitiertÅrsak?.message
              }
              legend="Årsak til at du vil opprette inntektsmelding"
              name={name}
            >
              <Radio value="NYANSATT" {...radioGroupProps}>
                Ny ansatt som mottar ytelse fra Nav
              </Radio>
              <Radio
                description="(Ambassadepersonell, fiskere og utenlandske arbeidstakere)"
                value="UNNTATT_AAREGISTER"
                {...radioGroupProps}
              >
                Unntatt registrering i Aa-registeret
              </Radio>
              <Radio value="ANNEN_ÅRSAK" {...radioGroupProps}>
                Annen årsak
              </Radio>
            </RadioGroup>
            {formMethods.watch("arbeidsgiverinitiertÅrsak") === "NYANSATT" && (
              <>
                <NyAnsattForm data={hentPersonMutation.data} />
                <Button
                  className="w-fit"
                  loading={isPending}
                  type="submit"
                  variant="secondary"
                >
                  Hent opplysninger
                </Button>
                <VelgArbeidsgiver data={hentPersonMutation.data} />
              </>
            )}
            {formMethods.watch("arbeidsgiverinitiertÅrsak") ===
              "UNNTATT_AAREGISTER" && <UnntattAaregRegistrering />}
            {formMethods.watch("arbeidsgiverinitiertÅrsak") ===
              "ANNEN_ÅRSAK" && <AnnenÅrsak />}
            <HentPersonError error={hentPersonMutation.error} />
            {(hentPersonMutation.data?.arbeidsforhold.length ?? 0) > 1 && (
              <Button
                className="w-fit"
                icon={<ArrowRightIcon />}
                iconPosition="right"
                loading={opprettOpplysningerMutation.isPending}
                onClick={() =>
                  opprettOpplysningerMutation.mutate({
                    organisasjonsnummer: formMethods.watch(
                      "organisasjonsnummer",
                    ),
                    fødselsnummer: formMethods.watch("fødselsnummer"),
                    førsteFraværsdag: formMethods.watch("førsteFraværsdag"),
                    ytelseType,
                  })
                }
                type="button"
              >
                Opprett inntektsmelding
              </Button>
            )}
          </div>
        </form>
      </section>
    </FormProvider>
  );
};

function HentPersonError({ error }: { error: Error | null }) {
  if (!error) {
    return null;
  }

  if (error?.message === "MENN_KAN_IKKE_SØKE_SVP") {
    return (
      <Alert variant="warning">
        <Heading level="3" size="small">
          Bare kvinner kan søke svangerskapspenger
        </Heading>
        Ønsker du heller sende inntektsmelding for foreldrepenger?{" "}
        <TanstackLink
          from="/agi/opprett"
          search={(s) => ({ ...s, ytelseType: "FORELDREPENGER" })}
          to="."
        >
          Klikk her
        </TanstackLink>
      </Alert>
    );
  }

  const { ytelseType } = route.useSearch();
  if (error?.message === "INGEN_SAK_FUNNET") {
    return (
      <Alert variant="warning">
        <Heading level="3" size="small">
          Kan ikke opprette inntektsmelding
        </Heading>
        Du kan ikke sende inn inntektsmelding på {formatYtelsesnavn(ytelseType)}{" "}
        på denne personen
      </Alert>
    );
  }

  if (error.message.includes("Fant ikke person")) {
    return (
      <Alert variant="error">
        <Heading level="3" size="small">
          Vi finner ingen ansatt registrert hos dere med dette fødselsnummeret
        </Heading>
        <BodyShort>
          Sjekk om fødselsnummeret er riktig og at den ansatte er registrert hos
          dere i Aa-registeret. Den ansatte må være registrert i Aa-registeret
          for å kunne sende inn inntektsmelding.{" "}
        </BodyShort>
      </Alert>
    );
  }

  return <Alert variant="error">{error.message}</Alert>;
}

function UnntattAaregRegistrering() {
  return (
    <Alert data-testid="unntatt-aareg-registrering-alert" variant="info">
      <Heading level="3" size="small">
        Du må sende inn inntektsmelding via Altinn
      </Heading>
      <BodyShort>
        Skal du sende inn inntektsmelding for en ansatt som er unntatt for
        registrering i Aa-registeret, må du enn så lenge sende inn
        inntektsmelding i Altinn.
      </BodyShort>
    </Alert>
  );
}

function VelgArbeidsgiver({ data }: { data?: SlåOppArbeidstakerResponseDto }) {
  const formMethods = useFormContext<FormType>();

  if (!data || data.arbeidsforhold.length <= 1) {
    return null;
  }

  return (
    <Select
      description="Den ansatte har flere arbeidsforhold hos samme arbeidsgiver.  Velg hvilken underenhet inntektsmeldingen gjelder for. "
      error={formMethods.formState.errors.organisasjonsnummer?.message}
      label="Arbeidsgiver"
      {...formMethods.register(`organisasjonsnummer`, {
        required: "Må oppgis",
      })}
    >
      <option value="">Velg Organisasjon</option>
      {data?.arbeidsforhold.map((arbeidsforhold) => (
        <option
          key={arbeidsforhold.organisasjonsnummer}
          value={arbeidsforhold.organisasjonsnummer}
        >
          {arbeidsforhold.organisasjonsnavn} (
          {arbeidsforhold.organisasjonsnummer})
        </option>
      ))}
    </Select>
  );
}

function NyAnsattForm({ data }: { data?: SlåOppArbeidstakerResponseDto }) {
  const formMethods = useFormContext<FormType>();

  return (
    <VStack gap="8">
      <HStack gap="10">
        <TextField
          {...formMethods.register("fødselsnummer", {
            required: "Må oppgis",
            validate: (value) =>
              (value && fnr(value).status === "valid") ||
              "Du må fylle ut et gyldig fødselsnummer",
          })}
          error={formMethods.formState.errors.fødselsnummer?.message}
          label="Ansattes fødselsnummer"
        />
        <VStack gap="4">
          <Label>Navn</Label>
          {data && (
            <BodyShort>
              {data.fornavn} {data.etternavn}
            </BodyShort>
          )}
        </VStack>
      </HStack>
      <DatePickerWrapped
        label="Første fraværsdag med refusjon"
        name="førsteFraværsdag"
        rules={{ required: "Må oppgis" }} // TODO: Forklare hvorfor det må oppgis
      />
    </VStack>
  );
}

function AnnenÅrsak() {
  return (
    <Alert
      data-testid="im-kan-ikke-opprettes-for-andre-årsaker-alert"
      variant="warning"
    >
      <Heading level="2" size="small" spacing>
        Det er ikke mulig å opprette inntektsmelding for andre årsaker enda
      </Heading>
      <BodyShort>
        Den ansatte må søke om foreldrepenger før du kan sende inntektsmelding.
        Varsel med oppgave blir tilgjengelig i saksoversikten når den ansatte
        har sendt inn søknad til oss, men tidligst 4 uker før første fraværsdag.
        Trenger du hjelp, kontakt oss på{" "}
        <a href="tel:55553336">tlf.&nbsp;55&nbsp;55&nbsp;33&nbsp;36.</a>
      </BodyShort>
    </Alert>
  );
}
