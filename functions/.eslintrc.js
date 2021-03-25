module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 11,
    sourceType: "module",
  },
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "quotes": ["error", "double"],
    "max-len": [2, 120, 8],
  },
};
