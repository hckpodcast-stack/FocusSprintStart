import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Goal,
  GoalCompletionStatus,
  updateGoal,
  loadGoals,
} from "../lib/goals-storage";
import { cancelGoalReminderNotifications } from "../lib/notifications";

type ConfettiPiece = {
  left: number;
  delay: number;
  color: string;
};

export default function CheckIn() {
  const router = useRouter();
  const { goalId } = useLocalSearchParams<{ goalId?: string }>();
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const [goal, setGoal] = useState<Goal | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!goalId) return;
    loadGoals()
      .then((goals) => {
        if (!isMounted) return;
        const found = goals.find((g) => g.id === goalId) ?? null;
        setGoal(found);
      })
      .catch((error) => {
        console.log("Failed to load goal for check-in", error);
      });
    return () => {
      isMounted = false;
    };
  }, [goalId]);

  const confettiPieces: ConfettiPiece[] = useMemo(
    () =>
      new Array(24).fill(null).map((_, index) => ({
        left: Math.random() * 100,
        delay: index * 15,
        color: index % 3 === 0 ? "#7DD3C0" : index % 3 === 1 ? "#FDE68A" : "#FCA5A5",
      })),
    [],
  );

  const updateCompletionStatus = async (status: GoalCompletionStatus) => {
    if (!goalId) return;
    const now = new Date().toISOString();

    // Cancel any scheduled goal reminder notifications for this goal
    try {
      const allGoals = await loadGoals();
      const current = allGoals.find((g) => g.id === goalId);
      if (current?.reminderNotifications?.length) {
        await cancelGoalReminderNotifications(
          current.reminderNotifications.map((n) => n.notificationId),
        );
      }
    } catch (error) {
      console.log("Failed to cancel goal reminder notifications", error);
    }

    await updateGoal(goalId, (current) => ({
      ...current,
      completionStatus: status,
      completedAt: status === "completed" ? now : current.completedAt ?? now,
      reminderNotifications: [],
    }));
  };

  const startConfettiAndNavigate = async () => {
    if (!goalId) return;
    await updateCompletionStatus("completed");
    setShowConfetti(true);
    confettiAnim.setValue(0);

    Animated.timing(confettiAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setShowConfetti(false);
      router.push({ pathname: "/reflect", params: { goalId } });
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={16}>
            <Feather name="arrow-left" size={22} color="#3D4F5F" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>✨</Text>
          </View>

          <Text style={styles.questionText}>Did you finish your goal?</Text>
          <Text style={styles.goalLabel}>YOUR GOAL</Text>
          <Text style={styles.goalTitle}>{goal?.title ?? "Your goal"}</Text>

          <View style={styles.buttonStack}>
            <TouchableOpacity
              style={[styles.primaryActionButton, styles.completedButton]}
              activeOpacity={0.9}
              onPress={startConfettiAndNavigate}
            >
              <Feather name="check-circle" size={18} color="#143847" />
              <Text style={styles.primaryActionText}>Yes, I completed it!</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryActionButton}
              activeOpacity={0.9}
              onPress={async () => {
                if (goalId) {
                  await updateCompletionStatus("missed");
                  router.push({ pathname: "/still-true", params: { goalId } });
                }
              }}
            >
              <Feather name="x-circle" size={18} color="#3D4F5F" />
              <Text style={styles.secondaryActionText}>Not yet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryActionButton}
              activeOpacity={0.9}
              onPress={() => router.push("/add-memo")}
            >
              <Feather name="plus" size={18} color="#3D4F5F" />
              <Text style={styles.secondaryActionText}>Add Memo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showConfetti && (
          <View pointerEvents="none" style={styles.confettiOverlay}>
            {confettiPieces.map((piece, index) => {
              const translateY = confettiAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-40, 60],
              });
              const opacity = confettiAnim.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [1, 1, 0],
              });

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.confettiPiece,
                    {
                      left: `${piece.left}%`,
                      backgroundColor: piece.color,
                      transform: [{ translateY }],
                      opacity,
                    },
                  ]}
                />
              );
            })}
          </View>
        )}
      </View>
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
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#D4F4E8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  iconEmoji: {
    fontSize: 32,
  },
  questionText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2F3C4A",
    marginBottom: 4,
  },
  goalLabel: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#A0A4AD",
    marginBottom: 4,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#2F3C4A",
    marginBottom: 32,
  },
  buttonStack: {
    width: "100%",
  },
  primaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    paddingVertical: 16,
    marginBottom: 12,
  },
  completedButton: {
    backgroundColor: "#7DD3C0",
  },
  primaryActionText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "600",
    color: "#143847",
  },
  secondaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    paddingVertical: 14,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  secondaryActionText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "500",
    color: "#3D4F5F",
  },
  confettiOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  confettiPiece: {
    position: "absolute",
    width: 6,
    height: 14,
    borderRadius: 2,
  },
});
