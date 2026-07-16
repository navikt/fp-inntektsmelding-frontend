import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";

const IGNORED_UNICORN_RULES = {
  "unicorn/filename-case": "off",
  "unicorn/no-null": "off",
  "unicorn/prevent-abbreviations": "off",
  "unicorn/no-nested-ternary": "off",
  // name-replacements is a subset of prevent-abbreviations; msg→message renames are too noisy in Express
  "unicorn/name-replacements": "off",
  // Norwegian boolean names (erEndring) don't match English is/are/has prefix requirements
  "unicorn/consistent-boolean-name": "off",
  // Deeply nested calls are common in functional chaining (Winston format pipelines, etc.)
  "unicorn/max-nested-calls": "off",
  // Express server entry files inherently use top-level side effects (app.use, app.listen)
  "unicorn/no-top-level-side-effects": "off",
};

export default tseslint.config(
  {
    ignores: ["dist/*"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
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
      ...IGNORED_UNICORN_RULES,
    },
  },
);
