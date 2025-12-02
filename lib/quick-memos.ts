import AsyncStorage from "@react-native-async-storage/async-storage";

export type QuickMemo = {
  id: string;
  createdAt: string;
  memoType: "voice" | "text";
  durationSeconds?: number;
  voiceMemoFileUri?: string | null;
  voiceMemoTranscript?: string | null;
  textMemo?: string | null;
  title?: string | null;
  summary?: string | null;
};

const QUICK_MEMO_KEY = "@focusSprint/quick-memos-v1";

export async function loadQuickMemos(): Promise<QuickMemo[]> {
  const raw = await AsyncStorage.getItem(QUICK_MEMO_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as QuickMemo[];
    }
    return [];
  } catch {
    return [];
  }
}

export async function saveQuickMemos(memos: QuickMemo[]): Promise<void> {
  await AsyncStorage.setItem(QUICK_MEMO_KEY, JSON.stringify(memos));
}

export async function appendQuickMemo(memo: QuickMemo): Promise<void> {
  const current = await loadQuickMemos();
  const next = [...current, memo];
  await saveQuickMemos(next);
}
