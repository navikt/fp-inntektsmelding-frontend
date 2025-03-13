import { Alert, BodyLong, Heading } from "@navikt/ds-react";
import { useLoaderData, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";

import { useInntektsmeldingSkjema } from "~/features/inntektsmelding/InntektsmeldingSkjemaState.tsx";
import { useOpplysninger } from "~/features/inntektsmelding/useOpplysninger";
import { Fremgangsindikator } from "~/features/inntektsmelding/Fremgangsindikator.tsx";
import {
  Intro,
  KontaktInformasjon,
  Personinformasjon,
  PersonOgSelskapsInformasjonForm,
} from "~/features/skjema-moduler/KontaktInformasjon.tsx";
import { formatYtelsesnavn, lagFulltNavn } from "~/utils";

import { useDocumentTitle } from "../useDocumentTitle";

export const Steg1DineOpplysninger = () => {
  const opplysninger = useOpplysninger();
  useDocumentTitle(
    `Dine opplysninger – inntektsmelding for ${formatYtelsesnavn(opplysninger.ytelse)}`,
  );
  const { eksisterendeInntektsmeldinger } = useLoaderData({ from: "/$id" });
  const { inntektsmeldingSkjemaState, setInntektsmeldingSkjemaState } =
    useInntektsmeldingSkjema();

  const innsenderNavn = lagFulltNavn(opplysninger.innsender);

  const methods = useForm<PersonOgSelskapsInformasjonForm>({
    defaultValues: {
      ...(inntektsmeldingSkjemaState.kontaktperson ?? {
        navn: innsenderNavn,
        telefonnummer: opplysninger.innsender.telefon,
      }),
    },
  });
  const navigate = useNavigate();

  const onSubmit = methods.handleSubmit((kontaktperson) => {
    setInntektsmeldingSkjemaState((prev) => ({ ...prev, kontaktperson }));
    navigate({
      from: "/$id/dine-opplysninger",
      to: "../inntekt-og-refusjon",
    });
  });

  // Hvis en oppgave er FERDIG, men vi ikke finner noen tidligere IMer kan vi anta den er sendt fra Altinn eller LPS
  const erTidligereSendInnFraAltinn =
    opplysninger.forespørselStatus === "FERDIG" &&
    eksisterendeInntektsmeldinger.length === 0;

  return (
    <section className="mt-2">
      {erTidligereSendInnFraAltinn && (
        <Alert className="mb-4" variant="warning">
          <Heading level="3" size="xsmall" spacing>
            Inntektsmelding er sendt inn via Altinn eller lønns- og
            personalsystem
          </Heading>
          <BodyLong>
            Dere har tidligere sendt inn inntektsmelding for denne perioden via
            Altinn eller bedriftens lønns- og personalsystem. Vi klarer derfor
            ikke vise inntektsmeldingen. For å korrigere eller melde fra om
            endringer kan du fylle ut nytt skjema her.
          </BodyLong>
        </Alert>
      )}
      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          <div className="bg-bg-default px-5 py-6 rounded-md flex flex-col gap-6">
            <Heading level="3" size="large">
              Dine opplysninger
            </Heading>
            <Fremgangsindikator aktivtSteg={1} />
            <Intro opplysninger={opplysninger} />
            <Personinformasjon opplysninger={opplysninger} />
            <KontaktInformasjon />
          </div>
        </form>
      </FormProvider>
    </section>
  );
};
