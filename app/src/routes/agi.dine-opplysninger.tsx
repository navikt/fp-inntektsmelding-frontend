import { createFileRoute } from "@tanstack/react-router";

import { Steg2DineOpplysninger } from "~/features/arbeidsgiverinitiert/Steg2DineOpplysninger.tsx";

export const Route = createFileRoute("/agi/dine-opplysninger")({
  component: Steg2DineOpplysninger,
});
