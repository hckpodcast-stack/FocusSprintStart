import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  configureNotifications,
  registerFocusNotificationResponseListener,
} from "../lib/notifications";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    configureNotifications().catch((error) => {
      console.log("Notification configuration failed", error);
    });
    const sub = registerFocusNotificationResponseListener(router);
    return () => {
      sub.remove();
    };
  }, [router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "#EFECE5",
          },
        }}
      />
    </GestureHandlerRootView>
  );
}
