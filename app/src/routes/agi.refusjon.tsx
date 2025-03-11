import { createFileRoute } from "@tanstack/react-router";

import { Steg3Refusjon } from "~/features/arbeidsgiverinitiert/Steg3Refusjon.tsx";

export const Route = createFileRoute("/agi/refusjon")({
  component: Steg3Refusjon,
});
