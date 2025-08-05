import type { KnipConfig } from "knip";

const config: KnipConfig = {
  ignore: [
    "src/routeTree.gen.ts",
    "src/features/react-hook-form-wrappers/DateRangePickerWrapped.tsx",
    "src/types/api-models.ts",
  ],
  ignoreBinaries: [],
  ignoreDependencies: ["@navikt/ds-css"],
};

export default config;
