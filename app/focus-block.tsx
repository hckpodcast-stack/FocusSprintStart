import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  AppState,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActiveFocusBlock,
  getActiveFocusBlock,
  setActiveFocusBlock,
  completeActiveFocusBlock,
  cancelActiveFocusBlock,
} from "../lib/focus-blocks";

const FOCUS_DURATION_MS = 25 * 60 * 1000;
const CARD_BG = "#EFECE5";
const OVERTIME_BG = "#7DD3C0";

function formatCountdown(msRemaining: number): string {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function formatOvertime(msOver: number): string {
  const totalSeconds = Math.max(0, Math.floor(msOver / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `+${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export default function FocusBlock() {
  const router = useRouter();
  const [activeBlock, setActiveBlock] = useState<ActiveFocusBlock | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [hasVibratedAtZero, setHasVibratedAtZero] = useState(false);
  const [phase, setPhase] = useState<"idle" | "countdown" | "running">("idle");
  const rippleBg = useRef(new Animated.Value(0)).current;
  const appState = useRef(AppState.currentState);
  const startScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let mounted = true;
    getActiveFocusBlock()
      .then((stored) => {
        if (!mounted) return;
        if (stored) {
          setActiveBlock(stored);
          setPhase("running");
        }
      })
      .catch((error) => {
        console.log("Failed to load active focus block", error);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (activeBlock) {
      interval = setInterval(() => {
        setNow(Date.now());
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeBlock]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const prevState = appState.current;
      appState.current = nextState;

      if (prevState === "active" && nextState === "background") {
        if (activeBlock) {
          cancelActiveFocusBlock()
            .catch((error) =>
              console.log("Failed to cancel focus block on background", error),
            )
            .finally(() => {
              setActiveBlock(null);
              setPhase("idle");
              setNow(Date.now());
              setHasVibratedAtZero(false);
            });
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [activeBlock, cancelActiveFocusBlock]);

  useEffect(() => {
    if (!activeBlock) return;
    const startMs = new Date(activeBlock.startedAt).getTime();
    const elapsed = now - startMs;
    if (elapsed >= FOCUS_DURATION_MS && !hasVibratedAtZero) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setHasVibratedAtZero(true);
      Animated.timing(rippleBg, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }
  }, [activeBlock, now, hasVibratedAtZero, rippleBg]);

  const handleStart = async () => {
    const block: ActiveFocusBlock = {
      id: `${Date.now()}`,
      startedAt: new Date().toISOString(),
    };
    await setActiveFocusBlock(block);
    setActiveBlock(block);
    setPhase("running");

    rippleBg.setValue(0);

    // Immediate "block running" notification with actions
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Focus block running",
        body: "Tap Done when you're finished, or X to cancel.",
        categoryIdentifier: "focus-block",
        data: { type: "focus-block" },
      },
      trigger: null,
    });

    // Scheduled "block finished" notification at 25 minutes
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Focus block complete",
        body: "Your 25-minute block has finished.",
        categoryIdentifier: "focus-block",
        data: { type: "focus-block", kind: "finished" },
      },
      trigger: { seconds: FOCUS_DURATION_MS / 1000 },
    });

    // Brief visual feedback: timer scale pulse
    startScale.setValue(1);
    Animated.sequence([
      Animated.timing(startScale, {
        toValue: 1.08,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(startScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.in(Easing.quad),
      }),
    ]).start();
  };

  const handleDone = async () => {
    const block = await completeActiveFocusBlock();
    if (!block) {
      router.back();
      return;
    }
    setActiveBlock(null);
    setPhase("idle");
    router.push({ pathname: "/block-reflect", params: { blockId: block.id } });
  };

  const handleCancel = async () => {
    await cancelActiveFocusBlock();
    setActiveBlock(null);
    setPhase("idle");
    router.back();
  };

  const renderTimer = () => {
    if (!activeBlock) {
      return (
        <Animated.Text
          style={[styles.timerText, { transform: [{ scale: startScale }] }]}
        >
          25:00
        </Animated.Text>
      );
    }
    const startMs = new Date(activeBlock.startedAt).getTime();
    const elapsed = now - startMs;
    if (elapsed < FOCUS_DURATION_MS) {
      const remaining = FOCUS_DURATION_MS - elapsed;
      return (
        <Animated.Text
          style={[styles.timerText, { transform: [{ scale: startScale }] }]}
        >
          {formatCountdown(remaining)}
        </Animated.Text>
      );
    }
    const over = elapsed - FOCUS_DURATION_MS;
    return (
      <Animated.Text
        style={[styles.timerText, { transform: [{ scale: startScale }] }]}
      >
        {formatOvertime(over)}
      </Animated.Text>
    );
  };

  const bgColor = rippleBg.interpolate({
    inputRange: [0, 1],
    outputRange: [CARD_BG, OVERTIME_BG],
  });

  return (
    <Animated.View style={[styles.screen, { backgroundColor: bgColor }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleCancel} hitSlop={16}>
              <Feather name="x" size={22} color="#3D4F5F" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {!activeBlock && (
              <View style={styles.timerBlock}>
                <Text style={styles.timerText}>25:00</Text>
                <TouchableOpacity
                  style={styles.primaryButton}
                  activeOpacity={0.9}
                  onPress={handleStart}
                >
                  <Text style={styles.primaryButtonText}>Start</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeBlock && (
              <View style={styles.timerBlock}>
                {renderTimer()}
                <TouchableOpacity
                  style={styles.primaryButton}
                  activeOpacity={0.9}
                  onPress={handleDone}
                >
                  <Text style={styles.primaryButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  timerBlock: {
    alignItems: "center",
    justifyContent: "center",
  },
  timerText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#2F3C4A",
    marginBottom: 24,
  },
  doneButton: {
    display: "none",
  },
  doneButtonText: {
    display: "none",
  },
  primaryButton: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 48,
    backgroundColor: "#3D4F5F",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  countdownOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  countdownText: {
    fontSize: 64,
    fontWeight: "700",
    color: "#111827",
  },
});
