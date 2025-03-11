import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { AgiRot } from "~/features/arbeidsgiverinitiert/AgiRot.tsx";
import { YtelsetypeSchema } from "~/types/api-models.ts";

const agiSearchParams = z.object({
  ytelseType: YtelsetypeSchema,
});

export const Route = createFileRoute("/agi")({
  component: AgiRot,
  validateSearch: (search) => agiSearchParams.parse(search),
});
