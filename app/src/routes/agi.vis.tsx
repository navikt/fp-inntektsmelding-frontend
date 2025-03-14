import { createFileRoute } from "@tanstack/react-router";

import { VisAgiInntektsmelding } from "~/features/arbeidsgiverinitiert/VisAgiInntektsmelding.tsx";

export const Route = createFileRoute("/agi/vis")({
  component: VisAgiInntektsmelding,
});
