import { z } from "zod/v4";

import {
  feilmeldingSchema,
  SlåOppArbeidstakerResponseDto,
} from "~/types/api-models.ts";

export const arbeidsforholdResponse = {
  fornavn: "MOMENTAN",
  etternavn: "TRAKT",
  arbeidsforhold: [
    {
      organisasjonsnavn: "HELDIG SPRUDLENDE TIGER AS",
      organisasjonsnummer: "315786940",
    },
    {
      organisasjonsnavn: "NAV",
      organisasjonsnummer: "974652293",
    },
  ],
  kjønn: "MANN",
} satisfies SlåOppArbeidstakerResponseDto;

export const arbeidsforholdIngenSakFunnet = {
  callId: "123",
  type: "INGEN_SAK_FUNNET",
  feilmelding: "Fant ikke sak",
} satisfies z.infer<typeof feilmeldingSchema>;

export const arbeidsforholdForTidlig = {
  callId: "123",
  type: "SENDT_FOR_TIDLIG",
  feilmelding:
    "Du kan ikke sende inn inntektsmelding før fire uker før person starter ytelse",
} satisfies z.infer<typeof feilmeldingSchema>;

export const arbeidsforholdOrgNrFinnerIAreg = {
  callId: "123",
  type: "FINNES_I_AAREG",
  feilmelding:
    "Det finnes rapportering i aa-registeret på organisasjonsnummeret. Nav vil be om inntektsmelding når vi trenger det",
} satisfies z.infer<typeof feilmeldingSchema>;
