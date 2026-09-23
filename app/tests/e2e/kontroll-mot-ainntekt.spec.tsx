import { expect, Page, test } from "@playwright/test";
import {
  avvistInntektsmeldingResponse,
  inntektAvvikerFraAInntektFeilResponse,
  sendInntektsmeldingVenterVurderingResponse,
} from "tests/mocks/send-inntektsmelding";
import {
  mockGrunnbeløp,
  mockInntektsmeldinger,
  mockOpplysninger,
} from "tests/mocks/utils";

// Scenarioene speiler backend-responsene fra fp-inntektsmelding (TFP-6988), der inntekten
// kontrolleres mot A-inntekt ved innsending fra dialogen.

const fyllUtOgGåTilOppsummering = async (page: Page) => {
  await mockOpplysninger({ page });
  await mockGrunnbeløp({ page });
  await mockInntektsmeldinger({ page });

  await page.goto("/fp-im-dialog/1/dine-opplysninger");

  await page.getByLabel("Navn").fill("Test Brukersen");
  await page.getByLabel("Telefon").fill("13371337");
  await page.getByRole("button", { name: "Bekreft og gå videre" }).click();

  await page.locator('input[name="skalRefunderes"][value="NEI"]').click();
  await page.locator('input[name="misterNaturalytelser"][value="nei"]').click();
  await page.getByRole("button", { name: "Neste steg" }).click();

  await expect(
    page.getByRole("heading", { name: "Oppsummering" }),
  ).toBeVisible();
};

test.describe("Kontroll av inntekt mot A-inntekt", () => {
  test("Nedetid i A-inntekt gir status VENTER_VURDERING", async ({ page }) => {
    await fyllUtOgGåTilOppsummering(page);

    await page.route(`**/*/imdialog/send-inntektsmelding`, async (route) => {
      await route.fulfill({ json: sendInntektsmeldingVenterVurderingResponse });
    });
    const request = page.waitForRequest("**/*/imdialog/send-inntektsmelding");
    await page.getByRole("button", { name: "Send inn" }).click();
    await request;

    await expect(
      page.getByRole("heading", {
        name: "Inntektsmelding for Underfundig Dyreflokk er mottatt",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Inntekten er ikke kontrollert ennå" }),
    ).toBeVisible();
    await expect(
      page.getByText("Saken til den ansatte ligger nå til behandling hos oss"),
    ).not.toBeVisible();
  });

  test("Innsendt inntektsmelding som venter på kontroll viser informasjon om det", async ({
    page,
  }) => {
    await mockOpplysninger({ page });
    await mockGrunnbeløp({ page });
    await mockInntektsmeldinger({
      page,
      json: [sendInntektsmeldingVenterVurderingResponse],
    });

    await page.goto("/fp-im-dialog/1");

    await expect(
      page.getByRole("heading", { name: "Innsendt inntektsmelding" }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Inntekten i denne inntektsmeldingen er ikke kontrollert mot A-ordningen ennå",
      ),
    ).toBeVisible();
  });

  test("Avvist inntektsmelding regnes ikke som innsendt", async ({ page }) => {
    await mockOpplysninger({ page });
    await mockGrunnbeløp({ page });
    await mockInntektsmeldinger({
      page,
      json: [avvistInntektsmeldingResponse],
    });

    await page.goto("/fp-im-dialog/1");

    await expect(page).toHaveURL(/\/dine-opplysninger$/);
    await expect(
      page.getByRole("heading", { name: "Innsendt inntektsmelding" }),
    ).not.toBeVisible();
  });

  test("Inntekt som avviker fra A-inntekt uten endringsårsak avvises", async ({
    page,
  }) => {
    await fyllUtOgGåTilOppsummering(page);

    await page.route(`**/*/imdialog/send-inntektsmelding`, async (route) => {
      await route.fulfill({
        status: 400,
        json: inntektAvvikerFraAInntektFeilResponse,
      });
    });
    const request = page.waitForRequest("**/*/imdialog/send-inntektsmelding");
    await page.getByRole("button", { name: "Send inn" }).click();
    await request;

    await expect(
      page.getByRole("heading", { name: "Oppsummering" }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Månedslønnen du har oppgitt er ulik gjennomsnittet av inntekten som er rapportert til A-ordningen",
      ),
    ).toBeVisible();
    await expect(page.getByText("Noe gikk galt.")).not.toBeVisible();

    // Brukeren skal ikke kunne sende inn på nytt eller gå tilbake, kun starte på nytt
    await expect(page.getByRole("button", { name: "Send inn" })).toBeHidden();
    await expect(page.getByRole("link", { name: "Forrige steg" })).toBeHidden();

    await page.getByRole("button", { name: "Start på nytt" }).click();

    await expect(page).toHaveURL(/\/dine-opplysninger$/);
    await expect(page.getByLabel("Telefon")).toHaveValue("");
  });
});
