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

import {
  hentOpplysninger,
  hentOpplysningerUregistrert,
  hentPersonFraFnr,
  hentPersonUregistrertArbeidFraFnr,
} from "~/api/queries.ts";
import { AgiFremgangsindikator } from "~/features/arbeidsgiverinitiert/AgiFremgangsindikator.tsx";
import {
  AGI_OPPLYSNINGER_UUID,
  AGI_UREGISTRERT_RUTE_ID,
} from "~/features/arbeidsgiverinitiert/AgiRot.tsx";
import {
  AgiSkjemaState,
  useAgiSkjema,
} from "~/features/arbeidsgiverinitiert/AgiSkjemaState.tsx";
import { DatePickerWrapped } from "~/features/react-hook-form-wrappers/DatePickerWrapped.tsx";
import { useDocumentTitle } from "~/features/useDocumentTitle.tsx";
import {
  OpplysningerRequest,
  OpplysningerUregistrertRequest,
  SlåOppArbeidstakerResponseDto,
} from "~/types/api-models.ts";
import { formatYtelsesnavn, lagFulltNavn } from "~/utils.ts";

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
      if (opplysninger.forespørselUuid === undefined) {
        // 1. Finner på en ID
        // 2. lagrer opplysningene i sessionStorage
        // 3. AGI-løypa leser opplysninger fra sessionstorage istedetfor backend

        sessionStorage.setItem(
          AGI_OPPLYSNINGER_UUID,
          JSON.stringify(opplysninger),
        );
        const arbeidsgiverinitiertÅrsak = formMethods.watch(
          "arbeidsgiverinitiertÅrsak",
        );
        const førsteFraværsdag = formMethods.watch("førsteFraværsdag");

        // Det er med intensjon at vi ikke tar med eksisterende verdier. Fra dette punktet ønsker vi alltid et blankt skjema
        setAgiSkjemaState((prevState) => ({
          førsteFraværsdag,
          kontaktperson: prevState.kontaktperson,
          arbeidsgiverinitiertÅrsak,
          refusjon: [],
        }));
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

  const opprettOpplysningerUregistrertMutation = useMutation({
    mutationFn: async (opplysningerRequest: OpplysningerUregistrertRequest) => {
      return hentOpplysningerUregistrert(opplysningerRequest);
    },
    onSuccess: (opplysninger) => {
      if (opplysninger.forespørselUuid === undefined) {
        // 1. Finner på en ID
        // 2. lagrer opplysningene i sessionStorage
        // 3. redirecter til samme sti som før
        // 4. komponenten leser ID og avgjør om den skal hente opplysninger fra Backend eller sessionstorage.
        sessionStorage.setItem(
          AGI_OPPLYSNINGER_UUID,
          JSON.stringify(opplysninger),
        );

        return navigate({
          to: "/$id",
          params: { id: AGI_UREGISTRERT_RUTE_ID },
        });
      }

      // Hvis forespørsel finnes navigerer vi deg ut av AGI-flyten
      return navigate({
        to: "/$id",
        params: { id: opplysninger.forespørselUuid },
      });
    },
  });

  const hentPersonUregistrertArbeidMutation = useMutation({
    mutationFn: async ({ fødselsnummer }: FormType) => {
      const personinfo = await hentPersonUregistrertArbeidFraFnr(
        fødselsnummer,
        ytelseType,
      );
      if (ytelseType === "SVANGERSKAPSPENGER" && personinfo.kjønn === "MANN") {
        throw new Error("MENN_KAN_IKKE_SØKE_SVP");
      }
      return personinfo;
    },
    onSuccess: (data, { fødselsnummer }) => {
      if (data.arbeidsforhold.length === 1) {
        return opprettOpplysningerUregistrertMutation.mutate({
          fødselsnummer,
          ytelseType,
          organisasjonsnummer: data.arbeidsforhold[0].organisasjonsnummer,
        });
      }
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
          onSubmit={formMethods.handleSubmit((values) => {
            if (values.arbeidsgiverinitiertÅrsak === "NYANSATT") {
              return hentPersonMutation.mutate(values);
            } else if (values.arbeidsgiverinitiertÅrsak === "UREGISTRERT") {
              return hentPersonUregistrertArbeidMutation.mutate(values);
            } else {
              // TODO: sjekk om dette tryner hvis "Annen årsak" + ENTER
              throw new Error(
                "Ikke gyldig årsak ved submit: " +
                  values.arbeidsgiverinitiertÅrsak,
              );
            }
          })}
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
                value="UREGISTRERT"
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
              "UREGISTRERT" && (
              <>
                <UregistrertForm
                  data={hentPersonUregistrertArbeidMutation.data}
                />
                <Button
                  className="w-fit"
                  loading={isPending}
                  type="submit"
                  variant="secondary"
                >
                  Hent opplysninger
                </Button>
                <VelgArbeidsgiver
                  data={hentPersonUregistrertArbeidMutation.data}
                />
              </>
            )}
            {formMethods.watch("arbeidsgiverinitiertÅrsak") ===
              "ANNEN_ÅRSAK" && <AnnenÅrsak />}
            <ApiError
              error={
                hentPersonMutation.error ??
                hentPersonUregistrertArbeidMutation.error ??
                opprettOpplysningerMutation.error ??
                opprettOpplysningerUregistrertMutation.error
              }
            />
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
            {(hentPersonUregistrertArbeidMutation.data?.arbeidsforhold.length ??
              0) > 1 && (
              <Button
                className="w-fit"
                icon={<ArrowRightIcon />}
                iconPosition="right"
                loading={opprettOpplysningerUregistrertMutation.isPending}
                onClick={() =>
                  opprettOpplysningerUregistrertMutation.mutate({
                    organisasjonsnummer: formMethods.watch(
                      "organisasjonsnummer",
                    ),
                    fødselsnummer: formMethods.watch("fødselsnummer"),
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

function ApiError({ error }: { error: Error | null }) {
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
      <Alert data-testid="ingen-sak-funnet" variant="warning">
        <Heading level="3" size="small">
          Kan ikke opprette inntektsmelding
        </Heading>
        Du kan ikke sende inn inntektsmelding på {formatYtelsesnavn(ytelseType)}{" "}
        på denne personen.
      </Alert>
    );
  }

  if (error?.message === "SENDT_FOR_TIDLIG") {
    return (
      <Alert data-testid="sendt-for-tidlig" variant="warning">
        <Heading level="3" size="small">
          Kan ikke opprette inntektsmelding
        </Heading>
        Du kan ikke sende inn inntektsmelding før fire uker før personen starter{" "}
        {formatYtelsesnavn(ytelseType)}.
      </Alert>
    );
  }

  if (error?.message === "FINNES_I_AAREG") {
    return (
      <Alert data-testid="orgnr-finnes-i-aareg" variant="warning">
        <Heading level="3" size="small">
          Kan ikke opprette inntektsmelding
        </Heading>
        Det finnes rapportering i aa-registeret på organisasjonsnummeret. Nav
        vil be om inntektsmelding når vi trenger det.
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

function VelgArbeidsgiver({ data }: { data?: SlåOppArbeidstakerResponseDto }) {
  const formMethods = useFormContext<FormType>();

  if (!data || data.arbeidsforhold.length <= 1) {
    return null;
  }

  return (
    <Select
      description={`Velg hvilken underenhet du vil sende inn inntektsmelding for ${lagFulltNavn(data)}`}
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
        rules={{ required: "Må oppgis" }}
      />
    </VStack>
  );
}

function UregistrertForm({ data }: { data?: SlåOppArbeidstakerResponseDto }) {
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
