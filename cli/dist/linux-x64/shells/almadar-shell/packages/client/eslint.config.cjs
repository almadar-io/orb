"use strict";
const tsParser = require("@typescript-eslint/parser");
const almadarPlugin = require("@almadar/eslint-plugin");
// react-hooks plugin registered so the codegen-emitted
// `// eslint-disable-next-line react-hooks/exhaustive-deps` comments are
// well-formed (eslint errors on disable directives that reference
// unknown rules). The actual rules are left off — enabling them would
// surface a backlog of dep-array warnings the codegen knows are
// intentional. Tightening is a separate codegen-fix pass.
let reactHooksPlugin;
try {
  reactHooksPlugin = require("eslint-plugin-react-hooks");
} catch (_) {
  reactHooksPlugin = { rules: { "exhaustive-deps": { meta: {}, create: () => ({}) }, "rules-of-hooks": { meta: {}, create: () => ({}) } } };
}

module.exports = [
  { ignores: ["dist/**", "node_modules/**", "**/*.test.ts", "**/*.test.tsx"] },
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    // The codegen emits `// eslint-disable-next-line react-hooks/exhaustive-deps`
    // ahead of every mount-only effect's `[]` dep array. Until the real
    // `eslint-plugin-react-hooks` is wired (it would fire the rule and
    // make these directives meaningful), the shim's no-op create() means
    // the rule never reports — so ESLint flags the directives as
    // "Unused eslint-disable directive". That's a false alarm at this
    // stage; suppress it so the strict-error rule set still hard-fails.
    linterOptions: { reportUnusedDisableDirectives: "off" },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: { almadar: almadarPlugin, "react-hooks": reactHooksPlugin },
    rules: {
      // Zero escape hatches in emitted shell code. Each rule pairs with a
      // codegen-template fix in orbital-rust (see docs/Almadar_Compiler_Gaps.md):
      // - no-as-any:           catches `as any` casts.
      // - no-unknown-type:     catches `: unknown` annotations.
      //                        Service results are typed via the integrations
      //                        contract; every other "unknown" is a typed
      //                        shape the codegen knows.
      // - no-record-string-unknown: catches `as Record<string, unknown>` casts
      //                        the codegen used to index into entity rows by
      //                        string key. The entity has a typed interface
      //                        — emit against that.
      "almadar/no-as-any": "error",
      "almadar/no-unknown-type": "error",
      "almadar/no-record-string-unknown": "error",
      "almadar/no-import-generated": "error",
    },
  },
];
