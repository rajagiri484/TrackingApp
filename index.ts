import { registerFirebaseBackgroundHandler } from "./notifications/firebaseMessagingFacade";

import { registerRootComponent } from "expo";

import App from "./App";

function scheduleAfterStartup(task: () => void): void {
  const ric = globalThis.requestIdleCallback;
  if (typeof ric === "function") {
    ric(task, { timeout: 2000 });
  } else {
    setTimeout(task, 0);
  }
}

scheduleAfterStartup(() => {
  registerFirebaseBackgroundHandler();
});

registerRootComponent(App);
