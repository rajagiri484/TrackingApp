import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_LOGGED_IN_KEY = "@TrackingApp/auth_logged_in";

export async function setAuthLoggedIn(loggedIn: boolean): Promise<void> {
  if (loggedIn) {
    await AsyncStorage.setItem(AUTH_LOGGED_IN_KEY, "1");
  } else {
    await AsyncStorage.removeItem(AUTH_LOGGED_IN_KEY);
  }
}

export async function getAuthLoggedIn(): Promise<boolean> {
  const v = await AsyncStorage.getItem(AUTH_LOGGED_IN_KEY);
  return v === "1";
}
