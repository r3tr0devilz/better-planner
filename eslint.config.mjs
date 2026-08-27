import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "supabase/.temp/**",
    "supabase/.branches/**",
    // Agent/skill tooling, not app source — noisy and irrelevant to lint here.
    ".agents/**",
    ".claude/**",
    ".codex/**",
    ".impeccable/**",
    ".lavish/**",
  ]),
]);

export default eslintConfig;
