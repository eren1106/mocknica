import js from "@eslint/js";
import tseslint from "typescript-eslint";

const config = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // Only disable rules you truly need to disable
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  
  {
    ignores: ["dist/**", "node_modules/**", ".turbo/**", "build/**"],
  },
];

export default config;
