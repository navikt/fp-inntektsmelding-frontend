//Bruk kun navn fra taksonomien. Med utgangspunkt i https://github.com/navikt/analytics-taxonomy
import { isDev } from "~/utils.ts";

type EventNamesTaksonomi =
  "readmore lukket" | "readmore åpnet" | "switch åpnet" | "switch lukket";

export const loggUmamiEvent = async ({
  eventName,
  eventData,
}: {
  eventName: EventNamesTaksonomi;
  eventData?: Record<string, string>;
}) => {
  if (!isDev) {
    try {
      // eslint-disable-next-line unicorn/prefer-global-this, unicorn/no-optional-chaining-on-undeclared-variable -- klarer ikke få TS til å bli riktig for globalThis
      window.dekoratorenAnalytics?.({
        origin: "fp-inntektsmelding-frontend",
        eventName,
        eventData,
      });
    } catch {
      /* Vi bryr oss ikke om logging feiler. Oftest hvis bruker rejecter cookies */
    }
  }
};
