import { expect, test } from "@playwright/test";
import { expectError, mockHentPersonOgArbeidsforhold } from "tests/mocks/utils";

import { enkeltOpplysningerResponse } from "../mocks/opplysninger.ts";
import { sendAgiInntektsmeldingResponse } from "../mocks/send-inntektsmelding.ts";

const FAKE_FNR = "09810198874";

test("Valgt: Ny ansatt", async ({ page }) => {
  await mockHentPersonOgArbeidsforhold({ page });

  await page.goto("/fp-im-dialog/agi?ytelseType=FORELDREPENGER");

  await expect(page.getByText("Steg 1 av 4")).toBeVisible();
  await page.locator('input[name="agiÅrsak"][value="NYANSATT"]').click();
  await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR.slice(2));
  await page.getByRole("button", { name: "Hent opplysninger" }).click();

  await expectError({
    page,
    error: "Du må fylle ut et gyldig fødselsnummer",
    label: "Ansattes fødselsnummer",
  });
  await expectError({
    page,
    label: "Første fraværsdag",
    error: "Må oppgis",
  });

  await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
  await page.getByLabel("Første fraværsdag").fill("01.4.2024");
  await page.getByRole("button", { name: "Hent opplysninger" }).click();

  await page.route(`**/*/arbeidsgiverinitiert/opplysninger`, async (route) => {
    await route.fulfill({ json: enkeltOpplysningerResponse });
  });

  await page.getByLabel("Arbeidsgiver").selectOption("974652293");

  await page.getByRole("button", { name: "Opprett inntektsmelding" }).click();

  await expect(page.getByText("Steg 2 av 4")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Dine opplysninger" }),
  ).toBeVisible();
  await page.getByLabel("Telefon").fill("13371337");
  await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

  await expect(page.getByText("Steg 3 av 4")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Refusjon", exact: true }),
  ).toBeVisible();
  await page
    .locator('input[name="skalRefunderes"][value="JA_LIK_REFUSJON"]')
    .click();
  await page.getByRole("button", { name: "Neste steg" }).click();
  await expectError({
    page,
    label: "Refusjonsbeløp per måned",
    error: "Beløpet må være 1 eller høyere",
  });
  await page.getByText("Refusjonsbeløp per måned").fill("20000");
  await page.getByRole("button", { name: "Neste steg" }).click();

  await expect(page.getByText("Steg 4 av 4")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Oppsummering", exact: true }),
  ).toBeVisible();
  // TODO: test at oppsummeringsside ser rett ut
  await page.route(`**/*/imdialog/send-inntektsmelding`, async (route) => {
    await route.fulfill({ json: sendAgiInntektsmeldingResponse });
  });

  await page.getByRole("button", { name: "Send inn" }).click();
  await expect(
    page.getByText("Inntektsmelding for Underfundig Dyreflokk er sendt"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Last ned inntektsmeldingen" }),
  ).toBeVisible();
});

test("Valgt: Unntatt registrering i Aa-registeret. Skal vise info alert", async ({
  page,
}) => {
  await mockHentPersonOgArbeidsforhold({ page });

  await page.goto("/fp-im-dialog/agi?ytelseType=FORELDREPENGER");
  await page
    .locator('input[name="agiÅrsak"][value="UNNTATT_AAREGISTER"]')
    .click();
  await expect(
    page.getByTestId("unntatt-aareg-registrering-alert"),
  ).toBeVisible();
});

test("Valgt: Annen årsak", async ({ page }) => {
  await mockHentPersonOgArbeidsforhold({ page });

  await page.goto("/fp-im-dialog/agi?ytelseType=FORELDREPENGER");
  await page.locator('input[name="agiÅrsak"][value="ANNEN_ÅRSAK"]').click();
  await expect(
    page.getByTestId("im-kan-ikke-opprettes-for-andre-årsaker-alert"),
  ).toBeVisible();
});

test("Verifiser fremgangsindikator", async ({ page }) => {
  await mockHentPersonOgArbeidsforhold({ page });

  await page.goto("/fp-im-dialog/agi?ytelseType=FORELDREPENGER");

  await page.getByRole("button", { name: "Vis alle steg" }).click();
  const formprogress = await page.locator(".navds-stepper");
  // Verfiser at den ikke er interaktiv
  await expect(formprogress.locator("a")).toHaveCount(0);
  await expect(formprogress).toContainText("Opprett");
  await expect(formprogress).toContainText("Dine opplysninger");
  await expect(formprogress).toContainText("Refusjon");
  await expect(formprogress).toContainText("Oppsummering");
});

