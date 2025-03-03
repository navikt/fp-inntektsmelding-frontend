import { initializeFaro } from "@grafana/faro-react";

if (import.meta.env.PROD) {
  initializeFaro({
    url: globalThis.location.hostname.includes(".intern.dev.nav")
      ? "https://telemetry.ekstern.dev.nav.no/collect"
      : "https://telemetry.nav.no/collect",
    app: {
      name: "fpinntektsmelding-frontend",
    },
  });
}
