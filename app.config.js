import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    eas: {
      projectId: "30360ea1-a3f9-4d6d-8a97-452dbfe713a6"
    }
  },
  name: "my-expo-app",
  slug: "my-expo-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  assetBundlePatterns: ["**/*"],
  web: {
    favicon: "./assets/favicon.png",
  },
  experiments: {
    tsconfigPaths: true,
  },
  plugins: [
    "expo-secure-store",
    "expo-font",
    "expo-localization"
  ],
  ios: {
    supportsTablet: true,
    config: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    },
  },
  android: {
    allowBackup: false,
    userInterfaceStyle: "light",
    softwareKeyboardLayoutMode: "pan",
    resizeMode: "contain",
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
  },
});