test("Sjekk at man kan gå frem og tilbake mellom alle steg", async ({
  page,
}) => {
  await mockHentPersonOgArbeidsforhold({ page });

  await page.goto("/fp-im-dialog/agi?ytelseType=FORELDREPENGER");

  await page.locator('input[name="agiÅrsak"][value="NYANSATT"]').click();
  await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
  await page.getByLabel("Første fraværsdag").fill("01.4.2024");
  await page.getByRole("button", { name: "Hent opplysninger" }).click();
  await page.route(`**/*/arbeidsgiverinitiert/opplysninger`, async (route) => {
    await route.fulfill({ json: enkeltOpplysningerResponse });
  });
  await page.getByLabel("Arbeidsgiver").selectOption("974652293");
  await page.getByRole("button", { name: "Opprett inntektsmelding" }).click();

  await page.getByLabel("Telefon").fill("13371337");
  await page.getByRole("button", { name: "Bekreft og gå videre" }).click();
  await page
    .locator('input[name="skalRefunderes"][value="JA_LIK_REFUSJON"]')
    .click();
  await page.getByText("Refusjonsbeløp per måned").fill("20000");
  await page.getByRole("button", { name: "Neste steg" }).click();
  await expect(
    page.getByRole("heading", { name: "Oppsummering", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Forrige steg" }).click();
  await expect(
    page.locator('input[name="skalRefunderes"][value="JA_LIK_REFUSJON"]'),
  ).toBeChecked();
  await page.getByRole("button", { name: "Forrige steg" }).click();
  await expect(page.getByLabel("Navn")).toHaveValue("Berømt Flyttelass");
  await expect(page.getByText("Steg 2 av 4")).toBeVisible();
});

test("Skal ikke kunne velge NEI på refusjon hvis AGI og nyansatt", async ({
  page,
}) => {
  await mockHentPersonOgArbeidsforhold({ page });

  await page.goto("/fp-im-dialog/agi?ytelseType=FORELDREPENGER");

  await page.locator('input[name="agiÅrsak"][value="NYANSATT"]').click();
  await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
  await page.getByLabel("Første fraværsdag").fill("01.4.2024");
  await page.getByRole("button", { name: "Hent opplysninger" }).click();

  await page.route(`**/*/arbeidsgiverinitiert/opplysninger`, async (route) => {
    await route.fulfill({ json: enkeltOpplysningerResponse });
  });

  await page.getByLabel("Arbeidsgiver").selectOption("974652293");

  await page.getByRole("button", { name: "Opprett inntektsmelding" }).click();
  await page.getByLabel("Telefon").fill("13371337");
  await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

  await page
    .locator('input[name="skalRefunderes"][value="JA_LIK_REFUSJON"]')
    .click();
  await expect(
    page.getByText("Inntektsmelding kan ikke sendes inn"),
  ).toBeVisible({ visible: false });
  await page.locator('input[name="skalRefunderes"][value="NEI"]').focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("Enter");

  await expect(page.getByRole("button", { name: "Neste steg" })).toBeDisabled();
});

test("Kun kvinner kan søke SVP", async ({ page }) => {
  await mockHentPersonOgArbeidsforhold({ page });

  await page.goto("/fp-im-dialog/agi?ytelseType=SVANGERSKAPSPENGER");

  await page.locator('input[name="agiÅrsak"][value="NYANSATT"]').click();
  await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
  await page.getByLabel("Første fraværsdag").fill("01.8.2024");
  await page.getByRole("button", { name: "Hent opplysninger" }).click();

  await expect(
    page.getByRole("heading", {
      name: "Bare kvinner kan søke svangerskapspenger",
    }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Klikk her" }).click();
  await page.getByRole("button", { name: "Hent opplysninger" }).click();
  await page.getByLabel("Arbeidsgiver").selectOption("974652293");
});

test("Påse at skjema tilstand nullstilles dersom man endrer person", async ({
  page,
}) => {
  await mockHentPersonOgArbeidsforhold({ page });

  await page.goto("/fp-im-dialog/agi?ytelseType=FORELDREPENGER");

  // Fyll inn litt skjemadata
  await page.locator('input[name="agiÅrsak"][value="NYANSATT"]').click();
  await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
  await page.getByLabel("Første fraværsdag").fill("01.4.2024");
  await page.getByRole("button", { name: "Hent opplysninger" }).click();

  await page.route(`**/*/arbeidsgiverinitiert/opplysninger`, async (route) => {
    await route.fulfill({ json: enkeltOpplysningerResponse });
  });
  await page.getByLabel("Arbeidsgiver").selectOption("974652293");
  await page.getByRole("button", { name: "Opprett inntektsmelding" }).click();
  await page.getByLabel("Telefon").fill("13371337");
  await page.getByRole("button", { name: "Bekreft og gå videre" }).click();
  await page
    .locator('input[name="skalRefunderes"][value="JA_LIK_REFUSJON"]')
    .click();
  await page.getByText("Refusjonsbeløp per måned").fill("20000");
  await page.getByRole("button", { name: "Neste steg" }).click();

  // Gå manuelt tilbake til start (ikke mulig i løsningen)
  await page.goto("/fp-im-dialog/agi/opprett?ytelseType=FORELDREPENGER");

  await page.locator('input[name="agiÅrsak"][value="NYANSATT"]').click();
  await page.getByLabel("Ansattes fødselsnummer").fill(FAKE_FNR);
  await page.getByLabel("Første fraværsdag").fill("01.4.2024");
  await page.getByRole("button", { name: "Hent opplysninger" }).click();
  await page.getByLabel("Arbeidsgiver").selectOption("974652293");
  await page.getByRole("button", { name: "Opprett inntektsmelding" }).click();
  await page.getByRole("button", { name: "Bekreft og gå videre" }).click();
  await page.getByRole("button", { name: "Neste steg" }).click();

  // Felt skal ha blitt tomt
  await expectError({
    page,
    error: "Du må svare på dette spørsmålet",
    label: "Betaler dere lønn under fraværet og krever refusjon?",
  });
});
