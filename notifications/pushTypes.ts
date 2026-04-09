/** FCM path vs environments where native modules are absent. */
export type PushArchitectureMode = "firebase" | "unavailable" | "web_skipped";

export type PushPermissionStatus =
  | "undetermined"
  | "granted"
  | "denied"
  | "unavailable";

export type PushInboundRemote = {
  messageId?: string;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
};

export type PushHubSnapshot = {
  architectureMode: PushArchitectureMode;
  permissionStatus: PushPermissionStatus;
  fcmToken: string | null;
  lastInboundRemote: PushInboundRemote | null;
};
