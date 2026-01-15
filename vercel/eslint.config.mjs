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
  ]),
  // Disable new React 19 hooks purity rules for files with intentional patterns
  {
    files: [
      "**/components/ui/sidebar.tsx", // shadcn/ui uses Math.random() in useMemo
      "**/components/ai/ai-search.tsx", // AI components have async setState patterns
      "**/components/ai/ai-provider.tsx",
      "**/__tests__/**/*.tsx", // Test files need flexible patterns
    ],
    rules: {
      "react-hooks/globals": "off",
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
