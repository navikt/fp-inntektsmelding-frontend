import { z } from "zod";

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
