import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Turn off ESLint rules that conflict with Prettier.
  eslintConfigPrettier,
  {
    rules: {
      // Keep Next Image rule off: many marketing assets use <img> intentionally.
      "@next/next/no-img-element": "off",
      // Apostrophes/quotes in JSX text are fine; copy lives in i18n JSON anyway.
      "react/no-unescaped-entities": "off",
      // Too noisy for mount-time async loads / URL reads; causes unreadable refactors.
      "react-hooks/set-state-in-effect": "off",
      // Re-enabled after prettier: catch long declarations even if format was skipped.
      "max-len": [
        "error",
        {
          code: 120,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
          ignoreComments: true,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
