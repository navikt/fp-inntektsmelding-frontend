import { expect, test } from "@playwright/test";
import { utgåttOpplysningerResponse } from "tests/mocks/opplysninger.ts";
import {
  mockGrunnbeløp,
  mockInntektsmeldinger,
  mockOpplysninger,
} from "tests/mocks/utils";

test("utgått oppgave skal vise egen side og hindre innsending av IM", async ({
  page,
}) => {
  await mockOpplysninger({ page, json: utgåttOpplysningerResponse });
  await mockGrunnbeløp({ page });
  await mockInntektsmeldinger({
    page,
  });

  await page.goto("/fp-im-dialog/1");

  await expect(
    page.getByRole("heading", { name: "Oppgaven er utgått" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Gå til Min side - arbeidsgiver" }),
  ).toBeVisible();

  // Forsøk gå til en annen underside, og forvent samme resultat
  await page.goto("/fp-im-dialog/1/dine-opplysninger");

  await expect(
    page.getByRole("heading", { name: "Oppgaven er utgått" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Gå til Min side - arbeidsgiver" }),
  ).toBeVisible();
});
