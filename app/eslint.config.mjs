import eslint from "@eslint/js";
import eslintReact from "@eslint-react/eslint-plugin";
import lodashPlugin from "eslint-plugin-lodash";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";

const IGNORED_UNICORN_RULES = {
  "unicorn/filename-case": "off",
  "unicorn/no-null": "off",
  "unicorn/prevent-abbreviations": "off",
  "unicorn/no-nested-ternary": "off",
};

export default tseslint.config(
  {
    ignores: [
      "postcss.config.cjs",
      "src/vite-env.d.ts",
      "src/routeTree.gen.ts",
      "dist/*",
      "playwright-report/*",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintReact.configs["recommended-typescript"],
  {
    plugins: {
      lodash: lodashPlugin,
    },
    rules: {
      "lodash/import-scope": ["error", "method"],
    },
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
  eslintPluginUnicorn.configs["flat/recommended"],
  eslintPluginPrettierRecommended,
  {
    rules: {
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "no-console": "error",
      ...IGNORED_UNICORN_RULES,
    },
  },
);
