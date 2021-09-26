module.exports = {
  parser: "@babel/eslint-parser", // specifies ESLint parser
  parserOptions: {
    ecmaVersion: "2021", // allows for the parsing of modern ECMAScript features
    sourceType: "module", // allows for the use of imports
    ecmaFeatures: {
      modules: true,
    },
  },
  extends: ["airbnb-base/legacy", "plugin:prettier/recommended"],
  env: {
    node: true,
    jest: true,
  },
  rules: {
    "valid-typeof": "error",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        ts: "never",
      },
    ],
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [".storybook/**", "stories/**"],
      },
    ],
    "no-console": [2, { allow: ["warn", "error"] }],
    "no-underscore-dangle": [2, { allow: ["_id"] }],
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".ts"],
      },
    },
  },
  overrides: [
    {
      files: "**/*.ts",
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.json",
      },
      plugins: ["@typescript-eslint/eslint-plugin"],
      extends: ["airbnb-typescript/base", "plugin:prettier/recommended"],
      rules: {
        "import/no-extraneous-dependencies": [
          "error",
          {
            devDependencies: ["**/*.test.ts"],
          },
        ],
        "no-console": [2, { allow: ["warn", "error"] }],
        "no-underscore-dangle": [2, { allow: ["_id"] }],
      },
    },
  ],
};
