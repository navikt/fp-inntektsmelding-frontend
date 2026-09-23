import { expect, Page, test } from "@playwright/test";
import {
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

    // TODO: Avklar hvordan det skal vises at inntektsmeldingen venter på kontroll mot A-inntekt.
    // I dag vises vanlig kvittering.
    await expect(
      page.getByText("Vi har mottatt inntektsmeldingen"),
    ).toBeVisible();
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
  });
});
