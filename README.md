# Foodify Mobile App

A React Native mobile application built with Expo for the Foodify food delivery service.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the required environment variables:
```env
BASE_API_URL=https://your-api-url.com/api
BASE_WS_URL=https://your-api-url.com/ws
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Running the App

Start the development server:
```bash
npm start
```

Run on Android:
```bash
npm run android
```

Run on iOS:
```bash
npm run ios
```

## Environment Variables

This project uses `react-native-dotenv` to manage environment variables. The following variables are required:

- `BASE_API_URL` - The base URL for the API server
- `BASE_WS_URL` - The base URL for the WebSocket server
- `GOOGLE_MAPS_API_KEY` - Google Maps API key for location services

### Important: Environment Variable Updates

When you update values in the `.env` file, the changes will be automatically detected by the development server. However, in some cases you may need to clear the cache:

```bash
npm run start:clear
# or
npm run clear-cache
```

The build configuration automatically invalidates the Babel cache when the `.env` file changes, ensuring that environment variable updates are properly reflected in your app.

### How It Works

- **Babel Cache Invalidation**: The `babel.config.js` automatically generates a new cache key based on the `.env` file content
- **Metro Bundler**: Watches the project directory including the `.env` file for changes
- **No Workarounds Needed**: You don't need to use string concatenation tricks like `BASE_API_URL + ''` anymore

## Development

### Code Formatting

Format code:
```bash
npm run format
```

Lint code:
```bash
npm run lint
```

## Project Structure

```
├── src/
│   ├── api/          # API client and services
│   ├── components/   # Reusable components
│   ├── context/      # React context providers
│   ├── hooks/        # Custom React hooks
│   ├── screens/      # Screen components
│   └── interfaces/   # TypeScript interfaces
├── assets/           # Images, fonts, and other static assets
├── .env              # Environment variables (not committed)
└── App.tsx           # Main application entry point
```

## Technologies

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **Axios** - HTTP client
- **STOMP/WebSocket** - Real-time communication
- **React Query** - Data fetching and caching
- **Zustand** - State management
- **NativeWind** - Tailwind CSS for React Native

## License

Private - All rights reserved
