import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import {
  cancelActiveFocusBlock,
  completeActiveFocusBlock,
} from "./focus-blocks";

const FOCUS_BLOCK_CHANNEL_ID = "focus-block";
const GOAL_REMINDER_CHANNEL_ID = "goal-reminders";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function configureNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(FOCUS_BLOCK_CHANNEL_ID, {
      name: "Focus Blocks",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500],
      lightColor: "#7DD3C0",
    });

    await Notifications.setNotificationChannelAsync(GOAL_REMINDER_CHANNEL_ID, {
      name: "Goal Reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 300],
      lightColor: "#60A5FA",
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

export async function scheduleGoalReminderNotification(options: {
  goalId: string;
  reminderId: string;
  title: string;
  body: string;
  date: Date;
}): Promise<string> {
  // Use the modern "date" trigger shape instead of passing a bare Date,
  // which is deprecated in newer Expo SDKs.
  const trigger: Notifications.NotificationTriggerInput = {
    type: "date",
    date: options.date,
  } as any;

  const content: Notifications.NotificationContentInput = {
    title: options.title,
    body: options.body,
    data: {
      type: "goal-reminder",
      goalId: options.goalId,
      reminderId: options.reminderId,
    },
    sound: "default",
  };

  const request: Notifications.NotificationRequestInput = {
    content,
    trigger,
  };

  if (Platform.OS === "android") {
    request.content = {
      ...content,
      android: { channelId: GOAL_REMINDER_CHANNEL_ID },
    } as any;
  }

  const id = await Notifications.scheduleNotificationAsync(request as any);
  return id;
}

export async function cancelGoalReminderNotifications(
  notificationIds: string[],
): Promise<void> {
  await Promise.all(
    notificationIds.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => {}),
    ),
  );
}
