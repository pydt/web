// @ts-check
// ESLint flat config (angular-eslint 22 no longer reads .eslintrc.json).
// Same rules as the old .eslintrc.json; the three "node/..." rules it turned off are gone because
// that plugin was never loaded and flat config rejects rules from unloaded plugins.
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const prettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = tseslint.config(
  {
    ignores: ["src/ng2-table/**/*", "src/polyfills.ts", "src/main*.ts"],
  },
  {
    // The old config didn't report stale eslint-disable comments; keep it that way
    linterOptions: { reportUnusedDisableDirectives: "off" },
  },
  {
    files: ["**/*.ts"],
    extends: [...tseslint.configs.recommendedTypeChecked, ...angular.configs.tsRecommended, prettierRecommended],
    processor: angular.processInlineTemplates,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "class-methods-use-this": ["off"],
      "comma-dangle": ["error", "always-multiline"],
      "func-style": ["error", "expression"],
      "lines-around-comment": ["off"],
      semi: ["error", "always"],
      "new-cap": ["off"],
      "no-invalid-this": ["off"],
      "no-new": ["off"],
      "no-useless-constructor": ["off"],
      "@angular-eslint/component-selector": ["error", { prefix: "pydt", style: "kebab-case", type: "element" }],
      "@angular-eslint/directive-selector": ["error", { prefix: "pydt", style: "camelCase", type: "attribute" }],
      "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
      "@angular-eslint/prefer-standalone": ["off"],
      "@angular-eslint/prefer-inject": ["off"],
      // New in angular-eslint 22. The Angular 22 migration pinned every component to
      // ChangeDetectionStrategy.Eager to keep today's behavior; moving to OnPush is its own project.
      "@angular-eslint/prefer-on-push-component-change-detection": ["off"],
    },
  },
  {
    // Specs need the Jasmine types, which only src/tsconfig.spec.json includes
    files: ["**/*.spec.ts"],
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: ["src/tsconfig.spec.json"],
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    files: ["**/*.html"],
    extends: [...angular.configs.templateRecommended],
    rules: {},
  },
  {
    files: ["**/*.html"],
    ignores: ["**/*inline-template-*.component.html"],
    extends: [prettierRecommended],
    rules: {
      "prettier/prettier": ["error", { parser: "angular" }],
    },
  },
);
