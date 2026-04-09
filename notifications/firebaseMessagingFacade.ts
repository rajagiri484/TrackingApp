import type { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { PermissionsAndroid, Platform } from "react-native";
import type { PushInboundRemote } from "./pushTypes";

/**
 * Do not use `import … from "@react-native-firebase/*"` here — that runs native
 * bridge code at load time and crashes Expo Go (`RNFBAppModule not found`).
 */
function shouldAttemptFirebaseMessaging(): boolean {
  if (Platform.OS === "web") return false;
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return false;
  }
  return true;
}

type MessagingModule = FirebaseMessagingTypes.Module;

function loadMessagingPackage(): {
  default: () => MessagingModule;
  AuthorizationStatus: {
    AUTHORIZED: number;
    PROVISIONAL: number;
  };
} | null {
  if (!shouldAttemptFirebaseMessaging()) return null;
  try {
    return require("@react-native-firebase/messaging");
  } catch {
    return null;
  }
}

function appMessaging(): MessagingModule | null {
  const pkg = loadMessagingPackage();
  if (!pkg) return null;
  try {
    return pkg.default();
  } catch {
    return null;
  }
}

export function registerFirebaseBackgroundHandler(): void {
  if (!shouldAttemptFirebaseMessaging()) return;
  try {
    const pkg = loadMessagingPackage();
    if (!pkg) return;
    const m = pkg.default();
    m.setBackgroundMessageHandler(
      async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        if (__DEV__) {
          console.log("[FCM] background handler", remoteMessage.messageId);
        }
      },
    );
  } catch {
    /* Native module missing or bridge not ready */
  }
}

export async function ensureFirebaseMessagingPermission(): Promise<
  "granted" | "denied" | "unavailable"
> {
  const m = appMessaging();
  if (!m) return "unavailable";

  const pkg = loadMessagingPackage();
  const AuthorizationStatus = pkg?.AuthorizationStatus;
  if (!AuthorizationStatus) return "unavailable";

  if (Platform.OS === "ios") {
    const status = await m.requestPermission();
    const ok =
      status === AuthorizationStatus.AUTHORIZED ||
      status === AuthorizationStatus.PROVISIONAL;
    return ok ? "granted" : "denied";
  }

  if (Platform.OS === "android" && Platform.Version >= 33) {
    const res = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return res === PermissionsAndroid.RESULTS.GRANTED ? "granted" : "denied";
  }

  return "granted";
}

export async function getFcmDeviceToken(): Promise<string | null> {
  const m = appMessaging();
  if (!m) return null;
  try {
    const token = await m.getToken();
    return token || null;
  } catch {
    return null;
  }
}

export function subscribeForegroundRemoteMessage(
  handler: (message: FirebaseMessagingTypes.RemoteMessage) => void,
): () => void {
  const m = appMessaging();
  if (!m) return () => {};
  return m.onMessage(handler);
}

export function subscribeFcmTokenRefresh(
  handler: (token: string) => void,
): () => void {
  const m = appMessaging();
  if (!m) return () => {};
  return m.onTokenRefresh(handler);
}

export function remoteMessageToInbound(
  msg: FirebaseMessagingTypes.RemoteMessage,
): PushInboundRemote {
  const title =
    msg.notification?.title ?? (msg.data?.title as string | undefined) ?? "";
  const body =
    msg.notification?.body ?? (msg.data?.body as string | undefined) ?? "";
  return {
    messageId: msg.messageId,
    title: title || undefined,
    body: body || undefined,
    data: msg.data ? { ...msg.data } : undefined,
  };
}
