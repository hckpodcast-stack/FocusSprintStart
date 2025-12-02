import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Goal,
  GoalCompletionStatus,
  GoalFeeling,
  loadGoals,
  deleteGoal,
} from "../lib/goals-storage";

type ReflectionLogItem = {
  id: string;
  title: string;
  dueAt: string;
  completionStatus: GoalCompletionStatus;
  reflectionEmotion?: GoalFeeling;
};

export default function ReflectionLog() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    loadGoals()
      .then((data) => {
        if (!isMounted) return;
        // Only goals that already have a reflection
        const withReflection = data.filter((goal) => goal.reflection);
        setGoals(
          withReflection.sort((a, b) => a.dueAt.localeCompare(b.dueAt)),
        );
      })
      .catch((error) => {
        console.log("Failed to load goals for reflection log", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const completedGoals = useMemo(
    () =>
      goals.filter((goal) => goal.completionStatus === "completed"),
    [goals],
  );
  const missedGoals = useMemo(
    () =>
      goals.filter((goal) => goal.completionStatus === "missed"),
    [goals],
  );

  const toggleSelected = (goalId: string) => {
    setSelectedGoalIds((previous) =>
      previous.includes(goalId)
        ? previous.filter((id) => id !== goalId)
        : [...previous, goalId],
    );
  };

  const handleDeleteGoal = (goalId: string) => {
    Alert.alert(
      "Delete this reflection?",
      "This will remove the goal and its reflection from your log.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setGoals((previous) => previous.filter((goal) => goal.id !== goalId));
            setSelectedGoalIds((previous) =>
              previous.filter((id) => id !== goalId),
            );
            try {
              await deleteGoal(goalId);
            } catch (error) {
              console.log("Failed to delete goal from reflection log", error);
            }
          },
        },
      ],
    );
  };

  const renderGoalCard = (goal: Goal) => {
    const reflection = goal.reflection;
    const isSelected = selectedGoalIds.includes(goal.id);

    return (
      <Swipeable
        key={goal.id}
        renderRightActions={() => (
          <View style={styles.deleteActionContainer}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteGoal(goal.id)}
              activeOpacity={0.8}
            >
              <Feather name="trash-2" size={18} color="#FFFFFF" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      >
        <TouchableOpacity
          style={styles.goalCard}
          activeOpacity={0.9}
          onPress={() => toggleSelected(goal.id)}
        >
          <View style={styles.goalCardRow}>
            <View style={styles.goalInfoRow}>
              <Text style={styles.goalEmoji}>
                {reflection?.emotion === "calm"
                  ? "😊"
                  : reflection?.emotion === "scattered"
                    ? "🌀"
                    : reflection?.emotion === "in_control"
                      ? "🎯"
                      : reflection?.emotion === "drained"
                        ? "😮‍💨"
                        : reflection?.emotion === "motivated"
                          ? "💪"
                          : "🙂"}
              </Text>
              <View>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalDueAt}>
                  {new Date(goal.dueAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.selectCircle,
                isSelected && styles.selectCircleSelected,
              ]}
              activeOpacity={0.8}
              onPress={() => toggleSelected(goal.id)}
            >
              {isSelected && <View style={styles.selectCircleInner} />}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const handleTellMeMore = () => {
    if (selectedGoalIds.length === 0) return;

    router.push({
      pathname: "/insights",
      params: { goalIds: selectedGoalIds.join(",") },
    });
  };

  const hasAnyGoals = completedGoals.length > 0 || missedGoals.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={16}>
            <Feather name="arrow-left" size={22} color="#3D4F5F" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Reflection Log</Text>

        {hasAnyGoals ? (
          <>
            <View style={styles.sectionHeaderRow}>
              <Feather name="check-circle" size={16} color="#7DD3C0" />
              <Text style={styles.sectionHeaderText}>Completed Goals</Text>
            </View>
            {completedGoals.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No completed goals yet</Text>
              </View>
            ) : (
              completedGoals.map(renderGoalCard)
            )}

            <View style={styles.sectionHeaderRow}>
              <Feather name="x-circle" size={16} color="#9CA3AF" />
              <Text style={styles.sectionHeaderText}>Missed Goals</Text>
            </View>
            {missedGoals.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No missed goals yet</Text>
              </View>
            ) : (
              missedGoals.map(renderGoalCard)
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No reflections yet</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.tellMeMoreButton,
            selectedGoalIds.length > 0
              ? styles.tellMeMoreButtonEnabled
              : styles.tellMeMoreButtonDisabled,
          ]}
          activeOpacity={selectedGoalIds.length > 0 ? 0.9 : 1}
          disabled={selectedGoalIds.length === 0}
          onPress={handleTellMeMore}
        >
          <Text style={styles.tellMeMoreButtonText}>Tell Me More</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2F3C4A",
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  sectionHeaderText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "600",
  },
  goalCard: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  goalCardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  goalInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  goalEmoji: {
    fontSize: 22,
    marginRight: 10,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2F3C4A",
    marginBottom: 2,
  },
  goalDueAt: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  deleteActionContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 90,
    height: "100%",
    borderRadius: 18,
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
  },
  deleteButtonText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  selectCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  selectCircleSelected: {
    borderColor: "#7DD3C0",
  },
  selectCircleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#7DD3C0",
  },
  emptyCard: {
    borderRadius: 18,
    backgroundColor: "#F5F3EF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tellMeMoreButton: {
    marginTop: "auto",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  tellMeMoreButtonEnabled: {
    backgroundColor: "#3D4F5F",
  },
  tellMeMoreButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  tellMeMoreButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
