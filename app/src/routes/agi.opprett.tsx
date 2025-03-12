import { createFileRoute } from "@tanstack/react-router";

import { Steg1HentOpplysninger } from "~/features/arbeidsgiverinitiert/Steg1HentOpplysninger.tsx";

export const Route = createFileRoute("/agi/opprett")({
  component: Steg1HentOpplysninger,
});
