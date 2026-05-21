"use strict";
const tsParser = require("@typescript-eslint/parser");
const almadarPlugin = require("@almadar/eslint-plugin");

module.exports = [
  { ignores: ["dist/**", "node_modules/**", "**/*.test.ts"] },
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    },
    plugins: { almadar: almadarPlugin },
    rules: {
      // Zero escape hatches in emitted shell code — same rule set as client;
      // see docs/Almadar_Compiler_Gaps.md for the per-rule codegen fix.
      "almadar/no-as-any": "error",
      "almadar/no-unknown-type": "error",
      "almadar/no-record-string-unknown": "error",
      "almadar/no-import-generated": "error",
    },
  },
];
