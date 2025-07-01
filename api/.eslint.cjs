module.exports = {
  env: {
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended", // Enables eslint-config-prettier and eslint-plugin-prettier
  ],
  rules: {
    "prettier/prettier": "warn", // Show formatting issues as warnings
    "@typescript-eslint/no-unused-vars": ["warn"],
  },
};
