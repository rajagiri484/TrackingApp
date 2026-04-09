/**
 * Extends app.json with native Google Maps API keys (required for Google tiles on iOS).
 * Set GOOGLE_MAPS_API_KEY in `.env` (see `.env.example`), then run `npx expo prebuild --clean`
 * or EAS Build — Expo Go may still use Apple Maps on iOS; use a dev build to verify Google.
 */
const appJson = require("./app.json");

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

module.exports = {
  expo: {
    ...appJson.expo,
    ios: {
      ...appJson.expo.ios,
      config: {
        ...appJson.expo.ios?.config,
        ...(googleMapsApiKey
          ? { googleMapsApiKey: googleMapsApiKey }
          : {}),
      },
    },
    android: {
      ...appJson.expo.android,
      config: {
        ...appJson.expo.android?.config,
        ...(googleMapsApiKey
          ? { googleMaps: { apiKey: googleMapsApiKey } }
          : {}),
      },
    },
  },
};
