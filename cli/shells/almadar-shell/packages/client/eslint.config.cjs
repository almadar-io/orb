"use strict";
const tsParser = require("@typescript-eslint/parser");
const almadarPlugin = require("@almadar/eslint-plugin");

module.exports = [
  { ignores: ["dist/**", "node_modules/**", "**/*.test.ts", "**/*.test.tsx"] },
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: { almadar: almadarPlugin },
    rules: {
      "almadar/no-as-any": "error",
      "almadar/no-import-generated": "error",
    },
  },
];
