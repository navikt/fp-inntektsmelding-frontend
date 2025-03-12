import { z } from "zod";

export const SkalRefunderesSchema = z.enum([
  "JA_LIK_REFUSJON",
  "JA_VARIERENDE_REFUSJON",
  "NEI",
]);
