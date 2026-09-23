import { z } from "zod/v4";

import {
  feilmeldingSchema,
  SendInntektsmeldingResponseDto,
} from "~/types/api-models.ts";

export const enkelSendInntektsmeldingResponse = {
  inntektsmeldingUuid: "uuid-1000801",
  foresporselUuid: "1",
  aktorId: "2715347149890",
  ytelse: "FORELDREPENGER",
  arbeidsgiverIdent: "810007842",
  kontaktperson: {
    navn: "Test Testesen",
    telefonnummer: "13371337",
  },
  startdato: "2024-05-30",
  inntekt: 20_000,
  refusjon: [],
  endringAvInntektÅrsaker: [],
  bortfaltNaturalytelsePerioder: [],
  opprettetTidspunkt: "2024-09-11T15:23:16.013",
} satisfies SendInntektsmeldingResponseDto;

export const sendAgiInntektsmeldingResponse = {
  inntektsmeldingUuid: "uuid-1000801",
  arbeidsgiverinitiertÅrsak: "NYANSATT",
  foresporselUuid: "1",
  aktorId: "2715347149890",
  ytelse: "FORELDREPENGER",
  arbeidsgiverIdent: "810007842",
  kontaktperson: {
    navn: "Test Testesen",
    telefonnummer: "13371337",
  },
  startdato: "2024-05-30",
  inntekt: 20_000,
  refusjon: [],
  endringAvInntektÅrsaker: [],
  bortfaltNaturalytelsePerioder: [],
  opprettetTidspunkt: "2024-09-11T15:23:16.013",
} satisfies SendInntektsmeldingResponseDto;

// A-inntekt har nedetid: inntektsmeldingen lagres, men venter på etterkontroll (fp-inntektsmelding TFP-6988)
export const sendInntektsmeldingVenterVurderingResponse = {
  ...enkelSendInntektsmeldingResponse,
  status: "VENTER_VURDERING",
} satisfies SendInntektsmeldingResponseDto;

// Oppgitt inntekt avviker fra A-inntekt uten endringsårsak: backend svarer 400 (fp-inntektsmelding TFP-6988)
export const inntektAvvikerFraAInntektFeilResponse = {
  status: 400,
  callId: "CallId_1727071234567_123456789",
  feilkode: "INNTEKT_AVVIKER_FRA_AINNTEKT",
  feilmelding:
    "Inntekt i inntektsmelding er ulik inntekt fra A-inntekt, og ingen endringsårsak er oppgitt. Gjennomsnittlig inntekt fra A-inntekt: 46000.00, oppgitt inntekt i inntektsmelding: 45000",
} satisfies z.infer<typeof feilmeldingSchema> & { status: number };
