import AsyncStorage from "@react-native-async-storage/async-storage";

export type Reminder = {
  id: string;
  dateTime: string;
};

export type GoalType = "launch" | "build" | "revenue" | "audience" | "learning";

export type GoalFeeling =
  | "calm"
  | "scattered"
  | "in_control"
  | "drained"
  | "motivated";

export type FrictionType =
  | "not_sure"
  | "slow_execution"
  | "context_switching"
  | "fake_productivity"
  | null;

export type SignatureStrokePoint = { x: number; y: number };

export type GoalContractSignature = {
  strokes: SignatureStrokePoint[];
  signedAt: string;
};

export type GoalCompletionStatus = "completed" | "missed" | "pending";

export type GoalReflection = {
  emotion: GoalFeeling;
  satisfaction: number;
  memoType: "voice" | "text";
  voiceMemoFileUri?: string | null;
  voiceMemoTranscript?: string | null;
  textMemo?: string | null;
  createdAt: string;
};

export type GoalAdditionalMemo = {
  id: string;
  createdAt: string;
  memoType: "voice" | "text";
  voiceMemoFileUri?: string | null;
  textMemo?: string | null;
};

export type GoalInsight = {
  id: string;
  createdAt: string;
  goalIds: string[];
  paragraph: string | null;
  clarityScore: number | null;
  clarityExplanation: string | null;
};

export type FocusBlock = {
  id: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  blockCount: number;
};

export type GoalReminderNotification = {
  reminderId: string;
  notificationId: string;
};

export type Goal = {
  id: string;
  title: string;
  dueAt: string;
  reminders: Reminder[];
  memoType: "voice" | "text" | null;
  voiceMemoFileUri?: string;
  voiceMemoTranscript?: string;
  textMemo?: string;
  goalType: GoalType;
  feeling: GoalFeeling;
  friction: FrictionType;
  whySummary?: string;
  contract: GoalContractSignature;
  createdAt: string;
  completionStatus?: GoalCompletionStatus;
  completedAt?: string;
  reflection?: GoalReflection;
  additionalMemos?: GoalAdditionalMemo[];
  insightsHistory?: GoalInsight[];
  reminderNotifications?: GoalReminderNotification[];
};

const STORAGE_KEY = "@focusSprint/goals-v2";

export async function loadGoals(): Promise<Goal[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    // Attempt migration from v1 if present
    try {
      const legacyRaw = await AsyncStorage.getItem("@focusSprint/goals-v1");
      if (!legacyRaw) return [];
      const legacyParsed = JSON.parse(legacyRaw);
      if (Array.isArray(legacyParsed)) {
        const migrated = (legacyParsed as any[]).map((goal) => ({
          ...goal,
          completionStatus: "pending",
        })) as Goal[];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
      return [];
    } catch {
      return [];
    }
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as Goal[];
    }
    return [];
  } catch {
    return [];
  }
}

export async function saveGoals(goals: Goal[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

export async function appendGoal(goal: Goal): Promise<void> {
  const current = await loadGoals();
  const next = [...current, goal];
  await saveGoals(next);
}

export async function updateGoal(
  goalId: string,
  updater: (goal: Goal) => Goal,
): Promise<void> {
  const current = await loadGoals();
  const index = current.findIndex((goal) => goal.id === goalId);
  if (index === -1) {
    return;
  }
  const updated = updater(current[index]);
  const next = [...current];
  next[index] = updated;
  await saveGoals(next);
}

export async function deleteGoal(goalId: string): Promise<void> {
  const current = await loadGoals();
  const next = current.filter((goal) => goal.id !== goalId);
  await saveGoals(next);
}
