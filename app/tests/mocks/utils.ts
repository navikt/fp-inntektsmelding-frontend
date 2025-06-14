import { expect, Locator, Page } from "@playwright/test";

import type { OpplysningerDto } from "~/types/api-models.ts";

import {
  arbeidsforholdIngenSakFunnet,
  arbeidsforholdResponse,
} from "./arbeidsforhold.ts";
import {
  ingenEksisterendeInntektsmeldingerResponse,
  mangeEksisterendeInntektsmeldingerResponse,
} from "./eksisterende-inntektsmeldinger";
import { grunnbeløpResponse } from "./grunnbeløp";
import { enkeltOpplysningerResponse } from "./opplysninger.ts";

type mockOpplysningerParams = {
  page: Page;
  json?: OpplysningerDto;
  uuid?: string;
};

export const mockOpplysninger = ({
  page,
  json = enkeltOpplysningerResponse,
  uuid = "1",
}: mockOpplysningerParams) => {
  return page.route(
    `**/*/imdialog/opplysninger?foresporselUuid=${uuid}`,
    async (route) => {
      await route.fulfill({ json });
    },
  );
};

type MockHentPersonOgArbeidsforholdParams = {
  page: Page;
  json?: typeof arbeidsforholdResponse;
};
export const mockHentPersonOgArbeidsforhold = ({
  page,
  json = arbeidsforholdResponse,
}: MockHentPersonOgArbeidsforholdParams) => {
  return page.route(
    `**/*/arbeidsgiverinitiert/arbeidsforhold`,
    async (route) => {
      await route.fulfill({ json });
    },
  );
};

export const mockHentUregistrertPersonOgArbeidsforhold = ({
  page,
  json = arbeidsforholdResponse,
}: MockHentPersonOgArbeidsforholdParams) => {
  return page.route(
    `**/*/arbeidsgiverinitiert/arbeidsgivereForUregistrert`,
    async (route) => {
      await route.fulfill({ json });
    },
  );
};

export const mockHentUregistrertForTidlig = ({
  page,
  json = arbeidsforholdResponse,
}: MockHentPersonOgArbeidsforholdParams) => {
  return page.route(
    `**/*/arbeidsgiverinitiert/arbeidsgivereForUregistrert`,
    async (route) => {
      await route.fulfill({ json });
    },
  );
};

type MockHentPersonOgArbeidsforholdIngenSakFunnet = {
  page: Page;
  json?: typeof arbeidsforholdIngenSakFunnet;
};
export const mockHentPersonOgArbeidsforholdIngenSakFunnet = ({
  page,
  json = arbeidsforholdIngenSakFunnet,
}: MockHentPersonOgArbeidsforholdIngenSakFunnet) => {
  return page.route(
    `**/*/arbeidsgiverinitiert/arbeidsforhold`,
    async (route) => {
      await route.fulfill({ status: 403, json });
    },
  );
};

type MockGrunnbeløpParams = {
  page: Page;
  json?: typeof grunnbeløpResponse;
};
export const mockGrunnbeløp = ({
  page,
  json = grunnbeløpResponse,
}: MockGrunnbeløpParams) => {
  return page.route(
    "https://g.nav.no/api/v1/grunnbel%C3%B8p",
    async (route) => {
      await route.fulfill({ json });
    },
  );
};

type MockInntektsmeldingerParams = {
  page: Page;
  json?: typeof mangeEksisterendeInntektsmeldingerResponse;
  uuid?: string;
};

export const mockInntektsmeldinger = ({
  page,
  json = ingenEksisterendeInntektsmeldingerResponse,
  uuid = "1",
}: MockInntektsmeldingerParams) => {
  return page.route(
    `**/*/imdialog/inntektsmeldinger?foresporselUuid=${uuid}`,
    async (route) => {
      await route.fulfill({ json });
    },
  );
};

export const finnInputFraLabel = async ({
  page,
  nth = 0,
  labelText,
}: {
  page: Locator | Page;
  nth?: number;
  labelText: string;
}) => {
  const label = page.locator(`label:has-text("${labelText}")`).nth(nth);
  const inputId = await label.getAttribute("for");
  return page.locator(`#${inputId}`);
};

export const expectError = async ({
  page,
  label,
  nth = 0,
  error,
}: {
  page: Locator | Page;
  label: string;
  nth?: number;
  error: string;
}) => {
  await expect(
    page.getByText(label).nth(nth).locator("..").getByText(error),
  ).toBeVisible();
};

export const brukNoBreakSpaces = (s: string) => {
  return s.replaceAll(" ", "\u00A0");
};
