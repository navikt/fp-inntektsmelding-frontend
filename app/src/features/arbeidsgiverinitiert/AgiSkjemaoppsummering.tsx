import { FormSummary, VStack } from "@navikt/ds-react";
import { Link } from "@tanstack/react-router";

import { AgiSkjemaStateValid } from "~/features/arbeidsgiverinitiert/AgiSkjemaState.tsx";
import { InntektsmeldingSkjemaStateValid } from "~/features/inntektsmelding/InntektsmeldingSkjemaState.tsx";
import { REFUSJON_RADIO_VALG } from "~/features/skjema-moduler/UtbetalingOgRefusjon.tsx";
import type { OpplysningerDto } from "~/types/api-models.ts";
import {
  formatDatoLang,
  formatFødselsnummer,
  formatKroner,
  formatNavn,
  formatTelefonnummer,
  lagFulltNavn,
} from "~/utils";

type AgiSkjemaoppsummeringProps = {
  opplysninger: OpplysningerDto;
  skjemaState: AgiSkjemaStateValid;
};
export const AgiSkjemaoppsummering = ({
  opplysninger,
  skjemaState,
}: AgiSkjemaoppsummeringProps) => {
  const kanEndres = opplysninger.forespørselStatus !== "UTGÅTT";

  return (
    <VStack gap="space-16">
      <FormSummary>
        <FormSummary.Header>
          <FormSummary.Heading level="3">
            Arbeidsgiver og den ansatte
          </FormSummary.Heading>
          {kanEndres && (
            <FormSummary.EditLink
              aria-label="Endre dine opplysninger"
              as={Link}
              search
              to="../dine-opplysninger"
            />
          )}
        </FormSummary.Header>
        <FormSummary.Answers>
          <FormSummary.Answer>
            <FormSummary.Label>Arbeidsgiver</FormSummary.Label>
            <FormSummary.Value>
              {opplysninger.arbeidsgiver.organisasjonNavn}, org.nr.{" "}
              {opplysninger.arbeidsgiver.organisasjonNummer}
            </FormSummary.Value>
          </FormSummary.Answer>
          <FormSummary.Answer>
            <FormSummary.Label>Kontaktperson</FormSummary.Label>
            <FormSummary.Value>
              {formatterKontaktperson(skjemaState.kontaktperson)}
            </FormSummary.Value>
          </FormSummary.Answer>
          <FormSummary.Answer>
            <FormSummary.Label>Den ansatte</FormSummary.Label>
            <FormSummary.Value>
              {lagFulltNavn(opplysninger.person)}
              {", "}
              {formatFødselsnummer(opplysninger.person.fødselsnummer)}
            </FormSummary.Value>
          </FormSummary.Answer>
        </FormSummary.Answers>
      </FormSummary>

      <FormSummary>
        <FormSummary.Header>
          <FormSummary.Heading level="3">
            Første fraværsdag med refusjon
          </FormSummary.Heading>
        </FormSummary.Header>
        <FormSummary.Answers>
          <FormSummary.Answer>
            <FormSummary.Label>Fra og med</FormSummary.Label>
            <FormSummary.Value>
              {formatDatoLang(new Date(skjemaState.førsteFraværsdag))}
            </FormSummary.Value>
          </FormSummary.Answer>
        </FormSummary.Answers>
      </FormSummary>
      <FormSummary>
        <FormSummary.Header>
          <FormSummary.Heading level="3">Refusjon</FormSummary.Heading>
          {kanEndres && (
            <FormSummary.EditLink
              aria-label="Endre refusjon"
              as={Link}
              search
              to="../refusjon"
            />
          )}
        </FormSummary.Header>
        <FormSummary.Answers>
          <FormSummary.Answer>
            <FormSummary.Label>
              Betaler dere lønn under fraværet og krever refusjon?
            </FormSummary.Label>
            <FormSummary.Value>
              {REFUSJON_RADIO_VALG[skjemaState.skalRefunderes]}
            </FormSummary.Value>
          </FormSummary.Answer>
          {skjemaState.skalRefunderes === "JA_LIK_REFUSJON" && (
            <FormSummary.Answer>
              <FormSummary.Label>Refusjonsbeløp per måned</FormSummary.Label>
              <FormSummary.Value>
                {formatKroner(skjemaState.refusjon[0].beløp)}
              </FormSummary.Value>
            </FormSummary.Answer>
          )}
          {skjemaState.skalRefunderes === "JA_VARIERENDE_REFUSJON" && (
            <FormSummary.Answer>
              <FormSummary.Label>Endringer i refusjon</FormSummary.Label>
              <FormSummary.Value>
                <FormSummary.Answers>
                  {skjemaState.refusjon.map((endring) => (
                    <FormSummary.Answer
                      key={endring.fom!.toString() + endring?.beløp}
                    >
                      <FormSummary.Label>
                        Refusjonsbeløp per måned
                      </FormSummary.Label>
                      <FormSummary.Value>
                        {formatKroner(endring.beløp)} (fra og med{" "}
                        {formatDatoLang(new Date(endring.fom!))})
                      </FormSummary.Value>
                    </FormSummary.Answer>
                  ))}
                </FormSummary.Answers>
              </FormSummary.Value>
            </FormSummary.Answer>
          )}
        </FormSummary.Answers>
      </FormSummary>
    </VStack>
  );
};

const formatterKontaktperson = (
  kontaktperson: InntektsmeldingSkjemaStateValid["kontaktperson"],
) => {
  if (!kontaktperson) {
    return "";
  }
  return `${formatNavn(kontaktperson.navn)}, tlf. ${formatTelefonnummer(kontaktperson.telefonnummer)}`;
};
