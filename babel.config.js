/**
 * Expo uses babel-preset-expo for transforms. Keep this file so native/metro
 * builds stay aligned with the Expo SDK version pinned in package.json.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
