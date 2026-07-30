import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    name: "custom/jsx-sort-props",
    rules: {
      "react/jsx-sort-props": [
        "error",
        {
          callbacksLast: true,
          shorthandFirst: false,
          ignoreCase: true,
          noSortAlphabetically: false,
          reservedFirst: true,
        },
      ],
    },
  },
  {
    name: "custom/import-sort",
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // 1. Side-effect imports (Best practice to keep these at the absolute top)
            ["^\\u0000"],

            // 2. Frameworks: React and Next.js
            ["^react", "^next"],

            // 3. Third-party packages.
            // `^@?\\w` matches standard dependencies and scoped ones (e.g., @tanstack/react-query).
            // It naturally excludes local aliases like `@/` because `/` is not a word character.
            ["^@?\\w"],

            // 4. Project files: Internal aliases (@/)
            ["^@/"],

            // 5. Project files: Parent imports (..)
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],

            // 6. Project files: Sibling imports (.)
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],

            // 7. Catch-all for anything else
            ["^"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  },
]);

export default eslintConfig;
