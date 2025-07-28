import { z } from "zod/v4";

export const SkalRefunderesSchema = z.enum([
  "JA_LIK_REFUSJON",
  "JA_VARIERENDE_REFUSJON",
  "NEI",
]);
export type SkalRefunderesType = z.infer<typeof SkalRefunderesSchema>;
