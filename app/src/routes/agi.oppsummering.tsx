import { createFileRoute } from "@tanstack/react-router";

import { Steg4Oppsummering } from "~/features/arbeidsgiverinitiert/Steg4Oppsummering.tsx";

export const Route = createFileRoute("/agi/oppsummering")({
  component: Steg4Oppsummering,
});
