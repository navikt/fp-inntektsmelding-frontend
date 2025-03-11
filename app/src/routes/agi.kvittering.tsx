import { createFileRoute } from "@tanstack/react-router";

import { Steg5Kvittering } from "~/features/arbeidsgiverinitiert/Steg5Kvittering.tsx";

export const Route = createFileRoute("/agi/kvittering")({
  component: Steg5Kvittering,
});
