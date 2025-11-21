const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Watch .env file for changes and reset cache when it changes
config.watchFolders = config.watchFolders || [];
config.watchFolders.push(__dirname);

// Add .env file to the list of files that Metro should watch
const envPath = path.resolve(__dirname, '.env');
config.resolver = config.resolver || {};
config.resolver.sourceExts = config.resolver.sourceExts || [];

module.exports = withNativeWind(config, { input: './global.css' });
