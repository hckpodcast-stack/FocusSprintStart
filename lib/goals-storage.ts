import AsyncStorage from "@react-native-async-storage/async-storage";

export type Reminder = {
  id: string;
  dateTime: string;
};

export type GoalType = "launch" | "build" | "revenue" | "audience" | "learning";

export type GoalFeeling =
  | "great"
  | "calm"
  | "okay"
  | "tough"
  | "frustrated";

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
};

const STORAGE_KEY = "@focusSprint/goals-v1";

export async function loadGoals(): Promise<Goal[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
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

