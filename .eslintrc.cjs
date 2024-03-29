module.exports = {
  "extends": [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings"
  ],
  "parser": "@babel/eslint-parser",
  "parserOptions": {
    "requireConfigFile": false,
    "ecmaVersion": 6,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true,
      "modules": true,
      "experimentalObjectRestSpread": true
    }
  },
  "env": {
    "es6": true,
    "browser": true,
    "node": true,
    "jquery": true,
    "jest": true,
    "worker": true
  },
  "rules": {
    "consistent-return": 2,
    "curly": 2,
    "eol-last": 2,
    "eqeqeq": [2, "always"],
    "implicit-arrow-linebreak": 2,
    "import/extensions": 2,
    "indent": [2, 2, { "SwitchCase": 1, "ignoredNodes": ["TemplateLiteral"] }],
    "jsx-quotes": 2,
    "max-len": [2, { "code": 100, "ignoreStrings": true, "ignoreTemplateLiterals": true }],
    "max-lines": [2, { "max": 300, "skipBlankLines": true, "skipComments": true }],
    "max-statements-per-line": 2,
    "no-multi-spaces": ["error"],
    "no-console": 2,
    "no-debugger": 2,
    "no-nested-ternary": 2,
    "no-return-await": 2,
    "no-trailing-spaces": 2,
    "no-var": 2,
    "object-curly-spacing": [2, "always", { "arraysInObjects": false }],
    "quotes": [2, "single", { "allowTemplateLiterals": true }],
    "semi": [2, "always"],
    "sort-keys": [2, "asc", { "caseSensitive": false, "natural": false }]
  },
  "globals": {}
};