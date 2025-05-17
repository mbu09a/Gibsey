module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  parser: "@typescript-eslint/parser",
  parserOptions: { 
    ecmaVersion: "latest", 
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [
    "@typescript-eslint", 
    "react",
    "react-refresh"
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  settings: { 
    react: { 
      version: "detect" 
    } 
  },
  rules: {
    "react/prop-types": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // Allow explicit any for now
    '@typescript-eslint/no-explicit-any': 'off',
    // Other rules...
  },
}
