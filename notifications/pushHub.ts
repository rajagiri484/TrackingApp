import { Platform } from "react-native";
import {
  ensureFirebaseMessagingPermission,
  getFcmDeviceToken,
  remoteMessageToInbound,
  subscribeFcmTokenRefresh,
  subscribeForegroundRemoteMessage,
} from "./firebaseMessagingFacade";
import type { PushHubSnapshot, PushInboundRemote, PushPermissionStatus } from "./pushTypes";

let snapshot: PushHubSnapshot = {
  architectureMode: "unavailable",
  permissionStatus: "undetermined",
  fcmToken: null,
  lastInboundRemote: null,
};

const listeners = new Set<(s: PushHubSnapshot) => void>();

function emit() {
  const s = { ...snapshot };
  listeners.forEach((fn) => fn(s));
}

function setSnapshot(patch: Partial<PushHubSnapshot>) {
  snapshot = { ...snapshot, ...patch };
  emit();
}

export function getPushSnapshot(): PushHubSnapshot {
  return { ...snapshot };
}

export function subscribePush(
  listener: (s: PushHubSnapshot) => void,
): () => void {
  listeners.add(listener);
  listener(getPushSnapshot());
  return () => listeners.delete(listener);
}

let teardownForeground: (() => void) | null = null;
let teardownToken: (() => void) | null = null;

/**
 * Registers FCM permission, token, foreground listener, and token refresh.
 * Does not call any backend to send notifications.
 */
export async function bootstrapPushNotifications(): Promise<void> {
  teardownForeground?.();
  teardownForeground = null;
  teardownToken?.();
  teardownToken = null;

  if (Platform.OS === "web") {
    setSnapshot({
      architectureMode: "web_skipped",
      permissionStatus: "unavailable",
      fcmToken: null,
    });
    return;
  }

  const perm = await ensureFirebaseMessagingPermission();
  const permissionStatus: PushPermissionStatus =
    perm === "unavailable" ? "unavailable" : perm;

  if (perm !== "granted") {
    setSnapshot({
      architectureMode: perm === "unavailable" ? "unavailable" : "firebase",
      permissionStatus,
      fcmToken: null,
    });
    return;
  }

  const token = await getFcmDeviceToken();

  teardownForeground = subscribeForegroundRemoteMessage((msg) => {
    const inbound: PushInboundRemote = remoteMessageToInbound(msg);
    setSnapshot({ lastInboundRemote: inbound });
  });

  teardownToken = subscribeFcmTokenRefresh((next) => {
    setSnapshot({ fcmToken: next });
  });

  setSnapshot({
    architectureMode: "firebase",
    permissionStatus: "granted",
    fcmToken: token,
  });

  if (__DEV__) {
    console.log(
      "[FCM] hub ready — register token with your server when you add APIs (no send from this app).",
    );
  }
}
