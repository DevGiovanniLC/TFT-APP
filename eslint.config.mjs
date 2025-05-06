import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
    // ✅ Ignora carpetas específicas a nivel global
    {
        ignores: ["node_modules", "*/tests/**"],
    },

    // ✅ Aplica reglas solo a archivos JS/TS
    {
        files: ["**/*.{js,mjs,cjs,ts}"],
        languageOptions: {
            globals: globals.browser,
        },
    },

    // 🧩 Reglas recomendadas de ESLint y TypeScript
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
];
