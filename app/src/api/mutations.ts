import {
  mapInntektsmeldingResponseTilValidAgiState,
  mapInntektsmeldingResponseTilValidState,
} from "~/api/queries.ts";
import {
  feilmeldingSchema,
  InntektsmeldingResponseDtoSchema,
  SendAgiInntektsmeldingRequestDto,
  SendInntektsmeldingRequestDto,
} from "~/types/api-models.ts";
import { logDev } from "~/utils.ts";

const SERVER_URL = `${import.meta.env.BASE_URL}/server/api`;

export class InntektAvvikerFraAInntektError extends Error {
  constructor() {
    super(
      "Månedslønnen du har oppgitt er ulik gjennomsnittet av inntekten som er rapportert til A-ordningen for de tre siste månedene. Du må starte på nytt, slik at vi får hentet oppdaterte opplysninger fra A-ordningen. Hvis månedslønnen du oppgir fortsatt er ulik, må du oppgi hvorfor den er endret under «Endre månedslønn».",
    );
    this.name = "InntektAvvikerFraAInntektError";
  }
}

async function kastFeilVedInnsending(response: Response): Promise<never> {
  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new Error("Noe gikk galt.");
  }
  const parsedFeil = feilmeldingSchema.safeParse(json);

  if (
    parsedFeil.success &&
    parsedFeil.data.feilkode === "INNTEKT_AVVIKER_FRA_AINNTEKT"
  ) {
    throw new InntektAvvikerFraAInntektError();
  }

  throw new Error("Noe gikk galt.");
}

export async function sendInntektsmelding(
  sendInntektsmeldingRequest: SendInntektsmeldingRequestDto,
) {
  const response = await fetch(`${SERVER_URL}/imdialog/send-inntektsmelding`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sendInntektsmeldingRequest),
  });

  if (!response.ok) {
    await kastFeilVedInnsending(response);
  }

  const json = await response.json();
  const parsedJson = InntektsmeldingResponseDtoSchema.safeParse(json);

  if (!parsedJson.success) {
    logDev("error", parsedJson.error);

    throw new Error("Responsen fra serveren matchet ikke forventet format");
  }

  return mapInntektsmeldingResponseTilValidState(parsedJson.data);
}

export async function sendAgiInntektsmelding(
  sendInntektsmeldingRequest: SendAgiInntektsmeldingRequestDto,
) {
  const response = await fetch(`${SERVER_URL}/imdialog/send-inntektsmelding`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sendInntektsmeldingRequest),
  });

  if (!response.ok) {
    await kastFeilVedInnsending(response);
  }

  const json = await response.json();
  const parsedJson = InntektsmeldingResponseDtoSchema.safeParse(json);

  if (!parsedJson.success) {
    logDev("error", parsedJson.error);

    throw new Error("Responsen fra serveren matchet ikke forventet format");
  }

  return mapInntektsmeldingResponseTilValidAgiState(parsedJson.data);
}
