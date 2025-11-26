import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loadGoals, Goal as StoredGoal } from "../lib/goals-storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_HORIZONTAL_MARGIN = 16;
const CARD_SPACING = 16;
const CARD_WIDTH = SCREEN_WIDTH - 32;

type Goal = {
  id: string;
  title: string;
  dueDate: string; // ISO date string
};

type HomeScreenProps = {
  streakDays: number;
  totalReflections: number;
  reflectionThreshold?: number;
  goals: Goal[];
  onCheckInGoal?: (goal: Goal) => void;
  onOpenReflectionLog?: () => void;
  onCreateNewGoal?: () => void;
};

type GoalDueStatus = {
  label: string;
  isOverdue: boolean;
};

function getGoalDueStatus(dueDate: string, today: Date = new Date()): GoalDueStatus {
  const startOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const due = startOfDay(new Date(dueDate));
  const current = startOfDay(today);
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  const diffDays = Math.round((due.getTime() - current.getTime()) / MS_PER_DAY);

  if (diffDays === 0) {
    return { label: "Due today", isOverdue: false };
  }

  if (diffDays > 0) {
    const count = diffDays;
    const unit = count === 1 ? "day" : "days";
    return { label: `Due in ${count} ${unit}`, isOverdue: false };
  }

  const overdueCount = Math.abs(diffDays);
  const unit = overdueCount === 1 ? "day" : "days";
  return { label: `${overdueCount} ${unit} overdue`, isOverdue: true };
}

