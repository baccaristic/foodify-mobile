const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

module.exports = function (api) {
  // Invalidate cache when .env file changes
  const envPath = path.resolve(__dirname, '.env');
  let cacheKey = 'babel-cache-default';

  try {
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      // Use hash for better cache invalidation
      const hash = crypto.createHash('md5').update(envContent).digest('hex').substring(0, 8);
      cacheKey = `babel-cache-${hash}`;
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
