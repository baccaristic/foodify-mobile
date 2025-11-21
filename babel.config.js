const fs = require('fs');
const path = require('path');

module.exports = function (api) {
  // Invalidate cache when .env file changes
  const envPath = path.resolve(__dirname, '.env');
  let cacheKey = 'babel-cache';

  try {
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      cacheKey = `babel-cache-${Buffer.from(envContent).toString('base64').substring(0, 32)}`;
    }
  } catch (error) {
    console.warn('Warning: Could not read .env file for cache invalidation');
  }

  api.cache.using(() => cacheKey);

  let plugins = [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        safe: true,
        allowUndefined: false,
      },
    ],
  ];

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],

    plugins,
  };
};
