import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

export default [
  // Start with recommended TypeScript + ESLint configs
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    ignores: ["node_modules", ".next"],

    plugins: {
      "unused-imports": unusedImports,
      "simple-import-sort": simpleImportSort,
    },

    rules: {
      // Remove unused imports
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // Sort imports
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^react"], // React packages first
            ["^next"], // Next.js packages
            ["^\\u0000"], // side effect imports
            ["^@?\\w"], // packages
            ["^(@|components|utils|hooks|config)(/.*|$)"], // internal packages
            ["^\\./"], // relative imports
            ["^\\../"], // relative imports
          ],
        },
      ],
      "simple-import-sort/exports": "error",

      // TS rules (disable if unused-imports is handling it)
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-require-imports": "error",
    },
  },
];
