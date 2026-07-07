import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import tseslint from "typescript-eslint"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // ============================================================
  // TypeScript strict + stylistic rules (only for TS files)
  // ============================================================
  ...tseslint.config({
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
    extends: [
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      // ============================================================
      // Relaxed type-checked rules (too noisy for dynamic API code)
      // ============================================================
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",

      // ============================================================
      // Relaxed rules that conflict with React/Next patterns
      // ============================================================
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true, allowBoolean: true },
      ],
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/use-unknown-in-catch-callback-variable": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",
      "@typescript-eslint/no-deprecated": "warn",
      "@typescript-eslint/no-redundant-type-constituents": "warn",
      "@typescript-eslint/no-unnecessary-boolean-literal-compare": "warn",

      // ============================================================
      // Project conventions (enforced strictly)
      // ============================================================
      "@typescript-eslint/consistent-type-definitions": ["warn", "type"],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/return-await": ["error", "in-try-catch"],
    },
  }),

  // ============================================================
  // Global rules (applied to all files)
  // ============================================================
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-duplicate-imports": "error",
      "object-shorthand": "error",
      "prefer-const": "error",
      "react-hooks/exhaustive-deps": "error",
      "react/jsx-no-useless-fragment": "warn",
    },
  },

  // ============================================================
  // Ignores
  // ============================================================
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "prisma/migrations/**",
    "lib/generated/**",
    "node_modules/**",
    "integracao-totvs/**",
  ]),
])

export default eslintConfig
