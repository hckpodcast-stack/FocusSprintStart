import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
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
const CARD_BG = "#FFFFFF";
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
  const countdownValue = useRef(new Animated.Value(3)).current;
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleBg = useRef(new Animated.Value(0)).current;

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
    setPhase("countdown");

    countdownValue.setValue(3);
    rippleScale.setValue(0);
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

    Animated.sequence([
      Animated.timing(countdownValue, {
        toValue: 0,
        duration: 3000,
        useNativeDriver: false,
        easing: Easing.linear,
      }),
      Animated.parallel([
        Animated.timing(rippleScale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
      ]),
    ]).start(() => {
      setPhase("running");
    });
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
      return <Text style={styles.timerText}>25:00</Text>;
    }
    const startMs = new Date(activeBlock.startedAt).getTime();
    const elapsed = now - startMs;
    if (elapsed < FOCUS_DURATION_MS) {
      const remaining = FOCUS_DURATION_MS - elapsed;
      return <Text style={styles.timerText}>{formatCountdown(remaining)}</Text>;
    }
    const over = elapsed - FOCUS_DURATION_MS;
    return <Text style={styles.timerText}>{formatOvertime(over)}</Text>;
  };

  const bgColor = rippleBg.interpolate({
    inputRange: [0, 1],
    outputRange: [CARD_BG, OVERTIME_BG],
  });

  const showCountdownOverlay = phase === "countdown";

  const countdownNumber = countdownValue.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [1, 1, 2, 3],
    extrapolate: "clamp",
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleCancel} hitSlop={16}>
            <Feather name="x" size={22} color="#3D4F5F" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {!activeBlock && (
            <TouchableOpacity
              style={styles.focusCard}
              activeOpacity={0.9}
              onPress={handleStart}
            >
              <Text style={styles.focusTitle}>Tap to focus</Text>
            </TouchableOpacity>
          )}

          {activeBlock && (
            <View style={styles.timerBlock}>
              {renderTimer()}
              <TouchableOpacity
                style={styles.doneButton}
                activeOpacity={0.9}
                onPress={handleDone}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}

          {showCountdownOverlay && (
            <View style={styles.countdownOverlay}>
              <Animated.Text style={styles.countdownText}>
                {countdownNumber as any}
              </Animated.Text>
            </View>
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EFECE5",
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
  focusCard: {
    width: "100%",
    borderRadius: 20,
    backgroundColor: CARD_BG,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  focusTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2F3C4A",
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
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 48,
    backgroundColor: "#3D4F5F",
  },
  doneButtonText: {
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
