import type { KnipConfig } from "knip";

// Avhengigheter som ikke brukes overalt per nå. Men som vi ønsker ha tilgjengelig.
const avhengigheterViVilHaUansett = [];

// Usikker på om de med storybook trengs. jsdom og coverage refereres av vitest.
const avhengigheterRelatertTilTest = [];

const avhenegigheterKnipIkkeForstårBrukes = [];

const config: KnipConfig = {
  ignore: [
    "src/routeTree.gen.ts",
    "src/features/react-hook-form-wrappers/DateRangePickerWrapped.tsx",
  ],
  ignoreBinaries: [],
  ignoreDependencies: ["@navikt/ds-css"],
};

export default config;
