import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

import {
  AGI_OPPLYSNINGER_UUID,
  AGI_UREGISTRERT_RUTE_ID,
} from "~/features/arbeidsgiverinitiert/AgiRot.tsx";
import { AgiSkjemaStateValid } from "~/features/arbeidsgiverinitiert/AgiSkjemaState.tsx";
import { InntektsmeldingSkjemaStateValid } from "~/features/inntektsmelding/InntektsmeldingSkjemaState.tsx";
import { PÅKREVDE_ENDRINGSÅRSAK_FELTER } from "~/features/skjema-moduler/Inntekt.tsx";
import { parseStorageItem } from "~/features/usePersistedState.tsx";
import {
  feilmeldingSchema,
  grunnbeløpSchema,
  InntektsmeldingResponseDtoSchema,
  OpplysningerRequest,
  opplysningerSchema,
  OpplysningerUregistrertRequest,
  SendInntektsmeldingResponseDto,
  SlåOppArbeidstakerResponseDtoSchema,
  Ytelsetype,
} from "~/types/api-models";
import { logDev } from "~/utils.ts";

const SERVER_URL = `${import.meta.env.BASE_URL}/server/api`;

export const hentInntektsmeldingPdfUrl = (id: number) =>
  `${SERVER_URL}/imdialog/last-ned-pdf?id=${id}`;

export function hentGrunnbeløpOptions() {
  return queryOptions({
    queryKey: ["GRUNNBELØP"],
    queryFn: hentGrunnbeløp,
    initialData: Infinity,
  });
}

async function hentGrunnbeløp() {
  try {
    const response = await fetch("https://g.nav.no/api/v1/grunnbel%C3%B8p");
    if (!response.ok) {
      return Infinity;
    }

    const json = await response.json();
    const parsedJson = grunnbeløpSchema.safeParse(json);

    if (!parsedJson.success) {
      return Infinity;
    }
    return parsedJson.data.grunnbeløp;
  } catch {
    return Infinity;
  }
}

export async function hentEksisterendeInntektsmeldinger(uuid: string) {
  if (uuid === AGI_UREGISTRERT_RUTE_ID) {
    return [];
  }
  const response = await fetch(
    `${SERVER_URL}/imdialog/inntektsmeldinger?foresporselUuid=${uuid}`,
  );

  if (response.status === 404) {
    throw new Error("Forespørsel ikke funnet");
  }

  if (!response.ok) {
    throw new Error(
      "Kunne ikke hente eksisterende inntektsmeldinger for forespørsel",
    );
  }
  const json = await response.json();
  const parsedJson = z.array(InntektsmeldingResponseDtoSchema).safeParse(json);

  if (!parsedJson.success) {
    logDev("error", parsedJson.error);

    throw new Error("Responsen fra serveren matchet ikke forventet format");
  }

  return parsedJson.data;
}

export function mapInntektsmeldingResponseTilValidState(
  inntektsmelding: SendInntektsmeldingResponseDto,
) {
  return {
    kontaktperson: inntektsmelding.kontaktperson,
    refusjon: inntektsmelding.refusjon ?? [],
    bortfaltNaturalytelsePerioder:
      inntektsmelding.bortfaltNaturalytelsePerioder?.map((periode) => ({
        navn: periode.naturalytelsetype,
        fom: periode.fom,
        beløp: periode.beløp,
        inkluderTom: periode.tom !== undefined,
        tom: periode.tom,
      })) ?? [],
    endringAvInntektÅrsaker: (
      inntektsmelding.endringAvInntektÅrsaker ?? []
    ).map((endringÅrsak) => ({
      ...endringÅrsak,
      ignorerTom:
        endringÅrsak.tom === undefined &&
        PÅKREVDE_ENDRINGSÅRSAK_FELTER[endringÅrsak.årsak]?.tomErValgfritt,
    })),
    inntekt: inntektsmelding.inntekt,
    skalRefunderes:
      (inntektsmelding.refusjon ?? []).length > 1
        ? "JA_VARIERENDE_REFUSJON"
        : (inntektsmelding.refusjon ?? []).length === 1
          ? "JA_LIK_REFUSJON"
          : "NEI",
    misterNaturalytelser:
      (inntektsmelding.bortfaltNaturalytelsePerioder?.length ?? 0) > 0,
    opprettetTidspunkt: inntektsmelding.opprettetTidspunkt,
    id: inntektsmelding.id,
  } satisfies InntektsmeldingSkjemaStateValid;
}

