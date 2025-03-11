import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { AgiRoot } from "~/features/arbeidsgiverinitiert/AgiRoot.tsx";
import { YtelsetypeSchema } from "~/types/api-models.ts";

const agiSearchParams = z.object({
  ytelseType: YtelsetypeSchema,
});

export const Route = createFileRoute("/agi")({
  component: AgiRoot,
  validateSearch: (search) => agiSearchParams.parse(search),
});