function formatDueDateLabel(dueDate: string): string {
  const date = new Date(dueDate);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getReflectionStatusMessage(totalReflections: number, threshold: number): string {
  if (totalReflections >= threshold) {
    return "You’ve unlocked your next insight report";
  }

  const remaining = threshold - totalReflections;
  const unit = remaining === 1 ? "reflection" : "reflections";

  return `${remaining} ${unit} away from your next insight report`;
}

function HomeScreen(props: HomeScreenProps) {
  const {
    streakDays,
    totalReflections,
    reflectionThreshold = 3,
    goals,
    onCheckInGoal,
    onOpenReflectionLog,
    onCreateNewGoal,
  } = props;

  const [activeGoalIndex, setActiveGoalIndex] = useState(0);
  const hasGoals = goals.length > 0;

  const reflectionMessage = useMemo(
    () => getReflectionStatusMessage(totalReflections, reflectionThreshold),
    [totalReflections, reflectionThreshold],
  );

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / (CARD_WIDTH + CARD_SPACING));
      setActiveGoalIndex(Math.max(0, Math.min(index, goals.length - 1)));
    },
    [goals.length],
  );

  const renderGoalItem: ListRenderItem<Goal> = useCallback(
    ({ item, index }) => {
      const dueStatus = getGoalDueStatus(item.dueDate);
      const dateLabel = formatDueDateLabel(item.dueDate);

      return (
        <View style={styles.goalCardWrapper}>
          <View style={styles.goalCard}>
            <View style={styles.goalCardHeader}>
              <Text style={styles.upNextLabel}>UP NEXT</Text>
              <View style={styles.goalCountBadge}>
                <Text style={styles.goalCountText}>
                  {index + 1}/{goals.length}
                </Text>
              </View>
            </View>

            <Text style={styles.goalTitle}>{item.title}</Text>

            <View style={styles.goalMetaRow}>
              <View style={styles.goalDateRow}>
                <Feather name="calendar" size={16} color="#3D4F5F" />
                <Text style={styles.goalDateText}>{dateLabel}</Text>
              </View>

              <View
                style={[
                  styles.dueStatusChip,
                  dueStatus.isOverdue ? styles.dueStatusChipOverdue : styles.dueStatusChipUpcoming,
                ]}
              >
                <Text
                  style={[
                    styles.dueStatusText,
                    dueStatus.isOverdue && styles.dueStatusTextOverdue,
                  ]}
                >
                  {dueStatus.label}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => onCheckInGoal?.(item)}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Check In</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [goals.length, onCheckInGoal],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <View>
            <View style={styles.streakRow}>
              <View style={styles.streakDot} />
              <Text style={styles.streakText}>{streakDays} day streak</Text>
            </View>
            <View style={styles.reflectionRow}>
              <Text style={styles.reflectionEmoji}>🧠</Text>
              <Text style={styles.reflectionText}>{reflectionMessage}</Text>
            </View>
          </View>

          <View style={styles.menuIconContainer}>
            <Feather name="menu" size={20} color="#8D9299" />
          </View>
        </View>

        <Text style={styles.screenTitle}>Intention Archive</Text>

        {hasGoals ? (
          <>
            <FlatList
              data={goals}
              keyExtractor={(item) => item.id}
              renderItem={renderGoalItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + CARD_SPACING}
              decelerationRate="fast"
              contentContainerStyle={styles.goalListContent}
              onMomentumScrollEnd={handleScrollEnd}
            />

            <View style={styles.goalDotsRow}>
              {goals.map((goal, index) => {
                const isActive = index === activeGoalIndex;
                return (
                  <View
                    key={goal.id}
                    style={[
                      styles.goalDot,
                      isActive ? styles.goalDotActive : styles.goalDotInactive,
                    ]}
                  />
                );
              })}
            </View>
          </>
        ) : (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateTitle}>No goals yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Create your first goal to see it here.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.reflectionCard}
          onPress={onOpenReflectionLog}
          activeOpacity={0.9}
        >
          <View style={styles.reflectionIconContainer}>
            <Feather name="book-open" size={18} color="#3D4F5F" />
          </View>
          <Text style={styles.reflectionCardTitle}>Reflection Log</Text>
          <View style={{ flex: 1 }} />
          <Feather name="arrow-right" size={18} color="#8D9299" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, styles.createGoalButton]}
          onPress={onCreateNewGoal}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Create a New Goal</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function Index() {
  const router = useRouter();
  const { banner } = useLocalSearchParams<{ banner?: string }>();
  const [showGoalLockedBanner, setShowGoalLockedBanner] = useState(
    banner === "goalLocked",
  );
  const [goals, setGoals] = useState<StoredGoal[]>([]);

  useEffect(() => {
    if (banner === "goalLocked") {
      setShowGoalLockedBanner(true);
      const timer = setTimeout(() => setShowGoalLockedBanner(false), 500);
      return () => clearTimeout(timer);
    }
  }, [banner]);
  useEffect(() => {
    let isMounted = true;
    loadGoals()
      .then((data) => {
        if (!isMounted) return;
        setGoals(
          data.sort((a, b) =>
            a.dueAt.localeCompare(b.dueAt),
          ),
        );
      })
      .catch((error) => {
        console.log("Failed to load goals", error);
      });
    return () => {
      isMounted = false;
    };
  }, [banner]);

  const handleCheckInGoal = (goal: Goal) => {
    router.push("/check-in");
  };

  const handleOpenReflectionLog = () => {
    console.log("Open Reflection Log");
  };

  const handleCreateNewGoal = () => {
    router.push("/create-new-goal");
  };

  return (
    <>
      {showGoalLockedBanner && (
        <View style={styles.goalLockedBanner}>
          <Text style={styles.goalLockedBannerText}>Goal locked in</Text>
        </View>
      )}
      <HomeScreen
        streakDays={3}
        totalReflections={2}
        reflectionThreshold={3}
        goals={goals.map((goal) => ({
          id: goal.id,
          title: goal.title,
          dueDate: goal.dueAt,
        }))}
        onCheckInGoal={handleCheckInGoal}
        onOpenReflectionLog={handleOpenReflectionLog}
        onCreateNewGoal={handleCreateNewGoal}
      />
    </>
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
    paddingTop: 12,
    paddingBottom: 24,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  streakDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D4F4E8",
    marginRight: 8,
  },
  streakText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3D4F5F",
  },
  reflectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  reflectionEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  reflectionText: {
    fontSize: 13,
    color: "#8D9299",
  },
  menuIconContainer: {
    padding: 8,
  },
  screenTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 24,
    fontWeight: "700",
    color: "#2F3C4A",
  },
  goalListContent: {
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  goalCardWrapper: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
  },
  goalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  goalCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  upNextLabel: {
    fontSize: 12,
    letterSpacing: 1,
    color: "#8D9299",
  },
  goalCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F5F3EF",
  },
  goalCountText: {
    fontSize: 12,
    color: "#8D9299",
    fontWeight: "500",
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2F3C4A",
    marginBottom: 16,
  },
  goalMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  goalDateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalDateText: {
    fontSize: 14,
    color: "#3D4F5F",
    marginLeft: 8,
  },
  dueStatusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  dueStatusChipUpcoming: {
    backgroundColor: "#D4F4E8",
  },
  dueStatusChipOverdue: {
    backgroundColor: "#FFE5CC",
  },
  dueStatusText: {
    fontSize: 12,
    color: "#3D4F5F",
    fontWeight: "500",
  },
  dueStatusTextOverdue: {
    color: "#9A4A1A",
  },
  primaryButton: {
    backgroundColor: "#3D4F5F",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  goalDotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  goalDot: {
    height: 6,
    borderRadius: 999,
    marginHorizontal: 4,
  },
  goalDotActive: {
    width: 24,
    backgroundColor: "#7DD3C0",
  },
  goalDotInactive: {
    width: 6,
    backgroundColor: "#D4D7DD",
  },
  reflectionCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderRadius: 20,
    backgroundColor: "#F5F3EF",
    marginBottom: 16,
  },
  reflectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#D4F4E8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  reflectionCardTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2F3C4A",
  },
  createGoalButton: {
    marginTop: "auto",
  },
  emptyStateCard: {
    backgroundColor: "#F5F3EF",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2F3C4A",
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#8D9299",
  },
  goalLockedBanner: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 60,
    zIndex: 20,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#D4F4E8",
    alignItems: "center",
  },
  goalLockedBannerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#064E3B",
  },
});