export function mapInntektsmeldingResponseTilValidAgiState(
  inntektsmelding: SendInntektsmeldingResponseDto,
) {
  const arbeidsgiverinitiertÅrsak = inntektsmelding.arbeidsgiverinitiertÅrsak;

  if (arbeidsgiverinitiertÅrsak === undefined) {
    throw new Error(
      "AgiÅrsak ikke satt i inntektsmelding respons for send inn AGI-IM",
    );
  }

  return {
    arbeidsgiverinitiertÅrsak,
    førsteFraværsdag: inntektsmelding.startdato,
    kontaktperson: inntektsmelding.kontaktperson,
    refusjon: inntektsmelding.refusjon ?? [],
    skalRefunderes:
      (inntektsmelding.refusjon ?? []).length > 1
        ? "JA_VARIERENDE_REFUSJON"
        : (inntektsmelding.refusjon ?? []).length === 1
          ? "JA_LIK_REFUSJON"
          : "NEI",
    opprettetTidspunkt: inntektsmelding.opprettetTidspunkt,
    id: inntektsmelding.id,
  } satisfies AgiSkjemaStateValid;
}

export async function hentOpplysningerData(uuid: string) {
  if (uuid === AGI_UREGISTRERT_RUTE_ID) {
    const opplysninger = parseStorageItem(
      sessionStorage,
      AGI_OPPLYSNINGER_UUID,
      opplysningerSchema,
    );

    return opplysninger;
  }
  const response = await fetch(
    `${SERVER_URL}/imdialog/opplysninger?foresporselUuid=${uuid}`,
  );
  if (response.status === 404) {
    throw new Error("Forespørsel ikke funnet");
  }
  if (!response.ok) {
    throw new Error("Kunne ikke hente forespørsel");
  }
  const json = await response.json();
  const parsedJson = opplysningerSchema.safeParse(json);

  if (!parsedJson.success) {
    logDev("error", parsedJson.error);
    throw new Error("Responsen fra serveren matchet ikke forventet format");
  }
  return parsedJson.data;
}

export async function hentPersonUregistrertArbeidFraFnr(
  fnr: string,
  ytelsetype: Ytelsetype,
) {
  const response = await fetch(
    `${SERVER_URL}/arbeidsgiverinitiert/arbeidsgivereForUregistrert`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fødselsnummer: fnr,
        ytelseType: ytelsetype,
      }),
    },
  );

  if (response.status === 404) {
    throw new Error("Fant ikke person");
  }

  const json = await response.json();
  if (!response.ok) {
    return parseFeilmelding(json, "Kunne ikke hente opplysninger");
  }

  const parsedJson = SlåOppArbeidstakerResponseDtoSchema.safeParse(json);

  if (!parsedJson.success) {
    logDev("error", parsedJson.error);

    throw new Error("Responsen fra serveren matchet ikke forventet format");
  }

  return parsedJson.data;
}

export async function hentPersonFraFnr(
  fnr: string,
  ytelsetype: Ytelsetype,
  førsteFraværsdag: string,
) {
  const response = await fetch(
    `${SERVER_URL}/arbeidsgiverinitiert/arbeidsforhold`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fødselsnummer: fnr,
        ytelseType: ytelsetype,
        førsteFraværsdag,
      }),
    },
  );

  if (response.status === 404) {
    throw new Error("Fant ikke person");
  }
  const json = await response.json();
  if (!response.ok) {
    return parseFeilmelding(json, "Kunne ikke hente opplysninger");
  }

  const parsedJson = SlåOppArbeidstakerResponseDtoSchema.safeParse(json);

  if (!parsedJson.success) {
    logDev("error", parsedJson.error);

    throw new Error("Responsen fra serveren matchet ikke forventet format");
  }

  return parsedJson.data;
}

export async function hentOpplysninger(
  opplysningerRequest: OpplysningerRequest,
) {
  const response = await fetch(
    `${SERVER_URL}/arbeidsgiverinitiert/opplysninger`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(opplysningerRequest),
    },
  );
  const json = await response.json();
  if (!response.ok) {
    return parseFeilmelding(json, "Kunne ikke hente opplysninger");
  }

  const parsedJson = opplysningerSchema.safeParse(json);

  if (!parsedJson.success) {
    logDev("error", parsedJson.error);

    throw new Error("Responsen fra serveren matchet ikke forventet format");
  }

  return parsedJson.data;
}

export async function hentOpplysningerUregistrert(
  opplysningerRequest: OpplysningerUregistrertRequest,
) {
  const response = await fetch(
    `${SERVER_URL}/arbeidsgiverinitiert/opplysningerUregistrert`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(opplysningerRequest),
    },
  );

  const json = await response.json();
  if (!response.ok) {
    return parseFeilmelding(json, "Kunne ikke hente opplysninger");
  }

  const parsedJson = opplysningerSchema.safeParse(json);

  if (!parsedJson.success) {
    logDev("error", parsedJson.error);

    throw new Error("Responsen fra serveren matchet ikke forventet format");
  }

  return parsedJson.data;
}

const parseFeilmelding = (json: unknown, feilmelding: string) => {
  const parsedFeil = feilmeldingSchema.safeParse(json);
  if (!parsedFeil.success) {
    logDev("error", parsedFeil.error);
    throw new Error(feilmelding);
  }
  if (parsedFeil.data?.type !== undefined) {
    throw new Error(parsedFeil.data?.type);
  }
  throw new Error(feilmelding);
};
