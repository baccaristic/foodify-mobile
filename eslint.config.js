/* eslint-env node */
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    settings: {
      'import/core-modules': ['@env', '@fidme/react-native-wheel-of-fortune'],
    },
    rules: {
      'react/display-name': 'off',
    },
  },
]);
