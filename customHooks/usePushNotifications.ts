import { useEffect, useState } from "react";
import {
  bootstrapPushNotifications,
  getPushSnapshot,
  subscribePush,
} from "../notifications/pushHub";
import type { PushHubSnapshot } from "../notifications/pushTypes";

export function usePushNotifications(): PushHubSnapshot {
  const [state, setState] = useState<PushHubSnapshot>(getPushSnapshot);

  useEffect(() => {
    void bootstrapPushNotifications();
    return subscribePush(setState);
  }, []);

  return state;
}
