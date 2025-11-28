import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import {
  cancelActiveFocusBlock,
  completeActiveFocusBlock,
} from "./focus-blocks";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function configureNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("focus-block", {
      name: "Focus Blocks",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#7DD3C0",
    });
  }

  await Notifications.setNotificationCategoryAsync("focus-block", [
    {
      identifier: "FOCUS_CANCEL",
      buttonTitle: "X",
      options: { isDestructive: true },
    },
    {
      identifier: "FOCUS_DONE",
      buttonTitle: "Done",
    },
  ]);

  await Notifications.requestPermissionsAsync();
}

export function registerFocusNotificationResponseListener(router: any) {
  return Notifications.addNotificationResponseReceivedListener(
    async (response) => {
      const { actionIdentifier, notification } = response;
      const data = notification.request.content.data || {};

      if (data.type !== "focus-block") return;

      if (actionIdentifier === "FOCUS_CANCEL") {
        await cancelActiveFocusBlock();
        router.push("/");
        return;
      }

      if (actionIdentifier === "FOCUS_DONE") {
        const block = await completeActiveFocusBlock();
        if (!block) {
          router.push("/");
          return;
        }
        router.push({
          pathname: "/block-reflect",
          params: { blockId: block.id },
        });
      }
    },
  );
}

